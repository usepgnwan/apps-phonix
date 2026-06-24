# Fitur Unduh Invoice untuk Pelanggan (Customer)

Dokumen ini mencatat penambahan fitur bagi pelanggan untuk dapat mengunduh secara mandiri dokumen *Invoice* (faktur) berformat PDF langsung dari ruang *Dashboard* mereka. 

## 1. Perubahan Logika Backend (*Controller & Route*)
- **`CustomerDashboardController`**:
  - Menambahkan _method_ baru bernama `invoiceOrder(Request $request, Order $order)`.
  - Fungsi ini menggunakan _template view_ PDF yang sama persis dengan yang digunakan oleh Admin (`admin.orders.invoice`).
  - Dilengkapi dengan sistem otorisasi keamanan: pelanggan hanya dapat mengunduh *invoice* dari *order* (pesanan) miliknya sendiri. Jika pesanan tersebut bukan milik _user_ yang sedang _login_, sistem akan otomatis menampilkan error `404 Not Found`.
- **`routes/web.php`**:
  - Mendaftarkan rute baru: `GET /customer/dashboard/orders/{order}/invoice` yang memanggil fungsi `invoiceOrder`.
  - Diberi nama rute `customer.dashboard.orders.invoice`.

## 2. Pembaruan Antarmuka Dashboard (*React/Inertia*)
- **Halaman Detail Pesanan (`Customer/Dashboard/Orders/Show.jsx`)**:
  - Menambahkan tombol sekunder **"Download Invoice"** dengan ikon di sebelah tombol "Dashboard" pada area *Page Header*.
  - Tautan tombol mengarah langsung ke _route_ unduhan PDF dan menggunakan target `_blank` agar diunduh secara *seamless* tanpa memutus alur sesi *browsing* saat ini.
- **Halaman Beranda Dashboard (`Customer/Dashboard/Index.jsx`)**:
  - **Refactor `ListItem` Component**: Menambahkan *property* pendukung baru `actionNode` pada komponen `ListItem`. Hal ini dilakukan agar komponen bisa memiliki elemen fungsional tambahan (seperti tombol) tanpa bertumpuk atau bentrok dengan area *link* navigasi (komponen pembungkus `<Link>`).
  - **Daftar Pesanan Terbaru (`RecentOrders`)**: Memanfaatkan `actionNode` untuk menempatkan tombol **"Download Invoice"** pada masing-masing kartu pesanan (sehingga di *card order* terbaru, *invoice* sudah langsung dapat diklik).

**Status:** Fitur berhasil dibangun, berfungsi normal, aman secara otorisasi, dan telah diterapkan ke antarmuka pelanggan (baik di daftar *order* maupun halaman rincian *order*).
