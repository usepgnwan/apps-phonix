<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_referral_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('visitor_token')->nullable()->index();
            $table->foreignId('registered_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('landing_url')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('clicked_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['staff_user_id', 'clicked_at']);
            $table->index('registered_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_referral_clicks');
    }
};
