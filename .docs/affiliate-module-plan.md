# Modul Affiliate — Spesifikasi & Rencana Implementasi

**Tanggal:** 2026-07-14  
**Status:** Draft disetujui (keputusan bisnis terkunci)  
**Sumber mockup client:**
- `~/Downloads/affiliate2.html` — landing + form pendaftaran
- `~/Downloads/dashboard affiliator.html` — portal mitra
- `~/Downloads/dashboard adminaffiliate.html` — admin panel

**Dokumen terkait:** `AGENTS.md`, `system-flow.md`, `features-modules.md`, `admin-ui-style-guide.md`, `DESIGN.md`

---

## 1. Keputusan Bisnis (Terkunci)

| # | Topik | Keputusan |
|---|--------|-----------|
| 1 | Form pendaftaran | **A — Wajib login customer dulu** |
| 2 | Sumber komisi fase 1 | **B — Order online + Booking layanan** |
| 3 | Approve pendaftaran | **A — Manual admin** |
| 4 | Role | Tetap di `users.role`; **hanya customer** yang boleh daftar |
| 5 | Auto-affiliate saat register | **Tidak.** Register akun ≠ jadi affiliate |
| 6 | Model identitas affiliate | Relasi terpisah `affiliates` (1 user customer : 0..1 affiliate), **bukan** ganti role ke `affiliate` |
| 7 | UI/UX | **Konsisten 100% dengan design system project** (bukan styling HTML mockup client) |

---

## 1.1 UI/UX — Aturan Wajib (Terkunci)

Mockup HTML client (`affiliate2.html`, `dashboard affiliator.html`, `dashboard adminaffiliate.html`) **hanya** dipakai sebagai referensi:

- struktur section / informasi
- field form
- alur fitur & business rule
- label copy (boleh diadaptasi)

Mockup **bukan** sumber design system. Jangan porting CSS/HTML mockup mentah ke React.

### Sumber kebenaran visual

| Area | Referensi wajib |
|------|-----------------|
| Brand, warna, tipografi, tone | `.docs/DESIGN.md` |
| Admin panel (layout, table, form, badge, metric) | `.docs/admin-ui-style-guide.md` |
| Token Tailwind / font | `tailwind.config.js` |
| Layout shell | `AdminLayout`, `CustomerLayout`, `GuestLayout` (public landing) |
| Komponen reusable admin | `resources/js/Components/Admin/*` |
| Pola page existing | `resources/js/Pages/Admin/*`, `Pages/Customer/*`, `Pages/Public/*` |

### Palette project (bukan mockup)

| Token project | Hex | Catatan |
|---------------|-----|---------|
| Forest Green | `#1E4D3A` | Primary CTA, active nav, heading accent |
| Sage Green | `#6FA788` | Soft accent / icon bg |
| Mint Green | `#A8C5B3` | Light surface accent |
| Light Gray | `#F6F7F7` | Page background admin |
| Dark Gray | `#333333` | Body text |
| White / Gray border | `#FFFFFF` / `#E5E7EB` | Card & border |

**Jangan pakai warna mockup sebagai token baru**, misalnya:

- `#2d6a4f`, `#122019`, `#1b4332`, `#f7faf8` (mockup Inter theme)
- Font **Inter** dari mockup

Gunakan **Montserrat** (UI/body/label) dan **Playfair Display** (heading publik terbatas, sesuai `DESIGN.md`).

### Layout & komponen

| Halaman | Layout | Pola UI |
|---------|--------|---------|
| Landing program affiliate | Layout publik existing (`GuestLayout` / pola `Pages/Public`) | Hero, section, form mengikuti public pages existing |
| Form apply + portal mitra | `CustomerLayout` | Card, metric, table selaras dashboard customer |
| Admin daftar/approve/payout/rules | `AdminLayout` | `AdminPageHeader`, `AdminCard`, `MetricCard`, `StatusBadge`, `Pagination`, `EmptyState`, `FormFields`, `ImageUploadField` |

