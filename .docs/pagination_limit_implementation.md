# Implementasi Pagination dan Custom Limit Table Admin

Implementasi fitur pagination dengan custom limit (dropdown limit "Tampilkan X data") beserta fitur search (cari data) di semua halaman index tabel admin.

## Tabel / Modul yang diperbarui:

1. Staff (`StaffController`, `Staff/Index.jsx`)
2. Teams (`TeamController`, `Teams/Index.jsx`)
3. Positions (`PositionController`, `Positions/Index.jsx`)
4. Products (`ProductController`, `Products/Index.jsx`)
5. Customers (`CustomerController`, `Customers/Index.jsx`)
6. Testimonials (`TestimonialController`, `Testimonials/Index.jsx`)
7. Offline Sales (`OfflineSaleController`, `OfflineSales/Index.jsx`)
8. Bookings (`BookingController`, `Bookings/Index.jsx`)
9. Leads (`LeadController`, `Leads/Index.jsx`)
10. Payment Methods (`PaymentMethodController`, `PaymentMethods/Index.jsx`)
11. Videos (`VideoController`, `Videos/Index.jsx`)
12. Vouchers (`VoucherController`, `Vouchers/Index.jsx`)
13. Voucher Redemptions (`VoucherController@redemptions`, `Vouchers/Redemptions/Index.jsx`)
14. Examinations (`ExaminationController`, `Examinations/Index.jsx`)
15. Product Categories (`ProductCategoryController`, `ProductCategories/Index.jsx`)
16. Orders (`OrderController`, `Orders/Index.jsx`)
17. Events (`EventController`, `Events/Index.jsx`)
18. Lead Sources (`LeadSourceController`, `LeadSources/Index.jsx`)
19. Services (`ServiceController`, `Services/Index.jsx`)

## Detail Perubahan:

- **Controller (`app/Http/Controllers/Admin/*`)**:
  - Semua method `index` (dan `redemptions` pada Voucher) diperbarui agar menerima query parameter `per_page` dan `search`.
  - Eloquent query menggunakan `paginate($perPage)->withQueryString()` agar state limit dan pencarian bisa diteruskan di parameter URL.
  - Untuk controller yang juga menampilkan *Metrics* (seperti count data yang aktif, tidak aktif, atau total pesanan/pendapatan), perhitungannya dipisahkan dari `paginate()` agar nilai agregasi metrics tidak terpengaruh oleh jumlah data paginasi saat itu.
  - Value `search` dan `per_page` dikirimkan kembali ke Frontend via object `filters`.
- **View (`resources/js/Pages/Admin/*/Index.jsx`)**:
  - Komponen `Pagination` telah ditambahkan di setiap tabel.
  - Komponen input untuk `search` dan select dropdown untuk `per_page` limit (contoh opsi: 10, 25, 50, 100) telah diseragamkan di halaman.
  - Interaksi `onFilterChange` di-*handle* via `router.get` dari InertiaJS dengan mode `preserveState`, `replace`, dan `preserveScroll` agar perubahan search/limit terjadi secara mulus tanpa membuat full reload atau hilang scroll.
  - Integrasi mapping value API: karena format balikan `paginate()` dari Laravel akan menghasilkan object `links`, `data`, `total`, dsb., maka variable disesuaikan dengan mengecek array dari `items.data || items`.

Semua fungsi index tabel telah berhasil dibatasi dengan nilai default 10 per halaman, namun bisa di-*customize* dan dicari isinya melalui inputan yang tersedia.
