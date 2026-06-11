# Dokumentasi Fitur: Cetak Struk Penjualan Offline (Thermal)

**Tanggal:** 11 Juni 2026
**Deskripsi:** Penambahan fitur untuk mencetak struk (invoice) penjualan offline yang disesuaikan dengan ukuran printer thermal (58mm).

## 1. Perubahan Backend (Route & Controller)

- Ditambahkan route baru `admin.offline-sales.print` di file `routes/web.php`.
- Ditambahkan method `print` di `App\Http\Controllers\Admin\OfflineSaleController.php` untuk memuat relasi (items, payment method) dan merender view blade.

## 2. Perubahan Frontend (Blade Template)

- Dibuat file view baru `resources/views/admin/offline_sales/print.blade.php`.
- View ini menggunakan CSS standar khusus untuk ukuran kertas 58mm printer thermal (`width: 58mm`).
- Ditambahkan script `window.print()` agar dialog cetak browser otomatis terbuka.

## 3. Perubahan UI (React/Inertia)

- Di dalam file `resources/js/Pages/Admin/OfflineSales/Index.jsx`:
  - **Pada Modal Transaksi Berhasil:** Ditambahkan tombol "Print Struk (Thermal)" di bawah tombol "Tutup & Transaksi Baru" agar staf bisa langsung mencetak struk setelah checkout.
  - **Pada Tab Riwayat Penjualan:** Ditambahkan ikon/tombol `Printer` di kolom aksi setiap baris tabel riwayat transaksi, agar staf dapat mencetak ulang struk lama.