### Aturan implementasi UI

1. **Reuse dulu** komponen & class pattern yang sudah ada; jangan buat design system paralel.
2. Status badge (`pending`, `active`, `hold`, `approved`, `paid`, dll.) ikuti `StatusBadge` / pola badge admin existing.
3. Table admin: search, filter, pagination, empty state — pola CRUD admin existing.
4. Form: input/label/error Inertia + komponen form existing; upload foto pakai pola upload yang sudah ada.
5. Metric cards mitra/admin: pola `MetricCard` / card metric dashboard admin.
6. Responsive: ikuti breakpoint & mobile behavior layout project (mockup sidebar fixed 260px **tidak** ditiru mentah).
7. Jangan inline style massal ala mockup; pakai Tailwind utility + token project.
8. Copy teks mockup boleh dipertahankan (Bahasa Indonesia), styling tidak.

### Yang dilarang

- Copy-paste `<style>` / class CSS dari HTML mockup ke page React
- Sidebar gelap custom terpisah di luar `AdminLayout` / `CustomerLayout`
- Font Inter Google Fonts hanya untuk modul affiliate
- Warna neon, gradient SaaS, atau palette di luar `DESIGN.md`
- Membuat “mini theme” affiliate yang beda dari sisa aplikasi

### Alasan desain role

Role `users.role` saat ini single-value: `admin` | `customer` | `field_staff`.

Customer yang jadi affiliate **tetap** harus:
- belanja / booking
- mengakses dashboard customer

Jika `role` diganti ke `affiliate`, akses customer rusak.  
Solusi: `role` tetap `customer`; status mitra dicek lewat relasi `User → Affiliate`.

---

## 2. Ringkasan Fitur dari Mockup

### 2.1 Publik — Landing Program (`affiliate2.html`)
- Hero + CTA daftar
- Cara kerja 5 langkah
- Tabel skema komisi
- Etika promosi (boleh / dilarang)
- FAQ
- Form pendaftaran (hanya setelah login customer)

### 2.2 Mitra — Dashboard Affiliator
- Metric: komisi siap cair, komisi hold, total klik
- Link afiliasi unik + salin
- Kode kupon eksklusif + salin
- Riwayat transaksi/komisi
- Marketing kit (fase belakangan, opsional)
- Menu: Ringkasan, Riwayat Komisi, Materi Promosi, Pengaturan Akun

### 2.3 Admin — Manajemen Affiliate
- Daftar mitra (ID, nama, kontak, domisili, total referral, status)
- Approve / reject pendaftaran
- Pencairan komisi + konfirmasi transfer
- Atur harga/komisi per product & service
- Laporan transaksi (fase 2)

---

## 3. Aturan Bisnis

| Aturan | Nilai |
|--------|--------|
| Siapa boleh daftar | User login dengan `role = customer` dan `is_active = true` |
| 1 user | Maksimal 1 record affiliate (unique `user_id`) |
| Status awal | `pending` |
| Aktif beroperasi | Hanya `status = active` (setelah approve admin) |
| ID mitra | Format `PHNX-XXXX` (generate saat approve) |
| Tracking cookie | 30 hari, query param `?track={partner_code}` (case-insensitive) |
| Prioritas atribusi | **Kode kupon affiliate > cookie track** |
| Self-referral | Dilarang (user tidak boleh dapat komisi dari order/booking miliknya sendiri) |
| Hold komisi | 7 hari sejak transaksi eligible → status `hold` lalu auto `approved` |
| Jadwal payout | Setiap tanggal 28 |
| Minimum cair | Rp 100.000 (saldo `approved` yang belum dicairkan) |
| Sumber komisi F1 | `Order` (produk online) + `Booking` (layanan) |
| OfflineSale | **Di luar fase 1** (boleh dicatat backlog) |

### 3.1 Kapan komisi dibuat

