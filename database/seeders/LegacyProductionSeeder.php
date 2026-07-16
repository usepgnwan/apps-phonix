<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

/**
 * Import data production lama (skema pre-branch) ke skema baru.
 *
 * Prasyarat:
 * - database/data/legacy/*.json sudah diekstrak dari dump server
 * - schema sudah di-migrate (migrate:fresh / migrate)
 *
 * Tidak dipanggil dari DatabaseSeeder (dummy terpisah).
 *
 * @see .docs/legacy-data-seed-migration-plan.md
 */
class LegacyProductionSeeder extends Seeder
{
    private string $dataPath;

    private int $pusatBranchId;

    /** @var list<string> */
    private array $tablesWithSequences = [];

    public function run(): void
    {
        $this->dataPath = database_path('data/legacy');

        if (! File::isDirectory($this->dataPath)) {
            throw new RuntimeException(
                "Folder data legacy tidak ditemukan: {$this->dataPath}. ".
                'Jalankan scripts/extract-legacy-dump.sh terlebih dahulu.'
            );
        }

        $required = ['users.json', 'products.json'];
        foreach ($required as $file) {
            if (! File::exists($this->dataPath.'/'.$file)) {
                throw new RuntimeException("File data legacy wajib hilang: {$file}");
            }
        }

        DB::transaction(function (): void {
            $this->seedPusatBranch();

            // Migration 2026_06_21_000002 men-seed 4 position hierarchy dengan ID auto.
            // Data legacy punya ID + nama sendiri — ganti total agar FK user.position_id cocok.
            $this->replaceTable('positions');
            $this->replaceTable('teams');

            $this->seedUsers();
            $this->insertTable('customer_profiles');
            $this->insertTable('product_categories');
            $this->seedProductsAndStocks();
            $this->insertTable('services');
            $this->insertTable('payment_methods');
            $this->seedVouchers();
            $this->insertTable('lead_sources');
            $this->seedEvents();
            $this->seedLeads();
            $this->insertTable('lead_follow_ups');
            $this->insertTable('field_activities');
            $this->seedBookings();
            $this->insertTable('examinations');
            $this->insertTable('product_recommendations');
            $this->seedOrders();
            $this->insertTable('order_items');
            $this->seedOfflineSales();
            $this->insertTable('offline_sale_items');
            $this->insertTable('voucher_redemptions');
            $this->insertTable('testimonials');
            $this->insertTable('videos');
            $this->insertTable('settings');
            $this->insertTable('website_settings');
        });

        $this->resetSequences();

        $this->command?->info('Legacy production data imported. Cabang default: Pusat (id='.$this->pusatBranchId.').');
        $this->command?->info('Skip: carts, cart_items, cache, sessions, jobs, password_reset_tokens, migrations.');
    }

