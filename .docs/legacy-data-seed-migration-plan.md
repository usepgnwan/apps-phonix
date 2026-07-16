# Plan: Seed Data Legacy Server → Skema Baru (Local/Staging)

Dokumen ini merencanakan cara mengimpor data production lama (dump PostgreSQL) ke environment local/staging yang sudah memakai skema baru (branch, stok per cabang, admin_scope, affiliate).

Status dokumen: **implemented (local)** — seeder + extract script + data JSON lokal sudah ada.

Implementasi terkait:

- `database/seeders/LegacyProductionSeeder.php`
- `scripts/extract-legacy-dump.sh`
- `database/data/legacy/*.json` (gitignored)
- `.gitignore` entries untuk legacy dump/data

## Tujuan

1. **Primary**: testing migrasi production ke skema baru di local/staging, memakai data nyata dari server lama.
2. Bukan untuk mengganti seeder dummy harian; seeder dummy tetap ada untuk smoke test cepat.
3. Hasil akhir: database local/staging berisi data legacy yang sudah **ditransform** agar valid di skema baru, siap diuji alur admin, stok, order, booking, lead, offline sales.

## Keputusan yang Sudah Disetujui

| # | Keputusan | Detail |
|---|-----------|--------|
| 1 | Tujuan | Local/staging testing untuk migrasi production skema baru |
| 2 | Mapping cabang | **Semua** data operasional lama → cabang **Pusat** |
| 3 | Admin scope | Admin lama tanpa scope → `admin_scope = central` |
| 4 | Deliverable fase ini | **Plan di `.docs/` saja** (implementasi belakangan) |
| 5 | Cart | **Skip total** — `carts` dan `cart_items` tidak diimpor |
| 6 | Master cabang | Seed **hanya Pusat**; cabang lain diinput manual nanti (bukan lewat seeder legacy) |
| 7 | Password login | Default: **impor hash apa adanya** (login pakai password production). Reset password known opsional — lihat penjelasan di bawah |

## Sumber Data

- File dump: `dump-phonixapps-202607152025.sql` (path user: `~/Downloads/`)
- Format: **PostgreSQL custom dump** (`PGDMP`), version header **1.16**
- Dibuat dari: PostgreSQL **17.10** (Ubuntu)
- Database name di dump: `phonixapps`
- Ukuran: ~127 KB (dataset relatif kecil)

### Catatan teknis dump

- Bukan plain SQL; `pg_restore` wajib.
- `pg_restore` PostgreSQL 14 di mesin lokal **gagal** (`unsupported version 1.16`).
- Ekstraksi butuh **PostgreSQL 17+** (Homebrew `postgresql@17` atau container `postgres:17` bila Docker tersedia).
- Dump **tidak** boleh di-commit ke git (data production). Hasil ekstraksi JSON/CSV juga sebaiknya di `.gitignore` kecuali ada keputusan eksplisit tim untuk anonymize + commit subset.

## Konteks Skema: Lama vs Baru

### Tabel yang ada di dump (skema lama)

`bookings`, `cache`, `cache_locks`, `cart_items`, `carts`, `customer_profiles`, `events`, `examinations`, `failed_jobs`, `field_activities`, `job_batches`, `jobs`, `lead_follow_ups`, `lead_sources`, `leads`, `migrations`, `offline_sale_items`, `offline_sales`, `order_items`, `orders`, `password_reset_tokens`, `payment_methods`, `positions`, `product_categories`, `product_recommendations`, `products`, `services`, `sessions`, `settings`, `teams`, `testimonials`, `users`, `videos`, `voucher_redemptions`, `vouchers`, `website_settings`

### Tabel/kolom baru di project (belum ada di dump)

| Area | Perubahan |
|------|-----------|
| Branch | `branches`, `branch_product_stocks` |
| User | `users.branch_id`, `users.admin_scope` |
| Transaksi | `branch_id` di `bookings`, `orders`, `carts`, `offline_sales`, `leads`, `events` |
| Stok | `products.stock_quantity` & `low_stock_threshold` **dihapus**; stok pindah ke `branch_product_stocks` |
| Affiliate | `affiliates`, `affiliate_commission_rules`, `affiliate_referrals`, `affiliate_payouts`, `affiliate_commissions` |
| Affiliate FK | `orders.affiliate_id`, `bookings.affiliate_id`, `vouchers.affiliate_id` (nullable) |

