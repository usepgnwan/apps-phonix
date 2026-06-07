# System Flow Phoenix Herbal Commerce

Dokumen ini merangkum alur sistem end-to-end berdasarkan migration, model, controller, service, route, dan test yang sudah dibuat sampai Batch 17. Dokumen ini dipakai sebagai acuan sebelum masuk implementasi UI Inertia agar halaman yang dibuat mengikuti flow backend yang sudah tersedia.

Sumber acuan:

- `.docs/features-modules.md`
- `.docs/data-structure-plan.md`
- `.docs/implementation-progress.md`

## Status Umum

Sistem adalah Laravel monolith dengan Inertia.js dan React. Flow utama berjalan lewat web route, controller, Form Request, service, model Eloquent, dan redirect/session flash. Sistem bukan REST API terpisah dan bukan e-commerce otomatis penuh.

Backend MVP utama sudah mencakup:

- website publik awal,
- katalog produk dan layanan,
- cart dan checkout manual,
- voucher member,
- order management,
- pengiriman dan pembayaran manual,
- stock decrement saat fulfillment order,
- booking layanan,
- customer profile dan dashboard,
- admin catalog,
- admin customer,
- admin lead/CRM,
- field staff mini CRM,
- event,
- offline sales read/create-only,
- examination dan product recommendation read/create-only,
- admin dashboard dan basic reports.

UI Inertia untuk sebagian besar halaman fitur masih belum dibuat. Controller fitur baru sementara banyak yang render page placeholder `Welcome` dengan prop `page` dan data backend terkait.

## Role dan Hak Akses

### Guest

Guest dapat:

- membuka homepage,
- melihat daftar dan detail produk aktif,
- melihat daftar dan detail layanan aktif,
- memakai cart berbasis session,
- checkout sebagai guest/non-member.

Guest tidak dapat:

- memakai voucher member,
- membuat booking,
- membuka customer dashboard,
- membuka route admin atau field staff.

### Customer

Customer adalah user login dengan `role = customer`. Customer dapat:

- membuat atau memperbarui `customer_profile`,
- memakai cart berbasis akun,
- checkout dengan data profile,
- memakai voucher jika `customer_profiles.member_status = member`,
- membuat booking layanan,
- melihat dashboard customer,
- melihat detail order dan booking miliknya.

Customer hanya boleh mengakses data sendiri. Scope kepemilikan memakai `user_id` dan `customer_profile_id`.

### Admin

Admin adalah user dengan `role = admin` dan `is_active = true`. Admin dapat mengelola:

- kategori produk,
- produk,
- layanan,
- order,
- voucher,
- payment method,
- booking,
- customer profile,
- lead source,
- lead dan follow-up,
- event,
- offline sale,
- examination dan product recommendation,
- dashboard dan reports.

Admin tidak aktif dan user non-admin mendapat 403 pada route admin.

### Field Staff

Field staff adalah user dengan `role = field_staff` dan `is_active = true`. Field staff dapat:

- membuka dashboard field,
- melihat lead yang ditugaskan kepadanya,
- melihat detail lead miliknya,
- mengubah follow-up status lead miliknya,
- mencatat field activity pada lead miliknya.

Lead milik staff lain tidak dapat diakses lewat route field dan dikembalikan sebagai 404 untuk detail.

## Flow Website Publik dan Katalog

### Homepage

Route utama:

- `GET /` dengan nama `home`

Flow:

1. Visitor membuka homepage.
2. `HomeController` mengambil produk unggulan aktif, layanan unggulan aktif, dan testimoni aktif.
3. Controller render `Welcome` dengan props homepage.

Status UI:

- Homepage masih memakai page `Welcome` bawaan.

### Produk

Route utama:

- `GET /products` dengan nama `products.index`
- `GET /products/{product:slug}` dengan nama `products.show`

Flow daftar produk:

1. Visitor membuka daftar produk.
2. Sistem mengambil produk aktif dengan relasi kategori.
3. Data dipaginasi.
4. Controller render placeholder dengan `page = products.index`.

Flow detail produk:

1. Visitor membuka detail produk berdasarkan slug.
2. Sistem memastikan produk aktif.
3. Sistem mengambil related products dari kategori yang sama.
4. Controller render placeholder dengan `page = products.show`.

### Layanan

Route utama:

- `GET /services` dengan nama `services.index`
- `GET /services/{service:slug}` dengan nama `services.show`

