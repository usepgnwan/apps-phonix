<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voucher_redemptions', function (Blueprint $table) {
            // Drop unique constraint first
            $table->dropUnique(['voucher_id', 'customer_profile_id']);
            
            // Make customer_profile_id nullable
            $table->unsignedBigInteger('customer_profile_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Revert is risky if there are nulls, but we will try our best
        Schema::table('voucher_redemptions', function (Blueprint $table) {
            // We can't revert safely if there are null customer_profile_id records
            // For a clean rollback, we would have to delete or fix those records.
            // But for this simple migration down method:
            // $table->unsignedBigInteger('customer_profile_id')->nullable(false)->change();
            // $table->unique(['voucher_id', 'customer_profile_id']);
        });
    }
};