**Order**
- Trigger: order mencapai status pembayaran yang “berhasil / diterima” (ikuti field `payment_status` / alur admin existing).
- Basis komisi: item produk pada `order_items` sesuai `affiliate_commission_rules` untuk `product_id`.
- Jika tidak ada rule aktif untuk product → tidak ada komisi item itu.

**Booking**
- Trigger: booking mencapai status selesai / confirmed-paid sesuai alur admin existing (mapping status final saat implementasi, selaraskan dengan `bookings.status`).
- Basis komisi: `service_id` pada booking + rule fixed/percent.

### 3.2 Status komisi

```
hold → approved → paid
         ↘ cancelled (refund / batal / self-referral / fraud)
```

- `hold`: baru tercipta, dalam masa garansi 7 hari  
- `approved`: siap masuk saldo cair  
- `paid`: sudah masuk batch payout yang dikonfirmasi transfer  
- `cancelled`: dibatalkan (tidak dihitung)

### 3.3 Status affiliate

```
pending → active
       ↘ rejected
active  → suspended (admin)
suspended → active (admin reaktivasi)
```

---

## 4. Model Data

### 4.1 `affiliates`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| user_id | FK users, unique | Harus role customer |
| partner_code | string nullable, unique | `PHNX-4028`, diisi saat approve |
| coupon_code | string nullable, unique | `PHNX-BUDI`, diisi saat approve |
| voucher_id | FK vouchers nullable | Voucher sistem yang terikat kupon mitra |
| status | string | `pending`, `active`, `rejected`, `suspended` |
| full_name | string | Snapshot dari form (boleh sama dgn user.name) |
| email | string | Snapshot |
| whatsapp | string | |
| city | string | Domisili |
| age | unsignedTinyInteger | |
| platforms | json | `["whatsapp","instagram","tiktok"]` |
| media_url | string nullable | Link sosmed |
| photo_path | string nullable | Upload foto |
| payout_method | string | BCA, Mandiri, BRI, BNI, DANA, OVO, GOPAY |
| payout_account_number | string | |
| payout_account_name | string | Nama pemilik rekening |
| admin_notes | text nullable | |
| rejection_reason | text nullable | |
| submitted_at | timestamp | |
| approved_at | timestamp nullable | |
| approved_by | FK users nullable | Admin |
| rejected_at | timestamp nullable | |
| rejected_by | FK users nullable | |
| suspended_at | timestamp nullable | |
| created_at / updated_at | | |

Index: `status`, `partner_code`, `coupon_code`, `user_id`.

### 4.2 `affiliate_commission_rules`

Aturan komisi per product **atau** service (salah satu wajib).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| name | string | Label tampilan |
| product_id | FK products nullable | |
| service_id | FK services nullable | |
| commission_type | string | `fixed` \| `percent` |
| commission_value | decimal(12,2) | Rp atau % |
| is_active | boolean | default true |
| sort_order | int | default 0 |
| created_at / updated_at | | |

Constraint logis: tepat satu dari `product_id` / `service_id` terisi.  
Unique partial ideal: satu rule aktif per product, satu per service.

### 4.3 `affiliate_referrals` (atribusi kunjungan / binding)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| affiliate_id | FK affiliates | |
| visitor_token | string nullable | Cookie ID anonymous |
| referred_user_id | FK users nullable | Jika visitor login |
| source | string | `cookie` \| `coupon` \| `manual` |
| landing_url | string nullable | |
| ip_address | string nullable | |
| user_agent | text nullable | |
| clicked_at | timestamp | |
| expires_at | timestamp | clicked_at + 30 hari |
| created_at / updated_at | | |

Catatan: klik dihitung di sini (atau tabel `affiliate_clicks` terpisah jika volume tinggi; fase 1 boleh gabung).

