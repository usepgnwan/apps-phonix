# Changelog: Video CRUD, SEO, Sitemap, dan Pengaturan Alamat (13 Juni 2026)

Dokumen ini mencatat seluruh perubahan teknis dan fungsionalitas yang ditambahkan ke dalam sistem Phoenix Apps pada hari ini.

## 1. Fitur Video Terapi ("Bukti Nyata Terapi Kami")

- **Database & Model**:
  - Dibuat migration untuk tabel `videos` dengan kolom: `title` (string), `video_link` (string/url), dan `is_pinned` (boolean).
  - Dibuat model `App\Models\Video` dengan pengaturan `$fillable` yang mencakup kolom-kolom di atas.
- **Backend (Admin)**:
  - Dibuat `Admin\VideoController` untuk menangani CRUD.
  - Didaftarkan route resource `admin.videos` pada `routes/web.php`.
  - Ditambahkan menu navigasi "Video" (dengan ikon `Video` dari lucide-react) pada bagian **Master Data** di `AdminLayout.jsx`.
- **Frontend (Admin Panel)**:
  - Dibuat halaman `Index.jsx` yang menampilkan daftar video, status "pinned" (Ya/Tidak), serta aksi edit/hapus.
  - Dibuat halaman `Create.jsx` dan `Edit.jsx` dengan validasi form dan opsi checkbox "Sematkan (Pin)".
- **Frontend (Public/Welcome)**:
  - Diperbarui `HomeController.php` untuk mengambil 8 data video secara acak yang berstatus `is_pinned = true`.
  - Diperbarui `Welcome.jsx` untuk merender video tersebut pada grid bagian "Bukti Nyata Terapi Kami".
  - Dibuat komponen `DynamicVideoPlayer` yang mampu menampilkan `<iframe youtube>` jika URL berasal dari YouTube, dan elemen `<video>` biasa untuk file MP4.
  - Dinonaktifkan fitur `autoPlay`, `loop`, dan `muted` pada video samping (Before/After) serta ditambahkan `controls` dan `preload="none"` untuk menghemat bandwidth server sesuai instruksi pengguna.

## 2. Optimasi SEO (Search Engine Optimization)

- **Meta Tags (Welcome.jsx)**:
  - Menambahkan komponen `<Head>` dari Inertia di `Welcome.jsx` dengan pengaturan khusus:
    - **Title**: `Phoenix Terapi & Herbal | Layanan Bio Elektrik & Obat Herbal Bandung`
    - **Description**: `Phoenix Terapi & Herbal memberikan layanan bio elektrik dan obat herbal murah di Bandung. Deteksi akurat, terapi tepat sasaran menggunakan terapi GenQi.`
    - **Keywords**: `phoenix layanan bio electrik, obat herbal, Deteksi Akurat, Terapi Tepat Sasaran terapi genqi, obat herbal bandung, obat herbal murah dibandung`
- **Sitemap Dinamis**:
  - Dibuat `App\Http\Controllers\Public\SitemapController` yang mengambil data dinamis `Product` dan `Service` yang berstatus aktif.
  - Dibuat `resources/views/sitemap.blade.php` untuk output struktur XML yang sesuai standar sitemap.
  - Didaftarkan route GET `/sitemap.xml` di `routes/web.php`.
- **Robots.txt**:
  - Dibuat file statis `public/robots.txt` yang mengizinkan (`Allow: /`) seluruh rayapan crawler ke halaman publik dan memberikan path ke Sitemap, sekaligus melarang (`Disallow`) rayapan ke halaman sensitif (`/admin/`, `/customer/`, `/field/`, `/api/`).

## 3. Fitur Pengaturan Alamat (Settings)

- **Backend**:
  - Diperbarui `SettingController.php` dengan menambahkan validasi field `alamat` sebagai `nullable|string`.
  - Karena sistem menggunakan iterasi *key-value* `Setting::updateOrCreate`, alamat otomatis disimpan dan dipanggil tanpa perlu mengubah skema database.
- **Frontend (Admin Panel)**:
  - Diperbarui halaman `Admin/Settings/Index.jsx` dengan menambahkan komponen form `textarea` untuk field "Alamat Klinik / Perusahaan".
- **Frontend (Public/Welcome)**:
  - Diperbarui middleware `HandleInertiaRequests.php` untuk melampirkan data `siteSettings.alamat` secara global ke dalam properties Inertia.
  - Diperbarui bagian "Konsultasi Gratis" / CTA (Call to Action) pada `Welcome.jsx` untuk menampilkan text alamat lengkap dengan ikon lokasi `location_on` jika pengaturan alamat tersebut sudah diisi di panel admin.

## 4. Penambahan Menu "Cek Pesanan"

- **Frontend (Navbar)**:
  - Diperbarui komponen navigasi pada `Welcome.jsx` (Desktop dan Mobile Dropdown) untuk menambahkan tautan baru "Cek Pesanan".
  - Diperbarui komponen navigasi pada `commerce.jsx` (halaman produk dan keranjang) dengan tautan "Cek Pesanan".
  - Tautan mengarah ke route `orders.lookup.create` (`/orders/lookup`).

## 5. Pembaruan Template Struk/Pesanan

- **Backend (`CheckoutService.php`)**:
  - Memperbarui fungsi parser tag dinamis untuk mengenali variabel baru `[whatsapp]` dan `[email]`.
  - Mengonversi data `customer_whatsapp_number` dan `customer_email` dari model pesanan ke dalam template struk.
- **Frontend (Admin Panel)**:
  - Mengubah *default order template* yang dirender di halaman pengaturan (`Index.jsx`) agar memuat struktur baru sesuai dengan kebutuhan (menampilkan no whatsapps dan email).
  - Menyesuaikan instruksi panduan penggunaan tag dinamis agar memasukkan elemen `[whatsapp]` dan `[email]`.
- **Database**:
  - Menjalankan migrasi manual untuk menimpa format template struk default di database agar sistem otomatis memuat *layout* baru tersebut.
