# Perbaikan Isu Submit Penjualan Offline

**Deskripsi Masalah:**
User melaporkan bahwa form pada halaman `admin/offline-sales` tidak bisa disubmit ("ga bisa submit"). Setelah dianalisis, hal ini terjadi karena adanya pesan error validasi (seperti stok tidak mencukupi atau format item tidak valid) yang gagal tertangkap dan ditampilkan pada antarmuka, sehingga error tersebut menjadi _silent failure_ dan proses submit seolah-olah hanya diam di tempat tanpa memberikan petunjuk kepada user.

**Tindakan yang Dilakukan:**
1. Menganalisis alur validasi `StoreOfflineSaleRequest` dan `OfflineSaleService`.
2. Ditemukan bahwa beberapa pesan error dari sisi backend tidak dipetakan ke field input tertentu (contoh: error untuk array `items` atau error pengecekan stok).
3. Menambahkan komponen kotak peringatan (Alert) merah di bagian atas form POS Penjualan pada file `resources/js/Pages/Admin/OfflineSales/Index.jsx`. Alert ini akan muncul secara otomatis jika terdapat satu atau lebih `form.errors` dari Inertia.
4. Menambahkan import `AlertCircle` dari `lucide-react` untuk ikon error.
5. Memastikan semua field lainnya berfungsi normal termasuk sinkronisasi data keranjang (cart) dan form submit.

Dengan perubahan ini, ketika user gagal melakukan submit akibat validasi stok, validasi kuota voucher, atau masalah kelengkapan data cart, user akan dapat melihat peringatan error secara eksplisit dan mengetahui apa yang harus diperbaiki.
