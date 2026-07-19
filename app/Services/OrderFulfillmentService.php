<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Services\Affiliate\AffiliateCommissionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderFulfillmentService
{
    /**
     * Titik potong stok: dikurangi sekali saat payment = paid.
     * Dibatalkan (restore) hanya jika stock_decremented_at sudah terisi.
     */
    private const TERMINAL_STATUSES = ['completed', 'cancelled'];

    private const ORDER_STATUS_TRANSITIONS = [
        'payment_received' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['completed'],
    ];

    private const PAYMENT_STATUS_TRANSITIONS = [
        'waiting_payment' => ['paid', 'cancelled'],
    ];

    private const SHIPPING_STATUS_TRANSITIONS = [
        'pending_shipping_confirmation' => ['shipping_cost_confirmed'],
        'shipping_cost_confirmed' => ['ready_to_ship'],
    ];

    public function updateStatus(Order $order, array $data): Order
    {
        $nextStatus = $data['status'] ?? null;

        $this->assertOrderNotTerminal($order, 'status');
        $this->assertOrderStatusTransition($order, $nextStatus);

        $order->update($data);

        if ($nextStatus === 'cancelled') {
            $this->restoreStock($order->fresh());
        }

        return $order->fresh();
    }

    public function processPayment(Order $order, string $paymentStatus, ?string $paymentNotes = null, ?string $paymentReceivedAt = null): Order
    {
        $this->assertOrderNotTerminal($order, 'payment_status');
        $this->assertPaymentStatusTransition($order, $paymentStatus);

        $status = $order->status;

        if ($paymentStatus === 'paid') {
            $status = 'payment_received';
            $paymentReceivedAt = $paymentReceivedAt ?? now();
            // Stok dikurangi sekali di titik paid (idempotent via stock_decremented_at).
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

    public function assertShippingStatusTransition(Order $order, string $nextShippingStatus): void
    {
        $this->assertOrderNotTerminal($order, 'shipping_status');

        $current = $order->shipping_status;
        $allowed = self::SHIPPING_STATUS_TRANSITIONS[$current] ?? [];

        if (! in_array($nextShippingStatus, $allowed, true)) {
            throw ValidationException::withMessages([
                'shipping_status' => $this->invalidTransitionMessage(
                    'pengiriman',
                    $current,
                    $nextShippingStatus,
                    $allowed
                ),
            ]);
        }

        if ($nextShippingStatus === 'ready_to_ship' && $order->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'shipping_status' => 'Pembayaran harus berstatus lunas sebelum order ditandai siap dikirim.',
            ]);
        }
    }

    private function assertOrderStatusTransition(Order $order, ?string $nextStatus): void
    {
        if ($nextStatus === null || $nextStatus === '') {
            throw ValidationException::withMessages([
                'status' => 'Status order wajib diisi.',
            ]);
        }

        if ($order->shipping_status !== 'ready_to_ship' && $nextStatus !== 'cancelled') {
            throw ValidationException::withMessages([
                'status' => 'Status order hanya bisa diubah setelah pengiriman berstatus siap dikirim.',
            ]);
        }

        $current = $order->status;
        $allowed = self::ORDER_STATUS_TRANSITIONS[$current] ?? [];

        if (! in_array($nextStatus, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => $this->invalidTransitionMessage('order', $current, $nextStatus, $allowed),
            ]);
        }
    }

    private function assertPaymentStatusTransition(Order $order, string $nextPaymentStatus): void
    {
        $current = $order->payment_status;
        $allowed = self::PAYMENT_STATUS_TRANSITIONS[$current] ?? [];

        if (! in_array($nextPaymentStatus, $allowed, true)) {
            throw ValidationException::withMessages([
                'payment_status' => $this->invalidTransitionMessage(
                    'pembayaran',
                    $current,
                    $nextPaymentStatus,
                    $allowed
                ),
            ]);
        }
    }

    private function assertOrderNotTerminal(Order $order, string $field): void
    {
        if (in_array($order->status, self::TERMINAL_STATUSES, true)) {
            throw ValidationException::withMessages([
                $field => 'Order sudah selesai atau dibatalkan, tidak bisa diperbarui.',
            ]);
        }

        if ($order->shipping_status === 'cancelled') {
            throw ValidationException::withMessages([
                $field => 'Pengiriman order sudah dibatalkan, tidak bisa diperbarui.',
            ]);
        }
    }

    private function invalidTransitionMessage(string $domain, ?string $current, string $next, array $allowed): string
    {
        $currentLabel = $this->statusLabel($current);
        $nextLabel = $this->statusLabel($next);

        if ($allowed === []) {
            return "Status {$domain} \"{$currentLabel}\" tidak dapat diubah ke \"{$nextLabel}\".";
        }

        $allowedLabels = collect($allowed)
            ->map(fn (string $status): string => $this->statusLabel($status))
            ->implode(', ');

        return "Status {$domain} \"{$currentLabel}\" tidak dapat diubah ke \"{$nextLabel}\". Pilihan yang diizinkan: {$allowedLabels}.";
    }

    private function statusLabel(?string $status): string
    {
        if ($status === null || $status === '') {
            return '-';
        }

        return match ($status) {
            'pending' => 'Pending',
            'waiting_shipping_confirmation', 'pending_shipping_confirmation' => 'Menunggu Konfirmasi Ongkir',
            'shipping_cost_confirmed' => 'Ongkir Dikonfirmasi',
            'ready_to_ship' => 'Siap Dikirim',
            'waiting_payment' => 'Menunggu Bayar',
            'payment_received' => 'Pembayaran Diterima',
            'processing' => 'Diproses',
            'shipped' => 'Dikirim',
            'delivered' => 'Terkirim',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'paid' => 'Lunas',
            default => str_replace('_', ' ', $status),
        };
    }

    private function decrementStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->with('orderItems')
                ->lockForUpdate()
                ->firstOrFail();

            // Idempotent: stok hanya dikurangi sekali per order.
            if ($lockedOrder->stock_decremented_at !== null) {
                return;
            }

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
                        'payment_status' => "Stok {$product->name} tidak mencukupi untuk menandai pembayaran lunas di cabang ini.",
                    ]);
                }

                if ($branchStock) {
                    $branchStock->decrement('stock_quantity', $item->quantity);
                }
            }

            $lockedOrder->stock_decremented_at = now();
            $lockedOrder->save();
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

            // Hanya restore jika stok pernah dikurangi.
            if ($lockedOrder->stock_decremented_at === null) {
                return;
            }

            foreach ($lockedOrder->orderItems as $item) {
                Product::query()
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
                } else {
                    // Jika baris stok cabang hilang, buat ulang agar restore tidak hilang diam-diam.
                    \App\Models\BranchProductStock::query()->create([
                        'branch_id' => $lockedOrder->branch_id,
                        'product_id' => $item->product_id,
                        'stock_quantity' => $item->quantity,
                    ]);
                }
            }

            $lockedOrder->stock_decremented_at = null;
            $lockedOrder->save();
        });
    }
}
