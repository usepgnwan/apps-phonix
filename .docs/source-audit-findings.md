# Source Audit Findings Phoenix Terapi & Herbal

Tanggal audit: 2026-06-06

Sumber acuan:

- `.docs/production-readiness-audit.md`
- `.docs/system-flow.md`
- `.docs/implementation-progress.md`
- `routes/web.php`
- `app/Http/Controllers`
- `app/Http/Requests`
- `app/Services`
- `resources/js/Pages`
- `tests/Feature`
- `package.json`

## Ringkasan

Audit source ringan menunjukkan project sudah memiliki struktur route, controller, page Inertia, service, dan test feature yang cukup matang untuk MVP. Tidak ditemukan banyak placeholder besar pada modul utama. Temuan paling penting untuk production readiness adalah:

1. Route `/dashboard` masih memakai dashboard scaffold default Breeze.
2. Validasi `assigned_staff_id` pada admin lead belum dibatasi ke user aktif dengan role `field_staff`.
3. Offline sale mengecek stok tetapi belum mengurangi stok setelah transaksi dibuat.
4. Homepage masih memakai component bernama `Welcome`, tetapi isinya sudah menjadi landing page Phoenix, sehingga ini lebih tepat disebut technical debt naming daripada blocker.
5. Dependency `jquery` dan `spritespin` memang dipakai di homepage, sedangkan `@google/stitch-sdk` dan `html-to-jsx` belum terlihat dipakai dari pencarian awal.

Audit ini belum menjalankan test, build, atau server lokal karena aturan project meminta izin untuk command berat.

## Kondisi Git

Hasil `git status --short` saat audit:

```text
?? .docs/production-readiness-audit.md
```

Catatan:

- Tidak terlihat perubahan source code lain pada saat audit ringan ini.
- Dokumen audit production readiness sebelumnya masih file baru dan belum di-commit.

## Temuan Prioritas

### P0 - Placeholder Dashboard Default

Status: perlu keputusan/fix sebelum production jika route `/dashboard` masih dapat diakses user.

Bukti:

- `routes/web.php:44-46` masih merender `Inertia::render('Dashboard')` untuk route `/dashboard`.
- `resources/js/Pages/Dashboard.jsx` masih page scaffold default dengan pesan generic `You're logged in!`.

Dampak:

- User login yang diarahkan ke `/dashboard` dapat melihat halaman generic Laravel Breeze, bukan dashboard Phoenix.
- Ini mengurangi readiness dan bisa membingungkan role customer/admin/field staff.

Rekomendasi:

- Ubah route `/dashboard` menjadi redirect role-aware:
  - admin ke `admin.dashboard.index`,
  - field staff ke `field.dashboard.index`,
  - customer ke `customer.dashboard.index` atau `customer.profile.create` jika belum punya profile.
- Alternatif: ubah `Dashboard.jsx` menjadi landing dashboard role-aware, tetapi redirect lebih sederhana dan mengurangi duplikasi.

### P1 - Validasi `assigned_staff_id` Admin Lead Terlalu Longgar

Status: perlu fix sebelum production operasional CRM.

Bukti:

- `app/Http/Requests/Admin/StoreLeadRequest.php:20` memakai `['nullable', 'exists:users,id']`.
- `app/Http/Requests/Admin/UpdateLeadRequest.php:20` memakai `['nullable', 'exists:users,id']`.
- `app/Http/Controllers/Admin/LeadController.php` memuat pilihan user untuk assignment dari query user umum, belum terbatas ke role `field_staff` aktif.

Dampak:

- Admin bisa meng-assign lead ke user dengan role `admin`, `customer`, atau user tidak aktif selama ID valid.
- Field staff scoping tetap aman, tetapi data lead bisa salah assigned dan tidak muncul di dashboard field staff yang benar.

Rekomendasi:

- Ganti validasi menjadi rule yang membatasi user aktif dengan role `field_staff`.
- Batasi lookup assignee di controller ke `role = field_staff` dan `is_active = true`.
- Tambahkan/ubah test di `AdminLeadTest` untuk memastikan user non-field-staff dan field staff tidak aktif ditolak.

### P1 - Offline Sale Belum Mengurangi Stok

Status: fixed. Keputusan produk: offline sale mengurangi stok produk.

Bukti:

- `app/Services/OfflineSaleService.php` melakukan transaction, `lockForUpdate()`, validasi produk aktif, validasi stok cukup, membuat `offline_sales` dan `offline_sale_items`, lalu decrement `products.stock_quantity`.
- `tests/Feature/AdminOfflineSaleTest.php` menguji stok produk berkurang sesuai quantity offline sale.

Dampak:

- Inventory website dan admin dashboard kini mencerminkan pengurangan stok dari penjualan offline.

Rekomendasi:

- Tetap putuskan kebijakan restore/manual adjustment untuk pembatalan atau koreksi transaksi offline sale di luar scope fix ini.

### P1 - Kebijakan Restore Stok Saat Cancel Belum Ada

Status: perlu keputusan sebelum operasional penuh.

Bukti:

- `app/Services/OrderFulfillmentService.php` hanya mengurangi stok saat status menjadi `processing`.
- Jika status selain `processing`, service hanya update status tanpa side effect stok.
- Dokumen `.docs/system-flow.md` juga mencatat belum ada restore stok otomatis saat order cancelled setelah fulfillment dimulai.

Dampak:

- Jika order sudah `processing` lalu dibatalkan, stok tidak otomatis kembali.
- Ini bisa diterima untuk MVP manual jika admin mengoreksi stok secara manual, tetapi perlu SOP atau fitur restore.

Rekomendasi:

- Putuskan policy: restore otomatis, manual adjustment, atau stok tidak dikembalikan.
- Jika belum implement restore, tulis SOP admin dan tampilkan warning di UI saat cancel order yang sudah `stock_decremented_at`.

### P2 - Homepage Component Masih Bernama `Welcome`

Status: technical debt, bukan blocker langsung.

Bukti:

- `app/Http/Controllers/Public/HomeController.php:18` merender `Inertia::render('Welcome')`.
- `resources/js/Pages/Welcome.jsx` berisi landing page Phoenix yang sudah menggunakan data `featuredProducts`, `featuredServices`, dan `testimonials`.

Dampak:

- Nama file/component generic dapat membingungkan maintenance.
- Tidak menunjukkan placeholder dari isi file, tetapi naming tidak lagi sesuai domain.

Rekomendasi:

- Rename bertahap ke `resources/js/Pages/Public/Home.jsx` dan update `HomeController` jika ingin merapikan production code.
- Pastikan test homepage disesuaikan jika component assertion ada.

### P2 - Dependency Frontend Kandidat Tidak Terpakai

Status: perlu audit lanjut sebelum dihapus.

Bukti:

- `jquery` dan `spritespin` dipakai di `resources/js/Pages/Welcome.jsx`.
- `@google/stitch-sdk` dan `html-to-jsx` sejauh pencarian awal hanya terlihat di `package.json` dan `package-lock.json`.

Dampak:

- Dependency tidak terpakai memperbesar dependency tree dan surface area maintenance.
- Penghapusan dependency harus hati-hati karena harus update `package.json` dan `package-lock.json` bersama-sama.

Rekomendasi:

- Audit pemakaian `@google/stitch-sdk` dan `html-to-jsx` dengan pencarian source menyeluruh setelah tool search tersedia/normal.
- Jika benar tidak terpakai, minta izin user sebelum mengubah dependency dan lockfile.

## Area yang Terlihat Kuat

### Access Control Admin

Temuan:

- Route admin berada di dalam middleware `auth`.
- Controller dan Form Request admin banyak memakai guard `role === 'admin'` dan `is_active`.
- Modul yang terlihat memakai pola ini: order, lead, customer, offline sale, dashboard, report, voucher, catalog, booking, event, examination, dan payment method.

Risiko tersisa:

- Guard berulang di banyak controller/request dapat rawan inkonsistensi jangka panjang.
- Untuk produksi lebih rapi, pertimbangkan middleware `admin.active`, tetapi ini bukan blocker MVP jika test pass.

### Access Control Customer

Temuan:

- `CustomerDashboardController` melakukan resolve `customer_profile` milik user login.
- Detail order dan booking customer dicek terhadap `user_id` dan `customer_profile_id`.
- Payment method detail termasuk `instructions` sudah dimuat di detail order customer.
- Test `CustomerDashboardTest` mencakup akses owner dan payment instruction.

Risiko tersisa:

- Tetap perlu manual QA tampilan instruksi pembayaran setelah admin konfirmasi ongkir.

### Access Control Field Staff

Temuan:

- Field staff route berada di middleware `auth`.
- Controller field membatasi lead dengan `assigned_staff_id = current user id`.
- Detail lead milik staff lain dikembalikan sebagai 404.
- Form Request field mencegah spoofing `field_staff_id` dan `lead_id`.
- Test `FieldStaffLeadTest` mencakup scoping dan spoofing prevention.

Risiko tersisa:

- Validasi admin assignment masih longgar, sehingga source data assignment perlu diperbaiki seperti temuan P1.

### Order Fulfillment dan Stok Website

Temuan:

- `OrderFulfillmentService` melakukan transaksi dan row lock.
- Decrement stok hanya saat status `processing`.
- `stock_decremented_at` mencegah decrement ganda.
- Stok dicek sebelum decrement.
- Test `AdminOrderTest` mencakup decrement sekali dan gagal saat stok kurang.

Risiko tersisa:

- Restore stok saat cancel setelah processing belum ada.
- Perlu manual QA status flow di UI admin order.

### Payment Instruction Customer

Temuan:

- Detail order customer memuat relasi `paymentMethod` termasuk `instructions`, nomor rekening, holder, QRIS path, dan status.
- Test customer dashboard mencakup payment instruction.

Risiko tersisa:

- Perlu cek UI aktual agar instruksi hanya jelas setelah ongkir/total final dikonfirmasi.

## Checklist Follow-up Source Audit

Tahap audit ringan berikutnya jika diperlukan:

- [ ] Enumerasi route dengan `php artisan route:list` setelah izin.
- [ ] Jalankan targeted tests untuk temuan P1:
  - `AdminLeadTest`
  - `AdminOfflineSaleTest`
  - `AdminOrderTest`
  - `CustomerDashboardTest`
- [ ] Jalankan build frontend setelah izin user.
- [ ] Audit full source dependency jika `rg` tersedia kembali atau dengan tool search lain.
- [ ] Review `.env.example` dan config production.
- [ ] Manual QA route `/dashboard` setelah fix role redirect.

## Rekomendasi Urutan Fix

1. Fix route `/dashboard` agar tidak menampilkan scaffold default.
2. Fix validasi dan lookup `assigned_staff_id` admin lead.
3. Putuskan kebijakan offline sale stock decrement.
4. Jika offline sale harus decrement stok, implement service dan update test.
5. Putuskan kebijakan restore stok saat cancel order setelah fulfillment.
6. Audit dependency `@google/stitch-sdk` dan `html-to-jsx` sebelum production build.
7. Rename `Welcome.jsx` ke home page domain-specific jika ingin polish maintenance.

## Status Audit

Audit source ringan selesai untuk tahap awal. Belum ada perubahan source code aplikasi pada audit ini; hanya dokumen `.docs/source-audit-findings.md` yang ditambahkan.
