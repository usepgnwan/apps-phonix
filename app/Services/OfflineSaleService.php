<?php

namespace App\Services;

use App\Models\OfflineSale;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OfflineSaleService
{
    public function create(array $data): OfflineSale
    {
        return DB::transaction(function () use ($data): OfflineSale {
            $items = collect($data['items'])->map(function (array $item): array {
                $product = Product::query()
                    ->whereKey($item['product_id'])
                    ->lockForUpdate()
                    ->first();

                if ($product === null || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => 'Produk tidak valid atau sudah tidak aktif.',
                    ]);
                }

                if ((int) $item['quantity'] > $product->stock_quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name} tidak mencukupi.",
                    ]);
                }

                $unitPrice = (float) $product->price;
                $quantity = (int) $item['quantity'];
                $lineTotal = $unitPrice * $quantity;

                return [
                    'product' => $product,
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
                $product = $item['product'];

                $offlineSale->offlineSaleItems()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'line_total' => $item['line_total'],
                ]);

                $product->decrement('stock_quantity', $item['quantity']);
            }

            return $offlineSale->load(['offlineSaleItems.product', 'customerProfile', 'lead', 'fieldStaff', 'event']);
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
