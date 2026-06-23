# Penambahan Rincian Transaksi pada Laporan Stok & Penjualan

**Deskripsi Perubahan:**
Telah ditambahkan fitur modal pop-up interaktif pada modul laporan Stok & Penjualan Produk di halaman `admin/reports`. Selain itu, label Header (Produk, Terjual) ditambahkan pada komponen ReportGroup terkait.

**Detail Modifikasi:**
1. **API Rincian Transaksi (`app/Http/Controllers/Admin/ReportController.php`)**:
   - Dibuat fungsi `productSales()` yang menggabungkan (UNION) riwayat transaksi online dan offline untuk satu produk di periode yang dipilih.
   - Hasil diurutkan berdasarkan tanggal terbaru dan dipaginasi sebanyak 10 item per request.
   - Route `admin.reports.product_sales` ditambahkan ke `routes/web.php`.
2. **UI & State (`resources/js/Pages/Admin/Reports/Index.jsx`)**:
   - Menambahkan dukungan render *Header* khusus pada komponen `ReportGroup`.
   - Mengubah tampilan total nilai (`ReportRow`) menjadi sebuah *link* bergaris bawah jika menerima fungsi *callback* interaktif (`onClickTotal`).
   - Menyediakan komponen `Modal` yang akan terpicu (*trigger*) saat angka total diklik. Modal ini memiliki tabel rincian transaksi (Tanggal, Referensi, Sumber Online/Offline, dan Kuantitas).
   - Menambahkan sistem _Pagination_ AJAX di dalam Modal agar saat pengguna menelusuri riwayat transaksi yang panjang, halaman Laporan Utama tidak ter-refresh. Lencana sumber penjualan (Online/Offline) menggunakan komponen bawaan `StatusBadge`.
