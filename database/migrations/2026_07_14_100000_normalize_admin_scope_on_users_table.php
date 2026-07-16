<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Samakan kontrak admin_scope: central|branch (bukan all).
     * Hanya backfill data; tidak mengubah schema (hindari dependency doctrine/dbal).
     */
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'admin')
            ->where(function ($query) {
                $query->whereNull('admin_scope')
                    ->orWhere('admin_scope', '')
                    ->orWhere('admin_scope', 'all');
            })
            ->update(['admin_scope' => 'central']);

        DB::table('users')
            ->where('role', '!=', 'admin')
            ->update(['admin_scope' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')
            ->where('role', 'admin')
            ->where('admin_scope', 'central')
            ->update(['admin_scope' => 'all']);

        DB::table('users')
            ->where('role', '!=', 'admin')
            ->whereNull('admin_scope')
            ->update(['admin_scope' => 'all']);
    }
};
