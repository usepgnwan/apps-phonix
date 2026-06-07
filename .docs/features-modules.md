# Dokumentasi Fitur dan Modul

Dokumen ini merangkum fitur dan modul yang akan dibuat untuk project e-commerce produk dan layanan herbal. Sumber utama dokumen ini adalah proposal pengembangan sistem paket Rp 10 juta.

Tujuan dokumen ini adalah menjadi acuan bersama agar scope development jelas, realistis, dan tidak melebar ke fitur tahap lanjutan.

## Ringkasan Sistem

Sistem yang dibuat adalah website bisnis herbal dengan fitur e-commerce sederhana, booking layanan, admin panel, dan mini CRM untuk aktivitas door-to-door.

Sistem ini belum dibuat sebagai marketplace atau e-commerce full otomatis. Pembayaran, pengiriman, dan verifikasi transaksi masih dilakukan secara manual oleh admin.

## Scope Utama

Modul utama yang masuk scope:

- Website customer
- Katalog produk herbal
- Katalog layanan
- Cart atau keranjang
- Checkout manual rekening/QRIS
- Voucher member
- Pengiriman manual terstruktur
- Admin panel
- Manajemen produk, layanan, dan kategori
- Manajemen order
- Manajemen stok dasar
- Booking layanan
- Customer signup/signin
- Customer dashboard
- Customer dan leads management
- Pemeriksaan internal sederhana
- Rekomendasi produk internal
- Akun karyawan door-to-door
- Field Staff Mini CRM
- Event dan lead source sederhana
- Penjualan offline sederhana
- Dashboard admin
- Laporan dasar
- Pengaturan website dasar
- Upload gambar/media

## Phase Pengerjaan MVP

### Phase 1: Foundation dan Website Customer

Phase ini fokus membuat dasar data dan halaman publik agar bisnis sudah punya website yang bisa dilihat customer.

Modul:

- Website customer
- Katalog produk herbal
- Katalog layanan
- Testimoni
- Pengaturan website dasar
- Upload gambar/media dasar

Fitur website customer:

- Homepage / Beranda
- Halaman Tentang Kami
- Halaman Produk Herbal
- Halaman Detail Produk
- Halaman Layanan
- Halaman Testimoni
- Halaman Kontak
- Tombol WhatsApp untuk konsultasi atau pemesanan cepat

Fitur katalog produk:

- Daftar produk
- Detail produk
- Foto produk
- Nama produk
- Harga produk
- Deskripsi singkat
- Deskripsi lengkap
- Manfaat produk
- Aturan pakai
- Catatan produk
- Kategori produk
- Status aktif/nonaktif produk
- Produk unggulan

Fitur katalog layanan:

- Daftar layanan
- Detail layanan
- Nama layanan
- Deskripsi layanan
- Harga layanan jika ingin ditampilkan
- Tipe layanan: home visit atau office visit
- Status aktif/nonaktif layanan
- Layanan unggulan

Fitur testimoni:

- Daftar testimoni di website
- Nama customer
- Isi testimoni
- Foto customer opsional
- Status aktif/nonaktif testimoni

## Phase 2: Cart, Checkout, Order, dan Stok

Phase ini fokus agar customer bisa memesan produk dari website dan admin bisa mengelola order.

Modul:

- Cart / keranjang
- Checkout manual
- Voucher member
- Pengaturan pembayaran manual
- Pengiriman manual
- Order management
- Manajemen stok dasar

Fitur cart:

- Tambah produk ke keranjang
- Ubah jumlah produk
- Hapus produk dari keranjang
- Lihat ringkasan item
- Hitung subtotal
- Hitung total dasar sebelum ongkir manual
- Validasi stok dasar saat checkout

Fitur checkout manual:

- Customer dapat checkout tanpa daftar akun terlebih dahulu
- Customer yang belum login checkout sebagai guest/non-member
- Form data customer
- Form nomor WhatsApp
- Form alamat pengiriman
- Ringkasan pesanan
- Tampilkan subtotal produk
- Customer member dapat memilih voucher yang tersedia jika voucher masih valid
- Customer non-member tidak dapat melihat atau menggunakan voucher member
- Tampilkan informasi bahwa ongkir akan dikonfirmasi admin
- Order otomatis masuk ke admin panel
- Status awal order: menunggu konfirmasi ongkir
- Instruksi pembayaran final belum ditampilkan sebelum admin mengisi ongkir

