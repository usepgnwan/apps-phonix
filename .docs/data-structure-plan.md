# Plan Struktur Data MVP Herbal Commerce

Sumber acuan: `.docs/features-modules.md`

Tujuan plan ini adalah mencatat rancangan awal struktur data sebelum membuat migration, model, factory, dan test. Scope harus tetap mengikuti MVP: website herbal, e-commerce sederhana, booking layanan, admin panel, customer dashboard, dan mini CRM field staff. Pembayaran, ongkir, dan verifikasi transaksi tetap manual oleh admin.

## Prinsip Desain

- Gunakan struktur sederhana, relasional, dan Laravel-friendly.
- Project memakai arsitektur monolitik Laravel + Inertia.js + React, bukan REST API terpisah untuk flow utama aplikasi.
- Route web cukup mapping URL ke controller action; jangan menaruh `Inertia::render()` langsung di `routes/web.php` untuk page aplikasi utama.
- Query, validasi, business flow, redirect, dan `Inertia::render()` ditempatkan di controller agar struktur tetap konsisten dan mudah dirawat.
- Gunakan `users` untuk semua akun login: admin, customer, dan field staff.
- Gunakan `customer_profiles` untuk data customer serta status `member` atau `non_member`.
- Guest checkout tidak otomatis membuat akun user.
- Cart menggunakan tabel `carts` dan `cart_items` agar customer bisa menyimpan beberapa produk sebelum checkout. Guest cart tetap dapat diikat ke `session_id`.
- Offline sale dipisah dari website order agar flow checkout manual tidak bercampur dengan transaksi lapangan.
- Laporan Phase 5 cukup berupa query dari tabel operasional, tanpa tabel reporting khusus.
- Jangan menambahkan payment gateway, ongkir API, multi-cabang, komisi, GPS, import/export, WhatsApp Business API, atau reporting advanced.

## Keputusan Awal yang Direkomendasikan

- Gambar produk/layanan/testimoni: mulai dari kolom sederhana seperti `image_path` atau `photo_path`.
- Nilai kolom gambar/file menyimpan path relatif storage lokal, bukan URL penuh dan bukan absolute server path.
- Stok: mulai dari `products.stock_quantity` dan `products.low_stock_threshold`.
- Riwayat stok: `stock_movements` opsional, dibuat hanya jika benar-benar dibutuhkan.
- Cart: gunakan `carts` dan `cart_items` untuk mendukung keranjang multi-produk sebelum checkout.
- Offline sales: gunakan tabel terpisah dari `orders`.

## Urutan Besar Implementasi Data

1. Identity dan customer profile.
2. Katalog produk, layanan, testimoni, dan website settings.
3. Checkout manual, order, voucher, payment method, dan stok dasar.
4. Booking, leads, pemeriksaan internal, dan rekomendasi produk.
5. Field staff CRM, event, dan offline sales.
6. Dashboard dan laporan sederhana dari query.

## Phase 1: Foundation dan Website

### `users`

Purpose: akun login untuk admin, customer, dan field staff.

Kolom utama:

- `name`
- `email`
- `password`
- `role`: `admin`, `customer`, `field_staff`
- `is_active`

Relasi:

- Has one `customer_profile` untuk role customer.
- Has many `leads` sebagai field staff yang ditugaskan.
- Has many `field_activities` sebagai field staff.
- Has many `offline_sales` sebagai field staff.

Catatan:

- Role cukup satu kolom string untuk MVP.
- Access control detail ditangani lewat middleware/policy saat implementasi fitur.

### `customer_profiles`

Purpose: data customer dan status member.

Kolom utama:

- `user_id` nullable unique
- `name`
- `whatsapp_number`
- `primary_address`
- `member_status`: `non_member`, `member`
- `internal_notes` nullable

Relasi:

- Belongs to `user`.
- Has many `orders`.
- Has many `bookings`.
- Has many `examinations`.
- Has many `product_recommendations`.
- Has many `voucher_redemptions`.

Catatan:

- Customer baru hasil signup default `non_member`.
- Status `member` hanya diubah admin.
- Guest checkout tidak wajib punya `customer_profile`.

### `product_categories`

Kolom utama:

- `name`
- `slug`
- `description` nullable
- `is_active`

Relasi:

- Has many `products`.

### `products`

Kolom utama:

- `product_category_id`
- `name`
- `slug`
- `price`
- `short_description`
- `full_description`
- `benefits` nullable
- `usage_rules` nullable
- `notes` nullable
- `image_path` nullable
- `stock_quantity`
- `low_stock_threshold`
- `is_active`
- `is_featured`

