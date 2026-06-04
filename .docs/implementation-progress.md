# Catatan Implementasi Project

Sumber acuan:

- `.docs/features-modules.md`
- `.docs/data-structure-plan.md`
- `.docs/system-flow.md`
- `.docs/DESIGN.md`

Dokumen ini mencatat progres implementasi yang sudah dikerjakan agar batch berikutnya bisa dilanjutkan tanpa kehilangan konteks.

## Status Terakhir

Progress saat ini sudah mencakup fondasi data, model domain, controller publik awal, flow backend cart dan checkout manual, booking, customer dashboard, customer profile backend, admin catalog backend untuk kategori produk, produk, dan layanan, Batch 8 Admin Commerce backend yang terdiri dari admin order, admin voucher, dan admin payment method, Batch 9 Admin Booking backend, Batch 10 Admin Customer backend, Batch 11 Admin Lead/CRM backend, Batch 12 Field Staff backend, Batch 13 Admin Event backend, Batch 14 Admin Offline Sales backend read/create-only, Batch 15 Admin Examination & Product Recommendation backend read/create-only, Batch 16 Admin Dashboard & Basic Reports backend read-only, serta Batch 17 Admin Order Fulfillment & Stock Movement backend. UI untuk halaman produk, layanan, cart, checkout, booking, customer dashboard, customer profile, admin catalog, admin order, admin voucher, admin payment method, admin booking, admin customer, admin lead/CRM, field staff, admin event, admin offline sales, admin examination, admin dashboard, dan admin reports belum dibuat; route/controller sementara masih memakai placeholder Inertia `Welcome` sesuai arahan bahwa UI selain home belum tersedia.

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
- `GET /admin/offline-sales/create` dengan nama `admin.offline-sales.create`
- `POST /admin/offline-sales` dengan nama `admin.offline-sales.store`
- `GET /admin/offline-sales/{offlineSale}` dengan nama `admin.offline-sales.show`

Implementasi admin offline sales saat ini:

- Semua route wajib login.
- Akses admin offline sales dibatasi untuk user dengan `role = admin` dan `is_active = true`.
- Batch ini read/create-only: tidak ada edit, update, delete, payment handling, atau field staff offline sales routes.
- `index`, `create`, dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin offline sales belum tersedia.
- `index` mengirim daftar `offlineSales` terbaru dengan relasi `customerProfile`, `lead`, `fieldStaff`, dan `event`.
- `create` mengirim lookup data produk aktif, customer profiles, leads, field staff aktif, events, dan daftar source.
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
- Stok produk tidak dikurangi pada batch ini karena stock movement masih out of scope.

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
- Admin aktif dapat membuka placeholder index/create/show offline sales.
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
- `php artisan route:list --name=admin.offline-sales`: 4 route admin offline sales terdaftar.

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
- Batch ini read/create-only: tidak ada edit, update, delete, update status booking, order creation, offline sale creation, atau UI admin examination.
- `index`, `create`, dan `show` sementara render Inertia page `Welcome` dengan prop `page` karena UI admin examination belum tersedia.
- `index` mengirim daftar `examinations` terbaru dengan relasi `customerProfile`, `booking`, `creator`, dan `productRecommendations.product`.
- `create` mengirim lookup data `customerProfiles`, `bookings` dengan `customerProfile` dan `service`, serta produk aktif.
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
- `booking_id` nullable dan harus valid jika diisi.
- Jika `booking_id` diisi, booking harus milik `customer_profile_id` yang dipilih.
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
- Admin aktif dapat membuka placeholder index/create/show examination.
- `create` hanya mengirim produk aktif.
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
- `php artisan route:list --name=admin.examinations`: 4 route admin examination terdaftar.

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

- UI Inertia untuk:
  - produk list/detail,
  - layanan list/detail,
  - cart,
  - checkout.
- UI Inertia untuk booking list/create/detail.
- UI Inertia untuk customer dashboard.
- UI Inertia untuk customer profile show/create/edit.
- UI Inertia untuk admin catalog produk, kategori produk, dan layanan.
- UI Inertia untuk admin order.
- UI Inertia untuk admin voucher.
- UI Inertia untuk admin payment method.
- UI Inertia untuk admin booking.
- UI Inertia untuk admin customer.
- UI Inertia untuk admin lead/CRM.
- UI Inertia untuk admin event.
- UI Inertia untuk admin offline sales.
- UI Inertia untuk admin examination dan product recommendation.
- UI Inertia untuk admin dashboard dan reports.
- UI Inertia untuk field staff dashboard dan lead lapangan.
- Payment method display dan instruksi pembayaran setelah ongkir dikonfirmasi admin.
- Order detail route untuk customer setelah checkout berhasil.

## Rekomendasi Batch Berikutnya

Batch berikutnya yang paling aman adalah salah satu dari dua opsi berikut:

1. **Customer-facing UI Inertia**
   - Mulai dari customer profile create/edit atau customer dashboard agar flow customer yang sudah ada bisa dipakai lewat UI.
   - Cocok jika prioritasnya menyelesaikan alur customer sebelum admin panel.

2. **Admin Controller tahap awal**
   - Mulai dari CRUD produk/kategori/layanan/testimoni atau order/booking management dasar.
   - Scope lebih besar, jadi sebaiknya dibagi per modul kecil.

Jika ingin menjaga alur customer, rekomendasi utama adalah membuat UI customer profile terlebih dahulu karena customer dashboard sekarang mengarahkan user tanpa profile ke `/customer/profile/create`.