Flow checkout manual:

- Customer memilih produk dan checkout
- Jika customer sudah login, order terhubung ke akun customer
- Jika customer belum login, customer dapat lanjut checkout sebagai guest/non-member
- Customer guest wajib mengisi nama, nomor WhatsApp, dan alamat pengiriman
- Customer yang baru daftar tetap otomatis berstatus non-member
- Status member customer hanya dapat diubah oleh admin dari admin panel
- Customer mengisi data penerima dan alamat pengiriman
- Jika customer berstatus member dan memiliki voucher valid, customer dapat memilih voucher sebelum order dibuat
- Sistem membuat order dengan subtotal produk
- Sistem menyimpan diskon voucher jika digunakan
- Order customer login terhubung ke akun customer
- Order guest tetap masuk ke admin panel tanpa wajib akun customer
- Order masuk ke admin panel dengan status menunggu konfirmasi ongkir
- Setelah checkout berhasil, customer diarahkan ke halaman detail pesanan publik dan mendapat nomor order untuk disimpan
- Guest dapat mengecek transaksi ulang memakai kombinasi nomor order dan nomor WhatsApp yang dipakai saat checkout
- Sistem tidak menyediakan pencarian transaksi hanya memakai nomor WhatsApp
- Admin mengecek alamat dan menentukan ongkir manual
- Admin mengisi kurir dan ongkir
- Sistem menghitung total akhir dari subtotal produk + ongkir
- Jika voucher digunakan, sistem menghitung total akhir dari subtotal produk - diskon voucher + ongkir
- Setelah ongkir diisi, order berubah menjadi menunggu pembayaran
- Instruksi pembayaran manual baru ditampilkan atau dikirim ke customer
- Customer membayar total akhir melalui transfer rekening atau QRIS
- Admin memverifikasi pembayaran secara manual

Fitur voucher member:

- Admin dapat membuat voucher
- Admin dapat mengatur kode voucher
- Admin dapat mengatur nama voucher
- Admin dapat mengatur deskripsi voucher
- Admin dapat mengatur tipe diskon: nominal atau persentase
- Admin dapat mengatur nilai diskon
- Admin dapat mengatur minimal belanja jika diperlukan
- Admin dapat mengatur tanggal mulai dan tanggal berakhir voucher
- Admin dapat publish atau unpublish voucher
- Voucher hanya dapat digunakan oleh customer dengan status member
- Customer non-member tidak dapat melihat atau menggunakan voucher member
- Customer member dapat melihat voucher yang sedang dipublish
- Customer member dapat menggunakan voucher saat checkout selama kuota masih tersedia
- Admin dapat membatasi jumlah customer yang boleh menggunakan voucher, misalnya 50 customer
- Satu customer hanya dapat menggunakan voucher yang sama satu kali
- Voucher yang tersedia dapat digunakan saat checkout jika masih valid
- Voucher yang sudah digunakan pada order tidak dapat digunakan ulang oleh customer yang sama
- Admin dapat melihat daftar customer yang sudah menggunakan voucher
- Admin dapat melihat jumlah voucher yang sudah digunakan dan sisa kuota voucher

Flow voucher member:

- Admin membuat voucher dan mengatur limit penggunaan customer
- Admin publish voucher
- Customer dengan status member melihat voucher di dashboard customer
- Saat checkout, customer member memilih voucher yang masih valid dan kuotanya tersedia
- Sistem mencatat penggunaan voucher pada order customer
- Sistem menghitung diskon voucher pada subtotal produk
- Ongkir tetap dikonfirmasi manual oleh admin sebelum pembayaran final
- Setelah order berhasil memakai voucher, voucher customer ditandai sudah digunakan

Fitur pengaturan pembayaran manual:

- Data rekening bank
- Nama bank
- Nomor rekening
- Nama pemilik rekening
- Upload atau atur gambar QRIS
- Instruksi pembayaran
- Status aktif/nonaktif metode pembayaran

