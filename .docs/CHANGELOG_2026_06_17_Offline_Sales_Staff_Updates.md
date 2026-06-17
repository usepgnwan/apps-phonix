# Update: Staff CRUD, Team CRUD, & Offline Sales Analytics
**Tanggal:** 17 Juni 2026

## Ringkasan
Dokumentasi ini merangkum perubahan yang dilakukan pada modul Staff Lapangan, referensi Tim & Jabatan, pembaruan versi *image processing*, serta penambahan analitik di halaman Penjualan Offline.

## Perubahan yang Dilakukan

### 1. Database & Schema
- Membuat tabel `positions` untuk mengelola master data jabatan (Position).
- Membuat tabel `teams` untuk mengelola master data tim (Team).
- Memperbarui tabel `users`:
  - Menambahkan kolom `phone_number`.
  - Menghapus kolom string `team` dan menggantinya dengan `team_id` (foreign key ke `teams`).
  - Menambahkan `position_id` (foreign key ke `positions`).
  - Menambahkan kolom `photo` untuk menyimpan path unggahan foto profil staff.

### 2. Models
- Membuat model `App\Models\Position`.
- Membuat model `App\Models\Team`.
- Memperbarui model `App\Models\User`:
  - Menambahkan `$fillable` fields: `phone_number`, `team_id`, `position_id`, `photo`.
  - Menambahkan relasi `position()` (belongsTo) dan `team()` (belongsTo).

### 3. Controllers & Backend Logic
- **PositionController**: Mengelola operasi CRUD untuk master Jabatan.
- **TeamController**: Mengelola operasi CRUD untuk master Tim.
- **StaffController**:
  - Mengelola pengguna dengan peran (`role`) `field_staff` secara eksklusif.
  - Menambahkan logika pemrosesan unggahan foto profil menggunakan pustaka **Intervention Image** (versi 4.x).
  - Menerapkan _resize_ otomatis (skala menurun dengan batasan lebar maksimum 500px) dan kompresi `toJpeg` (via `decode()` dan `encodeUsingFormat` kualitas 80) agar hemat tempat.
- Mendaftar direktori statis melalui _symbolic link_ `php artisan storage:link`.

### 4. Tampilan Antarmuka (Frontend - Inertia React)
- **Menu Master Data**:
  - Halaman `Pages/Admin/Positions/Index.jsx` untuk daftar Jabatan.
  - Halaman `Pages/Admin/Teams/Index.jsx` untuk daftar Tim.
- **Menu Staff Lapangan** (`Pages/Admin/Staff/Index.jsx`):
  - Mengubah _input text_ "Tim" menjadi komponen _dropdown_ terintegrasi ke referensi Tim.
  - Penambahan input file gambar interaktif (termasuk *live preview* lokal).
  - Tampilan *data table* kini mencakup avatar lingkaran untuk foto staf, dan menunjukkan informasi jabatan/tim secara lebih rapi.
- **Analitik Penjualan Offline** (`Pages/Admin/OfflineSales/Index.jsx`):
  - Mengintegrasikan bagan _Pie Chart_ ECharts untuk visualisasi "Revenue per Sumber / Event".
  - Memperbarui bagan "Peringkat Staff Lapangan" menjadi grafik _Dual Axis_ (Gabungan Bar dan Line Chart):
    - **Bar Chart**: Menunjukkan akumulasi nilai nominal penjualan (Revenue).
    - **Line Chart**: Menunjukkan kuantitas/frekuensi jumlah transaksi.
  - Menambahkan properti tooltip ECharts yang menggabungkan kedua _series_ agar mudah dibaca oleh admin.
