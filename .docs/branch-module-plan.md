# Plan Modul Cabang dan Stok Per Cabang

Dokumen ini merencanakan penambahan modul Cabang untuk Phoenix Herbal Commerce. Fokus utama modul ini adalah membuat data operasional dapat dipisahkan per cabang, terutama stok produk yang memang harus berbeda per cabang.

Status dokumen: planning, belum implementasi kode.

Sumber konteks:

- `.docs/system-flow.md`
- `.docs/implementation-progress.md`
- `app/Models/Team.php`
- `app/Models/User.php`
- `database/migrations/2026_06_17_152530_create_teams_table.php`
- `database/migrations/2026_06_17_152537_update_staff_fields_in_users_table.php`

## Keputusan Domain

### Team Tidak Dipakai Sebagai Cabang

`Team` saat ini tetap dipertahankan sebagai pengelompokan staff lapangan. Alasannya:

- Nama domain dan UI saat ini adalah Tim, bukan Cabang.
- `teams` hanya punya `name` dan `description`.
- Relasi `Team` saat ini hanya ke `users`.
- Controller dan pesan UI menganggap Team sebagai data staff grouping.
- Cabang membutuhkan informasi operasional seperti kode, alamat, nomor kontak, status aktif, dan relasi ke stok/transaksi.

### Branch Menjadi Entitas Baru

Modul baru memakai entitas `Branch` dengan tabel `branches`. Cabang mewakili lokasi operasional bisnis, misalnya Bandung, Jakarta, atau cabang toko/klinik tertentu.

### Stok Produk Per Cabang

Stok tidak lagi cukup disimpan hanya di `products.stock_quantity` untuk flow multi-cabang. Produk tetap menjadi master katalog global, sedangkan jumlah stok aktual disimpan per cabang.

Konsep utama:

- `products` = master produk global.
- `branches` = master cabang.
- `branch_product_stocks` = stok produk per cabang.
- Transaksi online/offline menyimpan `branch_id` agar histori tidak berubah walaupun user/staff pindah cabang.

## Scope MVP Modul Cabang

Masuk scope MVP:

- Master data cabang di admin.
- Assignment user/staff/admin ke cabang.
- Stok produk per cabang.
- Offline sales wajib menyimpan cabang transaksi.
- Order online menyimpan cabang fulfillment.
- Booking layanan menyimpan cabang layanan.
- Dashboard dan laporan dapat difilter per cabang.
- Seeder dummy minimal untuk satu cabang default.

Tidak masuk scope MVP pertama:

- Transfer stok antar cabang.
- Stock opname lengkap.
- Multi-warehouse di dalam satu cabang.
- Komisi staff per cabang.
- Auto-routing cabang berdasarkan alamat customer.
- Kapasitas jadwal layanan per cabang.

## Struktur Data yang Direncanakan

### `branches`

Field awal:

- `id`
- `name`
- `slug` unique
- `code` unique nullable atau required sesuai keputusan final
- `address` nullable text
- `phone_number` nullable string
- `description` nullable text
- `is_active` boolean default true
- timestamps

Relasi:

- `Branch hasMany User`
- `Branch hasMany BranchProductStock`
- `Branch hasMany Order`
- `Branch hasMany Booking`
- `Branch hasMany OfflineSale`
- `Branch hasMany Lead` jika CRM perlu cabang
- `Branch hasMany Event` jika event perlu cabang penyelenggara

### `users.branch_id`

Tambahkan nullable FK ke `branches`.

Tujuan:

- Admin/staff dapat punya cabang default.
- Field staff hanya melihat lead/aktivitas cabang sesuai aturan akses.
- Offline sale dapat default ke cabang user login.

Catatan:

- `users.team_id` tetap dipakai untuk tim staff.
- `users.position_id` tetap dipakai untuk jabatan.
- `branch_id` tidak mengganti `team_id`.

### `branch_product_stocks`

Field awal:

- `id`
- `branch_id` FK ke `branches`
- `product_id` FK ke `products`
- `stock_quantity` unsigned integer default 0
- `low_stock_threshold` unsigned integer default 0
- timestamps

Constraint:

- unique composite `branch_id + product_id`.

Tujuan:

- Satu produk dapat tersedia di banyak cabang.
- Stok dan low stock threshold berbeda per cabang.
- Offline sale dan fulfillment order mengurangi stok cabang, bukan stok global.

Catatan migration:

- `products.stock_quantity` dan `products.low_stock_threshold` jangan langsung dihapus pada tahap awal.
- Pada migration awal, data existing bisa dimigrasikan ke cabang default agar tidak kehilangan stok.
- Setelah semua flow memakai `branch_product_stocks`, field stok global di `products` bisa dianggap legacy dan dirapikan pada fase terpisah jika disetujui.

