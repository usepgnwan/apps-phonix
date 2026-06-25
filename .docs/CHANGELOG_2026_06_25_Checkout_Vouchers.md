# Changelog: Pilihan Voucher di Checkout - 25 Juni 2026

Dokumen ini mencatat implementasi fitur voucher publik di halaman Checkout agar semua pengunjung (termasuk *guest*) dapat menggunakan voucher selain tipe khusus member.

## Fitur & Aturan Bisnis
1. **Semua Customer Bisa Pakai Voucher**: Form input voucher di halaman checkout sekarang terbuka untuk semua pembeli, tidak lagi dibatasi hanya untuk member.
2. **Ketersediaan Voucher Sesuai Tipe**:
   - Pembeli *guest* (belum login/tidak punya profil) hanya akan melihat dan dapat menggunakan voucher publik (tipe *selain* `member`).
   - Pembeli *member* dapat melihat dan menggunakan semua jenis voucher (publik maupun khusus `member`).
3. **Pembatasan 1x Pakai per Customer**:
   - Untuk member: Pengecekan limitasi 1x pakai tetap menggunakan tabel `voucher_redemptions` (berdasarkan `customer_profile_id`).
   - Untuk *guest*: Pengecekan limitasi 1x pakai dilakukan dengan mencocokkan Nomor WhatsApp (`customer_whatsapp_number`) pada tabel `orders` yang pernah sukses menggunakan voucher yang sama.

## Perubahan Teknis

### 1. Database Migration
- Menjalankan migrasi `2026_06_25_140600_make_customer_profile_id_nullable_in_voucher_redemptions.php` untuk mengubah kolom `customer_profile_id` menjadi `nullable` pada tabel `voucher_redemptions`, dan menghapus *unique constraint* lamanya. Hal ini memungkinkan sistem mencatat riwayat pemakaian voucher dari *guest* dengan `customer_profile_id` = `null` namun tetap memiliki referensi `order_id` dan `voucher_id`.

### 2. Backend (`App\Http\Controllers\Public\CheckoutController.php` & `App\Services\CheckoutService.php`)
- **CheckoutController@show**: Menambahkan *query* pengambilan daftar `availableVouchers` yang aktif. Query ini secara dinamis akan memfilter `target_audience != 'member'` jika pembeli bukanlah *member*.
- **CheckoutController@validateVoucher**: Meneruskan input `customer_whatsapp_number` ke dalam parameter `previewVoucher`.
- **CheckoutService@resolveVoucher**: 
  - Membuka blokir error (yang awalnya menolak semua transaksi voucher dari *guest*). 
  - Menambahkan pengecekan limitasi pemakaian (*already redeemed*) dengan metode ganda: mencocokkan `customer_profile_id` untuk member, atau mencocokkan `customer_whatsapp_number` dari tabel `Order` untuk guest.

### 3. Frontend (`resources/js/Pages/Public/Checkout/Show.jsx`)
- Memindahkan blok input form "Voucher Belanja" ke kolom kanan ("Ringkasan Pesanan") tepat di bawah teks informasi biaya pengiriman.
- Menghapus kondisional `{customerProfile?.member_status === 'member' ? ...}` yang menutupi blok input voucher.
- Menambahkan validasi proteksi *front-end* yang mewajibkan pengunjung *guest* untuk mengisi "Nomor WhatsApp" terlebih dahulu sebelum menekan tombol "Cek", agar pengecekan *usage limit* di *backend* bisa dieksekusi dengan akurat menggunakan nomor tersebut.
