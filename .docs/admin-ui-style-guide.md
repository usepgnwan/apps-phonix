# Admin UI Style Guide Phoenix Terapi & Herbal

Dokumen ini adalah turunan praktis dari `.docs/DESIGN.md` untuk semua UI admin panel Phoenix Terapi & Herbal. Gunakan dokumen ini bersama `.docs/system-flow.md` saat membuat layout, dashboard, table, form, dan halaman CRUD admin.

Tujuan utama:

- menjaga semua halaman admin konsisten walaupun dikerjakan bertahap,
- menghindari tampilan generic SaaS,
- mempertahankan karakter botanical, natural, hangat, profesional,
- membuat pola komponen reusable agar halaman admin cepat dibangun.

Referensi struktur admin panel eksternal yang sudah dicek:

- sidebar kiri fixed di desktop,
- topbar sticky,
- grouped navigation,
- dashboard metric cards,
- table page dengan search, filter tabs, date filter, page-size selector, empty state, dan pagination,
- card grid untuk data katalog seperti paket/produk/layanan.

Warna, typography, dan brand tetap mengikuti Phoenix, bukan warna referensi eksternal.

## Prinsip Visual Admin

Admin panel harus terasa:

- bersih,
- mudah discan,
- tidak ramai,
- profesional,
- natural dan hangat,
- cukup compact untuk data operasional tetapi tetap punya whitespace.

Hindari:

- background gelap sebagai default admin,
- warna orange dominan,
- gradient warna-warni,
- shadow berat,
- card terlalu padat,
- terlalu banyak border tebal,
- animasi berlebihan,
- gaya generic AI dashboard dengan purple/blue neon.

## Palette Admin

Gunakan palette dari `.docs/DESIGN.md` dengan aturan admin berikut.

| Token | Hex | Penggunaan Admin |
| --- | --- | --- |
| Forest Green | `#1E4D3A` | active nav, primary button, primary badge, focus ring, selected tab |
| Sage Green | `#6FA788` | soft icon background, secondary badge, hover surface, success-soft accent |
| Mint Green | `#A8C5B3` | subtle panel accent, info box, light success background |
| Deep Blue | `#1F3B63` | trust/professional badge, report badge, secondary action |
| Herbal Orange | `#F08A2B` | warning, low stock, promo/voucher highlight, attention badge only |
| Earth Brown | `#B57A2E` | natural product highlight, warm secondary accent |
| White | `#FFFFFF` | main card surface, table surface, topbar/sidebar surface |
| Light Gray | `#F6F7F7` | page background, input background, subtle section background |
| Gray | `#E5E7EB` | border, divider, disabled state |
| Dark Gray | `#333333` | primary body text |

Rules:

- Forest Green adalah warna utama admin.
- Herbal Orange hanya untuk warning, low stock, promo, atau highlight yang perlu perhatian.
- Status positif boleh memakai Forest/Sage.
- Deep Blue dipakai untuk status informatif/profesional, bukan sebagai primary CTA.
- Background admin utama pakai `#F6F7F7`.
- Card, table, form panel pakai white dengan border abu muda.

## Typography Admin

Gunakan Montserrat untuk hampir seluruh admin UI:

- sidebar navigation,
- topbar,
- table,
- form,
- label,
- badge,
- button,
- metadata,
- helper text.

Playfair Display boleh dipakai terbatas untuk:

- heading besar pada public/customer page,
- bukan default untuk admin table atau dashboard.

Admin heading rules:

- Page eyebrow: uppercase kecil, Montserrat Bold, letter spacing halus.
- Page title: Montserrat Bold/ExtraBold, 24-30px desktop, 22-24px mobile.
- Section title: Montserrat Bold, 16-20px.
- Card metric value: Montserrat ExtraBold, 24-32px.
- Table header: uppercase kecil, Montserrat Bold, warna gray/dark gray.

Jangan gunakan uppercase panjang untuk paragraf. Uppercase hanya untuk label kecil seperti `ADMIN PANEL`, `STATUS`, `TOTAL ORDER`, `AKSI`.

## Admin Layout Shell

### Struktur Desktop

Layout dasar:

- sidebar fixed kiri,
- topbar sticky di atas konten,
- main content scrollable,
- background main `#F6F7F7`,
- content wrapper `max-w-7xl` untuk halaman data biasa,
- padding desktop `px-6` sampai `px-8`, mobile `px-4`.

