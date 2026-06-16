# Fitur Manajemen Testimoni Pelanggan

Dokumen ini mencatat pembuatan fitur CRUD (Create, Read, Update, Delete) untuk Testimoni Pelanggan pada panel administrator.

## 1. Perubahan Basis Data & Model
- **Migration:** Membuat berkas `2026_06_16_071701_add_rating_to_testimonials_table.php` yang menambahkan kolom `rating` (tipe `unsignedTinyInteger`, default `5`) pada tabel `testimonials` (terletak setelah kolom `content`).
- **Model:** Mengubah berkas `app/Models/Testimonial.php` dengan menambahkan atribut `rating` ke dalam deklarasi `#[Fillable]`.

## 2. Penghapusan Fitur Unggah Foto
Berdasarkan instruksi perbaikan terakhir, foto tidak lagi diperlukan untuk data testimoni (hanya membutuhkan nama pelanggan dan deskripsi/ulasan). 
- Form input file untuk foto dihapus secara menyeluruh dari halaman `Create.jsx` dan `Edit.jsx`.
- Aturan validasi `photo` dihapus dari `StoreTestimonialRequest` dan `UpdateTestimonialRequest`.
- Logika kompresi, unggah (*Intervention Image*), dan penghapusan *file* fisik dihilangkan dari `TestimonialController.php`.
- Tampilan foto pelanggan (`<img>`) pada tabel `Index.jsx` digantikan dengan ikon *MessageSquare* sebagai representasi statis.

## 3. Logika Backend (*Controller & Form Requests*)
- **`StoreTestimonialRequest` & `UpdateTestimonialRequest`:** Bertugas memvalidasi isian admin (mengharuskan adanya `customer_name`, `content`, `rating` minimal 1 & maksimal 5, serta status `is_active`).
- **`TestimonialController`:** Menyediakan alur *resourceful* untuk merender halaman Inertia dan memproses manipulasi data (menambah, mengubah, maupun menghapus testimoni) secara efisien tanpa pengolahan berkas/file eksternal.

## 4. Antarmuka Panel Admin (React/Inertia)
- **Halaman Tabel (`Index.jsx`):** Menampilkan daftar testimoni dengan bentuk rating berupa 1 hingga 5 ikon bintang secara visual, status aktif/tidak, nama pelanggan, serta opsi *Edit* dan *Hapus*. Kesalahan modul konfirmasi sebelumnya (*ConfirmModal missing*) telah diperbaiki dengan memanfaatkan API native browser `window.confirm`.
- **Halaman Formulir (`Create.jsx` & `Edit.jsx`):** Melampirkan input teks (Nama), *textarea* (Ulasan), *dropdown* statis untuk pemilihan Rating (1-5 Bintang), dan opsi *toggle switch* (Visibilitas web).

## 5. Navigasi Panel Admin
Menu kelola testimoni dapat diakses melalui tombol **Testimoni** yang diletakkan pada bilah navigasi kiri (*Sidebar*) di bawah kategori navigasi **Master Data** (`resources/js/Layouts/AdminLayout.jsx`).

**Status:** Fitur berhasil dibangun, terpasang pada panel admin, bebas *error*, dan telah melalui penyesuaian fungsionalitas visual.
