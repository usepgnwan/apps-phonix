# Production Readiness Audit Phoenix Terapi & Herbal

Tanggal audit awal: 2026-06-06

Sumber acuan:

- `.docs/features-modules.md`
- `.docs/data-structure-plan.md`
- `.docs/system-flow.md`
- `.docs/implementation-progress.md`
- `.docs/DESIGN.md`
- `.docs/admin-ui-style-guide.md`
- Struktur direktori aktual: `app/Http/Controllers`, `resources/js/Pages`, `routes`, `tests/Feature`, `package.json`, dan `composer.json`

## Ringkasan Eksekutif

Project sudah berada pada tahap lanjut untuk MVP. Fondasi backend, model data, controller, route, sebagian besar UI Inertia, dan test feature sudah tersedia. Berdasarkan dokumen progress serta pengecekan struktur repo ringan, estimasi kesiapan saat ini adalah:

| Area | Estimasi Kesiapan | Catatan |
| --- | ---: | --- |
| Backend/domain MVP | 85-95% | Controller admin, public, customer, field, dan test feature sudah luas. |
| UI admin | 80-90% | Direktori page admin untuk modul utama sudah tersedia. Perlu QA visual dan flow. |
| UI customer/public | 70-85% | Page public commerce, booking, cart, checkout, dan customer dashboard sudah tersedia. Perlu QA end-to-end. |
| Testing otomatis | 70-80% | Banyak feature test tersedia, tetapi hasil test terbaru belum dijalankan pada audit ini. |
| Production readiness | 60-75% | Masih perlu audit runtime, QA manual, hardening access control, config production, dan deployment checklist. |

Kesimpulan: project kemungkinan sudah cukup dekat untuk demo MVP dan UAT internal, tetapi belum boleh dianggap production-ready sampai blocker dan checklist verifikasi di dokumen ini diselesaikan.

## Bukti Kondisi Saat Ini

Struktur yang sudah terlihat di repo:

- `app/Http/Controllers/Admin` berisi 15 controller untuk dashboard, reports, catalog, orders, vouchers, payment methods, bookings, customers, leads, events, offline sales, examinations, dan services.
- `app/Http/Controllers/Public` berisi controller homepage, product, service, cart, checkout, dan booking.
- `resources/js/Pages/Admin` berisi 15 area page admin sesuai modul utama.
- `resources/js/Pages/Public` berisi page `Bookings`, `Cart`, `Checkout`, `Products`, dan `Services`.
- `resources/js/Pages/Customer` berisi `Dashboard` dan `Profile`.
- `resources/js/Pages/Field` berisi dashboard dan leads field staff.
- `tests/Feature` berisi 23 file test, termasuk test untuk cart, checkout, booking, catalog, admin order, voucher, payment method, dashboard report, CRM, offline sale, field staff, dan customer profile/dashboard.
- `package.json` memakai React 18, Inertia 2, Vite 8, Tailwind, Headless UI, Lucide, dan beberapa dependency tambahan.
- `composer.json` memakai PHP 8.3, Laravel 13, Inertia Laravel, Sanctum, Breeze, Ziggy, Pint, dan PHPUnit.

Catatan keterbatasan audit awal:

- Command `rg` tidak tersedia di environment saat audit ini dimulai, sehingga pengecekan pattern source tidak dilakukan dengan ripgrep.
- Test suite, build frontend, server lokal, dan command berat belum dijalankan karena panduan project meminta izin user untuk command tersebut.
- Audit ini adalah dokumen kesiapan dan rencana kerja, bukan hasil QA runtime penuh.

## Status Per Modul

| Modul | Status | Risiko Production |
| --- | --- | --- |
| Homepage dan public content | Hampir siap | Perlu cek data dinamis, CTA, empty state, mobile. |
| Produk dan layanan | Hampir siap | Perlu cek detail page, add to cart, fallback gambar, dan stok. |
| Cart dan checkout manual | Siap QA mendalam | Flow penting bisnis, wajib diuji end-to-end. |
| Voucher member | Siap QA mendalam | Perlu uji membership, expiry, usage limit, duplicate redemption. |
| Order admin | Siap QA mendalam | Flow ongkir, payment, fulfillment, stok wajib diuji. |
| Customer profile/dashboard | Hampir siap | Perlu cek owner scoping, detail order/booking, instruksi pembayaran. |
| Booking layanan | Hampir siap | Perlu cek visit type, schedule, status admin, dan UX form. |
| Admin catalog | Hampir siap | Perlu cek create/edit/delete, gambar, validasi slug, empty state. |
| Admin CRM/leads | Hampir siap | Perlu strict role validation untuk assigned staff aktif. |
| Field staff CRM | Hampir siap | Perlu QA akses data milik staff dan activity creation. |
| Offline sales | Partial MVP | Read/create-only. Perlu keputusan stock decrement. |
| Examination/recommendation | Partial MVP | Read/create-only. Perlu QA form dan relasi customer/booking/product. |
| Dashboard/reports | MVP read-only | Perlu cek angka, empty state, dan kebutuhan filter/export. |
| Upload/media | Belum fully hardened | Gambar masih path sederhana; jika upload aktif, perlu hardening storage. |

