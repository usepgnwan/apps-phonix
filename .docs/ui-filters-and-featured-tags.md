# Perbaikan Fitur Filter UI dan Tag Unggulan

Dokumen ini mencatat perubahan yang dilakukan untuk memperbaiki filter di katalog serta menampilkan tag Produk & Layanan Unggulan.

## 1. Menampilkan Tag "Unggulan" di Publik
- **Konteks:** Fitur `is_featured` sudah ada dan berfungsi di backend/admin, tapi tidak tertampil di UI (User Interface) halaman publik.
- **Perbaikan:**
  - Menambahkan kolom `is_featured` pada fungsi `get()` query database di `ProductController`, `ServiceController`, dan `HomeController`.
  - Mengubah urutan penampilan di katalog (`orderByDesc('is_featured')`) agar item unggulan tampil di paling atas.
  - Memperbarui komponen `ProductCard` (di `Welcome.jsx` dan `Products/Index.jsx`) serta `ServiceCard` (di `Welcome.jsx` dan `Services/Index.jsx`) untuk memunculkan badge/label bertuliskan "Unggulan" dan ikon Bintang (Lucide React) yang diletakkan menumpuk (*floating*) secara absolut di sudut kanan atas gambar.
  - Menambahkan tag di atas judul pada halaman Detail Produk (`Products/Show.jsx`) dan Detail Layanan (`Services/Show.jsx`).

## 2. Memperbaiki Filter & Toolbar di Katalog
- **Konteks:** Toolbar pencarian, dropdown jumlah tampilan (per page), pengurutan (sort), serta pemilihan kategori produk tidak bisa difilter (tidak mengubah apa-apa saat diklik atau diketik).
- **Perbaikan Frontend:**
  - Di `Products/Index.jsx` dan `Services/Index.jsx`, mengimpor `router` dari `@inertiajs/react`.
  - Mengimplementasikan `useEffect` dengan logika `setTimeout` (debounce 300ms) yang akan memanggil `router.get` secara asinkron (tanpa refresh penuh) dengan tetap mempertahankan *scroll* dan *state* saat ini (`preserveState`, `preserveScroll`).
  - Untuk kategori produk, elemen diubah dari `span` pasif menjadi struktur `button` yang akan mengirimkan filter kategori spesifik saat diklik. Menambahkan fungsi tombol khusus "Semua Kategori" untuk me-reset pilihan.
- **Perbaikan Backend:**
  - Mengubah query dari yang murni statis `paginate(12)` menjadi dinamis di fungsi `index()` pada `ProductController` dan `ServiceController`.
  - Menangani parameter query (`search`, `category` khusus produk, `sort` untuk menyusun berdasarkan nama atau harga terendah/tertinggi, serta parameter `perPage` yang divalidasi ke kelipatan 12, 24, 36).

## 3. Bug Z-Index Dropdown Toolbar
- **Konteks:** Dropdown menu filter ("Show" dan "Sort by") selalu tertutupi oleh list produk (card) yang ada di bawahnya saat terbuka.
- **Perbaikan:**
  - Pada komponen utama Katalog, baik container `section` untuk toolbar maupun `section` daftar produk sama-sama menggunakan `relative z-10`.
  - Nilai kelas Tailwind CSS pada `section` toolbar diubah dari `z-10` menjadi `z-20` agar berada pada layer yang lebih tinggi, sehingga dropdown yang bermodel absolut bisa mekar di atas kartu produk/layanan tanpa terpotong atau terhalang.

**Status:** Selesai. Seluruh katalog produk dan layanan sudah responsif dan terhubung penuh antara frontend dan backend.
