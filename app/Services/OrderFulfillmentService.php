<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderFulfillmentService
{
    public function updateStatus(Order $order, array $data): Order
    {
        if ($data['status'] !== 'processing') {
            $order->update($data);

            return $order->fresh();
        }

        return $this->markProcessing($order, $data['admin_notes'] ?? null);
    }

    private function markProcessing(Order $order, ?string $adminNotes): Order
    {
        return DB::transaction(function () use ($order, $adminNotes): Order {
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

                    if ($product->stock_quantity < $item->quantity) {
                        throw ValidationException::withMessages([
                            'status' => "Stok {$product->name} tidak mencukupi untuk memproses order.",
                        ]);
                    }

                    $product->decrement('stock_quantity', $item->quantity);
                }

                $lockedOrder->stock_decremented_at = now();
            }

            $lockedOrder->status = 'processing';
            $lockedOrder->admin_notes = $adminNotes;
            $lockedOrder->save();

            return $lockedOrder->fresh();
        });
    }
}