Sidebar desktop:

- width normal sekitar 280px.
- surface white.
- border kanan `#E5E7EB`.
- logo/brand di bagian atas.
- navigation scrollable.
- user mini profile di bawah jika tersedia.

Topbar:

- sticky top-0.
- background white dengan opacity solid, bukan glass berat.
- border bawah halus.
- tombol collapse sidebar di desktop.
- tombol open drawer di mobile.
- kanan: notification placeholder dan user menu.

### Struktur Mobile

Mobile admin harus:

- memakai drawer/sidebar overlay,
- menutup drawer saat nav item diklik,
- menjaga table dalam `overflow-x-auto`,
- stack filter controls menjadi satu kolom,
- menjaga tombol utama mudah dijangkau.

Jangan memaksa table menjadi card jika datanya kompleks, kecuali halaman memang dirancang sebagai card grid.

## Sidebar Navigation

Kelompok menu admin Phoenix:

### Utama

- Dashboard
- Reports

### Commerce

- Orders
- Vouchers
- Payment Methods
- Offline Sales

### Booking & Customer

- Bookings
- Customers
- Examinations

### Catalog

- Products
- Product Categories
- Services

### CRM & Field

- Leads
- Lead Sources
- Events
- Field Staff

### System

- Website Settings jika nanti dibuat UI-nya
- Profile/Account jika dibutuhkan

Nav item rules:

- Active item: background Forest Green, text white.
- Hover item: background Mint/Sage sangat muda, text Forest Green.
- Inactive item: text gray/dark gray.
- Group label: uppercase kecil, gray, semibold/bold.
- Icon boleh outline sederhana, satu ukuran konsisten.
- Jangan pakai lebih dari satu accent warna untuk active nav.

## Page Header Pattern

Semua halaman admin memakai header standar:

```text
EYEBROW / SECTION
Page Title
Short description if needed
[Primary action button]
```

Contoh:

```text
COMMERCE / ORDERS
Kelola Order
Konfirmasi ongkir, verifikasi pembayaran, dan proses fulfillment stok.
[Tambah/manual action jika ada]
```

Rules:

- Eyebrow uppercase kecil, warna Forest Green atau gray.
- Title besar dan jelas.
- Description maksimal 1 baris pendek di desktop, 2 baris di mobile.
- Primary action berada kanan pada desktop, bawah title pada mobile.

## Cards

### Base Card

Gunakan base card untuk dashboard, form, dan panel table:

- background white,
- border `#E5E7EB`,
- radius `rounded-2xl` atau `rounded-3xl`,
- shadow sangat lembut atau tanpa shadow,
- padding `p-5` sampai `p-6`,
- spacing antar card `gap-4` sampai `gap-6`.

Jangan pakai shadow tebal. Jika butuh emphasis, gunakan border Forest/Sage tipis atau background Mint sangat muda.

### Metric Card

Struktur metric card:

- label uppercase kecil,
- value besar,
- helper text kecil,
- icon optional di kanan atas dalam lingkaran Sage/Mint.

Contoh metric admin Phoenix:

- Total Orders
- Waiting Payment
- Payment Received
- Processing
- Low Stock Products
- Offline Sales Revenue

Rules:

- Value harus paling dominan.
- Label tidak boleh terlalu panjang.
- Low stock memakai Herbal Orange secara terbatas.
- Positive/safe status memakai Sage/Forest.

### Catalog Card

Gunakan untuk products/services jika table terasa terlalu padat.

Struktur:

- image placeholder atau thumbnail jika ada,
- title,
- category/service type,
- short description 1-2 baris,
- price,
- stock/status badges,
- action buttons atau dropdown.

Rules:

- Produk low stock harus mudah terlihat.
- Jangan menampilkan terlalu banyak metadata dalam satu card.
- Card grid desktop 2-3 kolom, mobile 1 kolom.

## Table Pattern

Gunakan table untuk data operasional:

- orders,
- bookings,
- customers,
- leads,
- vouchers,
- payment methods,
- events,
- offline sales,
- examinations.

### Table Container

Struktur:

- card/panel putih,
- toolbar filter di atas,
- `overflow-x-auto`,
- table width full,
- header row background Light Gray atau transparent dengan divider bawah,
- body rows divide-y `#E5E7EB`.

### Table Header

Rules:

- uppercase kecil,
- Montserrat Bold,
- warna gray/dark gray,
- padding cukup: `px-4 py-3`,
- kolom action rata kanan.

### Table Row

Rules:

- row hover background Light Gray sangat halus,
- primary text semibold,
- secondary metadata kecil gray,
- row height tidak terlalu kecil,
- action icons/tombol konsisten.

### Empty State

Jika data kosong:

- tampilkan pesan di tengah table/card,
- contoh: `Belum ada order ditemukan.`
- optional secondary text: `Coba ubah filter atau tambah data baru.`
- jangan tampilkan halaman kosong tanpa konteks.

### Action Column

Gunakan satu pola konsisten:

- primary view/detail: text link Forest Green atau icon button,
- edit: secondary subtle,
- destructive delete: merah standar, hanya jika memang ada delete,
- jika action banyak, pakai dropdown menu.

Jangan menaruh banyak button solid dalam satu row.

## Filter, Search, dan Pagination

### Filter Tabs

Gunakan filter tabs dengan counter untuk status-heavy pages.

Cocok untuk:

- Orders,
- Bookings,
- Leads,
- Vouchers,
- Offline Sales.

Pola:

```text
Semua 24 | Menunggu Ongkir 5 | Menunggu Pembayaran 3 | Diproses 8 | Selesai 6 | Batal 2
```

Rules:

- Active tab: Forest Green background, white text.
- Inactive tab: white/Light Gray background, gray text.
- Counter kecil berbentuk pill.
- Mobile: horizontal scroll.

### Search Input

Search input diletakkan di toolbar table.

Placeholder harus spesifik:

- Orders: `Cari nomor order, nama, atau WhatsApp...`
- Products: `Cari produk atau kategori...`
- Customers: `Cari nama atau WhatsApp...`
- Leads: `Cari lead, sumber, atau staff...`

Style:

- background white atau Light Gray,
- border `#E5E7EB`,
- focus ring Forest Green,
- icon search optional.

### Select Filter

Select filter dipakai untuk:

- status,
- kategori,
- staff,
- service,
- source,
- page size.

Rules:

- label jelas jika filter tidak self-explanatory,
- mobile stack vertical,
- desktop inline.

### Date Range

Untuk order/report/event:

- gunakan dua input date: start dan end,
- label `Filter tanggal`,
- separator sederhana `-`,
- jangan default terlalu rumit.

### Pagination

Pagination pattern:

- page-size selector di toolbar atau bawah table:
  - `10 / PAGE`,
  - `25 / PAGE`,
  - `50 / PAGE`.
- total count label:
  - `TOTAL 24 ORDER`,
  - `TOTAL 15 PRODUK`.
- pagination bawah:
  - `Previous`,
  - angka halaman,
  - `Next`.

Rules:

- Active page memakai Forest Green.
- Disabled state memakai gray.
- Jika backend belum mendukung filter/pagination tertentu, jangan buat UI filter palsu yang tidak berfungsi.

## Form Pattern

Gunakan form layout konsisten untuk create/edit:

- card putih,
- sectioned fields,
- label jelas,
- helper text kecil jika perlu,
- error message langsung di bawah field,
- sticky action bar optional untuk form panjang.

### Form Layout

Desktop:

- field sederhana: satu kolom dalam card,
- data detail: dua kolom jika field pendek,
- textarea/full description: full width.

Mobile:

- semua field satu kolom.

### Form Sections

Contoh sections:

- Informasi Utama,
- Harga dan Stok,
- Status Publikasi,
- Relasi dan Catatan,
- Metadata Internal.

### Form Buttons

- Primary submit: Forest Green background, white text.
- Secondary cancel/back: white/transparent with Forest Green border/text.
- Destructive: merah standar, hanya untuk delete/cancel irreversible.

Jangan memakai orange untuk primary submit.

## Badge dan Status Mapping

Badge harus berbentuk pill, text kecil, Montserrat SemiBold/Bold.

### Order Status

| Status | Label UI | Warna |
| --- | --- | --- |
| `waiting_shipping_confirmation` | Menunggu Ongkir | Herbal Orange soft |
| `waiting_payment` | Menunggu Pembayaran | Earth Brown soft |
| `payment_received` | Pembayaran Diterima | Deep Blue soft |
| `processing` | Diproses | Sage Green soft |
| `shipped` | Dikirim | Deep Blue soft |
| `completed` | Selesai | Forest Green soft |
| `cancelled` | Batal | Red soft |

