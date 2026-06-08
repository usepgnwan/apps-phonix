# Catatan Implementasi Project

Sumber acuan:

- `.docs/features-modules.md`
- `.docs/data-structure-plan.md`
- `.docs/system-flow.md`
- `.docs/admin-ui-style-guide.md`
- `.docs/DESIGN.md`

Dokumen ini mencatat progres implementasi yang sudah dikerjakan agar batch berikutnya bisa dilanjutkan tanpa kehilangan konteks.

## Status Terakhir

Progress saat ini sudah mencakup fondasi data, model domain, controller publik awal, flow backend cart dan checkout manual, booking, customer dashboard, customer profile backend, admin catalog backend untuk kategori produk, produk, dan layanan, Batch 8 Admin Commerce backend yang terdiri dari admin order, admin voucher, dan admin payment method, Batch 9 Admin Booking backend, Batch 10 Admin Customer backend, Batch 11 Admin Lead/CRM backend, Batch 12 Field Staff backend, Batch 13 Admin Event backend, Batch 14 Admin Offline Sales backend read/create-only, Batch 15 Admin Examination & Product Recommendation backend read/create-only, Batch 16 Admin Dashboard & Basic Reports backend read-only, Batch 17 Admin Order Fulfillment & Stock Movement backend, Batch 18 Admin Layout Shell & Dashboard UI, Batch 19 Admin Reports UI read-only, Batch 20 Admin Orders UI, Batch 21 Admin Catalog UI, Batch 22 Admin Voucher UI, Batch 23 Admin Payment Method UI, Batch 24 Admin Booking UI, Batch 25 Admin Customer UI, Batch 26 Admin Lead/CRM UI, Batch 27 Admin Event UI, Batch 28 Admin Offline Sales UI, Batch 29 Admin Examination & Product Recommendation UI, Batch 30 Field Staff UI, Batch 31 Admin UX Polish, auth redirect, dan seed dummy lokal, Batch 32 Customer Dashboard & Profile UI, Batch 33 Public Commerce UI untuk produk, cart, dan checkout, Batch 34 Public Service & Booking Create UI, Batch 35 Public Booking List & Detail UI, Batch 36 Customer Payment Instruction UI, Batch 37 Homepage CTA Integration Polish, Batch 38 Homepage Dynamic Content Polish, serta Batch 39 Guest Order Lookup. Flow publik utama customer untuk homepage, produk/cart/checkout, cek pesanan guest, instruksi pembayaran customer, dan layanan/booking sudah tersambung ke route Inertia nyata dan homepage sudah memakai data unggulan dari backend.

## Struktur Data dan Model

Migration dan model domain MVP sudah tersedia untuk area berikut:

- Identity dan customer profile:
  - `users`
  - `customer_profiles`
- Katalog dan website:
  - `product_categories`
  - `products`
  - `services`
  - `testimonials`
  - `website_settings`
- Cart dan checkout manual:
  - `carts`
  - `cart_items`
  - `payment_methods`
  - `vouchers`
  - `orders`
  - `order_items`
  - `voucher_redemptions`
- Booking, CRM customer, dan pemeriksaan:
  - `bookings`
  - `events`
  - `lead_sources`
  - `leads`
  - `lead_follow_ups`
  - `examinations`
  - `product_recommendations`
- Field staff dan offline sales:
  - `field_activities`
  - `offline_sales`
  - `offline_sale_items`

Catatan model yang sudah dirapikan:

- `App\Models\Order` sudah memiliki relasi `voucherRedemption(): HasOne` untuk flow satu order maksimal satu voucher redemption.
- Relasi lama `voucherRedemptions(): HasMany` masih dipertahankan sementara agar tidak memutus potensi pemakaian existing.

## Batch 1: Public Website Controller

Controller yang sudah dibuat:

- `App\Http\Controllers\Public\HomeController`
- `App\Http\Controllers\Public\ProductController`
- `App\Http\Controllers\Public\ServiceController`

Route yang sudah tersedia:

- `GET /` dengan nama `home`
- `GET /products` dengan nama `products.index`
- `GET /products/{product:slug}` dengan nama `products.show`
- `GET /services` dengan nama `services.index`
- `GET /services/{service:slug}` dengan nama `services.show`

Detail implementasi:

- Homepage memakai `HomeController` dan tetap render Inertia page `Welcome`.
- `HomeController` mengirim data awal:
  - `featuredProducts`
  - `featuredServices`
  - `testimonials`
  - `canLogin`
  - `canRegister`
  - `laravelVersion`
  - `phpVersion`
- `ProductController@index` mengambil produk aktif dengan kategori dan pagination 12 item.
- `ProductController@show` memakai route model binding berdasarkan `slug`, hanya memperbolehkan produk aktif, dan mengirim `relatedProducts`.
- `ServiceController@index` mengambil layanan aktif dengan pagination 12 item.
- `ServiceController@show` memakai route model binding berdasarkan `slug`, hanya memperbolehkan layanan aktif, dan mengirim `relatedServices`.
- Karena UI produk/layanan belum dibuat, controller produk dan layanan sementara render `Welcome` dengan prop `page` seperti:
  - `products.index`
  - `products.show`
  - `services.index`
  - `services.show`

## Batch 2: Cart dan Checkout Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Public\CartController`
- `App\Http\Controllers\Public\CheckoutController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Public\StoreCartItemRequest`
- `App\Http\Requests\Public\UpdateCartItemRequest`
- `App\Http\Requests\Public\StoreCheckoutRequest`

Service yang sudah dibuat:

- `App\Services\CartResolver`
- `App\Services\CheckoutService`

Route cart yang sudah tersedia:

- `GET /cart` dengan nama `cart.index`
- `POST /cart/items` dengan nama `cart.items.store`
- `PATCH /cart/items/{cartItem}` dengan nama `cart.items.update`
- `DELETE /cart/items/{cartItem}` dengan nama `cart.items.destroy`

Route checkout yang sudah tersedia:

- `GET /checkout` dengan nama `checkout.show`
- `POST /checkout` dengan nama `checkout.store`

### Cart Flow

Implementasi cart saat ini:

- Guest cart di-resolve menggunakan key session stabil `cart_session_id`, lalu disimpan ke kolom `carts.session_id`.
- Logged-in cart di-resolve menggunakan `user_id`.
- Jika user login punya `customer_profile`, `customer_profile_id` pada cart disinkronkan.
- Tidak ada guest-to-user cart merge karena belum diminta dan tidak masuk scope MVP saat ini.
- Tambah produk ke cart memvalidasi:
  - `product_id` wajib ada di tabel `products`.
  - `quantity` wajib integer minimal 1.
  - Produk harus aktif.
  - Total quantity item tidak boleh melebihi `products.stock_quantity`.
- Jika produk yang sama sudah ada di cart, quantity akan ditambah, bukan membuat row duplikat.
- Update cart item memvalidasi ownership cart dan stok produk.
- Delete cart item memvalidasi ownership cart.

### Checkout Flow

Implementasi checkout saat ini:

- `GET /checkout` sementara render `Welcome` dengan prop:
  - `page => checkout.show`
  - `cart`
  - `customerProfile`
- `POST /checkout` memvalidasi:
  - `customer_name`
  - `customer_whatsapp_number`
  - `shipping_address`
  - `voucher_code` opsional
- Checkout memakai `DB::transaction`.
- Checkout memvalidasi cart tidak kosong.
- Setiap cart item dicek ulang di dalam transaksi:
  - produk masih aktif,
  - stok masih mencukupi.
- Order dibuat dengan snapshot customer dan total:
  - `order_number`
  - `user_id`
  - `customer_profile_id`
  - `voucher_id`
  - `customer_name`
  - `customer_whatsapp_number`
  - `shipping_address`
  - `subtotal`
  - `voucher_discount_amount`
  - `shipping_cost = 0`
  - `total`
  - `shipping_status = pending_shipping_confirmation`
  - `payment_status = pending`
  - `status = waiting_shipping_confirmation`
- Order item dibuat sebagai snapshot produk:
  - `product_id`
  - `product_name`
  - `unit_price`
  - `quantity`
  - `line_total`
- Setelah checkout berhasil, cart item dihapus.
- Setelah checkout berhasil, user diarahkan ke `cart.index` dengan flash message dan `order_number`.
- Stok belum dikurangi saat checkout karena stock movement/konfirmasi order belum masuk batch ini.

## Batch 3: Focused Feature Test Cart dan Checkout

Test yang sudah dibuat:

- `tests/Feature/CartTest.php`
- `tests/Feature/CheckoutTest.php`

Coverage `CartTest`:

- Guest dapat menambahkan produk aktif ke session cart.
- Logged-in user dapat menambahkan produk ke cart yang terhubung ke `user_id` dan `customer_profile_id`.
- Menambahkan produk yang sama akan menambah quantity pada row cart item existing.
- Quantity cart tidak boleh melebihi stok produk.
- Produk nonaktif tidak dapat ditambahkan ke cart.
- Quantity cart item dapat diperbarui.
- Cart item dapat dihapus.

Coverage `CheckoutTest`:

- Guest checkout membuat `orders` dan `order_items`, lalu mengosongkan cart.
- Member checkout dengan voucher valid membuat `orders`, `order_items`, dan `voucher_redemptions`.
- Guest checkout dengan voucher ditolak.
- Non-member checkout dengan voucher ditolak.
- Checkout cart kosong ditolak.

Bug yang ditemukan dan sudah diperbaiki saat test:

- Guest cart sebelumnya memakai `$request->session()->getId()` langsung sebagai identifier. Pada feature test, identifier ini tidak stabil antar request sehingga cart guest bisa ter-resolve sebagai cart baru saat request berikutnya.
- Perbaikan: `CartResolver` sekarang menyimpan UUID stabil di session key `cart_session_id`, lalu memakai nilai tersebut untuk `carts.session_id`.

Hasil targeted test:

- `php artisan test --filter=CartTest`: pass, 7 tests, 21 assertions.
- `php artisan test --filter=CheckoutTest`: pass, 5 tests, 22 assertions.

## Batch 4: Booking Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Public\BookingController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Public\StoreBookingRequest`

Test yang sudah dibuat:

- `tests/Feature/BookingTest.php`

Route booking yang sudah tersedia dan berada di middleware `auth`:

- `GET /bookings` dengan nama `bookings.index`
- `GET /bookings/create` dengan nama `bookings.create`
- `POST /bookings` dengan nama `bookings.store`
- `GET /bookings/{booking}` dengan nama `bookings.show`

Implementasi booking saat ini:

- Booking wajib user login.
- Booking wajib memiliki `customer_profile` yang terhubung ke user login.
- `index`, `create`, dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI booking belum tersedia.
- `index` mengambil booking milik user login dengan relasi service dan pagination 10 item.
- `create` mengirim `customerProfile` user login dan daftar service aktif.
- `store` membuat booking dari data profile customer dan request tervalidasi.
- `show` hanya mengizinkan user melihat booking miliknya sendiri; booking milik user lain menghasilkan 404.
- `booking_number` dibuat otomatis dengan format `BK-YYYYMMDD-XXXXXX`.
- Status awal booking disimpan sebagai `waiting_confirmation`.
- Nama dan nomor WhatsApp booking disalin dari `customer_profiles`, bukan dari request bebas.

Validasi booking saat ini:

- `service_id` wajib ada dan harus merujuk service aktif.
- `visit_type` wajib salah satu dari:
  - `home_visit`
  - `office_visit`
- Jika service memiliki `visit_type = both`, maka `home_visit` dan `office_visit` diterima.
- Jika service memiliki `visit_type = home_visit`, hanya `home_visit` diterima.
- Jika service memiliki `visit_type = office_visit`, hanya `office_visit` diterima.
- `desired_schedule_at` wajib tanggal/jam di masa depan.
- `complaint_notes` wajib string maksimal 2000 karakter.

Coverage `BookingTest`:

- Guest tidak bisa membuat booking dan diarahkan ke login.
- User login tanpa customer profile tidak bisa membuat booking.
- Service nonaktif ditolak.
- Visit type tidak valid ditolak.
- Visit type yang tidak didukung service ditolak.
- Service dengan `visit_type = both` menerima home visit dan office visit.
- Jadwal booking harus di masa depan.
- Customer bisa membuat booking dengan data profile.
- Customer bisa melihat placeholder detail booking miliknya.
- Customer tidak bisa melihat booking customer lain.

Hasil targeted dan regression test setelah Batch 4:

- `php artisan test --filter=BookingTest`: pass, 10 tests, 28 assertions.
- `php artisan test --filter=CartTest`: pass, 7 tests, 21 assertions.
- `php artisan test --filter=CheckoutTest`: pass, 5 tests, 22 assertions.

Catatan test Inertia:

- Test GET placeholder booking memakai header `X-Inertia: true` agar response Inertia bisa diverifikasi tanpa membutuhkan `public/build/manifest.json` dari Vite build.

## Batch 5: Customer Dashboard Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Customer\CustomerDashboardController`

Test yang sudah dibuat:

- `tests/Feature/CustomerDashboardTest.php`

Route customer dashboard yang sudah tersedia dan berada di middleware `auth`:

- `GET /customer/dashboard` dengan nama `customer.dashboard.index`
- `GET /customer/dashboard/orders/{order}` dengan nama `customer.dashboard.orders.show`
- `GET /customer/dashboard/bookings/{booking}` dengan nama `customer.dashboard.bookings.show`

Catatan route:

- Route Breeze existing `GET /dashboard` tetap dibiarkan dan tidak diubah.
- Customer dashboard memakai namespace URL `/customer/dashboard` agar tidak bentrok dengan dashboard Breeze.

Implementasi customer dashboard saat ini:

- Semua route wajib login.
- User login wajib memiliki `customer_profile`.
- Jika user belum memiliki `customer_profile`, sistem redirect ke `customer.profile.create` dengan flash `error`.
- Semua response sementara render Inertia page `Welcome` dengan prop `page` karena UI customer dashboard belum tersedia.
- Dashboard index mengirim:
  - `customerProfile`
  - `summary`
  - `recentOrders`
  - `recentBookings`
  - `recentExaminations`
  - `recentProductRecommendations`

Summary dashboard yang sudah dihitung:

- `ordersCount`
- `bookingsCount`
- `voucherRedemptionsCount`
- `examinationsCount`
- `productRecommendationsCount`

Owner scoping yang sudah diterapkan:

- Detail order hanya dapat dibuka jika order terhubung ke user login dan `customer_profile` user tersebut.
- Detail booking hanya dapat dibuka jika booking terhubung ke user login dan `customer_profile` user tersebut.
- Order atau booking milik customer lain menghasilkan 404.

Coverage `CustomerDashboardTest`:

- Guest tidak bisa membuka customer dashboard dan diarahkan ke login.
- User login tanpa customer profile diarahkan ke `customer.profile.create` dengan flash error.
- Customer dashboard mengembalikan summary count yang hanya menghitung data customer login.
- Customer bisa melihat detail order miliknya.
- Customer tidak bisa melihat order customer lain.
- Customer bisa melihat detail booking miliknya.
- Customer tidak bisa melihat booking customer lain.

Hasil targeted dan regression test setelah Batch 5:

- `php artisan test --filter=CustomerDashboardTest`: pass, 7 tests, 23 assertions.
- `php artisan test --filter=BookingTest`: pass, 10 tests, 28 assertions.
- `php artisan test --filter=CheckoutTest`: pass, 5 tests, 22 assertions.