### 4.4 `affiliate_commissions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| affiliate_id | FK affiliates | |
| source_type | string | `order` \| `booking` |
| source_id | bigint | ID order / booking |
| order_item_id | FK nullable | Untuk order line-level |
| product_id | FK nullable | |
| service_id | FK nullable | |
| item_name | string | Snapshot nama |
| transaction_amount | decimal(12,2) | Nilai dasar hitung |
| commission_type | string | `fixed` \| `percent` |
| commission_rate | decimal(12,2) | Snapshot rule |
| commission_amount | decimal(12,2) | Hasil akhir |
| status | string | `hold`, `approved`, `paid`, `cancelled` |
| hold_until | timestamp nullable | |
| approved_at | timestamp nullable | |
| paid_at | timestamp nullable | |
| cancelled_at | timestamp nullable | |
| cancel_reason | string nullable | |
| affiliate_payout_id | FK nullable | Saat masuk batch payout |
| meta | json nullable | Debug / snapshot rule id |
| created_at / updated_at | | |

Unique: hindari double commission — unique (`source_type`, `source_id`, `order_item_id`, `affiliate_id`) dengan normalisasi null.

### 4.5 `affiliate_payouts`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| affiliate_id | FK affiliates | |
| amount | decimal(12,2) | |
| status | string | `pending`, `processing`, `paid`, `rejected` |
| period_label | string nullable | mis. `2026-06` |
| payout_method | string | Snapshot |
| payout_account_number | string | Snapshot |
| payout_account_name | string | Snapshot |
| requested_at | timestamp | |
| paid_at | timestamp nullable | |
| paid_by | FK users nullable | Admin konfirmasi |
| admin_notes | text nullable | |
| created_at / updated_at | | |

Saat status → `paid`: update semua `affiliate_commissions` terkait → `paid`.

### 4.6 Integrasi model existing (tanpa ganti role)

**User**
- Relasi: `affiliate(): HasOne`
- Helper: `isAffiliateActive()`, `hasPendingAffiliateApplication()`

**Order / Booking**
- Opsional kolom `affiliate_id` nullable untuk audit cepat  
  **atau** cukup lewat `affiliate_commissions.source_*` (prefer tanpa ubah order dulu jika cukup).
- Rekomendasi F1: kolom `affiliate_id` nullable di `orders` dan `bookings` untuk query admin lebih mudah.

**Voucher**
- Saat approve affiliate: buat `Voucher` internal (atau flag `is_affiliate_coupon`) dengan `code = coupon_code`.
- Alternatif lebih bersih: kolom `affiliate_id` nullable di `vouchers` + `source = affiliate`.
- Prioritas atribusi: jika order pakai voucher affiliate → komisi ke owner voucher itu (mengalahkan cookie).

---

## 5. Alur Sistem

### 5.1 Daftar mitra

```
Guest buka /affiliate
  → CTA "Daftar" → login/register customer
Customer login (belum punya affiliate)
  → Form pendaftaran
  → Submit → affiliates.status = pending
Admin review
  → Approve:
      - partner_code generate
      - coupon_code generate
      - (opsional) create Voucher terikat
      - status = active
  → Reject:
      - status = rejected + alasan
```

### 5.2 Tracking referral

```
Visitor buka URL ?track=PHNX4028
  → Middleware/controller:
      - validasi affiliate active
      - set cookie 30 hari (affiliate_ref = partner_code)
      - catat click/referral
  → Lanjut ke landing/home

Checkout order / submit booking:
  1. Cek voucher affiliate di cart/order → jika ada, pakai owner voucher
  2. Else cek cookie affiliate_ref valid & belum expire
  3. Else no affiliate
  4. Tolak self-referral
  5. Simpan affiliate_id di order/booking (jika kolom ada)
```

### 5.3 Komisi & hold

```
Order payment received / Booking eligible
  → Hitung komisi per item via rules
  → Insert affiliate_commissions status=hold, hold_until = now+7d

Scheduled command harian:
  → hold yang hold_until <= now → approved
```

### 5.4 Payout

