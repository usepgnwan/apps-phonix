# Penambahan Laporan Stok & Penjualan Produk

**Deskripsi Perubahan:**
Telah ditambahkan modul laporan baru untuk menampilkan **Stok Tersedia** dan **Jumlah Produk Terjual** berdasarkan periode yang dipilih pada halaman `admin/reports`.

**Detail Modifikasi:**
1. **Backend (`app/Http/Controllers/Admin/ReportController.php`)**:
   - Ditambahkan fungsi private `productStockAndSales` untuk menggabungkan data produk dari model `Product` (menyediakan sisa stok realtime) dengan perhitungan sum `quantity` produk yang berhasil terjual.
   - Penjualan online diambil dari `order_items` dengan status Order `paid`, `payment_received`, atau `completed`.
   - Penjualan offline diambil dari `offline_sale_items`.
   - Data ini ditambahkan ke properti segment sehingga otomatis ter-ekspor dalam format `.xlsx` dan `.pdf`.
2. **Frontend (`resources/js/Pages/Admin/Reports/Index.jsx`)**:
   - Menambahkan parsing data `reports.productStockAndSales`.
   - Membuat komponen `<ReportGroup>` baru dengan judul **Stok & Penjualan Produk** di bawah laporan "Rekomendasi Produk per Produk".
3. **Template Export (`resources/views/admin/reports/summary.blade.php`)**:
   - Mendaftarkan label `productStockAndSales` ke dalam array `$segmentLabels` agar pada saat export ke PDF judul tabel yang digunakan adalah "Stok & Penjualan Produk".