## Batch 6: Customer Profile Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Customer\CustomerProfileController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Customer\UpsertCustomerProfileRequest`

Test yang sudah dibuat:

- `tests/Feature/CustomerProfileTest.php`

Route customer profile yang sudah tersedia dan berada di middleware `auth`:

- `GET /customer/profile` dengan nama `customer.profile.show`
- `GET /customer/profile/create` dengan nama `customer.profile.create`
- `POST /customer/profile` dengan nama `customer.profile.store`
- `GET /customer/profile/edit` dengan nama `customer.profile.edit`
- `PATCH /customer/profile` dengan nama `customer.profile.update`

Catatan route:

- Route Breeze existing `/profile` tetap untuk account profile user dan tidak diubah.
- Customer profile memakai namespace URL `/customer/profile` agar terpisah dari profile akun Breeze.

Implementasi customer profile saat ini:

- Semua route wajib login.
- `show`, `create`, dan `edit` sementara render Inertia page `Welcome` dengan prop `page` karena UI customer profile belum tersedia.
- `show` dan `edit` mengirim prop `customerProfile` jika profile sudah ada.
- `store` hanya membuat profile jika user login belum punya `customer_profile`.
- `update` hanya memperbarui profile milik user login.
- Semua lookup profile di-scope memakai `user_id` dari user login.
- `store` redirect ke `customer.dashboard.index` dengan flash `success` agar flow dashboard langsung bisa dilanjutkan.
- `update` redirect ke `customer.profile.show` dengan flash `success`.

Validasi customer profile saat ini:

- `name` wajib string maksimal 255 karakter.
- `whatsapp_number` wajib string maksimal 30 karakter.
- `primary_address` wajib string maksimal 1000 karakter.
- Customer tidak dapat mengirim atau mengubah `member_status` dan `internal_notes` melalui request ini.
- Profile baru disimpan dengan `member_status = non_member` dan `internal_notes = null`.

Coverage `CustomerProfileTest`:

- Guest tidak bisa membuka route customer profile dan diarahkan ke login.
- User login tanpa customer profile bisa membuka placeholder create.
- User login bisa membuat customer profile.
- Store tidak membuat duplikat profile untuk user yang sudah punya profile.
- User login dengan profile bisa membuka placeholder show dan edit.
- User bisa memperbarui data customer profile miliknya.
- Field internal `member_status` dan `internal_notes` dari request customer diabaikan.
- Setelah membuat customer profile, user bisa membuka customer dashboard.

Hasil targeted test setelah Batch 6:

- `php artisan test tests/Feature/CustomerProfileTest.php tests/Feature/CustomerDashboardTest.php tests/Feature/ProfileTest.php`: pass, 20 tests, 83 assertions.

## Batch 7: Admin Catalog Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\ProductCategoryController`
- `App\Http\Controllers\Admin\ProductController`
- `App\Http\Controllers\Admin\ServiceController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StoreProductCategoryRequest`
- `App\Http\Requests\Admin\UpdateProductCategoryRequest`
- `App\Http\Requests\Admin\StoreProductRequest`
- `App\Http\Requests\Admin\UpdateProductRequest`
- `App\Http\Requests\Admin\StoreServiceRequest`
- `App\Http\Requests\Admin\UpdateServiceRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminCatalogTest.php`

Route admin catalog yang sudah tersedia dan berada di middleware `auth`:

- Resource `/admin/product-categories` dengan nama `admin.product-categories.*`
- Resource `/admin/products` dengan nama `admin.products.*`
- Resource `/admin/services` dengan nama `admin.services.*`

Catatan route:

- Route public `/products` dan `/services` tetap tersedia dan tidak diubah.
- Route admin memakai prefix URL `/admin` dan name prefix `admin.`.

Implementasi admin catalog saat ini:

- Semua route wajib login.
- Akses admin catalog dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- GET dan destroy memakai guard di controller.
- Store dan update memakai authorization di Form Request.
- `index`, `create`, `show`, dan `edit` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin belum tersedia.
- Product create/edit mengirim daftar `productCategories` untuk kebutuhan pilihan kategori.
- Product index/show/edit memuat relasi `productCategory`.
- Store, update, dan destroy redirect kembali ke index masing-masing dengan flash `success`.
- Delete kategori produk diblokir jika kategori masih memiliki produk, lalu redirect dengan flash `error`.

Validasi admin catalog saat ini:

- Kategori produk:
  - `name` wajib string maksimal 255 karakter.
  - `slug` wajib string maksimal 255 karakter dan unique, dengan ignore current row saat update.
  - `description` nullable string.
  - `is_active` wajib boolean.
- Produk:
  - `product_category_id` wajib ada di tabel `product_categories`.
  - `name` wajib string maksimal 255 karakter.
  - `slug` wajib unique, dengan ignore current row saat update.
  - `price` wajib numeric minimal 0.
  - `short_description` dan `full_description` wajib string.
  - `benefits`, `usage_rules`, dan `notes` nullable string.
  - `image_path` nullable string maksimal 255 karakter.
  - `stock_quantity` dan `low_stock_threshold` wajib integer minimal 0.
  - `is_active` dan `is_featured` wajib boolean.
- Layanan:
  - `name` wajib string maksimal 255 karakter.
  - `slug` wajib unique, dengan ignore current row saat update.
  - `description` wajib string.
  - `price` nullable numeric minimal 0.
  - `visit_type` wajib salah satu dari `home_visit`, `office_visit`, atau `both`.
  - `image_path` nullable string maksimal 255 karakter.
  - `is_active` dan `is_featured` wajib boolean.

Coverage `AdminCatalogTest`:

- Guest diarahkan ke login saat membuka route admin catalog.
- User non-admin mendapat 403 saat membuka route admin catalog.
- Admin aktif dapat membuka placeholder index/create/show/edit untuk kategori produk, produk, dan layanan.
- Admin aktif dapat create, update, dan delete kategori produk.
- Unique slug kategori produk tervalidasi saat create dan update.
- Kategori produk yang masih memiliki produk tidak dapat dihapus.
- Admin aktif dapat create, update, dan delete produk.
- Unique slug produk tervalidasi saat create dan update.
- Admin aktif dapat create, update, dan delete layanan.
- Unique slug layanan tervalidasi saat create dan update.

Hasil targeted test setelah Batch 7:

- `php artisan test tests/Feature/AdminCatalogTest.php`: pass, 10 tests, 85 assertions.
- `php artisan route:list --path=admin`: 21 route admin catalog terdaftar.

## Batch 8: Admin Commerce Controller Backend Flow

Batch ini mencakup tiga tahap backend admin untuk alur commerce manual:

- Tahap 1: Admin Order Controller.
- Tahap 2: Admin Voucher Controller.
- Tahap 3: Admin Payment Method Controller.

### Tahap 1: Admin Order Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\OrderController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\UpdateOrderShippingRequest`
- `App\Http\Requests\Admin\UpdateOrderPaymentRequest`
- `App\Http\Requests\Admin\UpdateOrderStatusRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminOrderTest.php`

Route admin order yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/orders` dengan nama `admin.orders.index`
- `GET /admin/orders/{order}` dengan nama `admin.orders.show`
- `PATCH /admin/orders/{order}/shipping` dengan nama `admin.orders.shipping.update`
- `PATCH /admin/orders/{order}/payment` dengan nama `admin.orders.payment.update`
- `PATCH /admin/orders/{order}/status` dengan nama `admin.orders.status.update`

Implementasi admin order saat ini:

- Semua route wajib login.
- Akses admin order dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- `index` dan `show` memakai guard di controller.
- Update shipping, payment, dan status memakai authorization di Form Request.
- `index` dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin order belum tersedia.
- `index` mengirim daftar `orders` terbaru dengan relasi dasar user, customer profile, voucher, dan payment method.
- `show` mengirim `order` yang memuat relasi `user`, `customerProfile`, `voucher`, `paymentMethod`, `orderItems.product`, dan `voucherRedemption.voucher`.
- `show` juga mengirim daftar `paymentMethods` aktif untuk kebutuhan UI admin berikutnya.

Update shipping order:

- Admin dapat mengubah `courier_name`, `tracking_number`, `shipping_cost`, `shipping_status`, dan `shipping_notes`.
- Total order dihitung ulang dengan rumus `subtotal - voucher_discount_amount + shipping_cost`.
- Jika `shipping_status` menjadi `shipping_cost_confirmed` atau `ready_to_ship`, status order menjadi `waiting_payment`.
- Jika `shipping_status` menjadi `cancelled`, status order menjadi `cancelled`.

Update payment order:

- Admin dapat mengubah `payment_method_id`, `payment_status`, `payment_received_at`, dan `payment_notes`.
- `payment_method_id` boleh null, tetapi jika diisi harus merujuk payment method aktif.
- Jika `payment_status = paid` dan `payment_received_at` tidak dikirim, sistem mengisi timestamp otomatis.
- Jika `payment_status = paid`, status order menjadi `payment_received`.
- Jika `payment_status = waiting_payment`, status order menjadi `waiting_payment`.
- Jika `payment_status = cancelled`, status order menjadi `cancelled`.

Update status order:

- Admin dapat mengubah `status` dan `admin_notes` melalui endpoint khusus status.
- Status order yang diterima:
  - `waiting_shipping_confirmation`
  - `waiting_payment`
  - `payment_received`
  - `processing`
  - `shipped`
  - `completed`
  - `cancelled`

Validasi admin order saat ini:

- Shipping status yang diterima:
  - `pending_shipping_confirmation`
  - `shipping_cost_confirmed`
  - `ready_to_ship`
  - `shipped`
  - `delivered`
  - `cancelled`
- Payment status yang diterima:
  - `pending`
  - `waiting_payment`
  - `paid`
  - `cancelled`
- Tidak ada pengurangan stok, integrasi payment gateway, atau integrasi ongkir API pada batch ini.

Coverage `AdminOrderTest`:

- Guest diarahkan ke login saat membuka admin orders.
- User non-admin mendapat 403.
- Admin aktif dapat membuka placeholder index order.
- Admin aktif dapat membuka placeholder show order dengan relasi detail.
- Admin dapat update shipping dan total order dihitung ulang.
- Admin dapat update payment dan timestamp pembayaran diterima diisi saat status paid.
- Admin dapat update status order dan admin notes.
- Invalid shipping, payment, dan order status ditolak.
- Payment method nonaktif ditolak.

Hasil targeted dan regression test setelah Batch 8 Tahap 1:

- `php artisan test tests/Feature/AdminOrderTest.php`: pass, 9 tests, 38 assertions.
- `php artisan test tests/Feature/CheckoutTest.php tests/Feature/CustomerDashboardTest.php`: pass, 12 tests, 45 assertions.
- `php artisan route:list --path=admin/orders`: 5 route admin order terdaftar.

### Tahap 2: Admin Voucher Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\VoucherController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StoreVoucherRequest`
- `App\Http\Requests\Admin\UpdateVoucherRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminVoucherTest.php`

Route admin voucher yang sudah tersedia dan berada di middleware `auth`:

- Resource `/admin/vouchers` dengan nama `admin.vouchers.*`
- `GET /admin/vouchers/{voucher}/redemptions` dengan nama `admin.vouchers.redemptions.index`

Implementasi admin voucher saat ini:

- Semua route wajib login.
- Akses admin voucher dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- GET, destroy, dan redemptions memakai guard di controller.
- Store dan update memakai authorization di Form Request.
- `index`, `create`, `show`, `edit`, dan `redemptions` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin voucher belum tersedia.
- `index` mengirim daftar `vouchers` terbaru dengan count `orders_count` dan `voucher_redemptions_count`.
- `show` mengirim `voucher` dengan count `orders_count` dan `voucher_redemptions_count`.
- `redemptions` mengirim `voucher` dan daftar `redemptions` yang memuat `customerProfile` dan `order`.
- Kode voucher dinormalisasi ke uppercase sebelum validasi dan sebelum disimpan.
- Delete voucher diblokir jika voucher masih memiliki redemption atau order.

Validasi admin voucher saat ini:

- `code` wajib string maksimal 255 karakter dan unique, dengan ignore current row saat update.
- `name` wajib string maksimal 255 karakter.
- `description` nullable string.
- `discount_type` wajib salah satu dari `fixed` atau `percentage`.
- `discount_value` wajib numeric minimal 0.
- Jika `discount_type = percentage`, `discount_value` maksimal 100.
- `minimum_purchase` nullable numeric minimal 0.
- `starts_at` wajib tanggal.
- `ends_at` wajib tanggal dan harus setelah atau sama dengan `starts_at`.
- `usage_limit` wajib integer minimal 1.
- `is_published` wajib boolean.

Coverage `AdminVoucherTest`:

- Guest diarahkan ke login saat membuka admin vouchers.
- User non-admin mendapat 403.
- Admin aktif dapat membuka placeholder index/create/show/edit voucher.
- Admin aktif dapat membuat voucher dan kode disimpan uppercase.
- Admin aktif dapat update voucher dan kode disimpan uppercase.
- Admin aktif dapat delete voucher yang belum punya order atau redemption.
- Unique code voucher tervalidasi saat create dan update, termasuk input beda kapital.
- Own unchanged code tetap diterima saat update.
- Invalid discount type, percentage di atas 100, discount negatif, tanggal selesai sebelum mulai, usage limit kurang dari 1, dan missing `is_published` ditolak.
- Delete voucher diblokir jika voucher punya redemption.
- Delete voucher diblokir jika voucher punya order.
- Endpoint redemptions mengembalikan voucher dan redemption dengan customer profile dan order.

Hasil targeted dan regression test setelah Batch 8 Tahap 2:

- `php artisan test tests/Feature/AdminVoucherTest.php`: pass, 11 tests, 66 assertions.
- `php artisan test tests/Feature/CheckoutTest.php`: pass, 5 tests, 22 assertions.
- `php artisan route:list --path=admin/vouchers`: 8 route admin voucher terdaftar.

### Tahap 3: Admin Payment Method Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\PaymentMethodController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StorePaymentMethodRequest`
- `App\Http\Requests\Admin\UpdatePaymentMethodRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminPaymentMethodTest.php`

Route admin payment method yang sudah tersedia dan berada di middleware `auth`:

- Resource `/admin/payment-methods` dengan nama `admin.payment-methods.*`

Implementasi admin payment method saat ini:

- Semua route wajib login.
- Akses admin payment method dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- GET dan destroy memakai guard di controller.
- Store dan update memakai authorization di Form Request.
- `index`, `create`, `show`, dan `edit` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin payment method belum tersedia.
- `index` mengirim daftar `paymentMethods` terbaru dengan count `orders_count`.
- `show` mengirim `paymentMethod` dengan count `orders_count`.
- Delete payment method diblokir jika payment method masih memiliki order.

Validasi admin payment method saat ini:

- `type` wajib salah satu dari `bank_transfer` atau `qris`.
- Jika `type = bank_transfer`, field berikut wajib diisi:
  - `bank_name`
  - `account_number`
  - `account_holder_name`
- Jika `type = qris`, `qris_image_path` wajib diisi.
- `qris_image_path` masih diperlakukan sebagai string path biasa, belum ada upload/storage file.
- `instructions` nullable string.
- `is_active` wajib boolean.