```
Opsi A (F1 sederhana, sesuai mockup admin):
  Admin lihat saldo approved per mitra
  → Buat payout request (manual admin atau auto tgl 28)
  → Admin "Konfirmasi Transfer"
  → commissions → paid

Opsi B (mitra request):
  Mitra request cair jika saldo approved >= 100.000
  → Admin approve transfer
```

Rekomendasi F1: **Admin-driven payout** (mockup admin lebih kuat; mitra hanya lihat saldo). Mitra self-request bisa F2.

---

## 6. Route & Akses

### 6.1 Publik
| Method | Path | Nama | Akses |
|--------|------|------|--------|
| GET | `/affiliate` | `affiliate.landing` | Publik |
| GET | `/r/{partnerCode}` | `affiliate.track` | Publik (redirect + cookie) |

### 6.2 Customer (auth + role customer)
| Method | Path | Nama | Akses |
|--------|------|------|--------|
| GET | `/customer/affiliate/apply` | `customer.affiliate.apply` | Customer, belum active/pending |
| POST | `/customer/affiliate/apply` | `customer.affiliate.apply.store` | Sama |
| GET | `/customer/affiliate` | `customer.affiliate.dashboard` | Customer + affiliate active |
| GET | `/customer/affiliate/commissions` | `customer.affiliate.commissions` | Sama |
| GET | `/customer/affiliate/settings` | `customer.affiliate.settings` | Sama |
| PATCH | `/customer/affiliate/settings` | `customer.affiliate.settings.update` | Update rekening/media (terbatas) |

### 6.3 Admin
| Method | Path | Nama | Akses |
|--------|------|------|--------|
| GET | `/admin/affiliates` | `admin.affiliates.index` | Admin |
| GET | `/admin/affiliates/{affiliate}` | `admin.affiliates.show` | Admin |
| POST | `/admin/affiliates/{affiliate}/approve` | `admin.affiliates.approve` | Admin |
| POST | `/admin/affiliates/{affiliate}/reject` | `admin.affiliates.reject` | Admin |
| POST | `/admin/affiliates/{affiliate}/suspend` | `admin.affiliates.suspend` | Admin |
| GET | `/admin/affiliate-payouts` | `admin.affiliate-payouts.index` | Admin |
| POST | `/admin/affiliate-payouts/{payout}/confirm` | `admin.affiliate-payouts.confirm` | Admin |
| GET | `/admin/affiliate-commission-rules` | `admin.affiliate-commission-rules.index` | Admin |
| PUT | `/admin/affiliate-commission-rules/{rule}` | `admin.affiliate-commission-rules.update` | Admin |
| GET | `/admin/affiliate-reports` | `admin.affiliate-reports.index` | Admin (F2) |

### 6.4 Middleware / policy ringkas
- Form apply: `auth` + `role:customer` + belum punya pending/active
- Dashboard mitra: `auth` + `role:customer` + `affiliate.status = active`
- Admin: `isAdmin()` (pusat preferred; cabang F1 boleh full access pusat dulu)

---

## 7. Frontend (Inertia + React)

**UI wajib konsisten dengan project** — lihat §1.1. Mockup client = wireframe fitur saja.

Ikuti pola existing:
- Pages: `resources/js/Pages/...`
- Layout: `CustomerLayout` untuk mitra; `AdminLayout` untuk admin; layout public untuk landing
- Styling: Tailwind + token `tailwind.config.js` + `.docs/DESIGN.md` + `.docs/admin-ui-style-guide.md`
- Tipografi: Montserrat / Playfair Display (bukan Inter mockup)
- Warna: Forest Green `#1E4D3A` dkk (bukan `#2d6a4f` / sidebar `#122019` mockup)
- Komponen admin: `AdminPageHeader`, `AdminCard`, `MetricCard`, `StatusBadge`, `Pagination`, `EmptyState`, `FormFields`, `ImageUploadField`, dll.
- Sebelum buat komponen baru: cek dulu apakah sudah ada di `Components/` atau `Components/Admin/`