### `orders.branch_id`

Tambahkan nullable atau required FK ke `branches`.

Tujuan:

- Menyimpan cabang fulfillment order online.
- Stok order diambil dari `branch_product_stocks` sesuai `orders.branch_id`.
- Laporan order dapat difilter per cabang.

Rekomendasi MVP:

- Untuk order baru, `branch_id` wajib diisi.
- Untuk data lama, `branch_id` boleh nullable atau diisi cabang default via migration/backfill.

### `bookings.branch_id`

Tambahkan nullable atau required FK ke `branches`.

Tujuan:

- Booking layanan diarahkan ke cabang tertentu.
- Admin booking dapat filter berdasarkan cabang.
- Customer melihat cabang layanan pada detail booking.

### `offline_sales.branch_id`

Tambahkan FK ke `branches`.

Tujuan:

- Audit historis transaksi offline per cabang.
- Revenue offline dan ranking staff bisa difilter per cabang.
- Stok produk offline sale dikurangi dari cabang transaksi.

Rekomendasi MVP:

- Untuk offline sale baru, `branch_id` wajib.
- Default cabang berasal dari `auth()->user()->branch_id`, tetapi admin dengan akses lintas cabang dapat memilih cabang.

### `leads.branch_id` dan `events.branch_id`

Tambahkan pada fase setelah transaksi inti stabil.

Tujuan:

- Lead dapat dimiliki cabang tertentu.
- Event dapat dikelola per cabang.
- Field staff visibility lebih aman berdasarkan cabang.

## Flow Bisnis yang Diubah

### Admin Branch Management

1. Admin membuka menu Cabang.
2. Admin melihat daftar cabang aktif/nonaktif.
3. Admin dapat membuat, memperbarui, dan menonaktifkan cabang.
4. Cabang yang sudah punya transaksi sebaiknya tidak dihapus permanen.
5. Cabang nonaktif tidak bisa dipilih untuk transaksi baru.

### Staff dan User Assignment

1. Admin membuka halaman staff/user.
2. Admin memilih cabang untuk user.
3. Staff tetap dapat memiliki team dan position.
4. Cabang user menjadi default cabang untuk aktivitas staff dan offline sale.

### Produk dan Stok Per Cabang

1. Admin membuat master produk global.
2. Admin mengatur stok produk per cabang di halaman stok cabang atau tab stok pada detail produk.
3. Sistem menampilkan low stock berdasarkan threshold cabang.
4. Public catalog tetap menampilkan master produk aktif.
5. Availability produk untuk checkout bergantung pada cabang yang dipilih.

### Checkout Online

Ada dua opsi UX yang perlu dipilih sebelum implementasi:

Opsi A: Customer memilih cabang saat checkout.

- Cocok jika customer tahu cabang terdekat.
- Checkout menampilkan stok berdasarkan cabang pilihan.
- Order menyimpan `branch_id` dari pilihan customer.

Opsi B: Admin menentukan cabang fulfillment setelah order masuk.

- Cocok jika bisnis ingin admin memilih cabang berdasarkan stok/alamat.
- Checkout hanya validasi produk aktif, belum mengunci stok cabang.
- Saat admin memilih cabang fulfillment, sistem validasi stok cabang.

Rekomendasi MVP:

- Gunakan Opsi A jika public commerce harus langsung akurat soal stok.
- Gunakan Opsi B jika ingin perubahan UI publik lebih kecil pada tahap pertama.

Karena user sudah menyatakan stok memang per cabang, opsi jangka panjang yang paling benar adalah Opsi A.

### Fulfillment Order dan Stock Decrement

1. Order memiliki `branch_id`.
2. Saat admin mengubah status order ke `processing`, sistem mengambil stok dari `branch_product_stocks` berdasarkan `orders.branch_id`.
3. Sistem mengunci row stok cabang dan mengecek quantity cukup.
4. Sistem mengurangi stok cabang sesuai order items.
5. Marker `orders.stock_decremented_at` tetap dipakai agar decrement idempotent.

### Offline Sales

1. Admin/staff membuka POS offline sale.
2. Sistem mengisi cabang default dari user login.
3. Admin lintas cabang dapat memilih cabang transaksi jika diizinkan.
4. Produk yang dipilih hanya bisa dijual jika stok cabang cukup.
5. `OfflineSaleService` mengurangi stok dari `branch_product_stocks`.
6. Histori offline sale menyimpan `branch_id` agar tidak berubah jika staff pindah cabang.

### Booking Layanan

1. Customer memilih cabang saat membuat booking.
2. Sistem menampilkan layanan aktif yang tersedia untuk cabang tersebut.
3. Booking menyimpan `branch_id`.
4. Admin booking dapat filter berdasarkan cabang.