### Shipping Status

| Status | Label UI | Warna |
| --- | --- | --- |
| `pending_shipping_confirmation` | Menunggu Konfirmasi | Herbal Orange soft |
| `shipping_cost_confirmed` | Ongkir Dikonfirmasi | Earth Brown soft |
| `ready_to_ship` | Siap Kirim | Sage Green soft |
| `shipped` | Dikirim | Deep Blue soft |
| `delivered` | Terkirim | Forest Green soft |
| `cancelled` | Batal | Red soft |

### Payment Status

| Status | Label UI | Warna |
| --- | --- | --- |
| `pending` | Pending | Gray soft |
| `waiting_payment` | Menunggu Bayar | Earth Brown soft |
| `paid` | Lunas | Forest Green soft |
| `cancelled` | Batal | Red soft |

### Booking Status

| Status | Label UI | Warna |
| --- | --- | --- |
| `waiting_confirmation` | Menunggu Konfirmasi | Herbal Orange soft |
| `confirmed` | Dikonfirmasi | Deep Blue soft |
| `completed` | Selesai | Forest Green soft |
| `cancelled` | Batal | Red soft |

### Lead Status

| Status | Label UI | Warna |
| --- | --- | --- |
| `new` | Baru | Deep Blue soft |
| `interested` | Tertarik | Sage Green soft |
| `needs_follow_up` | Perlu Follow Up | Herbal Orange soft |
| `booking_examination` | Booking Pemeriksaan | Earth Brown soft |
| `purchased` | Membeli | Forest Green soft |
| `not_interested` | Tidak Tertarik | Gray soft |

### Common Badges

- Active: Forest Green soft.
- Inactive: Gray soft.
- Featured: Sage/Mint soft.
- Low Stock: Herbal Orange soft.
- Member: Forest Green soft.
- Non-member: Gray soft.
- Published: Forest Green soft.
- Unpublished: Gray soft.

Soft badge style berarti background sangat muda, text warna solid, border optional tipis.

## Buttons dan Actions

### Primary Button

- background Forest Green,
- text white,
- rounded-full atau rounded-xl,
- Montserrat SemiBold,
- hover sedikit lebih gelap,
- focus ring Sage/Forest.

Use case:

- Tambah Produk,
- Simpan,
- Konfirmasi,
- Proses Order.

### Secondary Button

- background white atau transparent,
- border Forest Green,
- text Forest Green.

Use case:

- Kembali,
- Batal,
- Lihat Detail,
- Reset Filter.

### Subtle Button

- background Light Gray,
- text Dark Gray/Forest,
- border optional.

Use case:

- toolbar action,
- table row secondary action.

### Destructive Button

- red standard, not neon,
- confirmation required for delete/cancel destructive actions.

## Admin Dashboard Pattern

Dashboard admin Phoenix harus mengutamakan operational clarity.

Recommended sections:

1. Page header:
   - `ADMIN PANEL`,
   - `Dashboard`,
   - short description.
2. Summary metric grid:
   - Products,
   - Services,
   - Orders,
   - Bookings,
   - Leads,
   - Customer Profiles,
   - Offline Sales,
   - Examinations.
3. Commerce snapshot:
   - recent orders,
   - low stock products.
4. Customer/service snapshot:
   - recent bookings,
   - recent leads.
5. Report cards:
   - revenue summary,
   - status distribution,
   - recommendation/product interest summary.

Do not add fake charts if backend does not provide chart data. A clean empty/summary state is better.

## Page-Specific Patterns

### Admin Orders

Use table page.

Header:

- Eyebrow: `COMMERCE / ORDERS`
- Title: `Kelola Order`
- Description: `Konfirmasi ongkir, verifikasi pembayaran, dan proses fulfillment stok.`

Recommended columns:

- Order,
- Customer,
- Total,
- Shipping,
- Payment,
- Status,
- Created,
- Aksi.

Use filter tabs by order status.

### Admin Products

Prefer card grid for catalog overview, table for compact mode if needed.

Recommended product card info:

- image/placeholder,
- product name,
- category,
- price,
- stock quantity,
- active/featured/low-stock badges,
- action menu.

### Admin Services

Use card grid or table.

Recommended info:

- service name,
- visit type,
- price,
- active/featured badge,
- action menu.

### Admin Customers

Use table page.

Recommended columns:

- Customer,
- WhatsApp,
- Member Status,
- Orders/Bookings summary if available,
- Aksi.

Use avatar initial for customer rows.

### Admin Leads

Use table page with filter tabs.

Recommended columns:

- Lead,
- Source,
- Assigned Staff,
- Follow-up Status,
- Latest Activity if available,
- Aksi.

### Admin Offline Sales

Use table page.

Recommended columns:

- Sale Number,
- Customer,
- Source,
- Field Staff/Event,
- Total,
- Sold At,
- Aksi.

### Admin Examinations

Use table page.

Recommended columns:

- Customer,
- Booking,
- Summary/Complaint snippet,
- Recommendations count,
- Created By,
- Created At,
- Aksi.

## Empty, Loading, dan Error State

### Empty State

Rules:

- Selalu tampilkan pesan jelas.
- Tambahkan CTA jika resource bisa dibuat.
- Jangan tampilkan table kosong tanpa pesan.

Examples:

- `Belum ada produk.`
- `Belum ada order dengan status ini.`
- `Belum ada lead yang ditugaskan.`

### Loading State

Jika memakai client-side loading:

- gunakan skeleton card/table sederhana,
- warna Light Gray/Mint sangat muda,
- hindari spinner besar di semua tempat.

### Error State

- Error form dekat field terkait.
- Error page/action memakai alert card putih/soft red.
- Jangan memakai alert neon.

## Responsive Rules

Desktop:

- sidebar fixed,
- content max width,
- filter toolbar inline,
- table horizontal scroll jika kolom banyak.

Tablet:

- sidebar boleh tetap fixed jika cukup ruang,
- grid card 2 kolom,
- toolbar wrap.

Mobile:

- sidebar drawer,
- metric cards 1 kolom,
- catalog cards 1 kolom,
- filter controls stack,
- table `overflow-x-auto`,
- primary action full width jika perlu.

## Reusable Component Target

Saat mulai implementasi UI admin, prioritaskan komponen reusable berikut:

- `AdminLayout`
- `AdminSidebar`
- `AdminTopbar`
- `AdminPageHeader`
- `AdminCard`
- `MetricCard`
- `StatusBadge`
- `AdminTable`
- `TableToolbar`
- `FilterTabs`
- `PaginationControls`
- `EmptyState`
- `FormSection`
- `InputLabel/Error` wrapper jika belum cukup dari Breeze components.

Jangan membuat komponen terlalu abstrak sebelum dipakai minimal dua halaman. Namun layout, badge, card, dan page header sebaiknya dibuat reusable sejak awal.

## Do and Don't

### Do

- Gunakan Forest Green untuk active dan primary action.
- Gunakan whitespace cukup.
- Gunakan table untuk data operasional.
- Gunakan card grid untuk catalog yang lebih visual.
- Gunakan badge status konsisten.
- Gunakan empty state yang jelas.
- Ikuti flow di `.docs/system-flow.md`.
- Jika data backend belum tersedia, jangan mengarang data palsu di UI production.

### Don't

- Jangan mengganti design system Phoenix.
- Jangan membuat admin panel dark-mode default.
- Jangan memakai orange sebagai warna utama.
- Jangan membuat filter UI yang tidak terhubung ke backend kecuali jelas sebagai placeholder nonaktif.
- Jangan membuat chart palsu tanpa data.
- Jangan menambahkan dependency UI baru tanpa kebutuhan kuat.
- Jangan membuat UI terlalu ramai seperti marketplace.
- Jangan memakai inline style kecuali benar-benar tidak bisa dihindari.

## Batch UI Pertama yang Disarankan

Urutan aman untuk mulai admin UI:

1. Admin Layout Shell
   - sidebar,
   - topbar,
   - grouped navigation,
   - active state,
   - responsive drawer.
2. Admin Dashboard UI
   - summary metric cards,
   - recent sections,
   - low stock card,
   - basic report cards.
3. Admin Orders UI
   - table,
   - status badges,
   - detail action,
   - shipping/payment/status forms later.
4. Admin Catalog UI
   - products,
   - categories,
   - services.

Jika UI admin dikerjakan oleh AI, selalu sertakan dokumen ini dan `.docs/DESIGN.md` dalam prompt delegasi.