### Kolom legacy penting di dump (harus ditransform)

- `products.stock_quantity`, `products.low_stock_threshold` → `branch_product_stocks` untuk cabang Pusat
- `users` tanpa `branch_id` / `admin_scope` → diisi sesuai rule di bawah
- Transaksi tanpa `branch_id` → semua ke Pusat
- Affiliate columns → `null` (data lama belum punya affiliate)

## Referensi Internal Project

- `.docs/branch-module-plan.md` — keputusan domain branch & stok
- `.docs/affiliate-module-plan.md` — modul affiliate (data lama kosong)
- `database/seeders/BranchSeeder.php` — cabang default `pusat` / `cabang-bandung`
- `database/seeders/DatabaseSeeder.php` — seeder dummy (tetap terpisah)
- Migration backfill stok: `2026_07_13_040626_backfill_product_stocks_to_branches.php`
- Migration normalize admin scope: `2026_07_14_100000_normalize_admin_scope_on_users_table.php`

## Approach yang Dipilih

**Opsi A: Ekstrak dump → file data intermediate → Laravel seeder transform**

Alasan:

1. Dump binary tidak bisa di-restore langsung oleh stack local (PG version mismatch).
2. Skema lama ≠ skema baru; restore full dump ke DB app akan gagal / inkonsisten.
3. Dataset kecil → JSON/CSV intermediate mudah di-review dan diulang.
4. Cocok untuk uji migrasi berulang di local/staging tanpa menyentuh production.

### Alur high-level

```
[1] Dump PG custom (server lama)
        ↓  pg_restore 17 → DB temp / plain SQL
[2] Ekstrak tabel bisnis → database/data/legacy/*.json (gitignored)
        ↓
[3] migrate:fresh (skema baru penuh)
        ↓
[4] LegacyProductionSeeder
        - pastikan Branch Pusat ada
        - import master & transaksi (preserve ID)
        - transform branch_id, admin_scope, stok
        - skip cache/session/jobs
        - affiliate tetap kosong (nullable)
        ↓
[5] Verifikasi checklist (query + smoke UI)
```

## Aturan Transformasi (kontrak data)

### 1. Cabang default

- Seed master cabang **hanya Pusat** (`slug = pusat`, `code = PST` jika dipakai di backfill existing).
- **Tidak** seed Cabang Bandung lewat seeder legacy; cabang tambahan diinput manual di admin nanti.
- **Semua** record yang butuh `branch_id` diisi `branches.id` milik Pusat:
  - `users` (admin & staff; customer boleh `null` jika kontrak app mengizinkan)
  - `bookings`
  - `orders`
  - `offline_sales`
  - `leads`
  - `events`
- `carts` tidak relevan (di-skip total).

### 2. Admin scope

- `role = admin` → `admin_scope = central`
- role non-admin → `admin_scope = null`
- Selaras dengan migration normalize yang sudah ada di codebase.

### 3. Stok produk

Untuk setiap product di dump:

```
branch_product_stocks:
  branch_id   = Pusat
  product_id  = products.id (preserve)
  stock_quantity = products.stock_quantity (max 0)
  low_stock_threshold = products.low_stock_threshold (max 0)
```

Kolom global di `products` **tidak** diinsert (sudah di-drop skema baru).

### 4. Affiliate

- Tidak ada data affiliate di dump.
- Semua `affiliate_id` di orders/bookings/vouchers → `null`.
- Tabel affiliate boleh kosong; seeder commission rule dummy **opsional** (jangan diwajibkan untuk uji migrasi data legacy).

### 5. Preserve ID & relasi

- **Pertahankan primary key** dari dump untuk tabel bisnis agar FK tetap konsisten (`orders` → `order_items`, `bookings` → `examinations`, dll).
- Setelah insert, reset sequence PostgreSQL per tabel:

```sql
SELECT setval(pg_get_serial_sequence('table_name', 'id'), COALESCE((SELECT MAX(id) FROM table_name), 1));
```

### 6. Password & auth