Catatan:

- Jika layanan global tidak berbeda per cabang, cukup simpan `bookings.branch_id`.
- Jika layanan berbeda per cabang, perlu tabel tambahan seperti `branch_services`.

### Dashboard dan Reports

1. Dashboard admin menampilkan filter cabang.
2. Summary order, booking, lead, offline sale, revenue, dan low stock dapat difilter per cabang.
3. Admin cabang hanya melihat cabangnya jika aturan akses diterapkan.
4. Admin pusat dapat melihat semua cabang.

## Aturan Akses yang Perlu Diputuskan

Ada dua model permission:

### Model 1: Admin Semua Cabang

- Semua admin aktif dapat melihat semua cabang.
- Cabang hanya dipakai sebagai filter data.
- Implementasi lebih sederhana.

### Model 2: Admin Cabang dan Admin Pusat

- Admin cabang hanya melihat data cabangnya.
- Admin pusat melihat semua cabang.
- Perlu role/flag tambahan, misalnya `admin_scope = all|branch` atau role baru.

Rekomendasi MVP:

- Mulai dari Model 1 jika belum ada kebutuhan keamanan cabang yang ketat.
- Naik ke Model 2 jika tiap cabang harus dibatasi akses datanya.

Keputusan final:

- Gunakan Model 2: ada admin pusat dan admin cabang scoped.
- Admin pusat dapat melihat dan mengelola data semua cabang.
- Admin cabang hanya dapat melihat dan mengelola data cabangnya sendiri.
- Implementasi membutuhkan penanda scope admin, misalnya `admin_scope = all|branch` atau role/permission setara.
- `users.branch_id` menjadi cabang default untuk admin cabang dan staff.
- Query admin untuk data operasional harus disiapkan agar bisa difilter atau dibatasi berdasarkan cabang.

## Keputusan Final Flow Cabang

### Pemilihan Cabang Customer

- Customer memilih cabang saat membuka detail produk atau detail layanan.
- Untuk produk, stok yang ditampilkan mengikuti cabang yang dipilih.
- Pilihan cabang harus terbawa ke cart, checkout, order, dan fulfillment agar validasi stok memakai cabang yang sama.
- Untuk layanan, cabang yang dipilih harus terbawa ke booking.

### Produk dan Layanan Pusat/Per Cabang

- Produk tetap menjadi master global di `products`.
- Stok produk per cabang disimpan di `branch_product_stocks`.
- Produk dapat berlaku pusat/global, tetapi ketersediaan dan stok aktual tetap mengikuti cabang.
- Layanan dapat berlaku pusat/global dan juga dapat dibatasi per cabang.
- Jika layanan berbeda per cabang, gunakan tabel pivot seperti `branch_services` untuk availability layanan per cabang.
- Hindari duplikasi master produk atau layanan per cabang kecuali ada kebutuhan data yang benar-benar berbeda.

### Payment Method dan Voucher

- Payment method belum masuk scope implementasi cabang tahap awal.
- Voucher harus mendukung dua mode:
  - berlaku pusat/global untuk semua cabang,
  - berlaku hanya untuk cabang tertentu.
- Rekomendasi struktur voucher cabang: field seperti `applies_to_all_branches` pada `vouchers` dan pivot seperti `branch_voucher` untuk daftar cabang yang diizinkan.

### Nomor Transaksi Berbasis Cabang

- Kode cabang harus masuk ke nomor transaksi agar asal cabang transaksi mudah diaudit.
- `branch_id` tetap wajib disimpan di record transaksi; kode cabang di nomor transaksi hanya untuk readability dan audit manual.
- Contoh format:
  - `BDG-ORD-20260713-0001` untuk order online cabang Bandung,
  - `JKT-OFF-20260713-0001` untuk offline sale cabang Jakarta,
  - `PST-BKG-20260713-0001` untuk booking cabang pusat.
- Format final dapat disesuaikan saat implementasi generator nomor transaksi.

## Tahapan Implementasi yang Disarankan

### Phase 1: Foundation Cabang

- Buat migration `branches`.
- Buat model `Branch`.
- Buat admin CRUD cabang.
- Tambah `branch_id` ke `users`.
- Update Staff UI agar dapat memilih cabang.
- Tambah seeder cabang default dan assign user dummy.

Output phase:

- Cabang bisa dikelola.
- User/staff bisa punya cabang.
- Belum mengubah stok/transaksi.

### Phase 2: Stok Produk Per Cabang

- Buat `branch_product_stocks`.
- Backfill stok produk existing ke cabang default.
- Tambah UI pengelolaan stok per cabang.
- Update dashboard low stock agar membaca stok cabang.

Output phase:

- Stok cabang tersedia.
- Produk masih master global.
- Belum semua transaksi wajib mengurangi stok cabang.

### Phase 3: Offline Sales Per Cabang

- Tambah `branch_id` ke `offline_sales`.
- Update OfflineSaleController dan OfflineSaleService.
- POS menampilkan cabang dan stok cabang.
- Decrement stok offline sale dari `branch_product_stocks`.
- Update analytics offline sale dengan filter cabang.

Output phase:

- Transaksi offline sudah branch-aware.
- Pengurangan stok offline sale sudah per cabang.

### Phase 4: Order Online Per Cabang

- Tambah `branch_id` ke `orders`.
- Tentukan UX pilihan cabang di checkout atau assignment admin.
- Update cart/checkout validation agar mempertimbangkan stok cabang.
- Update fulfillment agar decrement stok cabang.
- Update order admin dan customer detail agar menampilkan cabang.

Output phase:

- Order online sudah branch-aware.
- Fulfillment order mengurangi stok cabang.

### Phase 5: Booking dan Layanan Per Cabang

- Tambah `branch_id` ke `bookings`.
- Tambah pilihan cabang saat booking.
- Filter admin booking per cabang.
- Jika layanan berbeda per cabang, rancang `branch_services`.

Output phase:

- Booking layanan sudah branch-aware.

### Phase 6: CRM, Event, Reports, dan Hardening

- Tambah branch scope ke leads dan events jika dibutuhkan.
- Update dashboard/reports global dengan filter cabang.
- Tambah test coverage untuk scoping cabang.
- Audit policy/authorization jika admin cabang harus dibatasi.

Output phase:

- Cabang konsisten di laporan dan CRM.
- Risiko data bocor antar cabang lebih terkendali.

## Risiko dan Perhatian

### Risiko Stok Ganda

Selama transisi, `products.stock_quantity` dan `branch_product_stocks.stock_quantity` bisa berbeda. Harus jelas field mana yang menjadi source of truth.

Rekomendasi:

- Setelah Phase 2, jadikan `branch_product_stocks` sebagai source of truth stok.
- `products.stock_quantity` hanya legacy sampai dihapus/diabaikan pada fase cleanup.

### Risiko Histori Transaksi

Jangan menghitung cabang transaksi dari `users.branch_id` secara dinamis untuk histori. Jika staff pindah cabang, histori lama akan terlihat berubah.

Rekomendasi:

- Simpan `branch_id` langsung di `orders`, `bookings`, `offline_sales`, dan record operasional penting lain.

### Risiko Public UX

Jika customer harus memilih cabang, public UI bertambah kompleks. Jika tidak memilih cabang, stok yang ditampilkan bisa tidak akurat.

Rekomendasi:

- Tentukan sejak awal apakah cabang dipilih di awal browsing, saat checkout, atau oleh admin setelah order masuk.

### Risiko Permission

Jika cabang juga menjadi batas akses data, hampir semua query admin perlu branch scope.

Rekomendasi:

- Jangan campur implementasi stok cabang dengan pembatasan akses admin cabang dalam satu batch besar.
- Mulai dari data model dan filter, lalu lanjutkan authorization scoped jika diperlukan.

## Pertanyaan Terbuka Sebelum Coding

Sudah diputuskan:

1. Admin memakai model scoped: admin pusat melihat semua cabang, admin cabang hanya melihat cabangnya.
2. Customer memilih cabang saat membuka detail produk atau detail layanan.
3. Produk dan layanan dapat berlaku pusat/global, tetapi stok dan availability dapat dibatasi per cabang.
4. Payment method belum diimplementasikan untuk scope cabang tahap awal.
5. Voucher dapat berlaku global/pusat atau dibatasi per cabang.
6. Kode cabang wajib masuk ke nomor transaksi, misalnya `BDG-ORD-...`.

Masih perlu dirinci saat implementasi:

- Nama field final untuk scope admin, misalnya `admin_scope` atau pendekatan role/permission lain.
- Struktur final untuk layanan per cabang, terutama apakah cukup `bookings.branch_id` atau perlu `branch_services` sejak awal.
- Format final nomor transaksi per jenis transaksi.

## Rekomendasi Keputusan Awal

Untuk implementasi paling aman:

1. Buat `Branch` baru, jangan reuse `Team`.
2. Tetapkan `branch_product_stocks` sebagai source of truth stok setelah Phase 2.
3. Simpan `branch_id` langsung di transaksi.
4. Implementasikan admin pusat dan admin cabang scoped, tetapi jangan mencampur authorization scoped dengan migrasi stok dalam satu batch besar.
5. Gunakan cabang default untuk backfill data lama.
6. Pilihan cabang dimulai dari detail produk atau detail layanan agar stok/availability publik akurat sejak sebelum checkout.
