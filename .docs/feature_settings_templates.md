# Dokumentasi Fitur: Menu Settings & Template Editor

**Tanggal:** 11 Juni 2026
**Deskripsi:** Penambahan fitur menu "Pengaturan" pada panel admin untuk mengelola template pesanan dan template email menggunakan rich-text editor (ReactQuill).

## 1. Database & Model

- **Tabel `settings`:** Dibuat menggunakan file migrasi baru untuk menyimpan konfigurasi sistem secara fleksibel dengan format Key-Value.
  - `key` (string, unique): Menyimpan nama unik pengaturan (contoh: `order_template`, `email_template`).
  - `value` (longText, nullable): Menyimpan nilai pengaturan (dalam fitur ini, berformat HTML dari Quill editor).
- **Model `Setting`:** Model `App\Models\Setting` dikonfigurasi dengan `#[Fillable(['key', 'value'])]`.

## 2. Controller & Routing

- **Route:** Ditambahkan `GET /admin/settings` dan `POST /admin/settings` pada `routes/web.php`.
- **Controller:** Dibuat `App\Http\Controllers\Admin\SettingController` yang memiliki 2 fungsi utama:
  1. `index()`: Mengambil seluruh baris di tabel settings, lalu mem-formatnya menjadi array asosiatif (key => value) untuk dilempar ke Inertia Frontend.
  2. `update(Request $request)`: Melakukan validasi, lalu menggunakan `updateOrCreate` untuk memperbarui pengaturan berdasarkan `key` yang sesuai di database.

## 3. Frontend (UI) & Integrasi ReactQuill

- **Dependency Baru:** Menambahkan `react-quill` via npm.
- **Navigasi:** Menambahkan kelompok menu "Sistem" berisi menu "Pengaturan" pada `AdminLayout.jsx`.
- **Halaman `Index.jsx`:** 
  - Lokasi: `resources/js/Pages/Admin/Settings/Index.jsx`.
  - Menggunakan komponen `ReactQuill` dengan module standar (Header, Bold/Italic/Underline, List, Link).
  - Mengizinkan admin menyimpan tag dinamis seperti `[nama]` dan `[order]` dalam teks HTML yang terformat.
  - Styling minimal ditambahkan (`[&_.ql-container]:min-h-[200px]`) agar editor teks memiliki ruang baca yang cukup lapang secara default.
