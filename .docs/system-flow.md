# System Flow Phoenix Herbal Commerce

Dokumen ini merangkum alur sistem end-to-end berdasarkan migration, model, controller, service, route, halaman Inertia, view Blade khusus, dan catatan implementasi sampai Batch 40. Dokumen ini dipakai sebagai acuan flow final yang lebih stabil daripada changelog harian atau catatan batch historis.

Sumber acuan:

- `.docs/features-modules.md`
- `.docs/data-structure-plan.md`
- `.docs/implementation-progress.md`
- `.docs/source-audit-findings.md`
- dokumen feature/changelog spesifik di `.docs/`

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
- admin dashboard dan basic reports,
- settings/template editor,
- receipt email checkout,
- admin video dan sitemap SEO,
- PWA dasar,
- admin staff, position, dan team,
- print/invoice offline sale,
- customer payment instruction.

UI Inertia utama sudah tersedia untuk mayoritas flow publik, customer, admin, dan field staff. Beberapa dokumen batch lama masih menyebut placeholder `Welcome`; bagian tersebut adalah catatan historis dan tidak lagi menjadi status final. Route yang masih memakai halaman lama harus diverifikasi langsung dari controller/page sebelum dianggap belum punya UI.

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
- `POST /checkout/validate-voucher` dengan nama `checkout.validate-voucher`
- `POST /checkout` dengan nama `checkout.store`

Flow checkout:

1. Customer atau guest membuka checkout.
2. Sistem mengambil cart aktif dan customer profile jika ada.
3. Jika customer member mengisi voucher, UI mewajibkan klik tombol **Cek** terlebih dahulu.
4. Endpoint `checkout.validate-voucher` memvalidasi voucher secara JSON, menghitung subtotal server-side dari cart aktif, dan mengembalikan preview diskon atau error `422`.
5. User mengirim data checkout:
   - `customer_name`,
   - `customer_whatsapp_number`,
   - `shipping_address`,
   - `voucher_code` opsional yang sudah lolos cek jika diisi.
6. `CheckoutService` menjalankan transaksi database.
7. Sistem memastikan cart tidak kosong.
8. Sistem mengecek ulang setiap cart item:
   - produk masih aktif,
   - stok masih mencukupi.
9. Sistem menghitung subtotal, diskon voucher jika valid, dan total awal.
10. Sistem membuat `orders` dan `order_items` sebagai snapshot transaksi.
11. Jika voucher valid dipakai, sistem membuat `voucher_redemptions`.
12. Sistem mengosongkan cart item setelah order berhasil dibuat.
13. User diarahkan ke halaman detail/konfirmasi pesanan publik dengan flash message dan `order_number`.

Status awal order:

- `shipping_status = pending_shipping_confirmation`
- `payment_status = pending`
- `status = waiting_shipping_confirmation`
- `shipping_cost = 0`

Catatan:

- Checkout tidak mengurangi stok.
- Pengurangan stok dilakukan nanti saat admin mulai fulfillment order.
- Payment instruction setelah ongkir dikonfirmasi belum dibuat sebagai UI/customer-facing flow lengkap.

### Cek Pesanan Guest

Route utama:

- `GET /orders/lookup` dengan nama `orders.lookup.create`
- `POST /orders/lookup` dengan nama `orders.lookup.store`
- `GET /orders/lookup/{order:order_number}` dengan nama `orders.lookup.show`

Flow:

1. Setelah checkout berhasil, guest maupun customer login diarahkan ke detail order publik dari order yang baru dibuat.
2. Sistem menyimpan penanda session untuk order tersebut agar detail dapat dilihat tanpa login setelah checkout berhasil.
3. Jika customer ingin mengecek ulang transaksi, customer membuka halaman cek pesanan.
4. Customer mengisi `order_number` dan `customer_whatsapp_number` yang dipakai saat checkout.
5. Sistem mencocokkan kombinasi nomor order dan nomor WhatsApp, bukan nomor WhatsApp saja.
6. Jika cocok, sistem menyimpan penanda session dan menampilkan detail order publik.
7. Jika tidak cocok atau order tidak ditemukan, sistem memberi pesan error generik agar keberadaan order tidak mudah ditebak.

Catatan keamanan:

- Tidak ada akun atau `customer_profile` yang dibuat otomatis untuk guest checkout.
- Tidak perlu migration baru karena `orders.order_number` sudah unique dan `orders.customer_whatsapp_number` sudah tersimpan sebagai snapshot checkout.
- Detail publik tidak menampilkan field internal seperti `admin_notes`, `user_id`, atau `customer_profile_id`.
- Endpoint lookup memakai pembatasan request ringan karena route bersifat publik.

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

Flow invoice admin:

1. Admin membuka invoice order dari detail/list order.
2. Sistem mengambil order beserta item, customer, voucher, dan payment method terkait.
3. Sistem menampilkan dokumen invoice untuk kebutuhan cetak atau arsip internal.

Catatan fulfillment:

- Tidak ada stock ledger pada MVP saat ini.
- Tidak ada restore stok otomatis saat order cancelled setelah fulfillment dimulai.
- Status `shipped`, `completed`, dan `cancelled` dapat diubah lewat update status, tetapi tidak memicu decrement stok jika belum masuk `processing`.

### Instruksi Pembayaran Customer

Flow:

1. Customer atau guest membuat order lewat checkout.
2. Order masuk dengan status awal menunggu konfirmasi ongkir.
3. Admin mengisi ongkir dan mengubah order menjadi `waiting_payment`.
4. Customer membuka detail order dari customer dashboard atau halaman lookup publik.
5. Sistem menampilkan total akhir setelah ongkir dan diskon voucher.
6. Jika payment method sudah dipilih atau tersedia, sistem menampilkan instruksi pembayaran manual seperti rekening bank atau QRIS sesuai data admin.
7. Customer melakukan pembayaran di luar sistem, lalu admin memverifikasi pembayaran secara manual.

Catatan:

- Sistem tidak memakai payment gateway otomatis.
- Instruksi pembayaran bergantung pada data payment method dan status order yang sudah dikonfirmasi admin.

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
- services,
- testimonials,
- videos.

Flow umum:

1. Admin aktif membuka daftar resource.
2. Admin dapat create, update, show, dan delete sesuai resource.
3. Form Request memvalidasi data input.
4. Produk dan layanan memakai status `is_active` serta `is_featured`.
5. Category delete diblokir jika category masih punya products.

Catatan:

- Upload gambar belum diperdalam sebagai flow UI.

### Produk: BPOM, Komposisi, dan Kemasan

Flow:

1. Admin membuat atau memperbarui produk.
2. Admin dapat mengisi nomor BPOM opsional.
3. Admin dapat mengisi komposisi produk.
4. Admin dapat mengisi detail kemasan terstruktur:
   - tipe kemasan,
   - jumlah isi,
   - satuan isi.
5. Data tersebut tersimpan pada produk dan dipakai oleh halaman detail publik.
6. Halaman detail produk publik menampilkan informasi BPOM dan kemasan jika nilainya tersedia.

### Testimonial

Route utama:

- resource `/admin/testimonials`

Flow:

1. Admin membuka daftar testimoni.
2. Admin dapat membuat, memperbarui, dan menghapus testimoni.
3. Testimoni berisi nama customer, isi ulasan, rating 1 sampai 5, dan status aktif.
4. Foto testimoni tidak lagi menjadi bagian flow saat ini.
5. Homepage hanya menampilkan testimoni aktif.

### Video Terapi

Route utama:

- resource `/admin/videos`

Flow:

1. Admin membuat atau memperbarui data video terapi.
2. Admin mengisi judul, link video, dan status pinned.
3. Homepage mengambil video pinned untuk bagian bukti terapi.
4. Frontend dapat merender video YouTube melalui iframe atau file MP4 melalui elemen video.

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

### Staff, Position, dan Team

Route utama:

- resource `/admin/positions` tanpa create/show/edit page terpisah,
- resource `/admin/teams` tanpa create/show/edit page terpisah,
- resource `/admin/staff` tanpa create/show/edit page terpisah.

Flow position dan team:

1. Admin mengelola master data jabatan melalui halaman positions.
2. Admin mengelola master data tim melalui halaman teams.
3. Data position dan team dipakai sebagai referensi staff lapangan.

Flow staff:

1. Admin membuka halaman staff.
2. Sistem menampilkan user dengan role `field_staff` beserta relasi team dan position.
3. Admin dapat membuat, memperbarui, dan menghapus staff sesuai aturan controller.
4. Admin dapat mengisi nomor telepon, memilih team, memilih position, dan mengunggah foto staff.
5. Foto staff diproses untuk ukuran lebih ringan sebelum disimpan.
6. Staff yang dibuat dipakai oleh flow lead assignment, field staff CRM, dan offline sales.

Catatan:

- Staff adalah user aplikasi dengan role `field_staff`, bukan entitas terpisah.
- Position dan team adalah master data referensi untuk pengelompokan staff.

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
- `POST /admin/offline-sales/validate-voucher`
- `POST /admin/offline-sales`
- `GET /admin/offline-sales/{offlineSale}`
- `GET /admin/offline-sales/{offlineSale}/print`
- `GET /admin/offline-sales/{offlineSale}/invoice`

Flow:

1. Admin membuka halaman offline sale dengan layout POS langsung di `/admin/offline-sales`.
2. Admin memilih atau mengisi relasi opsional:
   - customer profile,
   - lead,
   - field staff,
   - event.
3. Admin mengisi source:
   - `offline`,
   - `door_to_door`,
   - `event`.
4. Admin mengisi customer name, WhatsApp opsional, sold at, notes, dan items melalui grid data transaksi di kiri dan panel produk/kalkulasi di kanan.
5. Jika memilih customer profile member dan mengisi voucher, UI mewajibkan klik tombol **Cek** terlebih dahulu.
6. Endpoint `admin.offline-sales.validate-voucher` memvalidasi voucher secara JSON dari customer profile dan item yang dipilih, lalu mengembalikan preview diskon atau error `422`.
7. `OfflineSaleService` menjalankan transaksi untuk membuat `offline_sales` dan `offline_sale_items`.
8. UI menampilkan estimasi subtotal, diskon voucher, dan total dari item terpilih, tetapi harga final tetap dihitung server-side.
9. Harga, line total, subtotal, diskon voucher, dan total dihitung server-side dari harga produk/layanan saat ini.
10. Sale number dibuat dengan format `OFF-YYYYMMDD-XXXXXX`.
11. Stok produk dikurangi sesuai quantity item dalam transaksi yang sama.
12. Jika voucher valid dipakai, sistem membuat `voucher_redemptions` yang terhubung ke offline sale.
13. Admin dapat membuka detail offline sale, invoice, atau cetak struk thermal.

Flow print dan invoice:

1. Setelah transaksi offline sale berhasil dibuat, UI menyediakan aksi cetak struk.
2. Route print merender view Blade khusus ukuran printer thermal 58mm.
3. Route invoice merender dokumen invoice untuk transaksi offline sale.
4. Riwayat penjualan juga menyediakan aksi cetak ulang.
5. Struk dan invoice menampilkan subtotal, voucher, diskon voucher, dan total akhir jika transaksi memakai voucher.

Flow analytics offline sale:

1. Halaman offline sale menampilkan ringkasan dan visualisasi performa penjualan.
2. Sistem dapat menampilkan revenue per source atau event.
3. Sistem dapat menampilkan ranking staff lapangan berdasarkan revenue dan jumlah transaksi.

Validasi penting:

- Item wajib minimal satu.
- Product harus aktif.
- Quantity minimal 1 dan tidak boleh melebihi stok produk.
- `field_staff_id` jika diisi wajib user aktif dengan `role = field_staff`.

Catatan:

- Offline sales saat ini read/create-only.
- Tidak ada edit/delete offline sale pada MVP saat ini.
- Item offline sale mendukung item produk dan layanan sesuai implementasi terbaru; pengurangan stok hanya relevan untuk item produk.

## Flow Examination dan Product Recommendation

Route utama:

- `GET /admin/examinations`
- `GET /admin/examinations/create`
- `POST /admin/examinations`
- `GET /admin/examinations/{examination}`

Flow:

1. Admin membuka halaman `/admin/examinations` untuk melihat daftar pemeriksaan.
2. Admin membuka `/admin/examinations/create` untuk input pemeriksaan ala POS internal.
3. Admin memilih mode customer terdaftar atau guest/walk-in.
4. Jika mode customer terdaftar, admin memilih customer profile dan dapat memilih booking yang sesuai customer profile.
5. Jika mode guest, admin mengisi nama, nomor WhatsApp, dan alamat; sistem otomatis membuat `customer_profile` tanpa akun user dengan `member_status = non_member`.
6. Admin mengisi complaint, result, summary, dan internal recommendation.
7. Admin dapat menambahkan product recommendations opsional.
8. `ExaminationService` menjalankan transaksi.
9. `created_by` examination dan recommendation selalu current admin.
10. Recommendation memakai `customer_profile_id` yang sama dengan examination.

Validasi penting:

- `customer_profile_id` wajib valid.
- `booking_id` nullable tetapi jika diisi harus milik customer profile yang sama.
- Product recommendation hanya boleh memakai produk aktif.
- Guest/walk-in wajib mengisi nama, WhatsApp, dan alamat.
- Booking hanya dapat dipilih untuk mode customer terdaftar.
- Payload `created_by` dilarang pada level examination dan nested recommendation.

Catatan:

- Examination saat ini read/create-only.
- Halaman `/admin/examinations/create` dipakai khusus untuk form POS pemeriksaan.
- POS pada flow ini berarti point-of-service untuk input pemeriksaan, bukan penjualan, order, pembayaran, atau pengurangan stok.
- Guest pada POS pemeriksaan otomatis dibuat menjadi `customer_profile` operasional tanpa akun login.
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
3. Controller render halaman Inertia report admin dengan data agregasi.

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