Coverage `AdminPaymentMethodTest`:

- Guest diarahkan ke login saat membuka admin payment methods.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka placeholder index/create/show/edit payment method.
- Admin aktif dapat membuat payment method tipe bank transfer.
- Admin aktif dapat membuat payment method tipe QRIS.
- Admin aktif dapat update payment method.
- Invalid type, missing bank transfer field, missing QRIS path, dan missing `is_active` ditolak.
- Admin aktif dapat delete payment method yang belum punya order.
- Delete payment method diblokir jika payment method punya order.

Hasil targeted dan regression test setelah Batch 8 Tahap 3:

- `php artisan test tests/Feature/AdminPaymentMethodTest.php`: pass, 10 tests, 48 assertions.
- `php artisan test tests/Feature/AdminOrderTest.php`: pass, 9 tests, 38 assertions.
- `php artisan route:list --path=admin/payment-methods`: 7 route admin payment method terdaftar.

## Batch 9: Admin Booking Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\BookingController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\UpdateBookingStatusRequest`
- `App\Http\Requests\Admin\UpdateBookingScheduleRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminBookingTest.php`

Route admin booking yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/bookings` dengan nama `admin.bookings.index`
- `GET /admin/bookings/{booking}` dengan nama `admin.bookings.show`
- `PATCH /admin/bookings/{booking}/status` dengan nama `admin.bookings.status.update`
- `PATCH /admin/bookings/{booking}/schedule` dengan nama `admin.bookings.schedule.update`

Implementasi admin booking saat ini:

- Semua route wajib login.
- Akses admin booking dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- `index` dan `show` memakai guard di controller.
- Update status dan schedule memakai authorization di Form Request.
- `index` dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin booking belum tersedia.
- `index` mengirim daftar `bookings` terbaru dengan relasi `user`, `customerProfile`, dan `service`.
- `show` mengirim `booking` dengan relasi `user`, `customerProfile`, dan `service`.
- Admin dapat update `status` dan `admin_notes` melalui endpoint status.
- Admin dapat update `desired_schedule_at` dan `admin_notes` melalui endpoint schedule.
- Tidak ada admin booking create/store/edit/delete, notifikasi, atau integrasi kalender pada batch ini.

Validasi admin booking saat ini:

- Status booking yang diterima:
  - `waiting_confirmation`
  - `confirmed`
  - `completed`
  - `cancelled`
- `desired_schedule_at` wajib tanggal/jam di masa depan.
- `admin_notes` nullable string.

Coverage `AdminBookingTest`:

- Guest diarahkan ke login saat membuka admin bookings.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka placeholder index booking.
- Admin aktif dapat membuka placeholder show booking dengan relasi detail.
- Admin dapat update status booking dan admin notes.
- Invalid status booking ditolak.
- User non-admin tidak dapat update status booking.
- Admin dapat update schedule booking dan admin notes.
- Jadwal invalid atau masa lalu ditolak.
- User non-admin tidak dapat update schedule booking.

Hasil targeted dan regression test setelah Batch 9:

- `php artisan test tests/Feature/AdminBookingTest.php`: pass, 11 tests, 32 assertions.
- `php artisan test tests/Feature/BookingTest.php`: pass, 10 tests, 28 assertions.
- `php artisan route:list --name=admin.bookings`: 4 route admin booking terdaftar.

## Batch 10: Admin Customer Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\CustomerController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\UpdateCustomerProfileRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminCustomerProfileTest.php`

Route admin customer yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/customers` dengan nama `admin.customers.index`
- `GET /admin/customers/{customerProfile}` dengan nama `admin.customers.show`
- `PATCH /admin/customers/{customerProfile}` dengan nama `admin.customers.update`

Implementasi admin customer saat ini:

- Semua route wajib login.
- Akses admin customer dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- `index` dan `show` memakai guard di controller.
- Update customer profile memakai authorization di Form Request.
- `index` dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin customer belum tersedia.
- `index` mengirim daftar `customerProfiles` terbaru dengan relasi `user` dan count `orders_count`, `bookings_count`, serta `voucher_redemptions_count`.
- `show` mengirim `customerProfile` dengan relasi `user`, `orders`, `bookings.service`, dan `voucherRedemptions.voucher`, serta count order, booking, dan voucher redemption.
- Admin dapat update field operasional customer: `name`, `whatsapp_number`, `primary_address`, `member_status`, dan `internal_notes`.
- Tidak ada admin create/delete customer, perubahan akun user/email/password, mutasi order/booking/voucher, atau scope CRM/leads pada batch ini.

Validasi admin customer saat ini:

- `name` wajib string maksimal 255 karakter.
- `whatsapp_number` wajib string maksimal 30 karakter.
- `primary_address` wajib string maksimal 1000 karakter.
- `member_status` wajib salah satu dari `non_member` atau `member`.
- `internal_notes` nullable string.

Coverage `AdminCustomerProfileTest`:

- Guest diarahkan ke login saat membuka admin customers.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka placeholder index customer dengan count order, booking, dan voucher redemption.
- Admin aktif dapat membuka placeholder show customer dengan relasi user, orders, bookings, dan voucher redemptions.
- Admin aktif dapat update data customer profile.
- Invalid `member_status` ditolak.
- User non-admin tidak dapat update customer profile.
- Field `user_id` yang ikut dikirim tidak mengubah ownership customer profile.

Hasil targeted dan regression test setelah Batch 10:

- `php artisan test tests/Feature/AdminCustomerProfileTest.php`: pass, 9 tests, 32 assertions.
- `php artisan test tests/Feature/CustomerProfileTest.php`: pass, 8 tests, 39 assertions.
- `php artisan route:list --name=admin.customers`: 3 route admin customer terdaftar.

## Batch 11: Admin Lead/CRM Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\LeadSourceController`
- `App\Http\Controllers\Admin\LeadController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StoreLeadSourceRequest`
- `App\Http\Requests\Admin\UpdateLeadSourceRequest`
- `App\Http\Requests\Admin\StoreLeadRequest`
- `App\Http\Requests\Admin\UpdateLeadRequest`
- `App\Http\Requests\Admin\UpdateLeadStatusRequest`
- `App\Http\Requests\Admin\StoreLeadFollowUpRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminLeadSourceTest.php`
- `tests/Feature/AdminLeadTest.php`

Route admin lead source yang sudah tersedia dan berada di middleware `auth`:

- Resource `/admin/lead-sources` dengan nama `admin.lead-sources.*`

Route admin lead/CRM yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/leads` dengan nama `admin.leads.index`
- `GET /admin/leads/create` dengan nama `admin.leads.create`
- `POST /admin/leads` dengan nama `admin.leads.store`
- `GET /admin/leads/{lead}` dengan nama `admin.leads.show`
- `PATCH /admin/leads/{lead}` dengan nama `admin.leads.update`
- `PATCH /admin/leads/{lead}/status` dengan nama `admin.leads.status.update`
- `POST /admin/leads/{lead}/follow-ups` dengan nama `admin.leads.follow-ups.store`

Implementasi admin lead source saat ini:

- Semua route wajib login.
- Akses admin lead source dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- GET dan destroy memakai guard di controller.
- Store dan update memakai authorization di Form Request.
- `index`, `create`, `show`, dan `edit` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin lead source belum tersedia.
- `index` mengirim daftar `leadSources` terbaru dengan count `leads_count`.
- Delete lead source diblokir jika masih memiliki lead.

Validasi admin lead source saat ini:

- `name` wajib string maksimal 255 karakter.
- `slug` wajib string maksimal 255 karakter dan unique, dengan ignore current row saat update.
- `is_active` wajib boolean.

Implementasi admin lead/CRM saat ini:

- Semua route wajib login.
- Akses admin lead dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- `index`, `create`, dan `show` memakai guard di controller.
- Store, update, status update, dan follow-up creation memakai authorization di Form Request.
- `index`, `create`, dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin lead/CRM belum tersedia.
- `index` mengirim daftar `leads` terbaru dengan relasi `leadSource`, `assignedStaff`, `customerProfile`, dan `event`.
- `create` mengirim reference data `leadSources` aktif, `users`, `customerProfiles`, `events`, dan daftar `leadStatuses`.
- `show` mengirim `lead` dengan relasi `leadSource`, `assignedStaff`, `customerProfile`, `event`, dan `leadFollowUps.user`.
- Admin dapat create dan update field CRM dasar lead.
- Admin dapat update `follow_up_status` melalui endpoint khusus status.
- Admin dapat menambahkan history follow-up lead.
- Follow-up memakai user admin yang sedang login sebagai `user_id`; payload `user_id` dari request dilarang agar tidak bisa spoofing.
- Follow-up creation tidak otomatis mengubah `leads.follow_up_status`; status parent lead diubah melalui endpoint status khusus.
- Tidak ada field staff dashboard, policy ownership field staff, offline sales, examinations, product recommendations, notification, import, atau customer conversion automation pada batch ini.

Status lead/follow-up yang diterima:

- `new`
- `interested`
- `needs_follow_up`
- `booking_examination`
- `purchased`
- `not_interested`

Validasi admin lead saat ini:

- `assigned_staff_id` nullable dan harus merujuk `users.id` jika diisi.
- `customer_profile_id` nullable dan harus merujuk `customer_profiles.id` jika diisi.
- `lead_source_id` wajib dan harus merujuk `lead_sources.id`.
- `event_id` nullable dan harus merujuk `events.id` jika diisi.
- `name` wajib string maksimal 255 karakter.
- `whatsapp_number` wajib string maksimal 30 karakter.
- `address` nullable string maksimal 1000 karakter.
- `interested_product_notes`, `interested_service_notes`, `initial_complaint`, dan `internal_notes` nullable string.
- `follow_up_status` wajib salah satu dari status lead yang diterima.

Coverage `AdminLeadSourceTest`:

- Guest diarahkan ke login saat membuka admin lead sources.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka placeholder index/create/show/edit lead source.
- Admin aktif dapat create, update, dan delete unused lead source.
- Invalid field dan duplicate slug lead source ditolak.
- Delete lead source diblokir jika source masih memiliki lead.
- User non-admin tidak dapat mutate lead source.

Coverage `AdminLeadTest`:

- Guest diarahkan ke login saat membuka admin leads.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka placeholder index/create/show lead.
- Admin aktif dapat create dan update lead.
- Invalid status dan invalid foreign key lead ditolak.
- Admin aktif dapat update status lead.
- Invalid status update ditolak.
- Admin aktif dapat membuat follow-up lead dengan current admin sebagai user.
- Payload `user_id` pada follow-up ditolak.
- Invalid follow-up status, notes, dan tanggal follow-up ditolak.
- User non-admin tidak dapat mutate lead, update status, atau membuat follow-up.

Hasil targeted test setelah Batch 11:

- `php artisan test tests/Feature/AdminLeadSourceTest.php`: pass, 10 tests, 43 assertions.
- `php artisan test tests/Feature/AdminLeadTest.php`: pass, 15 tests, 62 assertions.
- `php artisan test tests/Feature/AdminLeadSourceTest.php tests/Feature/AdminLeadTest.php`: pass, 25 tests, 105 assertions.
- `php artisan route:list --name=admin.lead`: 14 route admin lead/CRM terdaftar.

## Batch 12: Field Staff Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Field\FieldDashboardController`
- `App\Http\Controllers\Field\FieldLeadController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Field\StoreFieldActivityRequest`
- `App\Http\Requests\Field\UpdateFieldLeadStatusRequest`

Test yang sudah dibuat:

- `tests/Feature/FieldStaffLeadTest.php`

Route field staff yang sudah tersedia dan berada di middleware `auth`:

- `GET /field/dashboard` dengan nama `field.dashboard.index`
- `GET /field/leads` dengan nama `field.leads.index`
- `GET /field/leads/{lead}` dengan nama `field.leads.show`
- `PATCH /field/leads/{lead}/status` dengan nama `field.leads.status.update`
- `POST /field/leads/{lead}/activities` dengan nama `field.leads.activities.store`

Implementasi field staff saat ini:

- Semua route wajib login.
- Akses field staff dibatasi untuk user dengan `role = field_staff` dan `is_active = true`.
- Dashboard, list lead, dan detail lead sementara render Inertia page `Welcome` dengan prop `page` karena UI field staff belum tersedia.
- Dashboard mengirim summary scoped untuk staff login:
  - `assignedLeadsCount`
  - `openLeadsCount`
  - `activitiesCount`
  - `recentLeads`
- Field staff hanya dapat melihat lead dengan `assigned_staff_id` sesuai user login.
- Detail lead milik staff lain menghasilkan 404 agar keberadaan lead tidak bocor.
- Field staff dapat update `follow_up_status` lead miliknya melalui endpoint status khusus.
- Field staff dapat membuat `field_activities` untuk lead miliknya.
- Activity creation memakai current field staff sebagai `field_staff_id`; payload `field_staff_id` dan `lead_id` dari request dilarang agar tidak bisa spoofing.
- Activity creation tidak otomatis mengubah `leads.follow_up_status`; status parent lead diubah melalui endpoint status khusus.
- Tidak ada offline sales, GPS, absensi, route planning, komisi, stok per staff, examinations, product recommendations, atau UI field staff pada batch ini.

Status lead/field activity yang diterima:

- `new`
- `interested`
- `needs_follow_up`
- `booking_examination`
- `purchased`
- `not_interested`

Activity type yang diterima:

- `visit`
- `follow_up`
- `note`

Validasi field activity saat ini:

- `activity_type` wajib salah satu dari `visit`, `follow_up`, atau `note`.
- `activity_at` wajib tanggal/jam valid.
- `notes` wajib string.
- `follow_up_status` nullable dan jika diisi wajib salah satu dari status lead yang diterima.
- `field_staff_id` dan `lead_id` dilarang dari payload request.

Coverage `FieldStaffLeadTest`:

- Guest diarahkan ke login saat membuka field dashboard.
- User non-field-staff mendapat 403.
- Field staff tidak aktif mendapat 403.
- Field staff aktif dapat membuka dashboard placeholder dengan summary scoped.
- Field staff aktif hanya melihat lead miliknya pada index.
- Field staff aktif dapat membuka detail lead miliknya.
- Field staff tidak dapat melihat lead milik staff lain.
- Field staff aktif dapat update status lead miliknya.
- Invalid status update ditolak.
- Field staff aktif dapat membuat field activity untuk lead miliknya.
- Field activity menerima `follow_up_status` nullable.
- Invalid activity type dan invalid follow-up status ditolak.
- Payload spoofing `field_staff_id` dan `lead_id` ditolak.
- Field staff tidak dapat membuat activity untuk lead milik staff lain.

Hasil targeted test setelah Batch 12:

- `php artisan test tests/Feature/FieldStaffLeadTest.php`: pass, 15 tests, 42 assertions.
- `php artisan test tests/Feature/AdminLeadTest.php`: pass, 15 tests, 62 assertions.
- `php artisan route:list --name=field`: 5 route field staff terdaftar.

## Batch 13: Admin Event Controller Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\EventController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StoreEventRequest`
- `App\Http\Requests\Admin\UpdateEventRequest`

Test yang sudah dibuat:

- `tests/Feature/AdminEventTest.php`

Route admin event yang sudah tersedia dan berada di middleware `auth`:

- Resource `/admin/events` dengan nama `admin.events.*`

Implementasi admin event saat ini:

- Semua route wajib login.
- Akses admin event dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- GET dan destroy memakai guard di controller.
- Store dan update memakai authorization di Form Request.
- `index`, `create`, `show`, dan `edit` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin event belum tersedia.
- `index` mengirim daftar `events` terbaru dengan count `leads_count` dan `offline_sales_count`.
- `show` mengirim `event` dengan count `leads_count` dan `offline_sales_count`.
- Delete event diblokir jika masih memiliki lead.
- Delete event diblokir jika masih memiliki offline sales.
- Tidak ada offline sales CRUD, event report, attendance, registration, notification, atau UI admin event pada batch ini.

Validasi admin event saat ini:

- `name` wajib string maksimal 255 karakter.
- `event_date` wajib tanggal valid.
- `location` wajib string maksimal 255 karakter.
- `organizer` nullable string maksimal 255 karakter.
- `notes` nullable string.

Coverage `AdminEventTest`:

- Guest diarahkan ke login saat membuka admin events.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka placeholder index/create/show/edit event.
- Index dan show mengirim `leads_count` dan `offline_sales_count`.
- Admin aktif dapat create event.
- Admin aktif dapat create event dengan field optional nullable.
- Admin aktif dapat update event.
- Invalid event fields ditolak.
- Admin aktif dapat delete event yang belum dipakai.
- Delete event diblokir jika masih memiliki lead.
- Delete event diblokir jika masih memiliki offline sales.
- User non-admin tidak dapat mutate event.

Hasil targeted test setelah Batch 13:

- `php artisan test tests/Feature/AdminEventTest.php`: pass, 12 tests, 53 assertions.
- `php artisan test tests/Feature/AdminLeadTest.php`: pass, 15 tests, 62 assertions.
- `php artisan route:list --name=admin.events`: 7 route admin event terdaftar.

## Batch 14: Admin Offline Sales Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\OfflineSaleController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StoreOfflineSaleRequest`

Service yang sudah dibuat:

- `App\Services\OfflineSaleService`

Test yang sudah dibuat:

- `tests/Feature/AdminOfflineSaleTest.php`

Route admin offline sales yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/offline-sales` dengan nama `admin.offline-sales.index`
- `POST /admin/offline-sales` dengan nama `admin.offline-sales.store`
- `GET /admin/offline-sales/{offlineSale}` dengan nama `admin.offline-sales.show`

Implementasi admin offline sales saat ini:

- Semua route wajib login.
- Akses admin offline sales dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- Batch ini read/create-only: tidak ada edit, update, delete, payment handling, atau field staff offline sales routes.
- `index` menjadi halaman list sekaligus input offline sale ala POS.
- `index` mengirim daftar `offlineSales` terbaru dengan relasi `customerProfile`, `lead`, `fieldStaff`, dan `event`.
- `index` juga mengirim lookup data produk aktif, customer profiles, leads, field staff aktif, events, dan daftar source untuk form POS offline sale.
- `show` mengirim `offlineSale` dengan relasi `offlineSaleItems.product`, `customerProfile`, `lead`, `fieldStaff`, dan `event`.
- Store memakai `OfflineSaleService` dan `DB::transaction`.
- `sale_number` dibuat otomatis dengan format `OFF-YYYYMMDD-XXXXXX`.
- Produk di-lock saat transaksi, dicek masih aktif, dan dicek stok mencukupi.
- Item penjualan offline memakai snapshot:
  - `product_id`
  - `product_name`
  - `unit_price`
  - `quantity`
  - `line_total`
- `offline_sales.total` dihitung server-side dari total semua item.
- Payload `total`, `unit_price`, dan `line_total` dari client tidak dipakai sebagai sumber kebenaran.
- Stok produk dikurangi sesuai quantity item dalam transaksi offline sale yang sama.

Source offline sales yang diterima:

- `offline`
- `door_to_door`
- `event`

Validasi admin offline sales saat ini:

- `customer_profile_id`, `lead_id`, `field_staff_id`, dan `event_id` nullable dan harus valid jika diisi.
- `field_staff_id` jika diisi wajib user aktif dengan `role = field_staff`.
- `source` wajib salah satu dari source yang diterima.
- `customer_name` wajib string maksimal 255 karakter.
- `customer_whatsapp_number` nullable string maksimal 255 karakter.
- `notes` nullable string.
- `sold_at` wajib tanggal/jam valid.
- `items` wajib array minimal 1 item.
- `items.*.product_id` wajib produk aktif.
- `items.*.quantity` wajib integer minimal 1 dan tidak boleh melebihi `products.stock_quantity`.

Coverage `AdminOfflineSaleTest`:

- Guest diarahkan ke login saat membuka admin offline sales.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka index/show offline sales; route create terpisah tidak diekspos.
- Admin aktif dapat create offline sale dengan item produk.
- Total dan line total dihitung server-side dari harga produk saat ini.
- Sale number mengikuti format `OFF-YYYYMMDD-XXXXXX`.
- Stok produk tidak berkurang setelah offline sale dibuat.
- Admin aktif dapat create offline sale dengan relasi nullable.
- Invalid source dan empty items ditolak.
- Invalid relation dan invalid field staff ditolak.
- Produk tidak aktif, quantity kurang dari 1, dan quantity melebihi stok ditolak.
- User non-admin tidak dapat create offline sale.

Hasil targeted test setelah Batch 14:

- `php artisan test tests/Feature/AdminOfflineSaleTest.php`: pass, 10 tests, 53 assertions.
- `php artisan test tests/Feature/AdminEventTest.php`: pass, 12 tests, 53 assertions.
- `php artisan test tests/Feature/CheckoutTest.php`: pass, 5 tests, 22 assertions.
- `php artisan route:list --name=admin.offline-sales`: route admin offline sales mencakup index, store, dan show; route create terpisah sudah ditiadakan.

## Batch 15: Admin Examination & Product Recommendation Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\ExaminationController`

Form Request yang sudah dibuat:

- `App\Http\Requests\Admin\StoreExaminationRequest`

Service yang sudah dibuat:

- `App\Services\ExaminationService`

Test yang sudah dibuat:

- `tests/Feature/AdminExaminationTest.php`

