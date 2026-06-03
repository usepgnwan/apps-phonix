# Design System Phoenix Terapi & Herbal

Sumber acuan: style guide visual Phoenix Terapi & Herbal yang diberikan oleh pemilik project.

Dokumen ini menjadi panduan wajib untuk menjaga konsistensi visual website, admin panel, dan komponen frontend. Semua perubahan UI harus mengikuti arah visual botanical, natural, hangat, profesional, dan mudah dipercaya.

## Brand Direction

Phoenix Terapi & Herbal adalah brand kesehatan natural yang menggabungkan produk herbal, alat terapi, dan layanan konsultasi profesional.

Kesan utama yang harus muncul:

- Alami
- Terpercaya
- Holistik
- Profesional
- Hangat
- Bersih
- Modern

Hindari kesan:

- Terlalu klinis dan dingin
- Terlalu ramai seperti marketplace besar
- Terlalu gelap
- Terlalu playful
- Warna neon atau kontras berlebihan
- Generic AI SaaS look

## Logo Usage

Logo utama menggunakan simbol phoenix dengan elemen daun dan huruf `P`, disertai teks `PHOENIX TERAPI & HERBAL`.

Varian logo:

- Primary: logo hijau di background putih atau sangat terang.
- Reverse: logo putih di background Forest Green.
- Monochrome: hitam/abu gelap untuk kebutuhan satu warna.

Aturan penggunaan:

- Prioritaskan varian primary untuk halaman publik.
- Gunakan varian reverse hanya di area background hijau gelap.
- Jangan mengubah proporsi, warna, spacing, atau bentuk logo.
- Jangan memberi shadow berat, gradient, outline, atau efek 3D pada logo.
- Beri clear space minimal setara tinggi simbol daun kecil di sekitar logo.

Ukuran minimum:

- Digital: minimal 120 px lebar.
- Print: minimal 20 mm lebar.

## Color Palette

Warna merepresentasikan alam, kesehatan, kepercayaan, kehangatan, dan profesionalitas.

### Primary Colors

| Nama | Hex | Penggunaan |
| --- | --- | --- |
| Forest Green | `#1E4D3A` | Primary button, heading accent, navbar, footer, badge utama |
| Sage Green | `#6FA788` | Secondary surface, icon background, soft section accent |
| Mint Green | `#A8C5B3` | Light background, info box, subtle card accent |
| Deep Blue | `#1F3B63` | Kategori alat terapi, trust element, secondary accent |
| Herbal Orange | `#F08A2B` | Promo badge, rating accent, CTA pendukung |
| Earth Brown | `#B57A2E` | Warm accent, natural product highlight |

### Neutral Colors

| Nama | Hex | Penggunaan |
| --- | --- | --- |
| White | `#FFFFFF` | Background utama, card surface |
| Light Gray | `#F6F7F7` | Background section, input background |
| Gray | `#E5E7EB` | Border, divider, disabled state |
| Dark Gray | `#333333` | Body text utama |

### Color Rules

- Forest Green adalah warna utama dan harus paling dominan pada CTA utama.
- Gunakan White dan Light Gray sebagai ruang napas agar layout terasa bersih.
- Gunakan Herbal Orange secara terbatas untuk promo, rating, atau highlight penting.
- Gunakan Deep Blue terutama untuk kategori alat terapi atau elemen trust/professional.
- Jangan memakai warna di luar palette tanpa alasan kuat.
- Jangan membuat gradient warna-warni. Jika butuh gradient, gunakan turunan hijau natural yang sangat halus.

## Typography

Gunakan kombinasi Playfair Display dan Montserrat.

### Playfair Display

Purpose:

- Heading utama
- Judul section penting
- Quote atau tagline
- Elemen yang perlu terlihat elegan, klasik, dan berwibawa

Recommended weight:

- Bold untuk hero headline atau heading besar.
- Regular untuk quote atau headline yang lebih lembut.

### Montserrat

Purpose:

- Body text
- Navigation
- Button
- Label
- Form
- Table/admin UI
- Metadata dan helper text

Recommended weight:

- Regular untuk body text.
- Medium/SemiBold untuk label, menu, card title, dan button.
- Bold hanya untuk emphasis terbatas.

### Type Rules

- Heading besar gunakan Playfair Display.
- Body dan UI control gunakan Montserrat.
- Jangan mencampur terlalu banyak font lain.
- Jaga line-height body agar mudah dibaca.
- Hindari teks uppercase panjang kecuali badge kecil atau label kategori.

## Layout Principles