## Blocker Sebelum Production

### P0 - Harus Selesai Sebelum Go Live

1. Jalankan audit route dan placeholder Inertia.
   - Tujuan: memastikan tidak ada route production yang masih render page generic atau data tidak sesuai page.
   - Output: daftar route yang siap, perlu polish, atau masih placeholder.

2. Jalankan test backend relevan dan full test setelah izin.
   - Target minimal:
     - `php artisan test tests/Feature/CartTest.php`
     - `php artisan test tests/Feature/CheckoutTest.php`
     - `php artisan test tests/Feature/BookingTest.php`
     - `php artisan test tests/Feature/AdminOrderTest.php`
     - `php artisan test tests/Feature/AdminVoucherTest.php`
     - `php artisan test tests/Feature/CustomerDashboardTest.php`
     - `php artisan test tests/Feature/FieldStaffLeadTest.php`
   - Setelah targeted pass, jalankan `php artisan test` atau `composer test` jika disetujui.

3. Verifikasi flow checkout sampai payment instruction.
   - Guest/customer checkout harus membuat order.
   - Admin konfirmasi ongkir harus mengubah order ke `waiting_payment`.
   - Customer harus bisa melihat total final dan instruksi pembayaran setelah ongkir dikonfirmasi.
   - Admin verifikasi payment harus mengubah status secara konsisten.

4. Verifikasi fulfillment order dan stok.
   - Stok hanya boleh berkurang saat transisi order ke `processing`.
   - Stok tidak boleh berkurang dua kali untuk order sama.
   - Jika stok tidak cukup, status order tidak boleh berubah diam-diam.

5. Perketat access control dan spoofing field.
   - Customer hanya boleh melihat order, booking, examination, dan recommendation miliknya.
   - Field staff hanya boleh melihat lead yang assigned kepadanya.
   - Admin route hanya untuk admin aktif.
   - Field internal seperti `user_id`, `role`, `member_status`, `created_by`, `field_staff_id`, `total`, `unit_price`, dan `line_total` tidak boleh dipercaya dari client.

6. Jalankan build frontend setelah izin user.
   - Target: `npm run build` pass tanpa error.
   - Build tidak dijalankan pada audit ini karena aturan project melarang build tanpa izin.

7. Siapkan konfigurasi production.
   - `.env.example` harus jelas.
   - Production wajib `APP_ENV=production` dan `APP_DEBUG=false`.
   - Session, cache, queue, mail, storage, logging, dan database harus dikonfirmasi.
   - Seed dummy tidak boleh masuk production.

### P1 - Sangat Disarankan Sebelum Go Live

1. Offline sale stock decrement sudah diputuskan dan diimplementasikan.
   - Offline sales mengurangi stok produk dalam transaksi yang sama.
   - Targeted test admin offline sale perlu tetap dijalankan saat flow ini berubah lagi.

2. Putuskan restore stok saat order dibatalkan setelah fulfillment.
   - Saat ini dokumen mencatat belum ada restore stok otomatis.
   - Untuk production operasional, ini rawan membingungkan inventory.

3. Validasi `assigned_staff_id` pada admin lead sudah diperketat.
   - Hanya user aktif dengan `role = field_staff` yang dapat dipilih atau dikirim sebagai assignee.

4. QA mobile dan desktop untuk flow utama.
   - Homepage.
   - Product list/detail.
   - Cart dan checkout.
   - Booking create/list/detail.
   - Customer dashboard/profile.
   - Admin dashboard/order/catalog.

5. Cek empty state, validation error, dan flash message.
   - Semua table dan form harus punya pesan jelas saat data kosong/error.
   - Tidak boleh ada tombol atau filter palsu yang tidak terhubung backend.

6. Buat SOP admin singkat.
   - Input produk/layanan.
   - Buat voucher.
   - Buat payment method.
   - Konfirmasi ongkir.
   - Verifikasi pembayaran.
   - Proses order dan stok.
   - Kelola booking dan lead.

### P2 - Bisa Setelah Production Awal

1. Filter tanggal dan export report.
   - Masuk tahap lanjutan jika client butuh laporan lebih serius.

2. Upload/media manager lebih matang.
   - Saat ini gambar memakai path sederhana. Production bisa mulai dari ini, tetapi upload perlu validasi MIME, ukuran, disk, dan cleanup.

