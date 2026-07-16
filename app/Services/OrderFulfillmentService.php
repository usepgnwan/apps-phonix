<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Services\Affiliate\AffiliateCommissionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderFulfillmentService
{
    public function updateStatus(Order $order, array $data): Order
    {
        $order->update($data);

        if ($data['status'] === 'cancelled') {
            $this->restoreStock($order->fresh());
        }

        return $order->fresh();
    }

    public function processPayment(Order $order, string $paymentStatus, ?string $paymentNotes = null, ?string $paymentReceivedAt = null): Order
    {
        $status = $order->status;
        
        if ($paymentStatus === 'paid') {
            $status = 'payment_received';
            $paymentReceivedAt = $paymentReceivedAt ?? now();
            // Mengurangi stok saat paid
            $this->decrementStock($order);
        } elseif ($paymentStatus === 'waiting_payment') {
            $status = 'waiting_payment';
        } elseif ($paymentStatus === 'cancelled') {
            $status = 'cancelled';
            $this->restoreStock($order);
        }

        $order->update([
            'payment_status' => $paymentStatus,
            'payment_received_at' => $paymentReceivedAt,
            'payment_notes' => $paymentNotes,
            'status' => $status,
        ]);

        $fresh = $order->fresh();

        if ($paymentStatus === 'paid') {
            app(AffiliateCommissionService::class)->createFromOrder($fresh);
        }

        return $fresh;
    }

    private function decrementStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with('orderItems')
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedOrder->stock_decremented_at === null) {
                foreach ($lockedOrder->orderItems as $item) {
                    $product = Product::query()
                        ->whereKey($item->product_id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $branchStock = \App\Models\BranchProductStock::query()
                        ->where('branch_id', $lockedOrder->branch_id)
                        ->where('product_id', $item->product_id)
                        ->lockForUpdate()
                        ->first();

                    $availableStock = $branchStock?->stock_quantity ?? 0;

                    if ($availableStock < $item->quantity) {
                        throw ValidationException::withMessages([
                            'payment_status' => "Stok {$product->name} tidak mencukupi untuk memproses pembayaran di cabang ini.",
                        ]);
                    }

                    if ($branchStock) {
                        $branchStock->decrement('stock_quantity', $item->quantity);
                    }
                }

                $lockedOrder->stock_decremented_at = now();
                $lockedOrder->save();
            }
        });
    }

    private function restoreStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with('orderItems')
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedOrder->stock_decremented_at !== null) {
                foreach ($lockedOrder->orderItems as $item) {
                    $product = Product::query()
                        ->whereKey($item->product_id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $branchStock = \App\Models\BranchProductStock::query()
                        ->where('branch_id', $lockedOrder->branch_id)
                        ->where('product_id', $item->product_id)
                        ->lockForUpdate()
                        ->first();

                    if ($branchStock) {
                        $branchStock->increment('stock_quantity', $item->quantity);
                    }
                }

                $lockedOrder->stock_decremented_at = null;
                $lockedOrder->save();
            }
        });
    }
}