Fitur pengiriman manual:

- Input alamat pengiriman dari customer
- Admin input kurir
- Admin input ongkir manual
- Admin input nomor resi
- Admin ubah status pengiriman
- Catatan pengiriman opsional

Fitur order management:

- Daftar order
- Detail order
- Data customer
- Item produk yang dibeli
- Total produk
- Ongkir manual
- Total pembayaran
- Metode pembayaran
- Catatan pembayaran manual
- Konfirmasi ongkir sebelum pembayaran final
- Update status order
- Catat pembayaran diterima
- Catat kurir dan resi

Status order minimal:

- Order baru
- Menunggu konfirmasi ongkir
- Menunggu pembayaran
- Pembayaran diterima
- Diproses
- Dikirim
- Selesai
- Dibatalkan

Fitur stok dasar:

- Input stok produk
- Update stok produk
- Stok berkurang saat order dikonfirmasi atau diproses
- Indikator stok rendah
- Filter produk stok rendah
- Riwayat perubahan stok sederhana jika diperlukan

## Phase 3: Booking Layanan dan Data Customer

Phase ini fokus pada layanan konsultasi/pemeriksaan dan pencatatan data customer.

Modul:

- Booking layanan
- Booking management
- Customer signup/signin
- Customer dashboard
- Customer / leads management
- Lead source management
- Pemeriksaan internal sederhana
- Rekomendasi produk internal

Fitur booking layanan:

- Customer memilih layanan
- Customer wajib login atau daftar akun sebelum booking layanan
- Customer yang baru daftar otomatis berstatus non-member
- Status member customer hanya dapat diubah oleh admin dari admin panel
- Customer mengisi nama
- Customer mengisi nomor WhatsApp
- Customer memilih tipe kunjungan: home visit atau office visit
- Customer mengisi jadwal yang diinginkan
- Customer mengisi keluhan atau catatan awal
- Booking terhubung ke akun customer
- Booking masuk ke admin panel

Status booking minimal:

- Menunggu konfirmasi
- Terkonfirmasi
- Terjadwal
- Selesai
- Dibatalkan

Fitur booking management:

- Daftar booking
- Detail booking
- Update status booking
- Catatan admin
- Filter berdasarkan status
- Filter berdasarkan tanggal
- Hubungkan booking dengan customer atau leads jika relevan

Fitur customer signup/signin:

- Customer dapat membuat akun customer
- Customer yang baru daftar otomatis berstatus non-member
- Customer dapat login ke akun customer
- Customer dapat logout
- Customer dapat mengelola profil dasar
- Customer dapat menyimpan nomor WhatsApp
- Customer dapat menyimpan alamat utama
- Customer tidak wajib login atau daftar akun sebelum checkout produk
- Customer yang checkout tanpa login diproses sebagai guest/non-member
- Status member tidak otomatis dari signup
- Admin dapat mengubah status customer dari non-member menjadi member
- Order dan booking customer login terhubung ke akun customer

Fitur customer dashboard:

- Customer dapat melihat ringkasan profil
- Customer dapat melihat riwayat order
- Customer dapat melihat detail order
- Customer dapat melihat status order
- Customer dapat melihat riwayat booking
- Customer dapat melihat detail booking
- Customer dapat melihat status booking
- Customer dapat melihat hasil pemeriksaan miliknya
- Customer dapat melihat rekomendasi produk dari admin
- Customer member dapat melihat voucher yang tersedia untuk digunakan
- Customer member dapat melihat voucher yang sudah digunakan
- Customer member dapat melihat status voucher: tersedia, sudah digunakan, atau expired
- Customer dapat mengubah data profil dasar

Fitur customer/leads management:

- Data customer/leads
- Nama
- Nomor WhatsApp
- Alamat
- Sumber lead
- Minat produk
- Minat layanan
- Keluhan awal
- Status follow-up
- Catatan internal
- Riwayat order
- Riwayat booking
- Riwayat follow-up

Sumber lead minimal:

- Website
- WhatsApp
- Door-to-door
- Event
- Koperasi
- Referral
- Customer lama

Fitur pemeriksaan internal sederhana:

- Catat keluhan customer
- Catat hasil pemeriksaan
- Catat ringkasan pemeriksaan
- Catat rekomendasi internal
- Simpan ke detail customer
- Riwayat pemeriksaan per customer
- Hasil pemeriksaan dapat ditampilkan di dashboard customer member

Fitur rekomendasi produk internal:

- Pilih customer
- Pilih produk yang direkomendasikan
- Tambah catatan rekomendasi
- Lihat rekomendasi di detail customer
- Rekomendasi dapat ditampilkan di dashboard customer member

## Phase 4: Field Staff Mini CRM dan Operasional Lapangan

Phase ini fokus pada karyawan door-to-door, leads lapangan, dan penjualan offline sederhana.

Modul:

- Role dan user management dasar
- Akun karyawan door-to-door
- Field Staff Mini CRM
- Event management sederhana
- Penjualan offline sederhana

Role minimal:

- Admin
- Karyawan door-to-door / field staff

Fitur role dan user management:

- Login admin
- Login karyawan
- Admin mengelola user karyawan
- Batasi akses berdasarkan role
- Karyawan hanya melihat leads miliknya
- Admin melihat semua data

Fitur akun karyawan door-to-door:

- Karyawan login
- Karyawan input calon customer
- Karyawan input kunjungan
- Karyawan input keluhan/minat customer
- Karyawan update status follow-up
- Karyawan melihat leads miliknya

Status follow-up minimal:

- Baru
- Tertarik
- Perlu follow-up
- Booking pemeriksaan
- Sudah beli
- Tidak tertarik

Fitur Field Staff Mini CRM:

- Daftar leads per karyawan
- Riwayat follow-up
- Catatan kunjungan
- Produk yang diminati customer
- Input penjualan offline sederhana
- Sumber otomatis bisa ditandai door-to-door
- Admin melihat aktivitas dasar karyawan

Fitur event management sederhana:

- Nama event
- Tanggal event
- Lokasi event
- Instansi/penyelenggara
- Catatan event
- Leads yang berasal dari event

Fitur penjualan offline sederhana:

- Input customer
- Input produk
- Input quantity
- Input total transaksi
- Input staff terkait jika ada
- Tandai source sebagai offline, door-to-door, atau event
- Masuk ke laporan dasar

## Phase 5: Dashboard dan Laporan Dasar

Phase ini fokus pada ringkasan operasional untuk admin.

Modul:

- Dashboard admin
- Laporan dasar

Fitur dashboard admin:

- Jumlah produk
- Jumlah layanan
- Jumlah leads
- Jumlah booking
- Jumlah order
- Jumlah aktivitas door-to-door
- Produk stok rendah
- Order terbaru
- Booking terbaru
- Leads terbaru

Fitur laporan dasar:

- Leads berdasarkan sumber
- Leads berdasarkan karyawan
- Booking layanan
- Order website
- Order manual/offline
- Produk sering diminati
- Aktivitas door-to-door dasar
- Penjualan offline sederhana

## Batasan Scope

Fitur berikut tidak dibuat pada tahap ini dan dianggap sebagai pengembangan lanjutan:

- Payment gateway otomatis
- Ongkir otomatis via API
- Upload file pemeriksaan oleh customer
- Multi-cabang penuh
- Stok per cabang
- Stok per petugas
- Komisi otomatis
- GPS tracking
- Route planning
- Absensi petugas
- QR code event
- WhatsApp Business API
- Import Excel/CSV
- Laporan advanced

## Catatan Implementasi

- Scope harus dijaga tetap basic sesuai proposal paket Rp 10 juta.
- Admin panel tidak perlu dibuat terlalu kompleks pada tahap awal.
- Checkout cukup manual, tanpa payment gateway.
- Ongkir cukup diinput manual oleh admin.
- CRM cukup mencatat leads, follow-up, dan aktivitas dasar.
- Customer dashboard masuk scope karena project memakai konsep member dan non-member.
- Laporan cukup berupa tabel atau ringkasan sederhana, belum perlu grafik advanced.
- Jika ada permintaan fitur di luar batasan scope, catat sebagai fitur tahap lanjutan.
