<?php

namespace App\Services;

use App\Models\OfflineSale;
use App\Models\Product;
use App\Models\Service;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OfflineSaleService
{
    public function create(array $data): OfflineSale
    {
        return DB::transaction(function () use ($data): OfflineSale {
            $items = collect($data['items'])->map(function (array $item): array {
                $type = ! empty($item['product_id']) ? 'product' : 'service';
                $model = null;
                $unitPrice = 0;
                $itemName = '';

                if ($type === 'product') {
                    $model = Product::query()
                        ->whereKey($item['product_id'])
                        ->lockForUpdate()
                        ->first();

                    if ($model === null || ! $model->is_active) {
                        throw ValidationException::withMessages([
                            'items' => 'Produk tidak valid atau sudah tidak aktif.',
                        ]);
                    }

                    if ((int) $item['quantity'] > $model->stock_quantity) {
                        throw ValidationException::withMessages([
                            'items' => "Stok {$model->name} tidak mencukupi.",
                        ]);
                    }

                    $unitPrice = (float) $model->price;
                    $itemName = $model->name;
                } else {
                    $model = Service::query()
                        ->whereKey($item['service_id'])
                        ->first();

                    if ($model === null || ! $model->is_active) {
                        throw ValidationException::withMessages([
                            'items' => 'Layanan tidak valid atau sudah tidak aktif.',
                        ]);
                    }

                    $unitPrice = (float) ($model->price ?? 0);
                    $itemName = $model->name;
                }

                $quantity = (int) $item['quantity'];
                $lineTotal = $unitPrice * $quantity;

                return [
                    'type' => $type,
                    'model' => $model,
                    'item_name' => $itemName,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            });

            $subtotal = $items->sum('line_total');
            $voucher = null;
            $voucherDiscountAmount = 0.0;

            if (! empty($data['voucher_code'])) {
                [$voucher, $voucherDiscountAmount] = $this->resolveVoucher($data, $data['voucher_code'], $subtotal);
            }

            $customerName = trim((string) ($data['customer_name'] ?? ''));

            $offlineSale = OfflineSale::query()->create([
                'sale_number' => $this->generateSaleNumber(),
                'customer_profile_id' => $data['customer_profile_id'] ?? null,
                'voucher_id' => $voucher?->id,
                'lead_id' => $data['lead_id'] ?? null,
                'field_staff_id' => $data['field_staff_id'] ?? null,
                'event_id' => $data['event_id'] ?? null,
                'source' => $data['source'],
                'customer_name' => $customerName !== '' ? $customerName : 'Walk-in Guest',
                'customer_whatsapp_number' => $data['customer_whatsapp_number'] ?? null,
                'subtotal' => $subtotal,
                'voucher_discount_amount' => $voucherDiscountAmount,
                'total' => $subtotal - $voucherDiscountAmount,
                'notes' => $data['notes'] ?? null,
                'sold_at' => $data['sold_at'],
            ]);

            foreach ($items as $item) {
                $model = $item['model'];
                $isProduct = $item['type'] === 'product';

                $offlineSale->offlineSaleItems()->create([
                    'product_id' => $isProduct ? $model->id : null,
                    'service_id' => ! $isProduct ? $model->id : null,
                    'item_name' => $item['item_name'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'line_total' => $item['line_total'],
                ]);

                if ($isProduct) {
                    $model->decrement('stock_quantity', $item['quantity']);
                }
            }

            if ($voucher !== null) {
                VoucherRedemption::query()->create([
                    'voucher_id' => $voucher->id,
                    'customer_profile_id' => $offlineSale->customer_profile_id,
                    'offline_sale_id' => $offlineSale->id,
                    'discount_amount' => $voucherDiscountAmount,
                    'redeemed_at' => now(),
                ]);
            }

            return $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'customerProfile', 'lead', 'fieldStaff', 'event', 'voucherRedemption.voucher']);
        });
    }

    public function previewVoucher(array $data, string $code, float $subtotal): array
    {
        return $this->resolveVoucher($data, $code, $subtotal);
    }

    private function resolveVoucher(array $data, string $code, float $subtotal): array
    {
        if (empty($data['customer_profile_id'])) {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher hanya dapat digunakan jika profil customer CRM dipilih.',
            ]);
        }

        $customerProfile = \App\Models\CustomerProfile::query()->find($data['customer_profile_id']);

        if ($customerProfile === null || $customerProfile->member_status !== 'member') {
            throw ValidationException::withMessages([
                'voucher_code' => 'Voucher hanya dapat digunakan oleh customer member.',
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

    private function generateSaleNumber(): string
    {
        do {
            $saleNumber = 'OFF-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (OfflineSale::query()->where('sale_number', $saleNumber)->exists());

        return $saleNumber;
    }
}
