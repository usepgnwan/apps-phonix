<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offline_sales', function (Blueprint $table) {
            $table->foreignId('voucher_id')->nullable()->after('customer_profile_id')->constrained()->nullOnDelete();
            $table->decimal('subtotal', 12, 2)->default(0)->after('customer_whatsapp_number');
            $table->decimal('voucher_discount_amount', 12, 2)->default(0)->after('subtotal');
        });

        Schema::table('voucher_redemptions', function (Blueprint $table) {
            $table->foreignId('offline_sale_id')->nullable()->after('order_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('voucher_redemptions', function (Blueprint $table) {
            $table->dropForeign(['offline_sale_id']);
            $table->dropColumn('offline_sale_id');
        });

        Schema::table('offline_sales', function (Blueprint $table) {
            $table->dropForeign(['voucher_id']);
            $table->dropColumn(['voucher_id', 'subtotal', 'voucher_discount_amount']);
        });
    }
};
