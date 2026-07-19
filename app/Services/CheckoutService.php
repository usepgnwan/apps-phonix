<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use App\Services\Affiliate\AffiliateAttributionService;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function checkout(Cart $cart, array $data, ?Request $request = null): Order
    {
        return DB::transaction(function () use ($cart, $data, $request): Order {
            $cart->load('cartItems.product', 'user', 'customerProfile');

            if ($cart->cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang masih kosong.',
                ]);
            }

            $affiliateId = null;
            $referredByStaffId = null;
            if ($request !== null) {
                $attribution = app(AffiliateAttributionService::class);
                $affiliate = $attribution->resolveForCheckout(
                    $data['voucher_code'] ?? null,
                    $cart->user_id,
                    $request
                );
                $affiliateId = $affiliate?->id;

                $staffAttribution = app(StaffReferralAttributionService::class);
                $referredByStaffId = $staffAttribution
                    ->resolveForTransaction($cart->user_id, $request)
                    ?->id;
            }

            $items = $cart->cartItems->map(function ($cartItem) use ($cart): array {
                $product = Product::query()
                    ->whereKey($cartItem->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => "Produk {$product->name} sudah tidak aktif.",
                    ]);
                }

                $branchStock = \App\Models\BranchProductStock::query()
                    ->where('branch_id', $cart->branch_id)
                    ->where('product_id', $cartItem->product_id)
                    ->lockForUpdate()
                    ->first();

                $availableStock = $branchStock?->stock_quantity ?? 0;

                if ($cartItem->quantity > $availableStock) {
                    throw ValidationException::withMessages([
                        'cart' => "Stok {$product->name} tidak mencukupi di cabang yang dipilih.",
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
                [$voucher, $voucherDiscountAmount] = $this->resolveVoucher($cart, $data['voucher_code'], $subtotal, $data['customer_whatsapp_number']);
            }

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber($cart->branch_id),
                'user_id' => $cart->user_id,
                'customer_profile_id' => $cart->customer_profile_id,
                'branch_id' => $cart->branch_id,
                'voucher_id' => $voucher?->id,
                'affiliate_id' => $affiliateId,
                'referred_by_staff_id' => $referredByStaffId,
                'payment_method_id' => $data['payment_method_id'],
                'customer_name' => $data['customer_name'],
                'customer_whatsapp_number' => $data['customer_whatsapp_number'],
                'customer_email' => $data['customer_email'],
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
            $cart->update(['branch_id' => null]);

            $receiptEmail = \App\Models\Setting::where('key', 'receipt_email')->value('value');
            $orderTemplate = \App\Models\Setting::where('key', 'order_template')->value('value');

            if (!empty($receiptEmail) && !empty($orderTemplate)) {
                $itemsHtml = '<div style="margin: 8px 0;"><table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; font-family: Arial, sans-serif;">';
                foreach ($items as $item) {
                    $productName = $item['product']->name;
                    $qty = $item['quantity'];
                    $unitPrice = number_format($item['unit_price'], 0, ',', '.');
                    $lineTotal = number_format($item['line_total'], 0, ',', '.');
                    $itemsHtml .= "<tr><td colspan='3' style='padding-top: 6px; padding-bottom: 2px;'>{$productName}</td></tr>";
                    $itemsHtml .= "<tr><td width='25%' style='padding-bottom: 6px; color: #4b5563;'>{$qty} x</td><td width='40%' align='right' style='padding-bottom: 6px; color: #4b5563;'>{$unitPrice}</td><td width='35%' align='right' style='padding-bottom: 6px;'>{$lineTotal}</td></tr>";
                }
                $itemsHtml .= '</table></div>';

                // Try replacing with <p> wrapper first to prevent extra spacing, then just the tag
                $parsedHtml = str_replace('<p>[items]</p>', '[items]', $orderTemplate);
                
                $parsedHtml = str_replace(
                    ['[order]', '[tanggal]', '[nama]', '[whatsapp]', '[email]', '[kasir]', '[items]', '[total]'],
                    [
                        $order->order_number,
                        $order->created_at->format('d-m-Y H:i'),
                        $order->customer_name ?: 'Umum',
                        $order->customer_whatsapp_number ?: '-',
                        $order->customer_email ?: '-',
                        'Sistem',
                        $itemsHtml,
                        number_format($order->total, 0, ',', '.')
                    ],
                    $parsedHtml
                );

                try { 
                    \Illuminate\Support\Facades\Mail::to($receiptEmail)->send(new \App\Mail\OrderReceiptMail($order->order_number, $parsedHtml));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send order receipt email: ' . $e->getMessage());
                }
            }

            return $order->load('orderItems', 'voucherRedemption');
        });
    }

    public function previewVoucher(Cart $cart, string $code, float $subtotal, ?string $customerWhatsapp = null): array
    {
        return $this->resolveVoucher($cart, $code, $subtotal, $customerWhatsapp);
    }

    private function resolveVoucher(Cart $cart, string $code, float $subtotal, ?string $customerWhatsapp = null): array
    {
        $customerProfile = $cart->customerProfile;

        // Vouchers are now accessible to guests too, but members-only vouchers still restricted
        $voucher = Voucher::query()
            ->where('code', Str::upper($code))
            ->lockForUpdate()
            ->first();

        if ($voucher === null || ! $voucher->is_published || now()->lt($voucher->starts_at) || now()->gt($voucher->ends_at)) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher tidak valid atau sudah tidak aktif.',
            ]);
        }

        if ($voucher->target_audience === 'member' && ($customerProfile === null || $customerProfile->member_status !== 'member')) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher ini khusus untuk customer member.',
            ]);
        }

        if ($voucher->minimum_purchase !== null && $subtotal < (float) $voucher->minimum_purchase) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Subtotal belum memenuhi minimum pembelian voucher.',
            ]);
        }

        $alreadyRedeemed = false;
        
        if ($customerProfile !== null) {
            $alreadyRedeemed = VoucherRedemption::query()
                ->where('voucher_id', $voucher->id)
                ->where('customer_profile_id', $customerProfile->id)
                ->exists();
        } elseif ($customerWhatsapp !== null) {
            $alreadyRedeemed = Order::query()
                ->where('voucher_id', $voucher->id)
                ->where('customer_whatsapp_number', $customerWhatsapp)
                ->exists();
        }

        if ($alreadyRedeemed) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Anda sudah pernah menggunakan voucher ini.',
            ]);
        }

        $redemptionCount = VoucherRedemption::query()
            ->where('voucher_id', $voucher->id)
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

    private function generateOrderNumber(?int $branchId): string
    {
        $branchCode = 'ONL';
        if ($branchId !== null) {
            $branch = \App\Models\Branch::find($branchId);
            if ($branch !== null && !empty($branch->code)) {
                $branchCode = Str::upper($branch->code);
            }
        }

        do {
            $orderNumber = $branchCode . '-ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