3. Stock movement ledger.
   - Saat ini stok cukup dari `products.stock_quantity` dan marker fulfillment order.
   - Ledger berguna jika audit inventory dibutuhkan.

4. Notification/WhatsApp Business API.
   - Di luar scope MVP awal.

5. Payment gateway dan ongkir API.
   - Di luar scope MVP awal.

## Checklist QA End-to-End

### Flow Guest Checkout

- [ ] Guest membuka homepage.
- [ ] Guest membuka daftar produk.
- [ ] Guest membuka detail produk aktif.
- [ ] Guest menambahkan produk ke cart.
- [ ] Guest mengubah quantity cart.
- [ ] Guest checkout tanpa login.
- [ ] Order dibuat dengan status `waiting_shipping_confirmation`.
- [ ] Cart kosong setelah checkout berhasil.
- [ ] Guest tidak bisa memakai voucher member.

### Flow Customer Member

- [ ] Customer register/login.
- [ ] Customer membuat customer profile.
- [ ] Customer non-member tidak melihat/memakai voucher member.
- [ ] Admin mengubah customer menjadi member.
- [ ] Customer member melihat voucher valid.
- [ ] Customer member checkout dengan voucher.
- [ ] Voucher redemption tercatat satu kali.
- [ ] Customer tidak bisa memakai voucher sama dua kali.

### Flow Admin Order

- [ ] Admin melihat daftar order.
- [ ] Admin membuka detail order.
- [ ] Admin mengisi ongkir dan kurir.
- [ ] Status berubah ke `waiting_payment` saat ongkir dikonfirmasi.
- [ ] Customer melihat total final dan instruksi pembayaran.
- [ ] Admin memilih payment method dan menandai `paid`.
- [ ] Status order menjadi `payment_received`.
- [ ] Admin mengubah status ke `processing`.
- [ ] Stok produk berkurang tepat satu kali.
- [ ] Admin mengubah status ke `shipped` dan `completed`.

### Flow Booking

- [ ] Guest tidak bisa booking.
- [ ] Customer login tanpa profile diarahkan membuat profile.
- [ ] Customer membuka form booking.
- [ ] Visit type tervalidasi sesuai layanan.
- [ ] Jadwal masa lalu ditolak.
- [ ] Booking dibuat dengan status `waiting_confirmation`.
- [ ] Customer melihat daftar/detail booking miliknya.
- [ ] Admin update status booking.
- [ ] Admin update jadwal booking.

### Flow Admin Catalog

- [ ] Admin membuat kategori produk.
- [ ] Admin membuat produk aktif/featured.
- [ ] Produk muncul di halaman publik jika aktif.
- [ ] Produk nonaktif tidak muncul di publik.
- [ ] Admin membuat layanan aktif/featured.
- [ ] Layanan muncul di halaman publik jika aktif.
- [ ] Slug duplikat ditolak.
- [ ] Category yang masih punya produk tidak bisa dihapus.

### Flow CRM dan Field Staff

- [ ] Admin membuat lead source.
- [ ] Admin membuat lead dan assign ke field staff aktif.
- [ ] Field staff melihat hanya lead miliknya.
- [ ] Field staff tidak bisa membuka lead staff lain.
- [ ] Field staff update status lead.
- [ ] Field staff menambahkan field activity.
- [ ] Admin melihat follow-up/activity terkait.

### Flow Offline Sales

- [ ] Admin membuka daftar offline sales.
- [ ] Admin membuat offline sale dengan minimal satu item.
- [ ] Produk nonaktif ditolak.
- [ ] Quantity melebihi stok ditolak.
- [ ] Total dihitung server-side.
- [ ] Keputusan stok offline sale terdokumentasi dan jelas di UI.

## Checklist Security dan Data Integrity

- [ ] Semua route admin memakai admin aktif.
- [ ] Semua route field staff memakai field staff aktif.
- [ ] Route customer memakai user login dan customer profile owner.
- [ ] Detail resource milik user lain menghasilkan 403 atau 404 sesuai desain.
- [ ] Form Request menolak atau mengabaikan field internal.
- [ ] Harga dan total transaksi dihitung server-side.
- [ ] Voucher usage limit dan unique redemption aman dalam transaksi.
- [ ] Stok dicek ulang dalam transaksi sebelum dikurangi.
- [ ] Upload file, jika dipakai, memvalidasi MIME, size, extension, dan path.
- [ ] Tidak ada `.env`, credential, token, atau file lokal yang ikut commit.
- [ ] Error production tidak membocorkan stack trace ke user.

## Checklist Production Config dan Deployment

