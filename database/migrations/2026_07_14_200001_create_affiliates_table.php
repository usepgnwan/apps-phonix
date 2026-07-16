<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('partner_code')->nullable()->unique();
            $table->string('coupon_code')->nullable()->unique();
            $table->foreignId('voucher_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending');
            $table->string('full_name');
            $table->string('email');
            $table->string('whatsapp');
            $table->string('city');
            $table->unsignedTinyInteger('age');
            $table->json('platforms');
            $table->string('media_url')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('payout_method');
            $table->string('payout_account_number');
            $table->string('payout_account_name');
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliates');
    }
};