    private function seedPusatBranch(): void
    {
        $existing = DB::table('branches')->where('slug', 'pusat')->first();

        if ($existing) {
            $this->pusatBranchId = (int) $existing->id;
            $this->command?->info("Cabang Pusat sudah ada (id={$this->pusatBranchId}).");

            return;
        }

        $this->pusatBranchId = (int) DB::table('branches')->insertGetId([
            'name' => 'Pusat',
            'slug' => 'pusat',
            'code' => 'PST',
            'address' => 'Kantor Pusat (hasil seed data legacy)',
            'phone_number' => null,
            'description' => 'Cabang default untuk data production lama.',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->tablesWithSequences[] = 'branches';
        $this->command?->info("Cabang Pusat dibuat (id={$this->pusatBranchId}).");
    }

    private function seedUsers(): void
    {
        $rows = $this->loadRows('users');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $role = (string) ($row['role'] ?? 'customer');
            $isAdmin = $role === 'admin';

            $payload[] = $this->onlyColumns($row, [
                'id',
                'name',
                'email',
                'email_verified_at',
                'password',
                'remember_token',
                'created_at',
                'updated_at',
                'role',
                'is_active',
                'phone_number',
                'position_id',
                'team_id',
                'photo',
            ]) + [
                // Hash production diimpor apa adanya (cast User::password = hashed tidak dipakai di sini).
                'branch_id' => $isAdmin || $role === 'field_staff' ? $this->pusatBranchId : null,
                'admin_scope' => $isAdmin ? 'central' : null,
            ];
        }

        $this->chunkInsert('users', $payload);
    }

    private function seedProductsAndStocks(): void
    {
        $rows = $this->loadRows('products');
        if ($rows === []) {
            return;
        }

        $products = [];
        $stocks = [];
        $now = now();

        foreach ($rows as $row) {
            $productId = (int) $row['id'];
            $stockQty = max(0, (int) ($row['stock_quantity'] ?? 0));
            $lowThreshold = max(0, (int) ($row['low_stock_threshold'] ?? 0));

            $products[] = $this->onlyColumns($row, [
                'id',
                'product_category_id',
                'name',
                'slug',
                'price',
                'short_description',
                'full_description',
                'benefits',
                'usage_rules',
                'notes',
                'image_path',
                'is_active',
                'is_featured',
                'created_at',
                'updated_at',
                'composition',
                'packaging_type',
                'content_amount',
                'content_unit',
                'bpom_number',
            ]);

            $stocks[] = [
                'branch_id' => $this->pusatBranchId,
                'product_id' => $productId,
                'stock_quantity' => $stockQty,
                'low_stock_threshold' => $lowThreshold,
                'created_at' => $row['created_at'] ?? $now,
                'updated_at' => $row['updated_at'] ?? $now,
            ];
        }

        $this->chunkInsert('products', $products);
        $this->chunkInsert('branch_product_stocks', $stocks);
        $this->tablesWithSequences[] = 'branch_product_stocks';
    }

    private function seedVouchers(): void
    {
        $rows = $this->loadRows('vouchers');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, [
                'id',
                'code',
                'name',
                'description',
                'discount_type',
                'discount_value',
                'minimum_purchase',
                'starts_at',
                'ends_at',
                'usage_limit',
                'is_published',
                'created_at',
                'updated_at',
                'target_audience',
            ]) + [
                'affiliate_id' => null,
            ];
        }

