<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function checkout(Cart $cart, array $data): Order
    {
        return DB::transaction(function () use ($cart, $data): Order {
            $cart->load('cartItems.product', 'user', 'customerProfile');

            if ($cart->cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang masih kosong.',
                ]);
            }

            $items = $cart->cartItems->map(function ($cartItem): array {
                $product = Product::query()
                    ->whereKey($cartItem->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => "Produk {$product->name} sudah tidak aktif.",
                    ]);
                }

                if ($cartItem->quantity > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Stok {$product->name} tidak mencukupi.",
                    ]);
                }

                $unitPrice = (float) $product->price;
                $lineTotal = $unitPrice * $cartItem->quantity;

                return [
                    'product' => $product,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            });

            $subtotal = $items->sum('line_total');
            $voucher = null;
            $voucherDiscountAmount = 0.0;

            if (! empty($data['voucher_code'])) {
                [$voucher, $voucherDiscountAmount] = $this->resolveVoucher($cart, $data['voucher_code'], $subtotal);
            }

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $cart->user_id,
                'customer_profile_id' => $cart->customer_profile_id,
                'voucher_id' => $voucher?->id,
                'customer_name' => $data['customer_name'],
                'customer_whatsapp_number' => $data['customer_whatsapp_number'],
                'shipping_address' => $data['shipping_address'],
                'subtotal' => $subtotal,
                'voucher_discount_amount' => $voucherDiscountAmount,
                'shipping_cost' => 0,
                'total' => $subtotal - $voucherDiscountAmount,
                'shipping_status' => 'pending_shipping_confirmation',
                'payment_status' => 'pending',
                'status' => 'waiting_shipping_confirmation',
            ]);

            foreach ($items as $item) {
                $product = $item['product'];

                $order->orderItems()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'line_total' => $item['line_total'],
                ]);
            }

            if ($voucher !== null) {
                VoucherRedemption::query()->create([
                    'voucher_id' => $voucher->id,
                    'customer_profile_id' => $cart->customer_profile_id,
                    'order_id' => $order->id,
                    'discount_amount' => $voucherDiscountAmount,
                    'redeemed_at' => now(),
                ]);
            }

            $cart->cartItems()->delete();

            return $order->load('orderItems', 'voucherRedemption');
        });
    }

    private function resolveVoucher(Cart $cart, string $code, float $subtotal): array
    {
        $customerProfile = $cart->customerProfile;

        if ($cart->user_id === null || $customerProfile === null || $customerProfile->member_status !== 'member') {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher hanya dapat digunakan oleh customer member yang sudah login.',
            ]);
        }

        $voucher = Voucher::query()
            ->where('code', Str::upper($code))
            ->lockForUpdate()
            ->first();

        if ($voucher === null || ! $voucher->is_published || now()->lt($voucher->starts_at) || now()->gt($voucher->ends_at)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher tidak valid atau sudah tidak aktif.',
            ]);
        }

        if ($voucher->minimum_purchase !== null && $subtotal < (float) $voucher->minimum_purchase) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Subtotal belum memenuhi minimum pembelian voucher.',
            ]);
        }

        $alreadyRedeemed = VoucherRedemption::query()
            ->where('voucher_id', $voucher->id)
            ->where('customer_profile_id', $customerProfile->id)
            ->exists();

        if ($alreadyRedeemed) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher sudah pernah digunakan.',
            ]);
        }

        $redemptionCount = VoucherRedemption::query()
            ->where('voucher_id', $voucher->id)
            ->lockForUpdate()
            ->count();

        if ($redemptionCount >= $voucher->usage_limit) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Kuota voucher sudah habis.',
            ]);
        }

        return [$voucher, $this->calculateDiscount($voucher, $subtotal)];
    }

    private function calculateDiscount(Voucher $voucher, float $subtotal): float
    {
        if ($voucher->discount_type === 'fixed') {
            return min((float) $voucher->discount_value, $subtotal);
        }

        if ($voucher->discount_type === 'percentage') {
            return min($subtotal * ((float) $voucher->discount_value / 100), $subtotal);
        }

        throw ValidationException::withMessages([
            'voucher_code' => 'Tipe diskon voucher tidak valid.',
        ]);
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
