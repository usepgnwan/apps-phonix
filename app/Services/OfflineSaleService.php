<?php

namespace App\Services;

use App\Models\OfflineSale;
use App\Models\Product;
use App\Models\Service;
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

            $offlineSale = OfflineSale::query()->create([
                'sale_number' => $this->generateSaleNumber(),
                'customer_profile_id' => $data['customer_profile_id'] ?? null,
                'lead_id' => $data['lead_id'] ?? null,
                'field_staff_id' => $data['field_staff_id'] ?? null,
                'event_id' => $data['event_id'] ?? null,
                'source' => $data['source'],
                'customer_name' => $data['customer_name'],
                'customer_whatsapp_number' => $data['customer_whatsapp_number'] ?? null,
                'total' => $items->sum('line_total'),
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

            return $offlineSale->load(['offlineSaleItems.product', 'offlineSaleItems.service', 'customerProfile', 'lead', 'fieldStaff', 'event']);
        });
    }

    private function generateSaleNumber(): string
    {
        do {
            $saleNumber = 'OFF-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (OfflineSale::query()->where('sale_number', $saleNumber)->exists());

        return $saleNumber;
    }
}