Flow:

1. Visitor membuka daftar atau detail layanan.
2. Sistem hanya menampilkan layanan aktif.
3. Detail layanan memakai slug.
4. Controller render placeholder dengan `page = services.index` atau `services.show`.

## Flow Cart, Checkout, Voucher, Order, dan Stock

### Cart

Route utama:

- `GET /cart` dengan nama `cart.index`
- `POST /cart/items` dengan nama `cart.items.store`
- `PATCH /cart/items/{cartItem}` dengan nama `cart.items.update`
- `DELETE /cart/items/{cartItem}` dengan nama `cart.items.destroy`

Flow guest cart:

1. Guest menambahkan produk aktif ke cart.
2. `CartResolver` membuat atau memakai session key stabil `cart_session_id`.
3. Cart disimpan dengan `session_id`.
4. Jika produk yang sama ditambahkan lagi, quantity pada item existing ditambah.
5. Quantity tidak boleh melebihi `products.stock_quantity`.

Flow customer cart:

1. Customer login menambahkan produk aktif ke cart.
2. `CartResolver` memakai `user_id`.
3. Jika customer punya `customer_profile`, cart disinkronkan dengan `customer_profile_id`.
4. Update dan delete cart item memvalidasi ownership cart.

Catatan:

- Guest-to-user cart merge belum dibuat.
- Cart belum mengurangi stok. Stok hanya divalidasi.

### Checkout Manual

Route utama:

- `GET /checkout` dengan nama `checkout.show`
- `POST /checkout` dengan nama `checkout.store`

Flow checkout:

1. Customer atau guest membuka checkout.
2. Sistem mengambil cart aktif dan customer profile jika ada.
3. User mengirim data checkout:
   - `customer_name`,
   - `customer_whatsapp_number`,
   - `shipping_address`,
   - `voucher_code` opsional.
4. `CheckoutService` menjalankan transaksi database.
5. Sistem memastikan cart tidak kosong.
6. Sistem mengecek ulang setiap cart item:
   - produk masih aktif,
   - stok masih mencukupi.
7. Sistem menghitung subtotal, diskon voucher jika valid, dan total awal.
8. Sistem membuat `orders` dan `order_items` sebagai snapshot transaksi.
9. Jika voucher valid dipakai, sistem membuat `voucher_redemptions`.
10. Sistem mengosongkan cart item setelah order berhasil dibuat.
11. User diarahkan kembali dengan flash message dan `order_number`.

Status awal order:

- `shipping_status = pending_shipping_confirmation`
- `payment_status = pending`
- `status = waiting_shipping_confirmation`
- `shipping_cost = 0`

Catatan:

- Checkout tidak mengurangi stok.
- Pengurangan stok dilakukan nanti saat admin mulai fulfillment order.
- Payment instruction setelah ongkir dikonfirmasi belum dibuat sebagai UI/customer-facing flow lengkap.

### Voucher Member

Flow voucher:

1. Admin membuat voucher dan mengatur publish window, tipe diskon, nilai diskon, minimum purchase, dan usage limit.
2. Customer member memakai voucher saat checkout lewat `voucher_code`.
3. Sistem hanya menerima voucher jika:
   - user login,
   - cart terhubung ke customer profile,
   - customer profile berstatus `member`,
   - voucher published,
   - tanggal aktif valid,
   - minimum purchase terpenuhi,
   - usage limit belum habis,
   - customer belum pernah memakai voucher tersebut.
4. Sistem mencatat penggunaan voucher pada `voucher_redemptions`.

Customer non-member dan guest tidak dapat memakai voucher.

### Admin Order Management

Route utama:

- `GET /admin/orders`
- `GET /admin/orders/{order}`
- `PATCH /admin/orders/{order}/shipping`
- `PATCH /admin/orders/{order}/payment`
- `PATCH /admin/orders/{order}/status`

Flow konfirmasi ongkir:

1. Admin membuka detail order.
2. Admin mengisi kurir, tracking number opsional, shipping cost, shipping status, dan notes.
3. Jika `shipping_status` menjadi `shipping_cost_confirmed` atau `ready_to_ship`, status order berubah menjadi `waiting_payment`.
4. Total order dihitung ulang dari `subtotal - voucher_discount_amount + shipping_cost`.
5. Jika shipping dibatalkan, status order menjadi `cancelled`.