- Hash password di `users.password` diimpor apa adanya (default).
- Login local/staging memakai credential production (hati-hati; hanya di mesin trusted).
- Jangan log password plain text di seeder.

#### Apa arti “reset password admin test setelah seed?”

Ini **bukan** bagian wajib. Hanya opsi kenyamanan testing:

| Opsi | Perilaku | Kapan dipakai |
|------|----------|---------------|
| **A. Impor hash apa adanya (default)** | Password user di local = password di production. Anda login dengan credential yang sudah dipakai di server. | Anda masih ingat / punya akses password production admin. |
| **B. Reset satu admin ke password known** | Setelah seed, seeder (opsional) meng-`Hash::make('password')` atau string fixed lain untuk **satu** email admin test, mis. admin utama. User lain tetap hash production. | Anda **tidak** ingat password production, atau ingin password local yang aman/dikenal tim (`password`, `admin123`, dll) tanpa mengutak-atik production. |

Catatan:

- Reset hanya mempengaruhi **DB local/staging** hasil seed, **bukan** server production.
- Hash di dump tidak bisa di-reverse; tanpa password asli, satu-satunya cara login local adalah opsi B (atau fitur “lupa password” jika mail local dikonfigurasi).
- Keputusan default plan: **opsi A**. Opsi B ditambahkan nanti hanya jika saat implementasi password production tidak tersedia.

### 7. File path media

- Field seperti `image_path`, `qris_image_path`, `photo_path`, `result_pdf_path` diimpor string-nya.
- File fisik di `storage/` kemungkinan **tidak** ada di local → UI boleh broken image; ini acceptable untuk uji data/schema.
- Out of scope fase 1: sync storage dari server.

### 8. Tabel yang di-skip

| Tabel | Alasan |
|-------|--------|
| `carts`, `cart_items` | ephemeral checkout; **keputusan user: skip total** |
| `cache`, `cache_locks` | runtime |
| `sessions` | runtime |
| `jobs`, `job_batches`, `failed_jobs` | queue |
| `password_reset_tokens` | ephemeral |
| `migrations` | diganti oleh migrate local |

### 9. Urutan import (FK-safe)

1. `branches` (**hanya Pusat**)
2. `positions`, `teams`
3. `users` (+ transform `branch_id`, `admin_scope`)
4. `customer_profiles`
5. `product_categories` → `products` (tanpa stock kolom)
6. `branch_product_stocks` (dari stock legacy → Pusat)
7. `services`
8. `payment_methods`
9. `vouchers` (`affiliate_id` null)
10. `lead_sources` → `events` → `leads` → `lead_follow_ups` → `field_activities`
11. `bookings` → `examinations` → `product_recommendations`
12. `orders` → `order_items` → `voucher_redemptions` (order side)
13. `offline_sales` → `offline_sale_items` → voucher redemptions offline
14. `testimonials`, `videos`, `settings`, `website_settings`

**Tidak diimpor:** `carts`, `cart_items`, cache/session/jobs, `password_reset_tokens`, `migrations`.

## Artefak yang Akan Dibuat (fase implementasi — nanti)

### A. Tooling ekstraksi (pilih salah satu)

**A1. Homebrew PostgreSQL 17**

```bash
# outline saja — dijalankan saat implementasi + izin user
brew install postgresql@17
# buat DB temp, pg_restore dump, COPY/export ke JSON
```

**A2. Docker (jika tersedia)**

```bash
docker run --rm -v "$PWD:/work" -v "$HOME/Downloads:/dumps" postgres:17 \
  pg_restore -f /work/legacy-plain.sql /dumps/dump-phonixapps-202607152025.sql
```

Output plain SQL atau export per-tabel ke:

```
database/data/legacy/
  users.json
  products.json
  orders.json
  ...
```

Folder ini **gitignored**.

### B. Seeder Laravel

| File | Peran |
|------|--------|
| `database/seeders/LegacyProductionSeeder.php` | Orkestrator: load JSON, transform, insert, reset sequence |
| Opsional: `database/seeders/Legacy/*.php` | Satu seeder per domain jika file monolit terlalu besar |

Command target:

```bash
php artisan migrate:fresh
php artisan db:seed --class=LegacyProductionSeeder
```