Relasi:

- Belongs to `product_category`.
- Has many `order_items`.
- Has many `product_recommendations`.
- Has many `offline_sale_items`.

### `services`

Kolom utama:

- `name`
- `slug`
- `description`
- `price` nullable
- `visit_type`: `home_visit`, `office_visit`, `both`
- `image_path` nullable
- `is_active`
- `is_featured`

Relasi:

- Has many `bookings`.

### `testimonials`

Kolom utama:

- `customer_name`
- `content`
- `photo_path` nullable
- `is_active`

### `website_settings`

Kolom utama:

- `key`
- `value` nullable text

Catatan:

- Pakai key-value untuk kontak, nomor WhatsApp, copy homepage, dan pengaturan dasar lain.
- Jangan membangun CMS kompleks pada MVP.

### `media` Opsional

Jika butuh multiple image per produk/layanan/testimoni, bisa ditambahkan kemudian.

Catatan upload file untuk MVP:

- File disimpan di storage lokal Laravel, misalnya `storage/app/public/products/nama-file.jpg`.
- Database hanya menyimpan path relatif seperti `products/nama-file.jpg`, `services/nama-file.jpg`, `testimonials/nama-file.jpg`, atau `payment-methods/qris.jpg`.
- Jangan menyimpan URL penuh seperti `https://domain.com/storage/products/nama-file.jpg`.
- Jangan menyimpan absolute path server seperti `/var/www/app/storage/app/public/products/nama-file.jpg`.
- URL publik untuk frontend dibuat saat render menggunakan mekanisme Laravel seperti `Storage::url($path)`.

Kolom utama:

- `mediable_type` nullable
- `mediable_id` nullable
- `collection` nullable
- `path`
- `alt_text` nullable

## Phase 2: Cart, Checkout, Order, Voucher, dan Stok

### `carts`

Purpose: keranjang belanja sebelum checkout, untuk customer login maupun guest session.

Kolom utama:

- `user_id` nullable
- `customer_profile_id` nullable
- `session_id` nullable

Relasi:

- Belongs to `user`, nullable.
- Belongs to `customer_profile`, nullable.
- Has many `cart_items`.

Catatan:

- Customer login dapat memiliki cart aktif berdasarkan `user_id`.
- Guest cart dapat diikat ke `session_id` tanpa membuat akun user.
- Data final checkout tetap disnapshot ke `orders` dan `order_items`.

### `cart_items`

Purpose: item produk dalam keranjang belanja.

Kolom utama:

- `cart_id`
- `product_id`
- `quantity`

Constraint penting:

- Unique `cart_id` + `product_id`.

Catatan:

- Harga produk final tetap disnapshot ke `order_items` saat checkout, bukan disimpan permanen di cart.

### `payment_methods`

Purpose: pengaturan pembayaran manual.

Kolom utama:

- `type`: `bank_transfer`, `qris`
- `bank_name` nullable
- `account_number` nullable
- `account_holder_name` nullable
- `qris_image_path` nullable
- `instructions` nullable text
- `is_active`

Catatan:

- Tidak ada field payment gateway.

### `orders`

Purpose: order website dari customer login atau guest.

Kolom utama:

- `order_number`
- `user_id` nullable
- `customer_profile_id` nullable
- `voucher_id` nullable
- `voucher_redemption_id` nullable
- `payment_method_id` nullable
- `customer_name`
- `customer_whatsapp_number`
- `shipping_address`
- `subtotal`
- `voucher_discount_amount`
- `shipping_cost`
- `total`
- `courier_name` nullable
- `tracking_number` nullable
- `shipping_status`
- `shipping_notes` nullable
- `payment_status`
- `payment_received_at` nullable
- `payment_notes` nullable
- `status`
- `admin_notes` nullable

Relasi:

- Belongs to `user`, nullable.
- Belongs to `customer_profile`, nullable.
- Belongs to `voucher`, nullable.
- Belongs to `voucher_redemption`, nullable.
- Belongs to `payment_method`, nullable.
- Has many `order_items`.

Catatan:

- Simpan snapshot nama customer, WhatsApp, dan alamat di order.
- Guest order memiliki `user_id` dan `customer_profile_id` null.
- Status awal checkout disarankan `waiting_shipping_confirmation`.
- Instruksi pembayaran final baru relevan setelah admin mengisi ongkir.

### `order_items`

Purpose: snapshot produk yang dibeli.

Kolom utama:

- `order_id`
- `product_id`
- `product_name`
- `unit_price`
- `quantity`
- `line_total`

