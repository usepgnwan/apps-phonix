# Changelog UI Updates - 25 Juni 2026

Dokumen ini mencatat perubahan tampilan (UI) yang dilakukan pada file `resources/js/Pages/Welcome.jsx` pada sesi ini untuk menyesuaikan desain dengan referensi baru.

## 1. Testimoni ("Kisah Sukses Mereka")
- Mengubah layout *grid* menjadi *horizontal slider* (1 baris) yang dapat digeser (scroll) untuk semua ukuran layar (desktop & mobile).
- Mengatur text agar dapat melakukan *word wrap* secara otomatis tanpa terpotong atau melebar ke samping, dengan lebar masing-masing *card* yang ditetapkan secara spesifik.

## 2. Video Perbandingan
- Mengubah layout kumpulan video (di bawah teks "Geser slider untuk melihat perbandingan sebelum dan sesudah terapi") dari bentuk *grid* menjadi *horizontal slider* (1 baris) dengan *continuous scroll*, menyesuaikan dengan gaya visual slider testimoni.

## 3. Section "Social Proof"
- Mengubah background *section* menjadi gambar *pattern* (`images/pattern/pattern.png`) yang semi-transparan.
- Menyesuaikan *layout* logo `Phoenix Sehat` dan teks judul "Social Proof" (termasuk pengurangan ukuran font dan penyesuaian jarak vertikal) menggunakan *relative positioning*.
- Menghapus ikon latar belakang (*watermark*) material `acupuncture`.
- Membuat bingkai wadah (*device frame*) berwarna putih dengan sudut *chamfer* (dipotong melintang) untuk slider testimoni di sebelah kanan menggunakan properti `clip-path`.
- Mengubah desain tombol panah navigasi menjadi bentuk segitiga oranye yang sesuai dengan *mockup*.
- Mempertahankan *styling* individual gambar testimoni/screenshot agar tetap menggunakan sudut sangat membulat (`rounded-3xl`) dengan *border* putih yang tebal.

## 4. Section "Sering Mengalami Keluhan Ini?"
- Menghapus ikon bawaan *Material Symbols* dan menggantinya dengan gambar custom (`1.png`, `2.png`, `3.png`, dan `4.png`) yang berada di folder `images/keluhan/`.
- Menghapus *background color* berupa lingkaran hijau gelap (`bg-[#1E4D3A]`) dan padding bawaan di wadah ikon, sehingga gambar keluhan ditampilkan secara murni menggunakan `object-contain` dengan `drop-shadow`.
