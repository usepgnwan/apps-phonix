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
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'team')) {
                $table->dropColumn('team');
            }
            $table->foreignId('team_id')->nullable()->after('phone_number')->constrained('teams')->nullOnDelete();
            $table->string('photo')->nullable()->after('position_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['team_id']);
            $table->dropColumn(['team_id', 'photo']);
            $table->string('team')->nullable()->after('phone_number');
        });
    }
};