Catatan:

- Simpan `product_name` dan `unit_price` agar histori order tidak berubah saat data produk berubah.

### `vouchers`

Purpose: konfigurasi voucher khusus member.

Kolom utama:

- `code`
- `name`
- `description` nullable
- `discount_type`: `fixed`, `percentage`
- `discount_value`
- `minimum_purchase` nullable
- `starts_at`
- `ends_at`
- `usage_limit`
- `is_published`

Catatan:

- Voucher hanya terlihat dan bisa digunakan customer dengan `member_status = member`.
- Guest dan non-member tidak dapat memakai voucher.

### `voucher_redemptions`

Purpose: catatan penggunaan voucher oleh customer.

Kolom utama:

- `voucher_id`
- `customer_profile_id`
- `order_id` nullable
- `discount_amount`
- `redeemed_at`

Constraint penting:

- Unique `voucher_id` + `customer_profile_id`.

Catatan:

- Constraint ini menjaga satu customer hanya dapat memakai voucher yang sama satu kali.
- Validasi usage limit perlu dilakukan transactional saat implementasi checkout.

### `stock_movements` Opsional

Purpose: riwayat perubahan stok sederhana jika dibutuhkan.

Kolom utama:

- `product_id`
- `type`: `manual_adjustment`, `order_confirmed`, `order_cancelled`
- `quantity_change`
- `stock_after`
- `notes` nullable
- `created_by` nullable

Catatan:

- Untuk MVP paling basic, cukup pakai `products.stock_quantity`.

## Phase 3: Booking, Customer, Leads, Pemeriksaan

### `bookings`

Purpose: booking layanan oleh customer login.

Kolom utama:

- `booking_number`
- `user_id`
- `customer_profile_id`
- `service_id`
- `name`
- `whatsapp_number`
- `visit_type`: `home_visit`, `office_visit`
- `desired_schedule_at`
- `complaint_notes`
- `status`
- `admin_notes` nullable

Catatan:

- Booking wajib login, sehingga `user_id` dan `customer_profile_id` required.
- Simpan snapshot nama dan WhatsApp untuk kejelasan operasional.

### `lead_sources`

Purpose: daftar sumber lead sederhana.

Kolom utama:

- `name`
- `slug`
- `is_active`

Seed awal:

- `website`
- `whatsapp`
- `door_to_door`
- `event`
- `koperasi`
- `referral`
- `existing_customer`

### `leads`

Purpose: data prospek/customer untuk CRM sederhana.

Kolom utama:

- `assigned_staff_id` nullable
- `customer_profile_id` nullable
- `lead_source_id`
- `event_id` nullable
- `name`
- `whatsapp_number`
- `address` nullable
- `interested_product_notes` nullable
- `interested_service_notes` nullable
- `initial_complaint` nullable
- `follow_up_status`
- `internal_notes` nullable

Relasi:

- Belongs to `user` sebagai assigned field staff.
- Belongs to `customer_profile`, nullable.
- Belongs to `lead_source`.
- Belongs to `event`, nullable.
- Has many `lead_follow_ups`.
- Has many `field_activities`.
- Has many `offline_sales`.

Catatan:

- Minat produk/layanan cukup text notes untuk MVP.
- Jangan membuat pivot minat produk/layanan kecuali nanti report detail benar-benar diperlukan.

### `lead_follow_ups`

Purpose: histori follow-up lead.

Kolom utama:

- `lead_id`
- `user_id` nullable
- `status`
- `notes`
- `followed_up_at`

### `examinations`

Purpose: catatan pemeriksaan internal sederhana.

Kolom utama:

- `customer_profile_id`
- `booking_id` nullable
- `complaint`
- `result`
- `summary`
- `internal_recommendation`
- `created_by` nullable

### `product_recommendations`

Purpose: rekomendasi produk untuk customer.

Kolom utama:

- `customer_profile_id`
- `product_id`
- `examination_id` nullable
- `notes` nullable
- `created_by` nullable

## Phase 4: Field Staff CRM dan Offline Sales

### `events`

Purpose: data event sederhana.

Kolom utama:

- `name`
- `event_date`
- `location`
- `organizer` nullable
- `notes` nullable

Relasi:

- Has many `leads`.
- Has many `offline_sales`.

### `field_activities`

Purpose: aktivitas door-to-door/follow-up field staff.

Kolom utama:

- `field_staff_id`
- `lead_id`
- `activity_type`: `visit`, `follow_up`, `note`
- `activity_at`
- `notes`
- `follow_up_status` nullable