Route admin examination yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/examinations` dengan nama `admin.examinations.index`
- `GET /admin/examinations/create` dengan nama `admin.examinations.create`
- `POST /admin/examinations` dengan nama `admin.examinations.store`
- `GET /admin/examinations/{examination}` dengan nama `admin.examinations.show`

Implementasi admin examination saat ini:

- Semua route wajib login.
- Akses admin examination dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- Batch ini read/create-only: tidak ada edit, update, delete, update status booking, order creation, offline sale creation, atau stock changes.
- `index` menjadi halaman list pemeriksaan.
- `index` mengirim daftar `examinations` terbaru dengan relasi `customerProfile`, `booking`, `creator`, dan `productRecommendations.product`.
- `create` mengirim lookup data `customerProfiles`, `bookings` dengan `customerProfile` dan `service`, serta produk aktif untuk form POS pemeriksaan.
- `show` mengirim `examination` dengan relasi `customerProfile`, `booking`, `creator`, dan `productRecommendations.product`.
- Store memakai `ExaminationService` dan `DB::transaction`.
- `created_by` pada `examinations` selalu memakai current admin.
- Product recommendation dibuat opsional bersamaan dengan examination.
- `created_by` pada `product_recommendations` selalu memakai current admin.
- Product recommendation selalu memakai `customer_profile_id` yang sama dengan examination.
- Payload `created_by` dari client dilarang pada level examination dan product recommendation.
- Implementasi mengikuti schema aktual: tidak ada `lead_id` dan tidak ada `examined_at` di examination.

Validasi admin examination saat ini:

- `customer_profile_id` wajib dan harus valid.
- `customer_mode` wajib bernilai `registered` atau `guest`.
- Mode `registered` wajib memilih `customer_profile_id` existing.
- Mode `guest` wajib mengirim `guest_name`, `guest_whatsapp_number`, dan `guest_address`; sistem membuat `customer_profile` tanpa `user_id` dengan `member_status = non_member`.
- `booking_id` nullable dan harus valid jika diisi.
- Jika `booking_id` diisi, booking harus milik `customer_profile_id` yang dipilih dan hanya berlaku untuk mode `registered`.
- `complaint`, `result`, `summary`, dan `internal_recommendation` wajib string.
- `created_by` dilarang dari payload.
- `product_recommendations` nullable array.
- `product_recommendations.*.product_id` wajib produk aktif.
- `product_recommendations.*.notes` nullable string.
- `product_recommendations.*.created_by` dilarang dari payload.

Coverage `AdminExaminationTest`:

- Guest diarahkan ke login saat membuka admin examinations.
- User non-admin mendapat 403.
- Admin tidak aktif mendapat 403.
- Admin aktif dapat membuka index/create/show examination.
- `create` menjadi halaman POS pemeriksaan dan mengirim customer profiles, booking, serta produk aktif.
- Admin aktif dapat create examination tanpa product recommendations.
- Admin aktif dapat create examination dengan product recommendations.
- `created_by` examination dan product recommendation memakai current admin.
- Payload spoofing `created_by` ditolak.
- Invalid examination fields ditolak.
- Booking yang tidak sesuai customer profile ditolak.
- Product recommendation dengan produk nonaktif ditolak.
- Store examination tidak mengubah status booking.
- Store examination tidak membuat order atau offline sale.
- User non-admin tidak dapat create examination.

Hasil targeted test setelah Batch 15:

- `php artisan test tests/Feature/AdminExaminationTest.php`: pass, 11 tests, 51 assertions.
- `php artisan test tests/Feature/AdminBookingTest.php`: pass, 11 tests, 32 assertions.
- `php artisan test tests/Feature/AdminOfflineSaleTest.php`: pass, 10 tests, 53 assertions.
- `php artisan route:list --name=admin.examinations`: route admin examination mencakup index, create, store, dan show.

## Batch 16: Admin Dashboard & Basic Reports Backend Flow

Controller yang sudah dibuat:

- `App\Http\Controllers\Admin\DashboardController`
- `App\Http\Controllers\Admin\ReportController`

Test yang sudah dibuat:

- `tests/Feature/AdminDashboardReportTest.php`

Route admin dashboard/report yang sudah tersedia dan berada di middleware `auth`:

- `GET /admin/dashboard` dengan nama `admin.dashboard.index`
- `GET /admin/reports` dengan nama `admin.reports.index`

Implementasi admin dashboard saat ini:

- Semua route wajib login.
- Akses dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- Batch ini read-only: tidak ada filter, export, chart, mutation, migration, dependency baru, atau UI khusus dashboard/report.
- `index` sementara render Inertia page `Welcome` dengan prop `page = admin.dashboard.index`.
- Dashboard mengirim `summary` untuk jumlah:
  - products,
  - services,
  - orders,
  - bookings,
  - leads,
  - customer profiles,
  - field activities,
  - offline sales,
  - examinations.
- Dashboard mengirim data terbaru pada prop `recent`:
  - orders,
  - bookings,
  - leads,
  - offline sales.
- Dashboard mengirim `lowStockProducts` untuk produk dengan `stock_quantity <= low_stock_threshold`.

Implementasi admin reports saat ini:

- `index` sementara render Inertia page `Welcome` dengan prop `page = admin.reports.index`.
- Reports mengirim metrik dasar:
  - `leadsBySource`,
  - `leadsByAssignedStaff`,
  - `bookingsByService`,
  - `bookingsByStatus`,
  - `ordersByStatus`,
  - `websiteOrderRevenue`,
  - `offlineSalesRevenue`,
  - `fieldActivitiesByType`,
  - `productRecommendationsByProduct`.
- `websiteOrderRevenue` menghitung total order dengan `payment_status = paid` atau `status = payment_received`.
- `offlineSalesRevenue` menghitung total dari seluruh `offline_sales.total`.

Coverage `AdminDashboardReportTest`:

- Guest diarahkan ke login saat membuka admin dashboard.
- User non-admin mendapat 403 untuk dashboard dan reports.
- Admin tidak aktif mendapat 403 untuk dashboard dan reports.
- Admin aktif dapat membuka placeholder dashboard dengan summary, low-stock products, dan recent data.
- Admin aktif dapat membuka placeholder reports dengan grouped metrics dan revenue dasar.

Hasil targeted test setelah Batch 16:

- `php artisan test tests/Feature/AdminDashboardReportTest.php`: pass, 5 tests, 42 assertions.
- `php artisan test tests/Feature/AdminOfflineSaleTest.php tests/Feature/AdminExaminationTest.php`: pass, 21 tests, 104 assertions.
- `php artisan route:list --name=admin.dashboard`: 1 route admin dashboard terdaftar.
- `php artisan route:list --name=admin.reports`: 1 route admin reports terdaftar.

## Batch 17: Admin Order Fulfillment & Stock Movement Backend Flow

Migration yang sudah dibuat:

- `database/migrations/2026_06_04_000024_add_stock_decremented_at_to_orders_table.php`

Service yang sudah dibuat:

- `App\Services\OrderFulfillmentService`

File yang diperbarui:

- `App\Models\Order`
- `App\Http\Controllers\Admin\OrderController`
- `tests/Feature/AdminOrderTest.php`

Implementasi fulfillment order saat ini:

- Batch ini menutup gap pengurangan stok untuk order website/manual checkout saat fulfillment admin dimulai.
- Stok produk dikurangi saat admin mengubah `orders.status` menjadi `processing` melalui `admin.orders.status.update`.
- `payment_status = paid` tetap hanya mengubah status order menjadi `payment_received` dan tidak mengurangi stok.
- Marker `orders.stock_decremented_at` ditambahkan sebagai idempotency guard agar stok tidak berkurang dua kali saat status `processing` dikirim berulang.
- `OrderFulfillmentService` memakai `DB::transaction()` dan `lockForUpdate()` pada order serta product row terkait.
- Jika stok produk kurang dari `order_items.quantity`, transisi ke `processing` ditolak dengan validation error pada field `status`.
- Saat stok tidak mencukupi, order tetap pada status sebelumnya, stok tidak berubah, dan `stock_decremented_at` tetap null.
- Batch ini tidak menambahkan stock ledger, tidak melakukan restore stok saat order cancelled setelah fulfillment dimulai, dan tidak mengubah stok offline sales.

Coverage tambahan `AdminOrderTest`:

- Status update ke `processing` mengurangi stok produk sesuai quantity order item.
- Repeated status update ke `processing` tidak mengurangi stok dua kali.
- Payment update ke `paid` tidak mengurangi stok dan hanya menghasilkan `payment_received`.
- Status update ke `processing` gagal jika stok produk tidak mencukupi.

Hasil targeted test setelah Batch 17:

- `php artisan test tests/Feature/AdminOrderTest.php`: pass, 13 tests, 59 assertions.
- `php artisan test tests/Feature/CheckoutTest.php tests/Feature/AdminOrderTest.php`: pass, 18 tests, 81 assertions.

## Batch 18: Admin Layout Shell & Dashboard UI

Komponen frontend admin yang sudah dibuat:

- `resources/js/Layouts/AdminLayout.jsx`
- `resources/js/Components/Admin/AdminCard.jsx`
- `resources/js/Components/Admin/AdminPageHeader.jsx`
- `resources/js/Components/Admin/MetricCard.jsx`
- `resources/js/Components/Admin/StatusBadge.jsx`
- `resources/js/Components/Admin/EmptyState.jsx`
- `resources/js/Pages/Admin/Dashboard/Index.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\DashboardController`
- `tests/Feature/AdminDashboardReportTest.php`

Implementasi admin shell saat ini:

- Admin memakai layout terpisah `AdminLayout`, sehingga layout Breeze/customer tidak diubah.
- Layout menyediakan fixed desktop sidebar, mobile overlay drawer, sticky topbar, user dropdown, dan grouped navigation.
- Navigation memakai `route().has(routeName)` agar item route yang belum tersedia tidak dirender.
- Group navigasi mengikuti area kerja admin: Utama, Commerce, Booking & Customer, Catalog, serta CRM & Field.
- Visual mengikuti admin style guide Phoenix: Forest Green sebagai primary, botanical/earth tone, card surface terang, rounded corners, dan typography token yang sudah ada.

Implementasi dashboard UI saat ini:

- `DashboardController@index` sekarang render Inertia component `Admin/Dashboard/Index`.
- Dashboard menampilkan metric cards dari prop `summary` untuk produk, layanan, order, booking, lead, customer, aktivitas lapangan, offline sales, dan examination.
- Dashboard menampilkan recent list untuk order, booking, lead, dan offline sales dari prop `recent`.
- Dashboard menampilkan low-stock products dari prop `lowStockProducts`.
- Empty state tersedia untuk daftar yang belum memiliki data.
- Status badge sudah memetakan status order, payment, booking, lead/follow-up, dan status umum.

Coverage/test terkait Batch 18:

- `AdminDashboardReportTest` dashboard assertion diubah dari placeholder component `Welcome` menjadi `Admin/Dashboard/Index`.
- Reports masih tetap placeholder `Welcome`; UI reports belum masuk scope Batch 18.

Hasil targeted test setelah Batch 18:

- `php artisan test --filter=AdminDashboardReportTest`: pass, 5 tests, 42 assertions.

Catatan verifikasi Batch 18:

- LSP diagnostics untuk file PHP controller/test dan komponen admin baru tidak menemukan error.
- `npm run build` dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 19: Admin Reports UI Read-only

Frontend reports admin yang sudah dibuat:

- `resources/js/Pages/Admin/Reports/Index.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\ReportController`
- `tests/Feature/AdminDashboardReportTest.php`

Implementasi reports UI saat ini:

- `ReportController@index` sekarang render Inertia component `Admin/Reports/Index`.
- Backend report query dan bentuk prop `reports` tidak diubah dari Batch 16.
- Reports UI memakai `AdminLayout` dan komponen admin Batch 18.
- Halaman reports bersifat read-only, tanpa CRUD action, filter, date range, atau form.
- Revenue summary ditampilkan untuk `websiteOrderRevenue` dan `offlineSalesRevenue`.
- Grouped report card ditampilkan untuk:
  - leads by source,
  - leads by assigned staff,
  - bookings by service,
  - bookings by status,
  - orders by status,
  - field activities by type,
  - product recommendations by product.
- Empty state tersedia untuk setiap grup report yang belum memiliki data.

Coverage/test terkait Batch 19:

- `AdminDashboardReportTest` reports assertion diubah dari placeholder component `Welcome` menjadi `Admin/Reports/Index`.
- Assertion grouped metrics dan revenue lama tetap dipertahankan.

Catatan verifikasi Batch 19:

- LSP diagnostics untuk `resources/js/Pages/Admin/Reports/Index.jsx` tidak menemukan error.
- `npm run build` dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 20: Admin Orders UI

Frontend orders admin yang sudah dibuat:

- `resources/js/Pages/Admin/Orders/Index.jsx`
- `resources/js/Pages/Admin/Orders/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\OrderController`
- `tests/Feature/AdminOrderTest.php`

Implementasi orders index saat ini:

- `OrderController@index` sekarang render Inertia component `Admin/Orders/Index`.
- Backend query dan eager load index tetap memakai data existing: user, customer profile, voucher, dan payment method.
- Index memakai `AdminLayout` dan komponen admin Batch 18.
- Index menampilkan local metrics dari collection order yang dikirim backend: total orders, waiting payment, payment received, processing, dan completed.
- Index menampilkan table orders responsif dengan kolom order number, customer, order status, shipping status, payment status, payment method, total, created date, dan link detail.
- Tidak ada backend filter, pagination, date range, atau search query baru pada Batch ini.

Implementasi orders show saat ini:

- `OrderController@show` sekarang render Inertia component `Admin/Orders/Show`.
- Backend query dan eager load show tetap memakai data existing: user, customer profile, voucher, payment method, order items product, voucher redemption voucher, dan active payment methods.
- Detail page menampilkan panel order summary, customer, order items, voucher/redemption, shipping current info, dan payment current info.
- Detail page menyediakan tiga form `useForm` terpisah untuk endpoint existing:
  - shipping update: `admin.orders.shipping.update`,
  - payment update: `admin.orders.payment.update`,
  - order status update: `admin.orders.status.update`.
- Status option mengikuti validation backend yang sudah ada.
- Status form menampilkan callout bahwa transisi ke `processing` mengurangi stok satu kali dan akan ditolak jika stok tidak cukup.
- Tidak ada frontend inventory mutation; stock decrement tetap dikelola backend `OrderFulfillmentService`.

Coverage/test terkait Batch 20:

- `AdminOrderTest` index assertion diubah dari placeholder component `Welcome` menjadi `Admin/Orders/Index`.
- `AdminOrderTest` show assertion diubah dari placeholder component `Welcome` menjadi `Admin/Orders/Show`.
- Test update shipping, payment, status, idempotent stock decrement, insufficient stock, dan validation tetap dipertahankan.

Catatan verifikasi Batch 20:

- LSP diagnostics untuk `resources/js/Pages/Admin/Orders/Index.jsx` dan `resources/js/Pages/Admin/Orders/Show.jsx` tidak menemukan error pada saat implementasi UI.
- `npm run build` dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 21: Admin Catalog UI

Frontend catalog admin yang sudah dibuat:

- `resources/js/Pages/Admin/ProductCategories/Index.jsx`
- `resources/js/Pages/Admin/ProductCategories/Create.jsx`
- `resources/js/Pages/Admin/ProductCategories/Edit.jsx`
- `resources/js/Pages/Admin/ProductCategories/Show.jsx`
- `resources/js/Pages/Admin/Products/Index.jsx`
- `resources/js/Pages/Admin/Products/Create.jsx`
- `resources/js/Pages/Admin/Products/Edit.jsx`
- `resources/js/Pages/Admin/Products/Show.jsx`
- `resources/js/Pages/Admin/Services/Index.jsx`
- `resources/js/Pages/Admin/Services/Create.jsx`
- `resources/js/Pages/Admin/Services/Edit.jsx`
- `resources/js/Pages/Admin/Services/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\ProductCategoryController`
- `App\Http\Controllers\Admin\ProductController`
- `App\Http\Controllers\Admin\ServiceController`
- `tests/Feature/AdminCatalogTest.php`

Implementasi catalog UI saat ini:

- Product category, product, dan service controller sekarang render Inertia component nyata, bukan placeholder `Welcome`.
- Query, validation, redirect, route name, dan CRUD semantics backend tidak diubah.
- Product categories memiliki halaman index, create, edit, dan show dengan form `name`, `slug`, `description`, dan `is_active`.
- Products memiliki halaman index, create, edit, dan show dengan field existing: category, name, slug, price, descriptions, benefits, usage rules, notes, image path text, stock, low-stock threshold, active, dan featured.
- Services memiliki halaman index, create, edit, dan show dengan field existing: name, slug, description, nullable price, visit type, image path text, active, dan featured.
- Delete action memakai existing destroy route dengan `window.confirm` sebelum request dikirim.
- `image_path` tetap berupa text field; Batch ini tidak menambahkan upload/image processing.
- Tidak ada backend filter, search, pagination, atau query behavior baru.
- Tidak ada perubahan public/customer UI.

Coverage/test terkait Batch 21:

- `AdminCatalogTest` 12 placeholder component assertion diubah menjadi component nyata:
  - `Admin/ProductCategories/*`,
  - `Admin/Products/*`,
  - `Admin/Services/*`.
- Test CRUD dan slug validation catalog tetap dipertahankan.

Catatan verifikasi Batch 21:

- LSP diagnostics untuk folder `resources/js/Pages/Admin/ProductCategories`, `resources/js/Pages/Admin/Products`, dan `resources/js/Pages/Admin/Services` tidak menemukan error pada saat implementasi UI.
- `npm run build` dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 22: Admin Voucher UI

Frontend voucher admin yang sudah dibuat:

- `resources/js/Pages/Admin/Vouchers/Index.jsx`
- `resources/js/Pages/Admin/Vouchers/Create.jsx`
- `resources/js/Pages/Admin/Vouchers/Edit.jsx`
- `resources/js/Pages/Admin/Vouchers/Show.jsx`
- `resources/js/Pages/Admin/Vouchers/Redemptions/Index.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\VoucherController`
- `tests/Feature/AdminVoucherTest.php`

Implementasi voucher UI saat ini:

- `VoucherController` sekarang render Inertia component nyata untuk index, create, show, edit, dan redemptions:
  - `Admin/Vouchers/Index`,
  - `Admin/Vouchers/Create`,
  - `Admin/Vouchers/Show`,
  - `Admin/Vouchers/Edit`,
  - `Admin/Vouchers/Redemptions/Index`.
- Query, auth check, validation, store/update/destroy behavior, dan redemptions query backend tidak diubah.
- Index menampilkan voucher dari prop existing, local metrics, publish status, discount display, validity dates, usage limit, orders count, redemptions count, dan action detail/edit/redemptions/delete.
- Create dan edit memakai field backend voucher existing: `code`, `name`, `description`, `discount_type`, `discount_value`, `minimum_purchase`, `starts_at`, `ends_at`, `usage_limit`, dan `is_published`.
- Create submit memakai `form.post(route('admin.vouchers.store'))`.
- Edit submit memakai `form.put(route('admin.vouchers.update', voucher.id))`.
- Show menampilkan seluruh field voucher, counts, status, discount, validity window, dan action back/edit/redemptions/delete.
- Redemptions menampilkan konteks voucher dan daftar redemption dari prop existing: `customer_profile`, `order`, `discount_amount`, dan `redeemed_at`.
- Batch ini tidak menambahkan backend filter, search, pagination, date range, dependency, atau perubahan public/customer UI.
- Batch ini tidak mengubah validation/business logic voucher maupun semantics checkout voucher.

Coverage/test terkait Batch 22:

- `AdminVoucherTest` placeholder component assertion untuk index/create/show/edit/redemptions diubah menjadi component nyata `Admin/Vouchers/*`.
- Prop assertions existing dan test business/validation voucher tetap dipertahankan.
- `php artisan test tests/Feature/AdminVoucherTest.php`: pass, 11 tests, 66 assertions.

Catatan verifikasi Batch 22:

- LSP diagnostics untuk folder `resources/js/Pages/Admin/Vouchers` dijalankan setelah formatting UI dan tidak menemukan error.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

### Voucher Flow

Voucher saat checkout hanya dapat digunakan jika:

- user sudah login,
- cart memiliki `customer_profile_id`,
- `customer_profiles.member_status` bernilai `member`,
- voucher ditemukan berdasarkan `code`,
- voucher `is_published = true`,
- waktu saat ini berada di antara `starts_at` dan `ends_at`,
- subtotal memenuhi `minimum_purchase` jika diisi,
- customer belum pernah memakai voucher tersebut,
- total redemption voucher belum mencapai `usage_limit`.

Discount type yang didukung:

- `fixed`
- `percentage`

Jika voucher valid, sistem membuat record `voucher_redemptions` dengan:

- `voucher_id`
- `customer_profile_id`
- `order_id`
- `discount_amount`
- `redeemed_at`

## Batch 23: Admin Payment Method UI

Frontend payment method admin yang sudah dibuat:

- `resources/js/Pages/Admin/PaymentMethods/Index.jsx`
- `resources/js/Pages/Admin/PaymentMethods/Create.jsx`
- `resources/js/Pages/Admin/PaymentMethods/Edit.jsx`
- `resources/js/Pages/Admin/PaymentMethods/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\PaymentMethodController`
- `tests/Feature/AdminPaymentMethodTest.php`

Implementasi payment method UI saat ini:

- `PaymentMethodController` sekarang render Inertia component nyata untuk index, create, show, dan edit:
  - `Admin/PaymentMethods/Index`,
  - `Admin/PaymentMethods/Create`,
  - `Admin/PaymentMethods/Show`,
  - `Admin/PaymentMethods/Edit`.
- Query, auth check, validation, store/update/destroy behavior, dan delete guard payment method yang masih memiliki order tidak diubah.
- Index menampilkan metode pembayaran dari prop existing, local metrics, type/status, detail bank atau QRIS, instructions, `orders_count`, dan action detail/edit/delete.
- Create dan edit memakai field backend payment method existing:
  - `type`,
  - `bank_name`,
  - `account_number`,
  - `account_holder_name`,
  - `qris_image_path`,
  - `instructions`,
  - `is_active`.
- Type option yang didukung di UI mengikuti validation backend:
  - `bank_transfer` dengan label `Bank Transfer`,
  - `qris` dengan label `QRIS`.
- Create submit memakai `form.post(route('admin.payment-methods.store'))`.
- Edit submit memakai `form.put(route('admin.payment-methods.update', paymentMethod.id))`.
- Field bank transfer ditampilkan kondisional untuk `bank_transfer`, sedangkan `qris_image_path` ditampilkan kondisional untuk `qris`.
- `qris_image_path` tetap berupa text field; tidak ada upload, image processing, storage handling, atau dependency baru.
- Show menampilkan seluruh field payment method, status, `orders_count`, dan action back/edit/delete.
- Batch ini tidak menambahkan backend filter, search, pagination, date range, dependency, atau perubahan public/customer UI.
- Batch ini tidak mengubah validation/business logic payment method maupun semantics checkout/payment.

Coverage/test terkait Batch 23:

- `AdminPaymentMethodTest` component assertion untuk index/create/show/edit diubah menjadi component nyata `Admin/PaymentMethods/*`.
- Nama test GET admin payment method sudah tidak memakai istilah placeholder.
- Prop assertions existing dan test business/validation/delete/authorization payment method tetap dipertahankan.
- `php artisan test tests/Feature/AdminPaymentMethodTest.php`: pass, 10 tests, 48 assertions.

Catatan verifikasi Batch 23:

- LSP diagnostics untuk folder `resources/js/Pages/Admin/PaymentMethods`, `tests/Feature/AdminPaymentMethodTest.php`, dan `app/Http/Controllers/Admin/PaymentMethodController.php` dijalankan setelah cleanup formatting dan tidak menemukan error.
- Test GET Inertia payment method memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 24: Admin Booking UI

Frontend booking admin yang sudah dibuat:

- `resources/js/Pages/Admin/Bookings/Index.jsx`
- `resources/js/Pages/Admin/Bookings/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\BookingController`
- `tests/Feature/AdminBookingTest.php`

Implementasi booking admin UI saat ini:

- `BookingController` sekarang render Inertia component nyata untuk index dan show:
  - `Admin/Bookings/Index`,
  - `Admin/Bookings/Show`.
- Query relasi booking untuk `user`, `customerProfile`, dan `service` tetap memakai data existing dari backend.
- Index menampilkan booking dari prop existing, local metrics berdasarkan status, customer, service, visit type, jadwal, status, service price, dan action detail.
- Show menampilkan ringkasan booking, customer, service, complaint notes, admin notes, serta form update schedule dan status.
- Form status memakai route existing `admin.bookings.status.update` dan option validasi backend: `waiting_confirmation`, `confirmed`, `completed`, dan `cancelled`.
- Form schedule memakai route existing `admin.bookings.schedule.update` dengan field `desired_schedule_at` dan `admin_notes`.
- Batch ini tidak menambahkan backend filter, search, pagination, dependency, endpoint baru, atau perubahan public/customer UI.
- Batch ini tidak mengubah validation/business logic booking maupun semantics status/schedule update.

Coverage/test terkait Batch 24:

- `AdminBookingTest` placeholder component assertion untuk index/show diubah menjadi component nyata `Admin/Bookings/*`.
- Nama test GET admin booking sudah tidak memakai istilah placeholder.
- Prop assertions existing untuk `bookings`, `booking.user`, `booking.customer_profile`, dan `booking.service` tetap dipertahankan.

Catatan verifikasi Batch 24:

- Test GET Inertia booking memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 25: Admin Customer UI

Frontend customer admin yang sudah dibuat:

- `resources/js/Pages/Admin/Customers/Index.jsx`
- `resources/js/Pages/Admin/Customers/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\CustomerController`
- `tests/Feature/AdminCustomerProfileTest.php`

Implementasi customer admin UI saat ini:

- `CustomerController` sekarang render Inertia component nyata untuk index dan show:
  - `Admin/Customers/Index`,
  - `Admin/Customers/Show`.
- Query relasi dan count customer profile tetap memakai data existing dari backend: `user`, `orders`, `bookings.service`, `voucherRedemptions.voucher`, `orders_count`, `bookings_count`, dan `voucher_redemptions_count`.
- Index menampilkan profil customer dari prop existing, local metrics, status member, counts order/booking/voucher redemption, dan action detail.
- Show menampilkan ringkasan customer, user terkait, orders, bookings, voucher redemptions, serta form update customer profile.
- Form update memakai route existing `admin.customers.update` dan field validasi backend: `name`, `whatsapp_number`, `primary_address`, `member_status`, dan `internal_notes`.
- Status member di UI mengikuti validasi backend: `non_member` dan `member`.
- Batch ini tidak menambahkan backend filter, search, pagination, dependency, endpoint baru, atau perubahan public/customer UI.
- Batch ini tidak mengubah validation/business logic customer profile maupun ownership user profile.

Coverage/test terkait Batch 25:

- `AdminCustomerProfileTest` placeholder component assertion untuk index/show diubah menjadi component nyata `Admin/Customers/*`.
- Nama test GET admin customer sudah tidak memakai istilah placeholder.
- Prop assertions existing untuk counts dan relasi `user`, `orders`, `bookings`, serta `voucher_redemptions` tetap dipertahankan.

Catatan verifikasi Batch 25:

- Test GET Inertia customer memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 26: Admin Lead/CRM UI

Frontend lead/CRM admin yang sudah dibuat:

- `resources/js/Pages/Admin/Leads/Index.jsx`
- `resources/js/Pages/Admin/Leads/Create.jsx`
- `resources/js/Pages/Admin/Leads/Show.jsx`
- `resources/js/Pages/Admin/LeadSources/Index.jsx`
- `resources/js/Pages/Admin/LeadSources/Create.jsx`
- `resources/js/Pages/Admin/LeadSources/Edit.jsx`
- `resources/js/Pages/Admin/LeadSources/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\LeadController`
- `App\Http\Controllers\Admin\LeadSourceController`
- `tests/Feature/AdminLeadTest.php`
- `tests/Feature/AdminLeadSourceTest.php`

Implementasi lead/CRM admin UI saat ini:

- `LeadController` sekarang render Inertia component nyata untuk index, create, dan show:
  - `Admin/Leads/Index`,
  - `Admin/Leads/Create`,
  - `Admin/Leads/Show`.
- `LeadSourceController` sekarang render Inertia component nyata untuk index, create, show, dan edit:
  - `Admin/LeadSources/Index`,
  - `Admin/LeadSources/Create`,
  - `Admin/LeadSources/Show`,
  - `Admin/LeadSources/Edit`.
- Lead index menampilkan metrics, source, assigned staff, customer profile, event, status, dan action detail dari prop existing.
- Lead create memakai route existing `admin.leads.store` dan field validasi backend lead.
- Lead show menampilkan detail CRM, form update lead, form update status, form tambah follow-up, serta histori follow-up.
- Lead source pages memakai route resource existing untuk create/update/delete; delete guard tetap dikendalikan backend saat source masih memiliki lead.
- Batch ini tidak menambahkan backend filter, search, pagination, dependency, endpoint baru, atau perubahan public/customer/field UI.
- Batch ini tidak mengubah validation/business logic lead, follow-up, maupun lead source.

Coverage/test terkait Batch 26:

- `AdminLeadTest` placeholder component assertion untuk create/index/show diubah menjadi component nyata `Admin/Leads/*`.
- `AdminLeadSourceTest` placeholder component assertion untuk index/create/show/edit diubah menjadi component nyata `Admin/LeadSources/*`.
- Prop assertions existing untuk relasi lead dan `leads_count` tetap dipertahankan.

Catatan verifikasi Batch 26:

- Test GET Inertia lead dan lead source memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 27: Admin Event UI

Frontend event admin yang sudah dibuat:

- `resources/js/Pages/Admin/Events/Index.jsx`
- `resources/js/Pages/Admin/Events/Create.jsx`
- `resources/js/Pages/Admin/Events/Edit.jsx`
- `resources/js/Pages/Admin/Events/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\EventController`
- `tests/Feature/AdminEventTest.php`

Implementasi event admin UI saat ini:

- `EventController` sekarang render Inertia component nyata untuk index, create, show, dan edit:
  - `Admin/Events/Index`,
  - `Admin/Events/Create`,
  - `Admin/Events/Show`,
  - `Admin/Events/Edit`.
- Event index menampilkan metrics lokal untuk total event, upcoming event, total lead, dan total offline sales dari prop existing `events` dengan `leads_count` dan `offline_sales_count`.
- Event create dan edit memakai route resource existing `admin.events.store` dan `admin.events.update` dengan field validasi backend: `name`, `event_date`, `location`, `organizer`, dan `notes`.
- Event show menampilkan detail event, tanggal, lokasi, organizer, notes, jumlah lead, jumlah offline sales, serta action edit/delete.
- Delete action memakai route resource existing `admin.events.destroy`; guard event yang masih memiliki lead/offline sale tetap dikendalikan backend.
- Batch ini tidak menambahkan backend filter, search, pagination, dependency, endpoint baru, atau perubahan public/customer/field UI.
- Batch ini tidak mengubah validation/business logic event maupun delete guard.

Coverage/test terkait Batch 27:

- `AdminEventTest` placeholder component assertion untuk index/create/show/edit diubah menjadi component nyata `Admin/Events/*`.
- Nama test GET admin event sudah tidak memakai istilah placeholder.
- Prop assertions existing untuk `leads_count`, `offline_sales_count`, dan event id tetap dipertahankan.

Catatan verifikasi Batch 27:

- Test GET Inertia event memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 28: Admin Offline Sales UI

Frontend offline sales admin yang sudah dibuat:

- `resources/js/Pages/Admin/OfflineSales/Index.jsx`
- `resources/js/Pages/Admin/OfflineSales/Create.jsx`
- `resources/js/Pages/Admin/OfflineSales/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\OfflineSaleController`
- `tests/Feature/AdminOfflineSaleTest.php`

Implementasi offline sales admin UI saat ini:

- `OfflineSaleController` sekarang render Inertia component nyata untuk index, create, dan show:
  - `Admin/OfflineSales/Index`,
  - `Admin/OfflineSales/Create`,
  - `Admin/OfflineSales/Show`.
- Offline sales index menampilkan metrics lokal untuk total transaksi, revenue, event sales, dan door-to-door sales dari prop existing `offlineSales`.
- Offline sales index memuat layout POS langsung di `/admin/offline-sales`: grid kiri untuk sumber, data customer, relasi CRM, waktu penjualan, dan catatan; panel kanan untuk item produk, kuantitas, stok, estimasi line total, dan ringkasan subtotal.
- Form POS offline sale tetap memakai route existing `admin.offline-sales.store` dengan field validasi backend: `customer_profile_id`, `lead_id`, `field_staff_id`, `event_id`, `source`, `customer_name`, `customer_whatsapp_number`, `notes`, `sold_at`, dan `items` berisi `product_id` serta `quantity`.
- Form item hanya mengirim product dan quantity; estimasi UI hanya membantu kasir/admin, sedangkan harga, line total, total final, dan stok tetap dihitung ulang oleh `OfflineSaleService` di server.
- Offline sales show menampilkan detail transaksi, relasi customer profile, lead, field staff, event, notes, dan daftar item penjualan.
- Batch ini tidak menambahkan backend filter, search, pagination, dependency, endpoint baru, update/edit/delete action, stock decrement, atau perubahan public/customer/field UI.
- Batch ini tidak mengubah validation/business logic offline sales maupun kalkulasi total server-side.

Coverage/test terkait Batch 28:

- `AdminOfflineSaleTest` placeholder component assertion untuk index/create/show diubah menjadi component nyata `Admin/OfflineSales/*`.
- Nama test GET admin offline sales sudah tidak memakai istilah placeholder.
- Prop assertions existing untuk relasi index, opsi create, dan item show tetap dipertahankan.

Catatan verifikasi Batch 28:

- Test GET Inertia offline sales memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 29: Admin Examination & Product Recommendation UI

Frontend examination admin yang sudah dibuat:

- `resources/js/Pages/Admin/Examinations/Index.jsx`
- `resources/js/Pages/Admin/Examinations/Create.jsx`
- `resources/js/Pages/Admin/Examinations/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Admin\ExaminationController`
- `tests/Feature/AdminExaminationTest.php`

Implementasi examination admin UI saat ini:

- `ExaminationController` sekarang render Inertia component nyata untuk index, create, dan show:
  - `Admin/Examinations/Index`,
  - `Admin/Examinations/Create`,
  - `Admin/Examinations/Show`.
- Examination index menampilkan metrics lokal untuk total pemeriksaan, total rekomendasi produk, pemeriksaan dengan booking, dan pemeriksaan manual dari prop existing `examinations`.
- Examination create memuat form POS internal untuk create pemeriksaan memakai route existing `admin.examinations.store` dengan field validasi backend: `customer_profile_id`, `booking_id`, `complaint`, `result`, `summary`, `internal_recommendation`, dan `product_recommendations` berisi `product_id` serta `notes`.
- Form POS internal tidak mengirim `created_by`; creator pemeriksaan dan rekomendasi produk tetap diisi server-side oleh `ExaminationService`.
- Product recommendation dibuat bersama pemeriksaan dari form create; tidak ada endpoint rekomendasi produk terpisah.
- Examination show menampilkan detail customer, booking/service, creator, complaint, result, summary, internal recommendation, dan daftar rekomendasi produk.
- Batch ini tidak menambahkan backend filter, search, pagination, dependency, endpoint baru, edit/delete/update action, order/offline-sale creation, stock changes, atau perubahan public/customer/field UI.
- Batch ini tidak mengubah validation/business logic examination maupun product recommendation.

Coverage/test terkait Batch 29:

- `AdminExaminationTest` placeholder component assertion untuk index/create/show diubah menjadi component nyata `Admin/Examinations/*`.
- Nama test GET admin examination sudah tidak memakai istilah placeholder.
- Prop assertions existing untuk relasi index, opsi create, dan product recommendation show tetap dipertahankan.

Catatan verifikasi Batch 29:

- Test GET Inertia examination memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 30: Field Staff UI

Frontend field staff yang sudah dibuat:

- `resources/js/Layouts/FieldLayout.jsx`
- `resources/js/Pages/Field/Dashboard.jsx`
- `resources/js/Pages/Field/Leads/Index.jsx`
- `resources/js/Pages/Field/Leads/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Field\FieldDashboardController`
- `App\Http\Controllers\Field\FieldLeadController`
- `tests/Feature/FieldStaffLeadTest.php`

Implementasi field staff UI saat ini:

- `FieldDashboardController` sekarang render Inertia component nyata `Field/Dashboard`.
- `FieldLeadController` sekarang render Inertia component nyata untuk index dan show:
  - `Field/Leads/Index`,
  - `Field/Leads/Show`.
- `FieldLayout` menyediakan shell khusus field staff dengan navigasi hanya ke dashboard dan leads, tanpa label atau menu admin.
- Dashboard menampilkan summary assigned leads, open leads, activity count, dan recent leads assigned ke field staff aktif.
- Leads index menampilkan paginated leads assigned ke field staff aktif, status, source, customer profile, event, created date, detail link, dan pagination existing.
- Lead show menampilkan detail lead, customer/source/event, notes, update status, form tambah field activity, dan timeline aktivitas.
- Form update status hanya mengirim `follow_up_status` ke route existing `field.leads.status.update`.
- Form tambah aktivitas hanya mengirim `activity_type`, `activity_at`, `notes`, dan nullable `follow_up_status` ke route existing `field.leads.activities.store`; `field_staff_id` dan `lead_id` tetap diisi/dijaga backend.
- Batch ini tidak menambahkan backend filter, search, dependency, endpoint baru, create/edit/delete/assign lead, booking/order/offline-sale creation, atau perubahan public/customer/admin UI.
- Batch ini tidak mengubah validation/business logic field lead maupun field activity.

Coverage/test terkait Batch 30:

- `FieldStaffLeadTest` placeholder component assertion untuk dashboard/leads index/leads show diubah menjadi component nyata `Field/*`.
- Nama test GET field staff sudah tidak memakai istilah placeholder.
- Prop assertions existing untuk summary, assigned leads, activity types, dan lead statuses tetap dipertahankan.

Catatan verifikasi Batch 30:

- Test GET Inertia field staff memakai helper `X-Inertia-Version` agar tidak terkena 409 asset version mismatch saat `public/build/manifest.json` tersedia.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 31: Admin UX Polish, Auth Redirect, dan Seeder Dummy

File backend/auth/seeder yang diperbarui:

- `database/seeders/DatabaseSeeder.php`
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- `tests/Feature/Auth/AuthenticationTest.php`
- `resources/views/app.blade.php`

File frontend/admin yang diperbarui:

- `resources/js/Layouts/AdminLayout.jsx`
- `resources/js/Components/Admin/AdminPageHeader.jsx`
- `resources/js/Components/Admin/EmptyState.jsx`
- `resources/js/Components/Admin/MetricCard.jsx`
- `resources/js/Pages/Admin/**/*.jsx`
- `package.json`
- `package-lock.json`

Implementasi Batch 31 saat ini:

- `DatabaseSeeder` sekarang menyediakan data dummy lokal yang idempotent memakai `updateOrCreate()` untuk akun dan data minimum dashboard:
  - admin: `admin@phoenix.test` / `password`
  - field staff: `field@phoenix.test` / `password`
  - customer: `customer@phoenix.test` / `password`
- Seeder juga membuat sample `CustomerProfile`, `ProductCategory`, `Product`, `Service`, `Event`, `LeadSource`, `Lead`, `Booking`, dan `FieldActivity` agar dashboard/admin/field tidak kosong setelah seed.
- Redirect login Breeze sudah dibuat role-aware:
  - `admin` diarahkan ke `/admin/dashboard`.
  - `field_staff` diarahkan ke `/field/dashboard`.
  - `customer` diarahkan ke `/customer/dashboard`.
  - role lain fallback ke `/dashboard`.
- Konten/copy statis admin panel sudah dilokalkan ke Bahasa Indonesia untuk heading, deskripsi, tombol, table header, form label, empty state, dan label detail.
- Dependency `lucide-react` ditambahkan untuk icon system admin panel.
- Sidebar admin memakai icon Lucide yang bermakna untuk setiap menu, menggantikan placeholder huruf.
- Metric card admin memakai icon Lucide sebagai elemen background/watermark dekoratif, bukan lagi kotak icon di samping title/value.
- Tombol/link create/add di admin panel, terutama tombol berlabel `Tambah`, sudah memakai icon `Plus` yang konsisten.
- Page header admin distandarkan tanpa icon di samping judul agar konsisten dan tidak terlalu ramai; icon tetap digunakan di sidebar, metric card, empty state, dan action button.
- Semua page admin di `resources/js/Pages/Admin/**` sudah direfactor memakai persistent layout Inertia:
  - page tidak lagi return wrapper `<AdminLayout>...</AdminLayout>`.
  - setiap page memakai assignment `PageName.layout = (page) => <AdminLayout>{page}</AdminLayout>;`.
  - tujuan utama: `AdminLayout` tidak remount saat navigasi admin, sehingga scroll sidebar tidak reset ketika klik menu bawah.
- Favicon/tab browser sekarang memakai logo brand dari `public/images/logo-transparent.png` melalui `resources/views/app.blade.php`.

Coverage/test terkait Batch 31:

- `AuthenticationTest` menambahkan coverage redirect login untuk role customer, admin, dan field staff.
- Test auth targeted sudah dijalankan:
  - `php artisan test tests/Feature/Auth/AuthenticationTest.php`: pass, 6 tests, 14 assertions.

Catatan verifikasi Batch 31:

- `php -l database/seeders/DatabaseSeeder.php`: no syntax errors.
- LSP diagnostics untuk `database/seeders/DatabaseSeeder.php`: bersih.
- LSP diagnostics untuk `AuthenticatedSessionController.php` dan `AuthenticationTest.php`: bersih.
- `php -l resources/views/app.blade.php`: no syntax errors.
- Persistent layout admin diverifikasi secara statis:
  - 46 admin JSX page ditemukan.
  - `export default function` tersisa: 0.
  - persistent layout assignment ditemukan: 46.
  - default export component ditemukan: 46.
- Diagnostics frontend admin dijalankan pada file penting dan file yang berubah selama polish; hasilnya bersih.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.
- `npm install lucide-react` melaporkan 6 vulnerability dari dependency tree existing; `npm audit fix` tidak dijalankan karena dapat mengubah dependency besar/breaking.

## Batch 32: Customer Dashboard & Profile UI

Frontend customer yang sudah dibuat:

- `resources/js/Layouts/CustomerLayout.jsx`
- `resources/js/Components/Customer/CustomerCard.jsx`
- `resources/js/Components/Customer/CustomerDetailRow.jsx`
- `resources/js/Components/Customer/CustomerEmptyState.jsx`
- `resources/js/Components/Customer/CustomerPageHeader.jsx`
- `resources/js/Components/Customer/CustomerSectionHeader.jsx`
- `resources/js/Components/Customer/CustomerStatusBadge.jsx`
- `resources/js/Pages/Customer/Dashboard/Index.jsx`
- `resources/js/Pages/Customer/Dashboard/Orders/Show.jsx`
- `resources/js/Pages/Customer/Dashboard/Bookings/Show.jsx`
- `resources/js/Pages/Customer/Profile/Show.jsx`
- `resources/js/Pages/Customer/Profile/Create.jsx`
- `resources/js/Pages/Customer/Profile/Edit.jsx`
- `resources/js/Pages/Customer/Profile/Partials/CustomerProfileForm.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Customer\CustomerDashboardController`
- `App\Http\Controllers\Customer\CustomerProfileController`
- `tests/Feature/CustomerDashboardTest.php`
- `tests/Feature/CustomerProfileTest.php`

Implementasi customer UI saat ini:

- `CustomerDashboardController` sekarang render component nyata:
  - `Customer/Dashboard/Index`
  - `Customer/Dashboard/Orders/Show`
  - `Customer/Dashboard/Bookings/Show`
- `CustomerProfileController` sekarang render component nyata:
  - `Customer/Profile/Show`
  - `Customer/Profile/Create`
  - `Customer/Profile/Edit`
- `CustomerLayout` menyediakan shell customer-facing dengan navigasi dashboard/profil, account dropdown, dan logout tanpa menu admin.
- Customer dashboard menampilkan summary orders, bookings, voucher redemptions, examinations, product recommendations, recent orders, recent bookings, recent examinations, dan recent product recommendations dari prop existing.
- Order detail customer menampilkan nomor order, status, total, voucher redemption, dan item order dari prop existing, tanpa mutation/update UI.
- Booking detail customer menampilkan nomor booking, service, visit type, jadwal, status, complaint notes, examinations, dan rekomendasi produk dari prop existing, tanpa mutation/update UI.
- Profile show menampilkan nama, WhatsApp, alamat utama, dan member status customer.
- Profile create/edit memakai route existing `customer.profile.store` dan `customer.profile.update` dengan field validasi backend: `name`, `whatsapp_number`, dan `primary_address`.
- Form profile tidak mengekspos atau mengirim `member_status` dan `internal_notes`; field internal tetap dikendalikan backend.
- Batch ini tidak menambahkan UI public products/services/cart/checkout, tidak mengubah route definition, validation, ownership check, redirect, query, atau business logic customer.

Coverage/test terkait Batch 32:

- `CustomerDashboardTest` component assertion untuk dashboard/order detail/booking detail diubah dari `Welcome` ke component nyata `Customer/Dashboard/*`.
- `CustomerProfileTest` component assertion untuk profile create/show/edit dan dashboard setelah profile dibuat diubah dari `Welcome` ke component nyata `Customer/*`.
- Nama test yang sebelumnya menyebut placeholder diperbarui agar sesuai halaman nyata.
- Existing assertions untuk redirect, scoped summary counts, ownership 404, store/update profile, dan proteksi internal fields tetap dipertahankan.

Catatan verifikasi Batch 32:

- LSP diagnostics untuk controller customer, tests customer, `CustomerLayout`, komponen customer, dan 6 page customer: bersih.
- Targeted test sudah dijalankan:
  - `php artisan test tests/Feature/CustomerDashboardTest.php tests/Feature/CustomerProfileTest.php`: pass, 15 tests, 62 assertions.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 33: Public Commerce UI

Frontend commerce publik yang sudah dibuat:

- `resources/js/Components/Public/commerce.js`
- `resources/js/Pages/Public/Products/Index.jsx`
- `resources/js/Pages/Public/Products/Show.jsx`
- `resources/js/Pages/Public/Cart/Index.jsx`
- `resources/js/Pages/Public/Checkout/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Public\ProductController`
- `App\Http\Controllers\Public\CartController`
- `App\Http\Controllers\Public\CheckoutController`
- `tests/Feature/ProductCatalogTest.php`
- `tests/Feature/CartTest.php`
- `tests/Feature/CheckoutTest.php`

Implementasi commerce UI saat ini:

- `ProductController@index` sekarang render `Public/Products/Index`, bukan placeholder `Welcome`.
- `ProductController@show` sekarang render `Public/Products/Show`, bukan placeholder `Welcome`.
- `CartController@index` sekarang render `Public/Cart/Index`, bukan placeholder `Welcome`.
- `CheckoutController@show` sekarang render `Public/Checkout/Show`, bukan placeholder `Welcome`.
- Shared public shell dan helper commerce menyediakan header publik, card, empty state, placeholder botanical untuk produk tanpa gambar, formatter Rupiah, helper subtotal cart, dan helper relasi kategori/cart item.
- Product index menampilkan hero katalog, kategori aktif, grid produk, empty state, dan pagination.
- Product detail menampilkan gambar/fallback, kategori, nama, deskripsi, harga, stok, form jumlah, tombol tambah ke cart, detail produk, dan produk terkait.
- Cart page menampilkan item cart, update quantity via `PATCH cart.items.update`, delete item via `DELETE cart.items.destroy`, subtotal, total item, CTA checkout, dan empty state.
- Checkout page menampilkan form sesuai `StoreCheckoutRequest`: `customer_name`, `customer_whatsapp_number`, `shipping_address`, dan `voucher_code`.
- Checkout page melakukan prefill dari `customerProfile` jika user login memiliki profil customer.
- Business logic cart/checkout tidak diubah: validasi stok, ownership cart item, voucher, pembuatan order, dan redirect tetap memakai flow backend existing.

Coverage/test terkait Batch 33:

- `ProductCatalogTest` ditambahkan untuk memastikan `products.index` render `Public/Products/Index` dan `products.show` render `Public/Products/Show`.
- `CartTest` ditambah coverage GET cart agar memastikan `cart.index` render `Public/Cart/Index` dengan item cart.
- `CheckoutTest` ditambah coverage GET checkout agar memastikan `checkout.show` render `Public/Checkout/Show` dan mengirim `customerProfile` untuk user login.
- Test Inertia GET memakai header `X-Inertia` dan `X-Inertia-Version` dari `public/build/manifest.json` jika manifest ada, agar tidak terkena asset version mismatch `409`.

Catatan verifikasi Batch 33:

- LSP diagnostics untuk controller public dan test PHP yang berubah: bersih.
- LSP diagnostics untuk `resources/js/Components/Public/commerce.js`: bersih.
- LSP diagnostics untuk `resources/js/Pages/Public`: tidak ada error; tersisa 2 informasi Biome `organizeImports` pada page produk yang tidak memblokir.
- Targeted test sudah dijalankan:
  - `php artisan test tests/Feature/ProductCatalogTest.php tests/Feature/CartTest.php tests/Feature/CheckoutTest.php`: pass, 16 tests, 56 assertions.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 34: Public Service & Booking Create UI

Frontend service dan booking create publik yang sudah dibuat:

- `resources/js/Pages/Public/Services/Index.jsx`
- `resources/js/Pages/Public/Services/Show.jsx`
- `resources/js/Pages/Public/Bookings/Create.jsx`

File backend/test/shared component yang diperbarui:

- `App\Http\Controllers\Public\ServiceController`
- `App\Http\Controllers\Public\BookingController`
- `resources/js/Components/Public/commerce.js`
- `tests/Feature/ServiceCatalogTest.php`
- `tests/Feature/BookingTest.php`

Implementasi service dan booking create saat ini:

- `ServiceController@index` sekarang render `Public/Services/Index`, bukan placeholder `Welcome`.
- `ServiceController@show` sekarang render `Public/Services/Show`, bukan placeholder `Welcome`.
- `BookingController@create` sekarang render `Public/Bookings/Create`, bukan placeholder `Welcome`.
- Query layanan tetap mempertahankan filter `is_active`, pagination, related services, dan inactive service tetap 404.
- `BookingController@index`, `BookingController@show`, `BookingController@store`, dan `StoreBookingRequest` tidak diubah.
- `commerce.js` ditambah helper kecil `visitTypeLabel()` dan `serviceVisitOptions()` untuk menyamakan label dan pilihan `visit_type` dengan validasi server.
- Service index menampilkan hero layanan, card layanan, badge tipe kunjungan, harga, CTA detail, CTA booking, empty state, dan pagination.
- Service detail menampilkan gambar/fallback, deskripsi, harga, tipe kunjungan, info konfirmasi jadwal, CTA booking, dan layanan terkait.
- Booking create menampilkan form pemilihan layanan, pilihan visit type sesuai layanan, input `datetime-local`, textarea `complaint_notes`, error validasi server, summary profil customer, dan summary layanan terpilih.
- Jika user login belum punya `customerProfile`, booking create menampilkan state terkunci dan link ke `customer.profile.create`; profile tetap tidak dibuat otomatis.
- Booking create tetap submit ke route existing `bookings.store`; validasi profil, layanan aktif, jadwal masa depan, dan visit type tetap server-authoritative.

Coverage/test terkait Batch 34:

- `ServiceCatalogTest` ditambahkan untuk memastikan `services.index` render `Public/Services/Index`, `services.show` render `Public/Services/Show`, dan layanan nonaktif menghasilkan 404.
- `BookingTest` ditambah coverage GET `bookings.create` untuk guest redirect, component `Public/Bookings/Create`, `customerProfile`, active services payload, dan user tanpa profile dengan `customerProfile = null`.
- Test Inertia GET memakai header `X-Inertia` dan `X-Inertia-Version` dari `public/build/manifest.json` jika manifest ada, agar tidak terkena asset version mismatch `409`.

Catatan verifikasi Batch 34:

- LSP diagnostics untuk `ServiceController`, `BookingController`, `commerce.js`, page services, dan page booking create: bersih.
- Targeted test sudah dijalankan:
  - `php artisan test tests/Feature/ServiceCatalogTest.php tests/Feature/BookingTest.php`: pass, 16 tests, 47 assertions.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 35: Public Booking List & Detail UI

Frontend booking publik yang sudah dibuat:

- `resources/js/Pages/Public/Bookings/Index.jsx`
- `resources/js/Pages/Public/Bookings/Show.jsx`

File backend/test yang diperbarui:

- `App\Http\Controllers\Public\BookingController`
- `tests/Feature/BookingTest.php`

Implementasi booking list/detail saat ini:

- `BookingController@index` sekarang render `Public/Bookings/Index`, bukan placeholder `Welcome`.
- `BookingController@show` sekarang render `Public/Bookings/Show`, bukan placeholder `Welcome`.
- `BookingController@index` tetap hanya mengambil booking milik user login dengan relasi `service:id,name,slug,visit_type`, pagination 10 item, dan `withQueryString()`.
- `BookingController@show` tetap owner-only dengan 404 untuk booking milik customer lain dan tetap load service detail yang dibutuhkan UI.
- `BookingController@create`, `BookingController@store`, dan `StoreBookingRequest` tidak diubah.
- Booking index menampilkan hero, CTA booking baru, CTA lihat layanan, empty state, kartu booking, status, tipe kunjungan, jadwal diminta, tanggal dibuat, link detail, pagination, dan callout konfirmasi WhatsApp.
- Booking detail menampilkan back link, nomor booking, status, next-step callout berdasarkan status, ringkasan booking, data customer snapshot, tipe kunjungan, jadwal diminta, catatan keluhan, catatan admin jika ada, service card, dan aksi terkait.
- Booking detail bersifat read-only; tidak ada action cancel/reschedule.
- Redirect setelah booking create tetap ke `bookings.show`, yang sekarang sudah punya page detail nyata.

Coverage/test terkait Batch 35:

- `BookingTest` ditambah coverage GET `bookings.index` untuk component `Public/Bookings/Index`, prop booking milik user saat ini, service prop, dan memastikan booking user lain tidak ikut tampil.
- Test placeholder detail diganti menjadi coverage GET `bookings.show` untuk component `Public/Bookings/Show`, prop booking, service prop, dan tanpa `props.page`.
- Test ownership 404 dan redirect setelah create ke `bookings.show` tetap dipertahankan.

Catatan verifikasi Batch 35:

- LSP diagnostics untuk `BookingController`, `tests/Feature/BookingTest.php`, dan `resources/js/Pages/Public/Bookings`: bersih.
- Targeted test sudah dijalankan:
  - `php artisan test tests/Feature/BookingTest.php`: pass, 14 tests, 50 assertions.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 36: Customer Payment Instruction UI

File customer dashboard/order yang diperbarui:

- `App\Http\Controllers\Customer\CustomerDashboardController`
- `resources/js/Pages/Customer/Dashboard/Orders/Show.jsx`
- `resources/js/Pages/Customer/Dashboard/Index.jsx`
- `tests/Feature/CustomerDashboardTest.php`

Implementasi instruksi pembayaran customer saat ini:

- Detail order customer sekarang eager-load relasi `paymentMethod` dengan field terbatas yang dibutuhkan UI: `id`, `type`, `bank_name`, `account_number`, `account_holder_name`, `qris_image_path`, `instructions`, dan `is_active`.
- Guard detail order tetap owner-only berdasarkan `customer_profile_id` dan `user_id`; behavior 404 untuk order customer lain tidak diubah.
- Page `Customer/Dashboard/Orders/Show` sekarang memiliki section `Pembayaran & Pengiriman` yang menampilkan status pengiriman, ongkir, kurir, nomor resi, catatan pengiriman, metode pembayaran, nomor rekening, nama pemilik rekening, status pembayaran, waktu pembayaran diterima, instruksi pembayaran, catatan pembayaran, catatan admin, dan total akhir yang harus dibayar.
- Page `Customer/Dashboard/Index` sekarang menampilkan hint next-action pada order terbaru:
  - Menunggu ongkir dari admin Phoenix.
  - Lihat instruksi pembayaran di detail order.
  - Cek status order dan pengiriman terbaru.
- Tidak ada perubahan pada business logic checkout, admin order fulfillment, payment gateway, shipping confirmation, atau mutasi status order.

Coverage/test terkait Batch 36:

- `CustomerDashboardTest` memperkuat test detail order customer dengan `PaymentMethod` dan assertion payload Inertia `props.order.payment_method.*`.
- Coverage owner-only order detail dan booking dashboard tetap dipertahankan.

Catatan verifikasi Batch 36:

- LSP diagnostics untuk `CustomerDashboardController`, `Customer/Dashboard/Orders/Show.jsx`, `Customer/Dashboard/Index.jsx`, dan `CustomerDashboardTest`: bersih.
- Targeted test sudah dijalankan:
  - `php artisan test tests/Feature/CustomerDashboardTest.php`: pass, 7 tests, 29 assertions.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 37: Homepage CTA Integration Polish

File homepage yang diperbarui:

- `resources/js/Pages/Welcome.jsx`

Implementasi integrasi CTA homepage saat ini:

- Homepage `Welcome.jsx` tetap memakai desain landing page existing; tidak ada redesign besar.
- Import `Link` dari `@inertiajs/react` ditambahkan agar CTA route internal memakai navigasi Inertia.
- Top nav cart sekarang mengarah ke `cart.index`.
- Top nav akun sekarang mengarah ke:
  - `login` untuk guest.
  - `admin.dashboard.index` untuk user admin.
  - `field.dashboard.index` untuk user field staff.
  - `customer.dashboard.index` untuk customer/default user.
- Hero `Konsultasi Sekarang` sekarang mengarah ke `bookings.create` jika user sudah login, atau `login` jika guest karena route booking dilindungi auth.
- Hero `Lihat Produk Herbal`, CTA produk herbal, CTA alat terapi, serta tombol `Beli`/icon pada card produk/alat hardcoded sekarang mengarah ke `products.index`.
- CTA layanan dan tombol layanan hardcoded sekarang mengarah ke `services.index` untuk lihat layanan atau `bookings.create`/`login` untuk aksi konsultasi.
- Tidak ada POST add-to-cart dari card hardcoded homepage; perubahan hanya menyambungkan navigasi.

Catatan verifikasi Batch 37:

- LSP diagnostics untuk `resources/js/Pages/Welcome.jsx`: bersih.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Batch 38: Homepage Dynamic Content Polish

File homepage yang diperbarui:

- `resources/js/Pages/Welcome.jsx`

Implementasi konten dinamis homepage saat ini:

- `Welcome.jsx` sekarang menerima prop `featuredProducts`, `featuredServices`, dan `testimonials` dari `HomeController`.
- Section produk unggulan sekarang render dari `featuredProducts` dengan card produk dinamis, format Rupiah, label kategori dari relasi `productCategory`/`product_category`, gambar storage, fallback botanical, dan link detail produk jika slug tersedia.
- Tombol utama `Lihat Produk` pada card produk homepage sekarang memakai link detail produk langsung (`products.show`) saat slug tersedia, dengan fallback ke katalog produk jika slug kosong.
- Homepage sekarang memakai animasi scroll reveal berbasis `IntersectionObserver` pada container utama seperti hero, brand essence, produk/layanan, testimoni, dan newsletter, dengan dukungan `prefers-reduced-motion`.
- Anchor menu homepage seperti `Beranda`, `Produk`, `Layanan`, dan `Tentang Kami` sekarang memakai smooth scroll dengan offset fixed header agar perpindahan section terasa animatif dan target tidak tertutup navbar.
- Public product detail sekarang menampilkan animasi produk bergerak ke icon keranjang setelah add-to-cart sukses, dan header public menampilkan badge jumlah item keranjang dari shared prop `cartSummary.count`.
- Icon keranjang pada card produk homepage sekarang menambahkan produk ke keranjang dengan quantity 1 tanpa masuk ke detail produk, sementara tombol `Lihat Produk` tetap menuju detail produk.
- Klik icon keranjang pada card produk homepage sekarang juga memunculkan animasi thumbnail produk bergerak ke icon keranjang header seperti di detail produk.
- Animasi fly-to-cart homepage sekarang disamakan dengan pola halaman detail produk: target memakai `[data-cart-link]`, ukuran thumbnail `h-16 w-16`, offset 32px, dan lintasan midpoint `startY - 90`.
- Fallback icon pada animasi fly-to-cart homepage sekarang memakai `ShoppingBag` dari `lucide-react`, sama seperti halaman detail produk saat produk tidak memiliki gambar.
- Section alat terapi hardcoded dihapus agar homepage tidak membuat kategori yang tidak berasal dari data backend.
- Section layanan sekarang render dari `featuredServices` dengan label tipe kunjungan, gambar storage, fallback botanical, CTA booking/login, dan link detail layanan jika slug tersedia.
- Section testimoni sekarang render dari `testimonials` dengan foto storage atau avatar inisial fallback.
- Jika data produk, layanan, atau testimoni kosong, homepage menampilkan empty state halus berbahasa Indonesia tanpa merusak layout.
- Anchor `#produk` dipertahankan pada section produk agar nav homepage tetap bekerja.
- Tidak ada perubahan pada `HomeController`, route, business logic, atau behavior add-to-cart.

Catatan verifikasi Batch 38:

- LSP diagnostics untuk `resources/js/Pages/Welcome.jsx`: bersih.
- LSP diagnostics ulang setelah bugfix tombol `Lihat Produk`: bersih.
- LSP diagnostics ulang setelah penambahan animasi scroll reveal: bersih.
- LSP diagnostics ulang setelah penambahan smooth scroll anchor menu: bersih.
- LSP diagnostics untuk cart badge/add-to-cart animation bersih pada backend dan shared component; `ProductShow.jsx` hanya menyisakan info Biome non-blocking `organizeImports`.
- LSP diagnostics untuk perubahan icon keranjang homepage: bersih.
- LSP diagnostics untuk animasi fly-to-cart homepage: bersih.
- LSP diagnostics ulang setelah tuning presisi endpoint animasi fly-to-cart homepage: bersih.
- LSP diagnostics ulang setelah menyamakan animasi fly-to-cart homepage dengan halaman detail produk: bersih.
- LSP diagnostics ulang setelah menyamakan fallback icon animasi homepage dengan detail produk: bersih.
- `php artisan test tests/Feature/CartTest.php`: pass, 9 tests, 26 assertions.
- `npm run build`, `npm run dev`, dan dev server tidak dijalankan karena instruksi project melarang build/server tanpa izin eksplisit.

## Verifikasi yang Sudah Dilakukan

LSP PHP:

- `intelephense` sudah diinstall global.
- LSP diagnostics sudah dijalankan pada file controller/service/request/route yang berubah dan hasil akhirnya bersih.

Syntax check:

- `php -l` sudah dijalankan untuk file PHP baru dan `routes/web.php`.
- Hasil: tidak ada syntax error.

Route check:

- `php artisan route:list --path=products`
- `php artisan route:list --path=services`
- `php artisan route:list --path=cart`
- `php artisan route:list --path=checkout`

Hasil route produk, layanan, cart, dan checkout sudah terdaftar.

## Yang Belum Dikerjakan

Item berikut belum diimplementasikan:

- Payment gateway otomatis belum dibuat; flow pembayaran saat ini tetap manual berdasarkan instruksi/admin confirmation.
- Newsletter homepage masih berupa alert lokal dan belum terhubung ke backend subscription/CRM.

## Rekomendasi Batch Berikutnya

Batch berikutnya yang paling aman adalah salah satu dari dua opsi berikut:

1. **Homepage newsletter/lead capture**
   - Sambungkan form newsletter homepage ke backend lead/CRM atau endpoint subscription sederhana.
   - Cocok jika prioritasnya menangkap prospek dari landing page.

2. **Admin UI modul berikutnya**
   - Mulai dari admin event atau admin offline sales agar panel admin semakin lengkap setelah lead/CRM selesai.
   - Scope lebih besar, jadi sebaiknya dibagi per modul kecil.

Jika ingin menjaga alur customer-facing publik, rekomendasi utama berikutnya adalah menyambungkan newsletter/lead capture karena homepage, produk/cart/checkout, instruksi pembayaran, layanan/booking, CTA homepage, serta customer dashboard/profile sudah memiliki page Inertia nyata.

## Batch 40: Perbaikan UI Admin Offline Sales dan Integrasi Metode Pembayaran

Pekerjaan yang telah diselesaikan:

1. **Perbaikan Tampilan Offline Sales (POS):**
   - Merombak halaman `Admin/OfflineSales/Index.jsx` dengan menambahkan layout berbasis sistem tab (POS Penjualan dan Riwayat Penjualan).
   - Layout POS dipecah menjadi 2 kolom: grid produk di kiri beserta pencarian, dan keranjang + form data transaksi di kanan.
   - Menyempurnakan desain keranjang: menghilangkan foto thumbnail agar lebih ringkas, dan memperbaiki padding/ukuran input qty agar angka tidak terpotong (menyembunyikan panah bawaan browser).
   - Memperbaiki layout form Data Transaksi agar tersusun dalam grid 2 kolom yang lebih rapi, dan memindahkan tombol submit ke bagian bawah.
   - Menambahkan efek hover estetik pada card produk dengan tombol `+` melayang di samping nama produk.
2. **Integrasi Metode Pembayaran pada Offline Sales:**
   - Membuat migration baru untuk menambahkan kolom `payment_method_id` yang terelasi ke tabel `payment_methods`.
   - Menyesuaikan model `OfflineSale` untuk memuat relasi `paymentMethod` dan properti fillable.
   - Memperbarui `OfflineSaleController` agar mengirimkan data `paymentMethods` (hanya yang aktif) ke halaman Inertia.
   - Memperbarui form Request `StoreOfflineSaleRequest` agar memvalidasi `payment_method_id` yang ada di tabel `payment_methods`.
   - Mengubah form "Input Data Transaksi" agar menggunakan `<SelectField>` untuk memilih metode pembayaran dinamis dari database (lengkap dengan nama bank dan no rekening).
   - Memperbarui halaman `Show` dan card Riwayat Penjualan untuk menampilkan detail nama metode pembayaran dari objek relasi terkait.
3. **Penyempurnaan Product Image Public Component:**
   - Memperbarui komponen `<ProductImage>` (`resources/js/Components/Public/commerce.jsx`) dan helper `storageImage` (`Welcome.jsx`) untuk menormalisasi path absolut (`/images/...`) dengan path lama (`/storage/...`), dan memunculkan placeholder SVG secara konsisten apabila gambar tidak diunggah.
4. **Integrasi Layanan (Services) ke Offline Sales (POS):**
   - Mengubah migration `offline_sale_items` untuk mendukung `service_id` dan mengubah `product_id` menjadi opsional (`nullable`), serta mengganti `product_name` menjadi `item_name`.
   - Menyesuaikan `OfflineSaleItem` (model), `StoreOfflineSaleRequest` (validasi), dan `OfflineSaleService` (logic pemotongan stok khusus produk).
   - Menambahkan tombol "Toggle" (Tab Produk / Layanan) di halaman POS Kiri untuk mengganti daftar grid yang ditampilkan.
   - Menampilkan Badge penanda (Produk / Layanan) di item keranjang dan detail riwayat.
5. **Modal Konfirmasi Simpan Offline Sale:**
   - Mengubah flow submit POS agar tidak melempar (`redirect`) pengguna ke halaman "Detail Transaksi" setelah berhasil menyimpan data.
   - `OfflineSaleController` kini melempar kembali data transaksi yang berhasil dibuat ke halaman `Index` sebagai *flash session*.
   - Menambahkan Modal Success di halaman `Index.jsx` yang menampilkan rangkuman (resume) item apa saja yang dibeli beserta detail nama pelanggan dan total belanja.
   - Perbaikan logika reset cart: keranjang otomatis dibersihkan di latar belakang sesaat setelah data sukses disimpan. Tombol tutup pada modal me-reset visual layar agar bersih siap transaksi baru.
6. **Perubahan Tampilan Riwayat Penjualan:**
   - Mengubah tampilan tab "Riwayat Penjualan" di POS dari semula berupa *Grid of Cards* menjadi bentuk Tabel (*Table*) yang rapi, responsif, dan mudah dipindai untuk mempercepat pembacaan data transaksi (Invoice, Tanggal, Customer, Sumber, Pembayaran, dan Total Harga).
7. **Pencarian dan Pagination pada Riwayat Penjualan:**
   - Mengubah pengambilan data dari *get all* menjadi terpaginasi (*paginate*) 10 data per halaman melalui `OfflineSaleController`.
   - Melakukan refaktor penghitungan kartu metrik atas ringkasan (Revenue, Jumlah Event, dsb) di *Backend* sehingga tidak terpengaruh oleh *pagination* dan mencerminkan angka global riwayat.
   - Menambahkan kotak pencarian (search) di pojok kanan atas tabel Riwayat Penjualan, mendukung pencarian berdasarkan Nama Customer maupun Nomor Invoice.
   - Menambahkan navigasi halaman (Links) di bawah tabel.