**Jangan** panggil `LegacyProductionSeeder` dari `DatabaseSeeder` default (hindari tumpang tindih dummy vs production data).

### C. Script helper (opsional)

- `scripts/extract-legacy-dump.sh` — restore + export JSON
- `scripts/verify-legacy-seed.php` atau Artisan command — checklist count & null checks

### D. Ignore rules

Tambah ke `.gitignore` (saat implementasi):

```
database/data/legacy/
*.pgdump
dump-*.sql
```

## Checklist Verifikasi Pasca-Seed

### Data integrity

- [ ] Jumlah baris key tables (users, products, orders, bookings, leads) ≈ dump
- [ ] Tidak ada orphan FK (order_items tanpa order, dll)
- [ ] Semua `branch_id` non-null di tabel operasional mengarah ke Pusat
- [ ] Semua admin punya `admin_scope = central`
- [ ] Non-admin punya `admin_scope = null`
- [ ] Setiap product aktif punya row stok di Pusat (meski qty 0)
- [ ] `products` tidak punya kolom `stock_quantity` (schema baru)
- [ ] Sequence ID tidak bentrok saat insert record baru setelah seed

### Smoke fungsional (manual / test ringan)

- [ ] Login admin production hash berhasil
- [ ] Admin dashboard load (scope central)
- [ ] Katalog produk + stok Pusat tampil
- [ ] Detail order lama terbuka
- [ ] Detail booking lama terbuka
- [ ] Offline sale lama terbuka
- [ ] Lead/field activity lama terbuka
- [ ] Buat order/booking **baru** setelah seed (sequence OK)
- [ ] Affiliate module tidak error meski data kosong

### Yang sengaja tidak dijamin

- Gambar/PDF media path
- Session/cart guest aktif
- Queue job history
- Data multi-cabang (legacy 100% Pusat; cabang lain manual nanti)
- Isi `carts` / `cart_items`

## Strategi Uji Migrasi Production (mirror local)

Alur yang disimulasikan di local/staging:

1. Ambil dump skema **lama** (seperti file user).
2. Apply skema **baru** via `php artisan migrate` (bukan restore schema dump).
3. Import + transform data (seeder legacy).
4. Verifikasi checklist.
5. Catat gap/bug yang muncul (query null, UI filter cabang, stok, permission admin_scope).
6. Perbaiki app/migration backfill jika perlu **sebelum** touch production.

Catatan production nanti (out of scope seeder, tapi terkait):

- Production ideal: deploy code + migrate (termasuk backfill existing) **in-place**, bukan `migrate:fresh`.
- Seeder legacy ini adalah **simulasi** “data lama masuk ke dunia baru”, bukan prosedur production final.
- Backfill production seharusnya mengikuti pola migration yang sudah ada (`backfill_product_stocks_to_branches`, normalize `admin_scope`), dengan default Pusat — selaras keputusan #2 dan #3.

## Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| PG 14 tidak bisa restore dump 17 | Wajib tool PG 17 untuk ekstraksi |
| Data production bocor ke git | gitignore + jangan commit dump/JSON |
| Bentrok seeder dummy vs legacy | class seeder terpisah; jangan auto-call di DatabaseSeeder |
| ID sequence rusak | reset sequence setelah import |
| FK order salah urutan | ikuti urutan import di atas |
| Media hilang | dokumentasikan; jangan block verifikasi schema |
| Password production di local | environment trusted only; jangan share DB dump |
| Carts/sessions usang | skip total (keputusan final) |

## Out of Scope (fase ini)

- Implementasi seeder/script (menunggu approval plan + izin command)
- Anonymisasi data (PII) untuk share ke dev lain
- Sync file `storage/` dari server
- Multi-cabang mapping historis (selain Pusat)
- Migrasi in-place production
- Seed data affiliate historis
- Commit dump ke repository

## Fase Kerja Implementasi (nanti, setelah plan disetujui)

### Fase 0 — Prasyarat

1. Pastikan PostgreSQL 17 tersedia (Homebrew atau alternatif yang disetujui user).
2. Pastikan local app bisa `migrate:fresh` ke DB kosong.
3. Konfirmasi path dump final.

### Fase 1 — Ekstraksi