Catatan:

- Tidak perlu GPS, absensi, route planning, komisi, atau stok per staff.
- Pembatasan field staff hanya melihat lead miliknya dilakukan di policy/query layer.

### `offline_sales`

Purpose: transaksi offline/manual sederhana.

Kolom utama:

- `sale_number`
- `customer_profile_id` nullable
- `lead_id` nullable
- `field_staff_id` nullable
- `event_id` nullable
- `source`: `offline`, `door_to_door`, `event`
- `customer_name`
- `customer_whatsapp_number` nullable
- `total`
- `notes` nullable
- `sold_at`

Catatan:

- Dipisah dari `orders` agar tidak mencampur flow checkout website dengan transaksi lapangan.

### `offline_sale_items`

Purpose: item produk pada transaksi offline.

Kolom utama:

- `offline_sale_id`
- `product_id`
- `product_name`
- `unit_price`
- `quantity`
- `line_total`

## Phase 5: Dashboard dan Laporan Dasar

Tidak direkomendasikan membuat tabel reporting khusus pada MVP.

Query laporan dari tabel existing:

- Jumlah produk dari `products`.
- Jumlah layanan dari `services`.
- Jumlah leads dari `leads`.
- Jumlah booking dari `bookings`.
- Jumlah order website dari `orders`.
- Aktivitas door-to-door dari `field_activities`.
- Produk stok rendah dari `products.stock_quantity <= products.low_stock_threshold`.
- Order terbaru dari `orders`.
- Booking terbaru dari `bookings`.
- Leads terbaru dari `leads`.
- Leads berdasarkan sumber dari `leads` grouped by `lead_source_id`.
- Leads berdasarkan karyawan dari `leads` grouped by `assigned_staff_id`.
- Laporan booking dari `bookings` grouped by `service_id`, status, atau tanggal.
- Laporan order website dari `orders`.
- Laporan offline sale dari `offline_sales`.
- Produk sering dibeli dari `order_items` dan `offline_sale_items`.

## Status dan Enum Rekomendasi

Gunakan string lowercase di database. PHP enum bisa ditambahkan saat implementasi jika diperlukan.

### User Role

- `admin`
- `customer`
- `field_staff`

### Customer Member Status

- `non_member`
- `member`

### Service Visit Type

Untuk katalog layanan:

- `home_visit`
- `office_visit`
- `both`

Untuk booking:

- `home_visit`
- `office_visit`

### Order Status

- `new`
- `waiting_shipping_confirmation`
- `waiting_payment`
- `payment_received`
- `processing`
- `shipped`
- `completed`
- `cancelled`

Catatan:

- Status awal checkout disarankan `waiting_shipping_confirmation`.
- `new` boleh dihapus jika ingin flow status lebih minimal.

### Payment Status

- `pending`
- `waiting_payment`
- `paid`
- `cancelled`

### Shipping Status

- `pending_shipping_confirmation`
- `shipping_cost_confirmed`
- `ready_to_ship`
- `shipped`
- `delivered`
- `cancelled`

### Voucher Discount Type

- `fixed`
- `percentage`

### Booking Status

- `waiting_confirmation`
- `confirmed`
- `scheduled`
- `completed`
- `cancelled`

### Lead Follow-Up Status

- `new`
- `interested`
- `needs_follow_up`
- `booking_examination`
- `purchased`
- `not_interested`

### Lead Source Slug

- `website`
- `whatsapp`
- `door_to_door`
- `event`
- `koperasi`
- `referral`
- `existing_customer`

### Field Activity Type

- `visit`
- `follow_up`
- `note`

### Offline Sale Source

- `offline`
- `door_to_door`
- `event`

## Tabel Immediate dan Later

### Immediate Foundation

- `users`
- `customer_profiles`
- `product_categories`
- `products`
- `services`
- `testimonials`
- `website_settings`

### Immediate Commerce

- `carts`
- `cart_items`
- `payment_methods`
- `orders`
- `order_items`
- `vouchers`
- `voucher_redemptions`

### Immediate Booking dan CRM Customer

- `bookings`
- `lead_sources`
- `leads`
- `lead_follow_ups`
- `examinations`
- `product_recommendations`

### Later Field Operations

- `events`
- `field_activities`
- `offline_sales`
- `offline_sale_items`

### Opsional/Later

- `media`
- `stock_movements`

## Urutan Migration yang Disarankan