        $this->chunkInsert('vouchers', $payload);
    }

    private function seedEvents(): void
    {
        $rows = $this->loadRows('events');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, [
                'id',
                'name',
                'location',
                'organizer',
                'notes',
                'created_at',
                'updated_at',
                'start_date',
                'end_date',
                'is_active',
            ]) + [
                'branch_id' => $this->pusatBranchId,
            ];
        }

        $this->chunkInsert('events', $payload);
    }

    private function seedLeads(): void
    {
        $rows = $this->loadRows('leads');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, [
                'id',
                'assigned_staff_id',
                'customer_profile_id',
                'lead_source_id',
                'event_id',
                'name',
                'whatsapp_number',
                'address',
                'interested_product_notes',
                'interested_service_notes',
                'initial_complaint',
                'follow_up_status',
                'internal_notes',
                'created_at',
                'updated_at',
            ]) + [
                'branch_id' => $this->pusatBranchId,
            ];
        }

        $this->chunkInsert('leads', $payload);
    }

    private function seedBookings(): void
    {
        $rows = $this->loadRows('bookings');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, [
                'id',
                'booking_number',
                'user_id',
                'customer_profile_id',
                'service_id',
                'name',
                'whatsapp_number',
                'visit_type',
                'desired_schedule_at',
                'complaint_notes',
                'status',
                'admin_notes',
                'created_at',
                'updated_at',
            ]) + [
                'branch_id' => $this->pusatBranchId,
                'affiliate_id' => null,
            ];
        }

        $this->chunkInsert('bookings', $payload);
    }

    private function seedOrders(): void
    {
        $rows = $this->loadRows('orders');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, [
                'id',
                'order_number',
                'user_id',
                'customer_profile_id',
                'voucher_id',
                'payment_method_id',
                'customer_name',
                'customer_whatsapp_number',
                'customer_email',
                'shipping_address',
                'subtotal',
                'voucher_discount_amount',
                'shipping_cost',
                'total',
                'courier_name',
                'tracking_number',
                'shipping_status',
                'shipping_notes',
                'payment_status',
                'payment_received_at',
                'payment_notes',
                'status',
                'admin_notes',
                'created_at',
                'updated_at',
                'stock_decremented_at',
            ]) + [
                'branch_id' => $this->pusatBranchId,
                'affiliate_id' => null,
            ];
        }

        $this->chunkInsert('orders', $payload);
    }

    private function seedOfflineSales(): void
    {
        $rows = $this->loadRows('offline_sales');
        if ($rows === []) {
            return;
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, [
                'id',
                'sale_number',
                'customer_profile_id',
                'lead_id',
                'field_staff_id',
                'event_id',
                'source',
                'customer_name',
                'customer_whatsapp_number',
                'total',
                'notes',
                'sold_at',
                'created_at',
                'updated_at',
                'payment_method_id',
                'voucher_id',
                'subtotal',
                'voucher_discount_amount',
            ]) + [
                'branch_id' => $this->pusatBranchId,
            ];
        }

        $this->chunkInsert('offline_sales', $payload);
    }

    /**
     * Kosongkan tabel lalu isi dari JSON (untuk master yang mungkin sudah di-seed migration).
     */
    private function replaceTable(string $table, ?array $columns = null): void
    {
        DB::table($table)->delete();
        $this->insertTable($table, $columns);
    }

    /**
     * Insert generik: kolom JSON yang cocok dengan tabel (tanpa transform ekstra).
     *
     * @param  list<string>|null  $columns  null = pakai semua key baris pertama
     */
    private function insertTable(string $table, ?array $columns = null): void
    {
        $rows = $this->loadRows($table);
        if ($rows === []) {
            $this->command?->line("  · {$table}: 0 rows (skip)");

            return;
        }

        if ($columns === null) {
            $columns = array_keys($rows[0]);
        }

        $payload = [];
        foreach ($rows as $row) {
            $payload[] = $this->onlyColumns($row, $columns);
        }

        $this->chunkInsert($table, $payload);
    }

    /**
     * setval membutuhkan nama tabel literal; whitelist karakter aman.
     */
    private function assertSafeTableName(string $table): void
    {
        if (! preg_match('/^[a-z_]+$/', $table)) {
            throw new RuntimeException("Nama tabel tidak valid untuk sequence reset: {$table}");
        }
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    private function chunkInsert(string $table, array $rows): void
    {
        if ($rows === []) {
            return;
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table($table)->insert($chunk);
        }

        $this->tablesWithSequences[] = $table;
        $this->command?->line('  · '.$table.': '.count($rows).' rows');
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function loadRows(string $table): array
    {
        $path = $this->dataPath.'/'.$table.'.json';

        if (! File::exists($path)) {
            $this->command?->warn("  · {$table}: file JSON tidak ada, di-skip");

            return [];
        }

        $decoded = json_decode(File::get($path), true);

        if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException("JSON invalid: {$path} — ".json_last_error_msg());
        }

        if ($decoded === null || $decoded === []) {
            return [];
        }

        if (! is_array($decoded)) {
            throw new RuntimeException("JSON {$path} harus array of objects.");
        }

        // json_agg kosong bisa jadi null yang sudah ditangani; associative single object ditolak
        if ($decoded !== [] && ! array_is_list($decoded)) {
            throw new RuntimeException("JSON {$path} harus list (array numerik).");
        }

        return $decoded;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  list<string>  $columns
     * @return array<string, mixed>
     */
    private function onlyColumns(array $row, array $columns): array
    {
        $out = [];
        foreach ($columns as $column) {
            if (array_key_exists($column, $row)) {
                $out[$column] = $row[$column];
            }
        }

        return $out;
    }

    private function resetSequences(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->command?->warn('Driver DB bukan pgsql — skip reset sequence. Pastikan ID manual tidak bentrok.');

            return;
        }

        $tables = array_values(array_unique($this->tablesWithSequences));

        foreach ($tables as $table) {
            $this->assertSafeTableName($table);

            $hasId = DB::selectOne(
                'SELECT 1 AS ok FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?',
                [$table, 'id']
            );

            if ($hasId === null) {
                continue;
            }

            // setval(regclass, bigint) — nama sequence dari pg_get_serial_sequence.
            DB::statement(
                "SELECT setval(pg_get_serial_sequence('{$table}', 'id'), COALESCE((SELECT MAX(id) FROM {$table}), 1))"
            );
        }

        $this->command?->info('PostgreSQL sequences di-reset untuk '.count($tables).' tabel.');
    }
}
