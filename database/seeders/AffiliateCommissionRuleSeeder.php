<?php

namespace Database\Seeders;

use App\Models\AffiliateCommissionRule;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Database\Seeder;

class AffiliateCommissionRuleSeeder extends Seeder
{
    public function run(): void
    {
        $product = Product::query()->where('slug', 'madu-herbal-dummy')->first()
            ?? Product::query()->orderBy('id')->first();

        $service = Service::query()->where('slug', 'konsultasi-herbal-dummy')->first()
            ?? Service::query()->orderBy('id')->first();

        if ($product !== null) {
            AffiliateCommissionRule::query()->updateOrCreate(
                [
                    'name' => 'Komisi Produk · '.$product->name,
                    'product_id' => $product->id,
                ],
                [
                    'service_id' => null,
                    'commission_type' => AffiliateCommissionRule::TYPE_PERCENT,
                    'commission_value' => 10,
                    'is_active' => true,
                    'sort_order' => 10,
                ]
            );
        }

        if ($service !== null) {
            AffiliateCommissionRule::query()->updateOrCreate(
                [
                    'name' => 'Komisi Layanan · '.$service->name,
                    'service_id' => $service->id,
                ],
                [
                    'product_id' => null,
                    'commission_type' => AffiliateCommissionRule::TYPE_PERCENT,
                    'commission_value' => 15,
                    'is_active' => true,
                    'sort_order' => 20,
                ]
            );
        }
    }
}
