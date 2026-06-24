# Fitur Manajemen Testimoni Pelanggan

Dokumen ini mencatat pembuatan fitur CRUD (Create, Read, Update, Delete) untuk Testimoni Pelanggan pada panel administrator.

## 1. Perubahan Basis Data & Model
- **Migration:** Membuat berkas `2026_06_16_071701_add_rating_to_testimonials_table.php` yang menambahkan kolom `rating` (tipe `unsignedTinyInteger`, default `5`) pada tabel `testimonials` (terletak setelah kolom `content`).
- **Model:** Mengubah berkas `app/Models/Testimonial.php` dengan menambahkan atribut `rating` ke dalam deklarasi `#[Fillable]`.

## 2. Fitur Unggah Foto (Diaktifkan Kembali)
Berdasarkan instruksi terbaru, foto kembali dibutuhkan untuk ditampilkan pada bagian *Social Proof* di halaman utama.
- **Form Input:** Form input file untuk foto ditambahkan kembali pada halaman `Create.jsx` dan `Edit.jsx`.
- **Validasi:** Aturan validasi `photo` (tipe `image`, maksimal 5MB) ditambahkan kembali pada `StoreTestimonialRequest` dan `UpdateTestimonialRequest`.
- **Pemrosesan Gambar:** Logika kompresi, unggah (*Intervention Image* untuk *resize* otomatis ke lebar 500px dan *quality* 80%), serta penghapusan *file* fisik diimplementasikan kembali di `TestimonialController.php`. Gambar disimpan ke `/public/images/testimonials/`.
- **Tampilan Tabel:** Tampilan foto pelanggan ditampilkan kembali pada tabel `Index.jsx` jika testimoni memiliki foto.
- **Pengecualian Git:** Direktori penyimpanan foto `/public/images/testimonials/*` telah ditambahkan ke `.gitignore` agar tidak di-commit, kecuali `.gitignore` di dalamnya.

## 3. Logika Backend (*Controller & Form Requests*)
- **`StoreTestimonialRequest` & `UpdateTestimonialRequest`:** Bertugas memvalidasi isian admin (mengharuskan adanya `customer_name`, `content`, `rating` minimal 1 & maksimal 5, status `is_active`, dan `photo` bersifat opsional).
- **`TestimonialController`:** Menyediakan alur *resourceful* untuk merender halaman Inertia dan memproses manipulasi data (menambah, mengubah, maupun menghapus testimoni) beserta unggahan foto.

## 4. Antarmuka Panel Admin (React/Inertia)
- **Halaman Tabel (`Index.jsx`):** Menampilkan daftar testimoni dengan bentuk rating berupa 1 hingga 5 ikon bintang, foto pelanggan (jika ada), status aktif/tidak, nama pelanggan, serta opsi *Edit* dan *Hapus*.
- **Halaman Formulir (`Create.jsx` & `Edit.jsx`):** Melampirkan input teks (Nama), *textarea* (Ulasan), unggah dokumen gambar (Foto Opsional), *dropdown* statis untuk pemilihan Rating (1-5 Bintang), dan opsi *toggle switch* (Visibilitas web).

## 5. Implementasi Landing Page (`Welcome.jsx`)
- **Card Teks:** *Card* ulasan di bagian "Kisah Sukses Mereka" dimodifikasi agar **tidak** menampilkan foto (hanya memakai ikon profil *default*) untuk menghindari duplikasi konten visual.
- **Social Proof Slider:** Ditambahkan section baru (*full-page width*) berwarna latar hijau gelap di bawah "Kisah Sukses" yang berfungsi khusus merender foto-foto dari database Testimoni sebagai *carousel* / *slider*. Slider ini dilengkapi dengan tombol navigasi `chevron` oranye di desktop dan mobile.

## 6. Navigasi Panel Admin
Menu kelola testimoni dapat diakses melalui tombol **Testimoni** yang diletakkan pada bilah navigasi kiri (*Sidebar*) di bawah kategori navigasi **Master Data** (`resources/js/Layouts/AdminLayout.jsx`).

**Status:** Fitur unggah foto dan *Social Proof Slider* berhasil dibangun, terpasang pada halaman admin dan publik, serta bebas *error*.
