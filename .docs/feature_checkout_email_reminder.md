# Dokumentasi Fitur: Pengiriman Email Receipt Saat Checkout

**Tanggal:** 11 Juni 2026
**Deskripsi:** Sistem akan otomatis mengirimkan email receipt/struk ke alamat email yang dikonfigurasi di menu "Sistem > Pengaturan" (kolom "Email Tujuan Receipt") setelah pelanggan berhasil melakukan checkout di halaman publik.

## 1. Konfigurasi SMTP (`.env`)

Konfigurasi `.env` telah diupdate untuk menggunakan akun SMTP Gmail yang diberikan (`kuskusprogram@gmail.com`). 
*Catatan: Password email perlu dimasukkan secara manual ke dalam `.env` demi keamanan.*

## 2. Kelas Mailable

Dibuat mailable baru `App\Mail\OrderReceiptMail`. Mailable ini dirancang untuk menerima raw string HTML sebagai body, karena HTML tersebut digenerate secara dinamis dari template yang disimpan di pengaturan (quill editor).

## 3. Integrasi di CheckoutService

Modifikasi dilakukan pada `App\Services\CheckoutService` method `checkout()`:
1. Setelah data order tersimpan, sistem mengambil dua pengaturan dari database (`receipt_email` dan `order_template`).
2. Jika keduanya ada, sistem merakit tag dinamis ke data sebenarnya:
   - `[order]` -> Nomor Nota
   - `[tanggal]` -> Tanggal dan waktu checkout
   - `[nama]` -> Nama pelanggan (atau 'Umum')
   - `[kasir]` -> Menjadi 'Sistem'
   - `[items]` -> Di-render menjadi format tabel HTML berisi nama barang, qty, harga satuan, dan total
   - `[total]` -> Total harga
3. Mengirimkan email melalui `Mail::to()->send()` di dalam blok `try...catch` agar apabila terjadi error pada SMTP, proses checkout pelanggan tidak gagal/terputus.
