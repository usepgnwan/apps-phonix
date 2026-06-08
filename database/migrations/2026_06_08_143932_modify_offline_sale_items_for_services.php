<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('offline_sale_items', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->foreignId('service_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
            $table->renameColumn('product_name', 'item_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offline_sale_items', function (Blueprint $table) {
            $table->renameColumn('item_name', 'product_name');
            $table->dropForeign(['service_id']);
            $table->dropColumn('service_id');
            $table->foreignId('product_id')->nullable(false)->change();
        });
    }
};