### 7.1 Pages baru

**Public**
- `Public/Affiliate/Landing.jsx` — visual selaras public pages existing

**Customer**
- `Customer/Affiliate/Apply.jsx`
- `Customer/Affiliate/Dashboard.jsx`
- `Customer/Affiliate/Commissions.jsx`
- `Customer/Affiliate/Settings.jsx`
- (opsional F2) `Customer/Affiliate/MarketingKit.jsx`

**Admin**
- `Admin/Affiliates/Index.jsx`
- `Admin/Affiliates/Show.jsx`
- `Admin/AffiliatePayouts/Index.jsx`
- `Admin/AffiliateCommissionRules/Index.jsx`

### 7.2 Navigasi
- Customer layout: link “Program Affiliate” / “Portal Mitra” (kondisional status), gaya nav existing
- Admin sidebar: grup “Affiliate” (Daftar, Pencairan, Atur Komisi, Laporan) lewat pola menu `AdminLayout` existing — jangan sidebar custom

### 7.3 Mapping section mockup → UI project

| Mockup | Implementasi UI project |
|--------|-------------------------|
| Sidebar gelap mockup admin/mitra | Pakai shell `AdminLayout` / `CustomerLayout` |
| Panel putih radius 16px mockup | `AdminCard` / card pattern existing |
| Badge pending/active mockup | `StatusBadge` / badge admin existing |
| Metric 3 kartu mitra | `MetricCard` atau pola metric dashboard admin/customer |
| Form grid harga & komisi | Form + table admin existing |
| Landing hero mockup | Section public existing (botanical), bukan CSS mockup |

---

## 8. Backend Structure

```
app/Models/Affiliate.php
app/Models/AffiliateCommissionRule.php
app/Models/AffiliateReferral.php
app/Models/AffiliateCommission.php
app/Models/AffiliatePayout.php

app/Http/Controllers/Public/AffiliateLandingController.php
app/Http/Controllers/Public/AffiliateTrackController.php
app/Http/Controllers/Customer/AffiliateApplicationController.php
app/Http/Controllers/Customer/AffiliateDashboardController.php
app/Http/Controllers/Admin/AffiliateController.php
app/Http/Controllers/Admin/AffiliatePayoutController.php
app/Http/Controllers/Admin/AffiliateCommissionRuleController.php

app/Services/Affiliate/AffiliateCodeGenerator.php
app/Services/Affiliate/AffiliateAttributionService.php
app/Services/Affiliate/AffiliateCommissionService.php
app/Services/Affiliate/AffiliatePayoutService.php

app/Http/Requests/... (FormRequest per aksi)
app/Console/Commands/ApproveHeldAffiliateCommissions.php
```

Hook integrasi:
- Setelah order payment confirmed → `AffiliateCommissionService::createFromOrder(Order $order)`
- Setelah booking eligible → `AffiliateCommissionService::createFromBooking(Booking $booking)`
- Checkout: resolve affiliate via `AffiliateAttributionService`

---

## 9. Generate Code

**Partner code:** `PHNX-` + 4 digit unik (atau base36), cek unique.  
Contoh: `PHNX-4028`

**Coupon code:** `PHNX-` + slug nama (huruf besar) atau random, unique, max length selaras voucher.  
Contoh: `PHNX-BUDI`

**Tracking URL:**  
`{APP_URL}/r/{partner_code}` → set cookie → redirect home (atau path configurable).

**Link display di dashboard:**  
`{APP_URL}/?track={partner_code}` atau short `/r/{code}` — pilih satu canonical, mockup pakai `?track=`.

---

## 10. Form Pendaftaran (Field)