1. Update `users` untuk `role` dan `is_active`, lalu buat `customer_profiles`.
2. Buat `product_categories`, `products`, `services`, `testimonials`, dan `website_settings`.
3. Buat `carts`, `cart_items`, `payment_methods`, `vouchers`, `orders`, `order_items`, dan `voucher_redemptions`.
4. Buat `bookings`, `lead_sources`, `leads`, `lead_follow_ups`, `examinations`, dan `product_recommendations`.
5. Buat `events`, `field_activities`, `offline_sales`, dan `offline_sale_items`.
6. Buat query/service laporan tanpa migration tambahan.

## Rencana Test Saat Implementasi

### Relationship Test

- User has one customer profile.
- Product belongs to category.
- Cart has many cart items.
- Order has many order items.
- Booking belongs to customer profile and service.
- Lead belongs to source and optionally assigned staff.
- Offline sale has many offline sale items.

### Factory Test

- Create admin user.
- Create customer user dengan non-member profile.
- Create member customer profile.
- Create field staff user.
- Create product with stock.
- Create guest cart with multiple cart items.
- Create registered customer cart.
- Create active voucher.
- Create guest order.
- Create registered customer order.

### Business Rule Test

- Customer signup default `non_member`.
- Guest checkout membuat order tanpa `user_id`.
- Cart dapat menampung beberapa produk sebelum checkout.
- Non-member tidak bisa memakai voucher.
- Member bisa memakai voucher valid yang published.
- Customer yang sama tidak bisa memakai voucher yang sama dua kali.
- Voucher tidak bisa melewati usage limit.
- Order awal masuk `waiting_shipping_confirmation`.
- Instruksi pembayaran final belum dianggap aktif sebelum ongkir diisi.
- Booking wajib customer login.
- Field staff hanya melihat assigned leads di policy/query layer.

### Report Query Test

- Produk stok rendah muncul dari query.
- Leads grouped by source.
- Leads grouped by field staff.
- Website orders dihitung terpisah dari offline sales.
- Door-to-door activities dihitung dari `field_activities`.

## Risiko dan Mitigasi

- Customer dan lead bisa overlap.
  - Mitigasi: `customer_profiles` untuk customer yang sudah dikenal, `leads` untuk prospek CRM. Hubungkan `lead` ke `customer_profile` hanya jika dibutuhkan.
- Guest checkout bisa kehilangan data jika hanya bergantung ke akun.
  - Mitigasi: simpan snapshot customer di `orders`.
- Voucher rawan race condition saat checkout bersamaan.
  - Mitigasi: gunakan unique constraint `voucher_id + customer_profile_id` dan validasi usage limit secara transactional.
- Stok history mungkin diminta setelah launch.
  - Mitigasi: mulai dari `stock_quantity`; tambahkan `stock_movements` jika kebutuhan operasional sudah jelas.
- Report bisa melebar.
  - Mitigasi: Phase 5 hanya query dasar, tanpa export dan tanpa aggregate table.

## Keputusan yang Perlu Dikunci Sebelum Implementasi

1. Tetap pakai kolom gambar sederhana (`image_path`, `photo_path`) atau langsung membuat `media` polymorphic?
2. Stok awal cukup `stock_quantity` atau langsung tambah `stock_movements`?
3. Offline sale tetap dipisah dari `orders` atau disatukan ke satu tabel transaksi?
4. Cart memakai tabel `carts` dan `cart_items` atau cukup session-only?

Rekomendasi MVP yang dikunci: pakai kolom gambar sederhana, cukup `stock_quantity` dulu, pisahkan `offline_sales` dari `orders`, dan gunakan `carts` + `cart_items` untuk keranjang multi-produk sebelum checkout.

## Cakupan Migration yang Sudah Dibuat

Migration tahap struktur data MVP mencakup:

- Identity: update `users` dengan `role` dan `is_active`, serta tabel `customer_profiles`.
- Katalog dan website: `product_categories`, `products`, `services`, `testimonials`, dan `website_settings`.
- Cart dan checkout manual: `carts`, `cart_items`, `payment_methods`, `vouchers`, `orders`, `order_items`, dan `voucher_redemptions`.
- Booking dan CRM customer: `bookings`, `events`, `lead_sources`, `leads`, `lead_follow_ups`, `examinations`, dan `product_recommendations`.
- Field staff dan offline sales: `field_activities`, `offline_sales`, dan `offline_sale_items`.

Tabel yang tetap tidak dibuat pada MVP awal:

- `media`, karena gambar masih memakai kolom sederhana seperti `image_path`, `photo_path`, dan `qris_image_path`.
- `stock_movements`, karena stok awal cukup dari `products.stock_quantity` dan `products.low_stock_threshold`.