Flow verifikasi pembayaran:

1. Admin memilih payment method dan mengubah `payment_status`.
2. Jika `payment_status = paid`, status order menjadi `payment_received` dan `payment_received_at` diisi.
3. Jika `payment_status = waiting_payment`, status order menjadi `waiting_payment`.
4. Jika `payment_status = cancelled`, status order menjadi `cancelled`.
5. Verifikasi pembayaran tidak mengurangi stok.

Flow fulfillment dan stock movement:

1. Admin mengubah status order menjadi `processing`.
2. `OrderFulfillmentService` mengunci order dan product row terkait dalam database transaction.
3. Jika `orders.stock_decremented_at` masih null, sistem mengecek stok tiap product pada `order_items`.
4. Jika stok cukup, sistem mengurangi `products.stock_quantity` sesuai quantity order item.
5. Sistem mengisi `orders.stock_decremented_at`.
6. Order disimpan dengan `status = processing` dan admin notes terbaru.
7. Jika status `processing` dikirim ulang, stok tidak berkurang lagi karena marker sudah terisi.
8. Jika stok tidak cukup, transisi ditolak dan status order tetap sebelumnya.

Catatan fulfillment:

- Tidak ada stock ledger pada MVP saat ini.
- Tidak ada restore stok otomatis saat order cancelled setelah fulfillment dimulai.
- Status `shipped`, `completed`, dan `cancelled` dapat diubah lewat update status, tetapi tidak memicu decrement stok jika belum masuk `processing`.

## Flow Customer Profile dan Dashboard

### Customer Profile

Route utama berada di prefix `/customer/profile`.

Flow:

1. Customer login membuka profile.
2. Jika belum punya profile, customer dapat membuat profile.
3. Customer dapat update data profile miliknya.
4. Customer tidak dapat mengubah `member_status`, `user_id`, akun email, atau password lewat flow ini.
5. `member_status` hanya dapat dikelola admin.

Data profile dipakai oleh:

- checkout customer login,
- booking layanan,
- customer dashboard,
- voucher member,
- examination,
- product recommendation.

### Customer Dashboard

Route utama:

- `GET /customer/dashboard`
- route detail order customer,
- route detail booking customer.

Flow:

1. Customer login membuka dashboard.
2. Sistem mengambil customer profile milik user.
3. Jika profile belum ada, user diarahkan ke pembuatan profile.
4. Dashboard menampilkan ringkasan order dan booking milik customer.
5. Detail order dan booking hanya dapat dibuka oleh owner berdasarkan `user_id` dan `customer_profile_id`.

## Flow Booking Layanan

Route utama:

- `GET /bookings`
- `GET /bookings/create`
- `POST /bookings`
- `GET /bookings/{booking}`

Flow customer booking:

1. Customer login membuka form booking.
2. Customer wajib punya `customer_profile`.
3. Sistem menampilkan layanan aktif.
4. Customer memilih layanan, visit type, desired schedule, dan complaint notes.
5. Sistem memvalidasi visit type sesuai tipe layanan:
   - `home_visit`,
   - `office_visit`,
   - `both`.
6. Sistem membuat booking dengan snapshot data customer profile.
7. Status awal booking adalah `waiting_confirmation`.
8. Customer dapat melihat daftar dan detail booking miliknya.

Flow admin booking:

1. Admin membuka daftar/detail booking.
2. Admin dapat mengubah status booking.
3. Admin dapat mengubah jadwal booking.
4. Jadwal baru wajib berada di masa depan.

Status booking yang dipakai admin:

- `waiting_confirmation`
- `confirmed`
- `completed`
- `cancelled`

## Flow Admin Catalog

Admin catalog mencakup:

- product categories,
- products,
- services.

Flow umum:

1. Admin aktif membuka daftar resource.
2. Admin dapat create, update, show, dan delete sesuai resource.
3. Form Request memvalidasi data input.
4. Produk dan layanan memakai status `is_active` serta `is_featured`.
5. Category delete diblokir jika category masih punya products.

Catatan:

- UI admin catalog belum dibuat.
- Upload gambar belum diperdalam sebagai flow UI.

## Flow Admin Customer

Flow:

1. Admin membuka daftar customer profile.
2. Admin melihat detail customer dengan relasi operasional terkait.
3. Admin dapat update data profile dan membership.
4. Admin tidak mengubah akun user, email, password, atau `user_id` melalui flow ini.