| Field | Required | Validasi |
|-------|----------|----------|
| full_name | ya | string max 255 |
| email | ya | email (default dari user) |
| whatsapp | ya | string |
| city | ya | string |
| age | ya | integer 17–100 |
| platforms[] | ya min 1 | in:whatsapp,instagram,tiktok |
| media_url | ya | url/string |
| photo | ya | image max 5MB |
| payout_method | ya | enum bank/ewallet |
| payout_account_number | ya | string |
| payout_account_name | ya | string |
| agreement | ya | accepted |

Pre-fill dari `user` + `customerProfile` jika ada.

---

## 11. Fase Implementasi

### Fase 1 — Core (MVP)
1. Migration + model + factory + seeder rule contoh
2. Helper User + policy/middleware
3. Landing publik + form apply (customer login)
4. Admin list + approve/reject + generate code
5. Tracking cookie `/r/{code}` + catat click
6. Attribution di checkout order + booking create
7. Commission create (hold) + command approve hold
8. Dashboard mitra: metric, link, kupon, riwayat
9. Admin: atur commission rules
10. Admin: list payout + konfirmasi transfer (manual batch)

### Fase 2 — Finance & Report
- Auto generate payout draft tanggal 28
- Mitra request pencairan
- Laporan transaksi admin
- Cancel komisi saat refund order/batal booking
- Notifikasi email/WA (jika infrastruktur ada)

### Fase 3 — Growth
- Marketing kit CRUD + download
- Analytics klik/konversi
- Multi-tier (jika diminta)
- OfflineSale sebagai sumber komisi

---

## 12. Edge Cases (Wajib Ditangani)

| Kasus | Perilaku |
|-------|----------|
| Customer sudah pending daftar lagi | Tolak; tampilkan status menunggu review |
| Customer rejected daftar lagi | Izinkan apply ulang (record baru atau reopen) — **rekomendasi: reopen/update record** |
| Self-referral | Tidak buat komisi |
| Affiliate suspended | Link tetap redirect, tapi **tidak** atribusi baru; komisi lama tetap proses |
| Rule diubah setelah transaksi | Komisi lama pakai snapshot; rule baru hanya transaksi baru |
| Order refund | Komisi hold/approved → cancelled (F2 min; F1 catat TODO) |
| Voucher non-affiliate + cookie | Cookie yang menang |
| Voucher affiliate + cookie beda mitra | **Voucher menang** |
| Guest checkout order | Atribusi cookie tetap valid jika ada |
| Booking guest | Sama, cookie valid |

---

## 13. Testing (PHPUnit) — Cakupan Minimal F1

- Customer non-login tidak bisa submit apply
- Customer bisa apply sekali → pending
- Admin approve → active + code unique
- Track link set cookie + increment click
- Order dengan cookie → commission hold
- Order dengan kupon affiliate → commission ke owner kupon
- Self-referral tidak menghasilkan commission
- Command hold → approved setelah hold_until
- Payout confirm → commission paid + status payout paid
- Non-active affiliate tidak bisa buka dashboard mitra

---

## 14. Yang Tidak Dilakukan di F1

- Role baru `affiliate` di kolom users
- Auto-approve pendaftaran
- Komisi dari OfflineSale
- Marketing kit penuh
- Multi-level MLM
- **Porting styling HTML mockup** (Inter, palette `#2d6a4f`/`#122019`, sidebar custom, CSS inline mockup)
- Design system terpisah khusus modul affiliate
- Menjalankan build/test berat tanpa izin user

---

## 15. Open Points (boleh dikunci belakangan, default sudah ada)

| Point | Default F1 |
|-------|------------|
| Admin cabang kelola affiliate? | Hanya admin pusat (semua admin jika belum ada pembeda ketat di menu) |
| Discount kupon mitra | Voucher 0% dulu (hanya tracking), atau potongan kecil configurable |
| Booking status trigger | Saat status masuk daftar `completed` / `done` / `confirmed` — mapping final saat baca enum booking |
| Order payment trigger | Saat `payment_status` = paid/received (selaras admin order) |
| Mitra edit rekening | Boleh edit di settings; payout berikutnya pakai data baru |
| Foto wajib? | Ya (mockup), simpan di `storage` disk public |

