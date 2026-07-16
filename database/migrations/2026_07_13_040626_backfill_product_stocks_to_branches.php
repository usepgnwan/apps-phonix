<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Temukan cabang default (Pusat atau cabang pertama yang ada)
        $defaultBranch = DB::table('branches')->where('code', 'PST')->first() ?? DB::table('branches')->first();

        if ($defaultBranch) {
            $products = DB::table('products')->get();
            $stocks = [];

            foreach ($products as $product) {
                // Gunakan quantity dari product jika > 0, sisanya 0
                $stocks[] = [
                    'branch_id' => $defaultBranch->id,
                    'product_id' => $product->id,
                    'stock_quantity' => max(0, $product->stock_quantity ?? 0),
                    'low_stock_threshold' => max(0, $product->low_stock_threshold ?? 0),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($stocks)) {
                DB::table('branch_product_stocks')->insertOrIgnore($stocks);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We cannot reliably revert this backfill without data loss if stocks changed, 
        // so we truncate the table instead in a strict rollback scenario.
        DB::table('branch_product_stocks')->truncate();
    }
};
