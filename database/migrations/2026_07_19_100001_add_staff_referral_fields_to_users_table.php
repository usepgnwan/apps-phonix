<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('staff_code')->nullable()->unique()->after('admin_scope');
            $table->boolean('staff_referral_enabled')->default(true)->after('staff_code');
            $table->foreignId('referred_by_staff_id')
                ->nullable()
                ->after('staff_referral_enabled')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('referred_at')->nullable()->after('referred_by_staff_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referred_by_staff_id');
            $table->dropColumn(['staff_code', 'staff_referral_enabled', 'referred_at']);
        });
    }
};