---

## 16. Kriteria Selesai MVP

- [x] Customer login bisa daftar affiliate; guest diarahkan login
- [x] Register user biasa **tidak** membuat affiliate
- [x] Admin bisa approve/reject
- [x] Mitra active punya link + kupon + dashboard ringkas
- [x] Klik track tercatat
- [x] Order & booking eligible menghasilkan komisi hold
- [x] Hold 7 hari → approved (command + schedule daily)
- [x] Admin bisa konfirmasi payout
- [x] UI mengikuti `DESIGN.md` + `admin-ui-style-guide.md` + layout/komponen existing (bukan styling mockup)
- [ ] Feature test inti lulus (setelah diizinkan jalankan test)
- [ ] Migration dijalankan di environment lokal/staging (butuh izin user)

---

## 17. Status Implementasi (2026-07-14)

### Sudah diimplementasikan (kode siap)

| Area | File utama |
|------|------------|
| Spec | `.docs/affiliate-module-plan.md` |
| Migrations | `database/migrations/2026_07_14_20000*_*.php` |
| Models | `Affiliate*`, relasi di `User`/`Order`/`Booking`/`Voucher` |
| Services | `app/Services/Affiliate/*` + integrasi checkout/fulfillment/booking |
| Command | `affiliate:approve-held-commissions` + schedule daily di `routes/console.php` |
| Controllers | Public / Customer / Admin affiliate |
| Frontend public + customer | `Landing`, `Apply`, `Dashboard`, `Commissions`, `Settings` |
| Frontend admin | `Admin/Affiliates/*`, `AffiliatePayouts`, `AffiliateCommissionRules` |
| Seeder rules | `AffiliateCommissionRuleSeeder` (dipanggil dari `DatabaseSeeder`) |
| Nav/status UX | share `auth.affiliate`, redirect non-aktif ke landing, badge status |
| Saldo approved | `approvedBalance()` hanya komisi `approved` **tanpa** `affiliate_payout_id` (selaras payout service) |
| Flash customer | `CustomerLayout` menampilkan `flash.success` / `flash.error` (apply, settings, redirect non-aktif) |

### Catatan residual yang sudah ditutup (kode)

- **Saldo siap cair:** sebelumnya `approvedBalance()` menjumlah semua status `approved`, termasuk yang sudah di-lock ke payout pending → bisa double-count. Sekarang exclude `whereNull('affiliate_payout_id')`.
- **Flash portal mitra:** controller customer sudah `with('success'|'error')` dan middleware share `flash`, tapi layout customer belum merender — sekarang dirender di `CustomerLayout` (pola sama admin `PanelShell`).
- **Circular FK affiliate ↔ voucher:** migration OK (keduanya nullable). Alur approve: buat/update voucher dulu dengan `affiliate_id`, lalu set `affiliates.voucher_id`. Tidak butuh defer constraint di MySQL selama insert berurutan dalam transaction (sudah di `AffiliateController@approve`).

### Belum (butuh izin / environment)

1. `php artisan migrate` (dan opsional `db:seed` / seeder rules saja)
2. `npm run build` / `npm run dev` untuk validasi UI browser
3. Feature/unit test PHPUnit
4. Cron server: `* * * * * php artisan schedule:run` (agar daily hold→approved jalan)

### Cara validasi cepat setelah migrate

```bash
php artisan migrate
php artisan db:seed --class=AffiliateCommissionRuleSeeder
# atau full seed jika environment fresh
php artisan schedule:list   # pastikan affiliate:approve-held-commissions daily
```

---

## 18. Langkah Berikutnya

1. User izinkan migrate (+ seed rules jika DB sudah ada product/service).
2. Smoke test alur: apply → admin approve → track link → order/booking → komisi hold → command approve → payout.
3. Setelah stabil, tulis feature test inti (butuh izin jalankan test).