Visual harus bersih, lapang, dan natural.

Aturan layout:

- Gunakan card putih dengan border abu muda dan radius lembut.
- Gunakan background section `#F6F7F7` atau white.
- Beri whitespace cukup antar section.
- Gunakan dekorasi daun secara halus, bukan sebagai elemen dominan.
- Gunakan shadow sangat lembut atau border tipis, jangan shadow berat.
- Komposisi hero boleh menggabungkan teks, produk herbal, daun, dan CTA.
- Layout mobile harus tetap sederhana, satu kolom, dan tidak padat.

## UI Components

### Button

Primary button:

- Background: `#1E4D3A`
- Text: `#FFFFFF`
- Radius: rounded/full atau rounded besar
- Style: solid, bersih, tanpa shadow berat
- Use case: CTA utama seperti `Beli Sekarang`, `Konsultasi`, `Pesan Layanan`

Secondary button:

- Background: transparent atau white
- Border: `#1E4D3A`
- Text: `#1E4D3A`
- Use case: CTA pendukung seperti `Lihat Detail`, `Pelajari Lebih Lanjut`

Text link:

- Text: `#1E4D3A` atau `#1F3B63`
- Boleh memakai icon arrow kecil.
- Jangan terlihat seperti button penuh.

Button rules:

- Gunakan Montserrat SemiBold.
- Jangan memakai warna orange untuk primary CTA utama kecuali promo khusus.
- Jangan memakai gradient atau efek 3D.

### Badge / Label

Contoh badge:

- `100% Herbal`: Forest Green
- `Alat Terapi`: Deep Blue
- `Service`: Sage/teal green
- `Konsultasi`: Mint/Sage Green
- `Promo`: Herbal Orange
- `Baru`: Deep Blue

Aturan badge:

- Bentuk pill/rounded-full.
- Text kecil, Montserrat SemiBold.
- Gunakan warna solid dengan kontras yang jelas.
- Jangan memakai lebih dari 2-3 badge pada satu card.

### Input Field

Style:

- Background white.
- Border `#E5E7EB`.
- Radius lembut.
- Placeholder gray.
- Focus ring Forest Green atau Sage Green.

Aturan:

- Label harus jelas.
- Error state boleh memakai merah standar yang tidak terlalu neon.
- Select field boleh memakai chevron sederhana.

### Product Card

Struktur card produk:

- Card putih dengan border abu muda.
- Badge kategori di kiri atas jika relevan.
- Icon favorite/wishlist di kanan atas jika fitur tersedia.
- Gambar produk natural dan bersih.
- Nama produk.
- Deskripsi pendek 1-2 baris.
- Harga.
- Primary CTA kecil seperti `Beli Sekarang`.

Aturan:

- Gambar harus terasa natural, herbal, bersih, dan tidak terlalu ramai.
- Gunakan radius lembut.
- Hover boleh menaikkan card sedikit atau mempertegas border, tapi tetap subtle.

### Info Box

Use case:

- `100% Alami & Aman`
- `Konsultasi Profesional`
- Benefit, trust message, atau service highlight.

Style:

- Background Mint Green sangat muda atau Light Gray.
- Icon outline dalam lingkaran Sage/Mint.
- Title Montserrat SemiBold.
- Body kecil, readable.

### Testimonial

Style:

- Card putih dengan border abu muda.
- Quote mark hijau.
- Isi testimoni sebagai body text.
- Rating bintang memakai Herbal Orange.
- Nama dan usia/customer info di bawah.
- Foto customer rounded-full jika tersedia.

Aturan:

- Jangan membuat testimonial terlalu ramai.
- Maksimal tampilkan informasi penting: quote, rating, nama.

## Product and Service Categories

Gunakan kategori utama berikut untuk tampilan publik.

### Produk Herbal

Warna kategori:

- Forest Green

Konten umum:

- Imun & Vitalitas
- Detoks & Pencernaan
- Kesehatan Sendi & Tulang
- Kecantikan Alami

Visual:

- Botol herbal
- Daun hijau
- Bahan natural
- Background terang

### Alat Terapi

Warna kategori:

- Deep Blue

Konten umum:

- Terapi Pijat & Relaksasi
- Terapi Panas & Dingin
- Alat Detoks & Relaksasi
- Aksesoris Terapi

Visual:

- Alat terapi bersih dan modern
- Nuansa profesional
- Background putih/abu terang

### Layanan / Service

Warna kategori:

- Sage Green atau Teal Green

Konten umum:

- Konsultasi Kesehatan
- Terapi & Treatment
- Program Detoks
- Edukasi & Workshop

Visual:

- Konsultasi profesional
- Terapis dan customer
- Ruang terang, hangat, bersih

## Icon Style

Gunakan icon outline dengan ujung membulat, konsisten, dan modern.

Tema icon yang disarankan:

- Herbal/daun
- Alat terapi
- Konsultasi
- Service
- Edukasi
- Garansi/proteksi
- Headset/konsultasi

Aturan:

- Stroke icon konsisten.
- Gunakan warna Forest Green, Sage Green, atau Deep Blue.
- Icon boleh berada dalam lingkaran Mint/Sage muda.
- Jangan mencampur icon filled berat dengan outline dalam satu section.

## Imagery Style

Gaya foto harus natural, bersih, hangat, dan menenangkan.

Gunakan imagery seperti:

- Produk herbal dengan daun, rempah, mortar, atau bahan natural.
- Alat terapi di setting bersih dan modern.
- Proses terapi atau konsultasi yang profesional.
- Daun herbal close-up.
- Aktivitas sehat di alam terbuka.

Aturan imagery:

- Pencahayaan natural dan soft.
- Hindari foto terlalu gelap atau terlalu saturated.
- Hindari image stock yang terlihat palsu/berlebihan.
- Hindari background terlalu ramai.
- Pastikan produk tetap menjadi fokus utama.

## Application Examples

### Website Public

Hero section ideal:

- Headline Playfair Display.
- Subheadline Montserrat.
- CTA primary Forest Green.
- CTA secondary outline.
- Visual produk herbal dan daun.
- Background white atau green-tinted soft.

Section homepage yang disarankan:

- Hero.
- Kategori produk dan layanan.
- Produk unggulan.
- Benefit/info box.
- Testimoni.
- CTA konsultasi WhatsApp.

### Mobile

Aturan mobile:

- Gunakan satu kolom.
- CTA mudah dijangkau.
- Card tidak terlalu padat.
- Typography tetap readable.
- Jangan menampilkan dekorasi daun berlebihan.

### Admin Panel

Admin panel boleh lebih utilitarian, tapi tetap mengikuti brand.

Aturan admin:

- Sidebar/header bisa memakai Forest Green.
- Table dan form gunakan Montserrat.
- Gunakan status badge sesuai palette.
- Prioritaskan readability dan kecepatan input data.
- Jangan membuat admin panel terlalu decorative.

## Tailwind Implementation Notes

Jika menambahkan design token di Tailwind, gunakan nama yang konsisten:

- `forest`: `#1E4D3A`
- `sage`: `#6FA788`
- `mint`: `#A8C5B3`
- `deep-blue`: `#1F3B63`
- `herbal-orange`: `#F08A2B`
- `earth-brown`: `#B57A2E`
- `light-gray`: `#F6F7F7`
- `border-gray`: `#E5E7EB`
- `dark-gray`: `#333333`

Font family recommendation:

- `font-heading`: Playfair Display
- `font-sans`: Montserrat

Jangan mengubah token visual utama tanpa memperbarui dokumen ini.

## AI Implementation Rules

Saat AI membuat atau mengubah UI untuk project ini:

- Baca dokumen ini sebelum mengubah komponen visual.
- Pertahankan botanical, green/earth tone, Playfair Display, dan Montserrat.
- Gunakan Tailwind utility class dan token project jika sudah tersedia.
- Jangan membuat design system baru tanpa permintaan eksplisit.
- Jangan memakai warna acak di luar palette.
- Jangan memakai layout generic SaaS yang tidak sesuai brand herbal.
- Jangan menggunakan inline style kecuali benar-benar diperlukan.
- Jangan menjalankan `npm run build` tanpa izin user, sesuai `AGENTS.md`.
- Untuk halaman publik, prioritaskan kesan natural, terpercaya, dan hangat.
- Untuk admin panel, prioritaskan readability, struktur form/table, dan status badge yang jelas.

## Checklist UI Sebelum Selesai

- Warna mengikuti palette utama.
- Heading menggunakan Playfair Display jika halaman publik/marketing.
- Body, form, dan button menggunakan Montserrat.
- Card memiliki whitespace cukup, border halus, dan radius lembut.
- CTA utama memakai Forest Green.
- Badge/status memakai warna sesuai kategori.
- Imagery terasa natural, bersih, dan profesional.
- Tampilan mobile tidak padat.
- Tidak ada elemen out-of-scope atau visual yang tidak sesuai brand.
