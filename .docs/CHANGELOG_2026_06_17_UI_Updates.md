# Changelog 17 Juni 2026 - UI Updates & Gitignore Fixes

## Perubahan yang Dilakukan:
1. **Welcome.jsx (`resources/js/Pages/Welcome.jsx`)**
   - Memperbarui deskripsi GenQi sesuai dengan permintaan user.
   - Memperbarui daftar poin "Manfaat Terapi GenQi".
   - Menyesuaikan posisi gambar produk GenQi (`genqi_bioscan.jpeg`) menggunakan class `object-[center_20%]` agar bagian atas gambar tidak terlalu terpotong (cropping fix).

2. **Gitignore untuk Upload Produk (`.gitignore` & `public/images/products/.gitignore`)**
   - Menambahkan aturan ignore di file utama `.gitignore` untuk mencegah Git melacak file yang diunggah ke `public/images/products/` sehingga tidak terbaca sebagai *new commit* di server.
   - Membuat file `public/images/products/.gitignore` agar struktur foldernya tetap dipertahankan meski isinya diabaikan.
   - Menghapus tracking Git untuk file gambar contoh lama yang sudah ter-commit sebelumnya.

3. **Admin Services Index (`resources/js/Pages/Admin/Services/Index.jsx`)**
   - Menambahkan fungsi helper `storageImage` agar path gambar bisa diload dari storage.
   - Menampilkan thumbnail/gambar layanan di sebelah kiri judul & deskripsi pada daftar layanan admin.
   - Menambahkan tampilan placeholder jika layanan tidak memiliki gambar.

4. **Public Services Show (`resources/js/Pages/Public/Services/Show.jsx`)**
   - Memperbaiki cropping gambar pada detail layanan publik (contoh: `/services/konsultasi-herbal-dummy`).
   - Mengganti class `h-full min-h-[360px]` menjadi `aspect-[4/3] object-[center_20%]` agar gambar tidak tertarik (stretch) mengikuti panjang teks deskripsi di sebelahnya.
   - Menambahkan class `h-fit` pada card pembungkus gambar agar card tidak menyisakan ruang kosong (white space) berlebih di bagian bawah saat deskripsi teks lebih panjang dari tinggi gambar.
