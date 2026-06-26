<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('name');
            $table->date('end_date')->nullable()->after('start_date');
            $table->boolean('is_active')->default(true)->after('notes');
        });

        DB::table('events')
            ->whereNull('start_date')
            ->update([
                'start_date' => DB::raw('event_date'),
                'end_date' => DB::raw('event_date'),
            ]);

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('event_date');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->date('event_date')->nullable()->after('name');
        });

        DB::table('events')
            ->whereNull('event_date')
            ->update(['event_date' => DB::raw('start_date')]);

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'is_active']);
        });
    }
};