## Flow Settings, Template, Email Receipt, SEO, dan PWA

### Admin Settings dan Template Editor

Route utama:

- `GET /admin/settings`
- `POST /admin/settings`

Flow:

1. Admin membuka halaman settings.
2. Sistem mengambil key-value settings dan mengirimnya ke halaman Inertia.
3. Admin dapat mengelola template order dan email melalui rich text editor.
4. Admin dapat menyimpan tag dinamis seperti `[nama]`, `[order]`, `[items]`, `[total]`, `[whatsapp]`, dan `[email]` di template.
5. Admin dapat mengelola alamat klinik/perusahaan untuk ditampilkan di halaman publik.
6. Sistem menyimpan perubahan dengan pola `updateOrCreate` berdasarkan key setting.

Catatan:

- Model `Setting` adalah key-value settings aktif untuk fitur template dan konfigurasi dinamis.
- Model `WebsiteSetting` masih ada sebagai domain website setting terpisah/legacy dan perlu dicek sebelum dipakai untuk fitur baru.

### Email Receipt Checkout

Flow:

1. Customer atau guest menyelesaikan checkout.
2. `CheckoutService` membuat order dan order items.
3. Sistem membaca `receipt_email` dan `order_template` dari settings.
4. Jika konfigurasi tersedia, sistem merender template dengan data order.
5. Sistem mengirim email receipt ke alamat tujuan internal yang dikonfigurasi.
6. Jika SMTP gagal, proses checkout tidak dibatalkan karena email hanya notifikasi pendukung.

Catatan:

- Credential SMTP berada di `.env` dan tidak boleh masuk repository.
- Email receipt bukan payment confirmation otomatis.

### SEO, Sitemap, Robots, dan PWA

Route utama:

- `GET /sitemap.xml`

Flow SEO dan sitemap:

1. Halaman publik menyetel meta title, description, dan keywords utama.
2. Sitemap controller mengambil produk dan layanan aktif.
3. Sistem merender sitemap XML untuk crawler.
4. `robots.txt` mengizinkan halaman publik dan membatasi area sensitif seperti admin/customer/field/api.

Flow PWA:

1. Layout utama memuat manifest dan theme color.
2. Browser mendaftarkan service worker dasar.
3. Admin layout dapat menampilkan tombol install app jika browser mendukung `beforeinstallprompt`.

Catatan:

- PWA saat ini bersifat dasar untuk installability, bukan offline-first penuh.

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

## Prioritas Maintenance Berikutnya

Karena UI utama sudah tersedia untuk mayoritas flow, prioritas berikutnya bukan lagi membuat halaman dari nol, tetapi menyelaraskan stabilitas, QA, dan dokumentasi:

1. Audit end-to-end public commerce
   - Pastikan produk, cart, checkout, lookup order, dan instruksi pembayaran berjalan mulus untuk guest dan customer login.
2. Audit end-to-end booking
   - Pastikan create booking, list booking, detail booking customer, dan update admin booking konsisten.
3. Audit admin commerce dan inventory
   - Pastikan order shipping/payment/status, fulfillment stok, offline sale, invoice, dan print struk berjalan sesuai aturan stok.
4. Audit CRM dan field staff
   - Pastikan assignment lead, status follow-up, activity field staff, team, position, dan staff CRUD konsisten.
5. Audit settings, template, email, SEO, dan PWA
   - Pastikan settings aktif terdokumentasi, tag template valid, email receipt tidak mengganggu checkout, sitemap/robots/PWA sesuai kebutuhan production.
6. Rapikan dokumentasi batch historis
   - Pertahankan `implementation-progress.md` sebagai log sejarah, tetapi gunakan dokumen ini sebagai acuan flow final.

## Gap yang Masih Perlu Diputuskan

Gap backend yang masih ada dan perlu keputusan sebelum dianggap production-complete:

- Order detail customer login di dashboard sudah tersedia; guest memakai flow cek pesanan publik berbasis nomor order dan WhatsApp.
- Restore stok saat order cancelled setelah status `processing`.
- Strict role validation untuk `assigned_staff_id` pada admin lead.
- Export/filter/report advanced jika dibutuhkan di luar MVP.
- Hardening upload/media untuk gambar produk, layanan, QRIS, dan foto staff jika akan dipakai production penuh.
- Keputusan final pemakaian `Setting` vs `WebsiteSetting` agar tidak ada dua sumber konfigurasi yang membingungkan.

Gap UI/QA yang masih perlu diaudit:

- Pastikan semua halaman Inertia terbaru mengikuti design system botanical/green-earth tone.
- Pastikan flow mobile untuk public commerce, booking, admin POS, dan field staff nyaman digunakan.
- Pastikan state error/empty/loading pada form penting sudah jelas untuk user.
