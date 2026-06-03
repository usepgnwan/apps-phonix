<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_profile_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('voucher_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_whatsapp_number');
            $table->text('shipping_address');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('voucher_discount_amount', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('courier_name')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('shipping_status')->default('pending_shipping_confirmation');
            $table->text('shipping_notes')->nullable();
            $table->string('payment_status')->default('pending');
            $table->timestamp('payment_received_at')->nullable();
            $table->text('payment_notes')->nullable();
            $table->string('status')->default('waiting_shipping_confirmation');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