- [ ] `.env.example` berisi variable penting tanpa secret.
- [ ] `APP_ENV=production`.
- [ ] `APP_DEBUG=false`.
- [ ] `APP_KEY` production sudah dibuat aman.
- [ ] Database production sudah disiapkan.
- [ ] Migration production bisa dijalankan bersih.
- [ ] Seeder dummy tidak dijalankan di production.
- [ ] `storage:link` siap jika public upload dipakai.
- [ ] Permission storage dan cache folder benar.
- [ ] Queue driver diputuskan: sync/database/redis.
- [ ] Mail driver diputuskan untuk notification atau reset password.
- [ ] Log channel production diputuskan.
- [ ] Backup database dan storage upload disiapkan.
- [ ] `composer install --no-dev --optimize-autoloader` siap untuk deployment.
- [ ] `npm ci` dan `npm run build` pass pada environment build.
- [ ] `php artisan config:cache`, `route:cache`, dan `view:cache` diuji jika dipakai.

## Risiko Khusus Dependency Frontend

`package.json` berisi beberapa dependency yang perlu dicek relevansinya sebelum production:

- `jquery`
- `spritespin`
- `@google/stitch-sdk`
- `html-to-jsx`

Risiko:

- Dependency tidak terpakai dapat memperbesar bundle atau menambah surface area maintenance.
- `jquery` bertentangan dengan prinsip project yang menghindari manipulasi DOM manual dengan React kecuali benar-benar perlu.
- Dependency visual/custom script harus dipastikan tidak menjalankan behavior berat atau tidak dibutuhkan.

Rekomendasi:

- Audit pemakaian dependency sebelum build production.
- Jangan hapus dependency tanpa cek source dan lockfile.
- Jika dependency dihapus, update `package.json` dan `package-lock.json` bersama-sama setelah izin.

## Urutan Kerja Rekomendasi

### Tahap 1 - Audit Aktual Source

1. Cek `git status` untuk memastikan worktree dan perubahan lokal aman.
2. Enumerasi route dengan `php artisan route:list` setelah izin jika dibutuhkan.
3. Cari page yang masih render `Welcome` atau placeholder.
4. Cocokkan route/controller dengan page Inertia nyata.
5. Cek dependency frontend yang tidak terpakai.

Output tahap ini:

- Daftar blocker aktual dari source.
- Daftar placeholder UI jika masih ada.
- Daftar test/build yang perlu dijalankan.

### Tahap 2 - Verifikasi Otomatis

1. Jalankan targeted Laravel feature test per modul.
2. Fix regression yang muncul.
3. Jalankan full Laravel test setelah targeted pass.
4. Jalankan build frontend setelah izin.

Output tahap ini:

- Test report terbaru.
- Build report frontend.
- Daftar error yang sudah diperbaiki atau masih blocked.

### Tahap 3 - Fix P0/P1

1. Tutup gap payment instruction dan customer order detail jika ditemukan belum solid.
2. Perketat role validation `assigned_staff_id`.
3. Putuskan dan implementasikan kebijakan stok untuk offline sale dan cancel order.
4. Rapikan access control dan spoofing field.
5. Rapikan UI error/empty state untuk flow utama.

Output tahap ini:

- Flow customer dan admin order siap UAT.
- Inventory policy jelas.
- Access control lebih aman.

### Tahap 4 - Manual QA dan UAT

1. Jalankan flow guest checkout.
2. Jalankan flow customer member voucher.
3. Jalankan flow admin order dari ongkir sampai completed.
4. Jalankan flow booking customer dan admin.
5. Jalankan flow CRM field staff.
6. Jalankan flow offline sales.
7. Cek desktop dan mobile.

Output tahap ini:

- Checklist QA terisi.
- Bug list prioritas.
- Approval UAT internal.

### Tahap 5 - Deployment Readiness

1. Siapkan `.env.example` dan environment production.
2. Siapkan deployment command.
3. Siapkan backup database/storage.
4. Siapkan SOP admin.
5. Siapkan rollback plan sederhana.

Output tahap ini:

- Checklist deployment pass.
- SOP operasional siap.
- Project siap soft launch.

## Definisi Siap Production

Project dapat disebut production-ready jika semua poin berikut terpenuhi:

- Semua P0 selesai.
- Tidak ada route user-facing penting yang masih placeholder.
- Targeted feature test dan full Laravel test pass, atau failure pre-existing terdokumentasi jelas.
- Frontend build pass.
- Flow guest checkout, customer checkout, payment instruction, admin order fulfillment, booking, dan field staff CRM sudah lolos manual QA.
- Access control untuk admin, customer, dan field staff sudah diverifikasi.
- `.env.example`, storage, migration, seed, dan deployment command siap.
- Admin memiliki SOP minimal untuk menjalankan operasional manual.

## Estimasi Setelah Checklist Diselesaikan

Jika tahap 1-3 selesai dan test/build pass, kesiapan production dapat naik ke sekitar 85-90%.

Jika tahap 4-5 juga selesai dan UAT internal disetujui, project dapat masuk kategori soft-launch ready untuk MVP manual commerce.