Customer profile menjadi pusat data untuk order, booking, examination, recommendation, voucher redemption, dan offline sale jika tersedia.

## Flow Lead, CRM, Field Staff, dan Event

### Lead Source dan Event

Flow lead source:

1. Admin membuat lead source.
2. Lead source dipakai untuk mengelompokkan asal leads.
3. Lead source tidak boleh dihapus jika sudah punya leads.

Flow event:

1. Admin membuat event.
2. Event dapat dikaitkan ke leads dan offline sales.
3. Event tidak boleh dihapus jika punya leads atau offline sales.

### Admin Lead/CRM

Route admin lead mencakup daftar, detail, create, update, status update, delete, dan follow-up.

Flow:

1. Admin membuat lead dari sumber, event, customer profile opsional, dan assigned staff opsional.
2. Admin dapat melihat dan update lead.
3. Admin dapat mengubah follow-up status lead.
4. Admin dapat membuat lead follow-up.
5. `user_id` follow-up selalu current admin dan payload spoofing `user_id` ditolak.

Status lead/follow-up yang dipakai:

- `new`
- `interested`
- `needs_follow_up`
- `booking_examination`
- `purchased`
- `not_interested`

Catatan:

- `assigned_staff_id` pada admin lead saat ini divalidasi `exists:users,id`; strict role field staff belum diterapkan pada admin lead.
- Membuat follow-up tidak otomatis mengubah parent lead status.

### Field Staff CRM

Route utama:

- `GET /field/dashboard`
- `GET /field/leads`
- `GET /field/leads/{lead}`
- `PATCH /field/leads/{lead}/status`
- `POST /field/leads/{lead}/activities`

Flow:

1. Field staff aktif login.
2. Staff membuka dashboard atau daftar leads.
3. Sistem hanya menampilkan leads dengan `assigned_staff_id = current user id`.
4. Staff membuka detail lead miliknya.
5. Staff dapat update follow-up status lead miliknya.
6. Staff dapat mencatat field activity dengan type:
   - `visit`,
   - `follow_up`,
   - `note`.
7. Payload `field_staff_id` dan `lead_id` pada activity dilarang; sistem mengambil dari current user dan route lead.

Catatan:

- Activity creation tidak otomatis mengubah parent lead status kecuali lewat endpoint status update terpisah.

## Flow Offline Sales

Route utama:

- `GET /admin/offline-sales`
- `GET /admin/offline-sales/create`
- `POST /admin/offline-sales`
- `GET /admin/offline-sales/{offlineSale}`

Flow:

1. Admin membuka form offline sale.
2. Admin memilih atau mengisi relasi opsional:
   - customer profile,
   - lead,
   - field staff,
   - event.
3. Admin mengisi source:
   - `offline`,
   - `door_to_door`,
   - `event`.
4. Admin mengisi customer name, WhatsApp opsional, sold at, notes, dan items.
5. `OfflineSaleService` menjalankan transaksi untuk membuat `offline_sales` dan `offline_sale_items`.
6. Harga, line total, dan total dihitung server-side dari harga produk saat ini.
7. Sale number dibuat dengan format `OFF-YYYYMMDD-XXXXXX`.
8. Stok produk dikurangi sesuai quantity item dalam transaksi yang sama.

Validasi penting:

- Item wajib minimal satu.
- Product harus aktif.
- Quantity minimal 1 dan tidak boleh melebihi stok produk.
- `field_staff_id` jika diisi wajib user aktif dengan `role = field_staff`.

Catatan:

- Offline sales saat ini read/create-only.
- Tidak ada edit/delete offline sale pada MVP saat ini.

## Flow Examination dan Product Recommendation

Route utama:

- `GET /admin/examinations`
- `GET /admin/examinations/create`
- `POST /admin/examinations`
- `GET /admin/examinations/{examination}`

Flow:

1. Admin membuka form examination.
2. Admin memilih customer profile.
3. Admin dapat memilih booking yang sesuai customer profile.
4. Admin mengisi complaint, result, summary, dan internal recommendation.
5. Admin dapat menambahkan product recommendations opsional.
6. `ExaminationService` menjalankan transaksi.
7. `created_by` examination dan recommendation selalu current admin.
8. Recommendation memakai `customer_profile_id` yang sama dengan examination.

Validasi penting:

- `customer_profile_id` wajib valid.
- `booking_id` nullable tetapi jika diisi harus milik customer profile yang sama.
- Product recommendation hanya boleh memakai produk aktif.
- Payload `created_by` dilarang pada level examination dan nested recommendation.

Catatan:

- Examination saat ini read/create-only.
- Tidak ada update booking status otomatis.
- Tidak membuat order atau offline sale otomatis.
- Schema saat ini tidak punya `lead_id` dan `examined_at` pada examination.

## Flow Dashboard dan Reports

### Admin Dashboard

Route utama:

- `GET /admin/dashboard`

Flow:

1. Admin aktif membuka dashboard.
2. Sistem menghitung summary dari tabel operasional.
3. Sistem mengambil recent orders, bookings, leads, dan offline sales.
4. Sistem mengambil low stock products dengan kondisi `stock_quantity <= low_stock_threshold`.
5. Controller render placeholder `Welcome` dengan `page = admin.dashboard.index`.

Summary yang tersedia:

- products,
- services,
- orders,
- bookings,
- leads,
- customer profiles,
- field activities,
- offline sales,
- examinations.

### Basic Reports

Route utama:

- `GET /admin/reports`

Flow:

1. Admin aktif membuka reports.
2. Sistem menjalankan query agregasi langsung dari tabel operasional.
3. Controller render placeholder `Welcome` dengan `page = admin.reports.index`.

Reports yang tersedia:

- leads by source,
- leads by assigned staff,
- bookings by service,
- bookings by status,
- orders by status,
- website order revenue,
- offline sales revenue,
- field activities by type,
- product recommendations by product.

Catatan:

- Reports masih read-only.
- Belum ada filter tanggal, export, chart, atau tabel reporting khusus.

## Status Utama yang Dipakai Sistem

### Order Status

- `waiting_shipping_confirmation`
- `waiting_payment`
- `payment_received`
- `processing`
- `shipped`
- `completed`
- `cancelled`

### Shipping Status

- `pending_shipping_confirmation`
- `shipping_cost_confirmed`
- `ready_to_ship`
- `shipped`
- `delivered`
- `cancelled`

### Payment Status

- `pending`
- `waiting_payment`
- `paid`
- `cancelled`

### Booking Status

- `waiting_confirmation`
- `confirmed`
- `completed`
- `cancelled`

### Lead Follow-Up Status

- `new`
- `interested`
- `needs_follow_up`
- `booking_examination`
- `purchased`
- `not_interested`

### Field Activity Type

- `visit`
- `follow_up`
- `note`

### Offline Sale Source

- `offline`
- `door_to_door`
- `event`

## Flow Prioritas untuk UI Berikutnya

Karena backend sudah cukup lengkap, UI sebaiknya mengikuti urutan dependency data berikut:

1. Customer Profile UI
   - Dibutuhkan sebelum customer booking dan dashboard berjalan mulus.
2. Customer Dashboard UI
   - Menghubungkan customer ke order dan booking miliknya.
3. Product dan Service UI
   - Dibutuhkan untuk browsing katalog.
4. Cart dan Checkout UI
   - Dibutuhkan untuk flow order customer.
5. Booking UI
   - Dibutuhkan untuk flow layanan.
6. Admin Order UI
   - Penting untuk konfirmasi ongkir, pembayaran, dan fulfillment stok.
7. Admin Catalog UI
   - Dibutuhkan untuk mengelola data produk/layanan.
8. Admin CRM, Field Staff, Offline Sales, Examination, Dashboard, dan Reports UI
   - Dibuat setelah flow customer dan order dasar dapat digunakan.

## Gap yang Masih Perlu Diputuskan

Gap backend yang masih ada dan perlu keputusan sebelum dianggap production-complete:

- Payment method display dan instruksi pembayaran setelah ongkir dikonfirmasi admin.
- Order detail route customer setelah checkout berhasil.
- Offline sale stock decrement jika penjualan offline harus memotong stok inventory yang sama.
- Restore stok saat order cancelled setelah status `processing`.
- Strict role validation untuk `assigned_staff_id` pada admin lead.
- Export/filter/report advanced jika dibutuhkan di luar MVP.

Gap UI yang masih besar:

- Hampir semua fitur selain homepage masih belum punya page Inertia khusus.
- Controller sudah mengirim data, tetapi UI perlu dibuat sesuai flow di dokumen ini.
