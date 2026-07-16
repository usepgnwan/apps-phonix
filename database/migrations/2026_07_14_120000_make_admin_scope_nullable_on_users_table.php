<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * admin_scope hanya meaningful untuk role admin.
     * Non-admin harus boleh null (bukan default 'all').
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'admin_scope')) {
            return;
        }

        // PostgreSQL / MySQL: drop default 'all' lalu izinkan null.
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN admin_scope DROP DEFAULT');
            DB::statement('ALTER TABLE users ALTER COLUMN admin_scope DROP NOT NULL');
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE users MODIFY admin_scope VARCHAR(255) NULL DEFAULT NULL');
        }
        // SQLite: ALTER COLUMN limited — fresh migrate memakai migration add_admin_scope yang sudah nullable.

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

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'admin_scope')) {
            return;
        }

        DB::table('users')
            ->whereNull('admin_scope')
            ->update(['admin_scope' => 'all']);

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE users ALTER COLUMN admin_scope SET DEFAULT 'all'");
            DB::statement('ALTER TABLE users ALTER COLUMN admin_scope SET NOT NULL');
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY admin_scope VARCHAR(255) NOT NULL DEFAULT 'all'");
        }
    }
};
