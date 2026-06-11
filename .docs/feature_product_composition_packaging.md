# Dokumentasi Fitur: Komposisi dan Detail Kemasan Produk

**Tanggal:** 11 Juni 2026
**Deskripsi:** Penambahan fitur untuk mencatat komposisi dan detail kemasan yang terstruktur pada entitas Produk.

## 1. Perubahan Struktur Database (Tabel `products`)

Untuk mendukung pencatatan yang lebih rapi, struktur tabel `products` diperbarui melalui migration dengan menambahkan kolom berikut:
- `composition` (TEXT): Untuk mencatat komposisi atau bahan-bahan produk.
- `packaging_type` (VARCHAR): Menyimpan jenis atau tipe kemasan (contoh: Botol, Box, Pouch, Sachet, dll).
- `content_amount` (DECIMAL): Menyimpan nilai angka dari berat atau jumlah isi (contoh: 50, 100).
- `content_unit` (VARCHAR): Menyimpan satuan ukuran dari isi produk (contoh: Gram, Kg, ml, Liter, dll).

## 2. Backend (Model & Request Validation)

- **Model `Product` (`app/Models/Product.php`)**: Field `composition`, `packaging_type`, `content_amount`, dan `content_unit` ditambahkan ke dalam array `$fillable` agar mendukung mass-assignment.
- **Form Request (`StoreProductRequest` & `UpdateProductRequest`)**: Menambahkan validasi untuk memastikan tipe data sesuai saat admin menginputkan data produk:
  - `composition`: nullable, string
  - `packaging_type`: nullable, string, max:255
  - `content_amount`: nullable, numeric, min:0
  - `content_unit`: nullable, string, max:50

## 3. Frontend (Panel Admin)

Perubahan pada form UI di dalam `resources/js/Pages/Admin/Products/Create.jsx` dan `Edit.jsx`:
- **Komposisi**: Ditambahkan sebagai komponen `TextAreaField` di bawah field "Deskripsi Lengkap".
- **Detail Kemasan**: Menggunakan struktur *grid 3 kolom* untuk mempermudah input yang terstandarisasi:
  1. **Tipe Kemasan** (`SelectField`): Menyediakan opsi bawaan seperti Botol, Box, Pouch, Sachet, Tube, Blister, dan Pcs.
  2. **Berat / Jumlah Isi** (`TextField` dengan tipe number): Mengambil angka bulat atau desimal.
  3. **Satuan Berat / Isi** (`SelectField`): Menyediakan opsi bawaan seperti Gram, Kg, mg, ml, Liter, Kapsul, dan Tablet.

## Tujuan Perubahan
Perubahan dari satu input teks bebas (*free text*) menjadi tiga input (*dropdown & number*) ini dirancang untuk:
- Memudahkan proses pelaporan (reporting) atau filter produk berdasarkan satuan dan jenis kemasan di kemudian hari.
- Menjaga standarisasi penulisan agar tampilan di sisi halaman *customer* lebih konsisten.