1. Restore dump ke DB temporary.
2. Export tabel bisnis ke `database/data/legacy/*.json`.
3. Catat row counts per tabel sebagai baseline.

### Fase 2 — Seeder transform

1. Buat `LegacyProductionSeeder` + helper insert/sequence.
2. Implement rule Pusat + `admin_scope` + stok.
3. Skip tabel runtime.

### Fase 3 — Verifikasi

1. Jalankan checklist integrity.
2. Smoke UI login + CRUD baca data lama + create baru.
3. Catat temuan di `.docs/` (changelog singkat atau section “Hasil uji”).

### Fase 4 — Hardening (opsional)

1. Artisan command `legacy:import` dengan flag `--dry-run`.
2. Validasi JSON schema sederhana.
3. Script verify otomatis.

## Acceptance Criteria Plan Ini

Plan dianggap siap dieksekusi jika:

1. Keputusan mapping (Pusat + central) tercatat dan tidak ambigu.
2. Gap skema lama→baru terdaftar lengkap.
3. Urutan import & skip list jelas.
4. Prasyarat tool (PG 17) dan batasan (jangan commit data) jelas.
5. Checklist verifikasi siap dipakai saat implementasi.

## Hasil Implementasi (2026-07-16)

### Artefak

| Artefak | Status |
|---------|--------|
| `database/seeders/LegacyProductionSeeder.php` | ✅ |
| `scripts/extract-legacy-dump.sh` | ✅ |
| `database/data/legacy/*.json` | ✅ (lokal, gitignored) |
| `.gitignore` | ✅ |

### Cara pakai ulang

```bash
# 1) Ekstrak dump (butuh postgresql@17)
./scripts/extract-legacy-dump.sh ~/Downloads/dump-phonixapps-202607152025.sql

# 2) Schema baru + import legacy
php artisan migrate:fresh
php artisan db:seed --class=LegacyProductionSeeder
```

**Jangan** pakai `php artisan db:seed` default (itu dummy `DatabaseSeeder`).

### Verifikasi lokal (setelah seed pertama)

| Cek | Hasil |
|-----|--------|
| users / products / orders / bookings / offline_sales | 36 / 10 / 3 / 3 / 4 |
| branches | 1 (Pusat only) |
| branch_product_stocks | 10 (semua branch_id=Pusat, qty dari dump) |
| admin `admin@phoenix.test` | `admin_scope=central` |
| non-admin admin_scope | semua `null` |
| orders/bookings/offline_sales.branch_id | semua Pusat |
| products.stock_quantity column | tidak ada (skema baru OK) |
| carts | 0 (skip) |
| affiliates | 0 |
| sequence users | nextval > max(id) OK |

### Catatan teknis implementasi

- Migration `2026_06_21_000002_seed_staff_hierarchy_positions` men-seed 4 position dulu; seeder legacy **mengganti** `positions`/`teams` agar ID match data production.
- Password diimpor via `DB::table` (bukan Eloquent) supaya cast `hashed` di model User tidak double-hash.
- Temp PostgreSQL 17 cluster dipakai hanya saat extract; app tetap di PG14/local `.env`.

## Status Keputusan Pending (boleh dijawab saat mau implementasi)

1. ~~Carts~~ → **skip total** (keputusan final).
2. ~~Cabang Bandung di seeder~~ → **hanya Pusat**; cabang lain manual nanti.
3. Apakah JSON legacy boleh disimpan hanya lokal (default), atau perlu subset anonymized di repo?
4. ~~Password~~ → default **impor hash production**. Opsi reset satu admin ke password known hanya jika credential production tidak tersedia saat implementasi.

## Ringkasan Eksekutif

Ya — data dump server lama **bisa** dijadikan basis testing skema baru. Cara yang benar: **bukan** restore dump ke app DB, melainkan **ekstrak → transform → seed** dengan rule:

- semua operasional → **Pusat**
- admin → **`admin_scope = central`**
- stok global → **`branch_product_stocks` Pusat**
- affiliate → **kosong/null**

Dokumen ini adalah kontrak plan. Implementasi menunggu perintah eksplisit user (termasuk izin install PG 17 / jalankan command berat bila diperlukan).
