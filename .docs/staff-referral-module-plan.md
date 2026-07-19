# Modul Staff Referral — Spesifikasi & Rencana Implementasi

**Tanggal:** 2026-07-19  
**Status:** Fase 1 + monitoring admin diimplementasi (2026-07-19)  
**Dokumen terkait:**
- `.docs/affiliate-module-plan.md` — modul komisi mitra **customer** (terpisah)
- `.docs/features-modules.md`
- `.docs/system-flow.md`
- `.docs/admin-ui-style-guide.md`
- `.docs/DESIGN.md`
- `AGENTS.md`

---

## 1. Ringkasan Intent (dari diskusi)

| Topik | Keputusan fase 1 |
|--------|------------------|
| Tujuan utama | Staff punya **link/kode referral** untuk mengajak customer **mendaftar** |
| Komisi staff | **Tidak ada** di fase 1 (komisi customer tetap lewat modul **Affiliate**) |
| Transaksi | **Siapkan hook/atribusi** agar order/booking nanti bisa diikat ke staff, **tanpa** engine komisi staff |
| Relasi ke Affiliate | **Modul terpisah** — jangan pakai tabel `affiliates` / `affiliate_*` untuk staff |

### 1.1 Yang bukan scope fase 1

- Komisi / payout / hold balance untuk staff
- Aturan komisi staff per product/service
- Menjadikan staff sebagai record di `affiliates`
- Mengubah `users.role` (staff tetap `field_staff`)
- GPS, absensi, ranking leaderboard lanjutan

### 1.2 Yang termasuk scope fase 1

1. Identitas referral staff (`staff_code` + URL tracking)
2. Cookie/session atribusi (mirip pola affiliate, cookie terpisah)
3. Binding saat **registrasi customer** (`referred_by_staff_id`)
4. Catatan klik/visit (opsional tapi disarankan, untuk metrik)
5. Hook nullable pada **Order / Booking** untuk `referred_by_staff_id` (isi nanti / siap diisi)
6. UI minimal: admin lihat performa referral staff; field staff salin link
7. Test fitur registrasi + tracking

---

## 2. Konteks Existing di Codebase

### 2.1 Affiliate (customer mitra) — **jangan digabung**

Sudah ada dan aktif:

| Area | Path / pola |
|------|-------------|
| Tracking | `GET /r/{partnerCode}` → `AffiliateTrackController` |
| Cookie | `affiliate_ref`, 30 hari (`AffiliateAttributionService`) |
| Komisi | `AffiliateCommissionService` dari Order (paid) + Booking (completed) |
| Identitas | Tabel `affiliates` (user customer : 0..1) |

Affiliate = **customer** yang dapat **komisi**.  
Staff referral = **field_staff** yang mendapat **atribusi pendaftaran** (tanpa komisi).

### 2.2 Staff

| Area | Keterangan |
|------|------------|
| Role | `users.role = field_staff` |
| CRUD admin | `Admin/StaffController`, pages `Admin/Staff/*` |
| Field app | `Field/*`, layout `FieldLayout` |
| Relasi operasional | Lead `assigned_staff_id`, OfflineSale `field_staff_id` |

**Belum ada:** `staff_code`, tracking link staff, binding registrasi ke staff.

### 2.3 Registrasi customer saat ini

`RegisteredUserController@store`:

- Buat `User` role `customer`
- Buat `CustomerProfile` (name, whatsapp, address, non_member)
- **Tidak** membaca referral code / cookie sama sekali

Ini titik integrasi utama fase 1.

---

## 3. Keputusan Bisnis (direkomendasikan terkunci)

| # | Topik | Rekomendasi | Alasan |
|---|--------|-------------|--------|
| 1 | Siapa yang punya kode | Semua `field_staff` aktif | Sederhana; admin create staff → auto generate code |
| 2 | Format kode | `STF-XXXX` (huruf/angka uppercase, unique) | Bedakan dari affiliate `PHNX-XXXX` |
| 3 | URL tracking | `GET /s/{staffCode}` | Bedakan dari `/r/{partnerCode}` affiliate |
| 4 | Redirect default setelah track | Halaman `register` (bukan home) | Intent fase 1 = pendaftaran |
| 5 | Cookie name | `staff_ref` (terpisah dari `affiliate_ref`) | Hindari bentrok atribusi |
| 6 | Cookie TTL | 30 hari | Selaras affiliate; mudah diganti config |
| 7 | Prioritas saat register | Cookie `staff_ref` valid + staff aktif | Boleh ditambah query `?ref=` di form register |
| 8 | Self / invalid | Abaikan cookie jika staff tidak aktif / kode invalid | Jangan gagalkan registrasi |
| 9 | Satu customer, satu staff referral | Binding **sekali** saat register; immutable | Audit jelas; ubah manual hanya admin (fase belakangan) |
| 10 | Komisi staff | **Tidak** | Komisi customer = Affiliate |
| 11 | Transaksi fase 1 | Kolom nullable `referred_by_staff_id` di `orders` & `bookings` | Siap isi di fase berikutnya tanpa migration mendadak |
| 12 | Isi `referred_by_staff_id` di order/booking fase 1 | **Opsional soft-fill**: copy dari user/customer yang punya staff referral saat checkout/booking | Data mulai terisi tanpa UI komisi |

### 3.1 Hubungan dengan cookie Affiliate

Kedua cookie boleh hidup bersamaan:

| Event | Affiliate | Staff referral |
|-------|-----------|----------------|
| Klik link mitra `/r/...` | Set `affiliate_ref` | — |
| Klik link staff `/s/...` | — | Set `staff_ref` |
| Register | — | Bind `referred_by_staff_id` dari `staff_ref` |
| Checkout / booking | Atribusi `affiliate_id` + komisi (existing) | Soft-fill `referred_by_staff_id` jika user punya staff referral **atau** cookie staff (fase 1.1) |

**Tidak ada** “staff mengalahkan affiliate untuk komisi” — staff **tidak** dapat komisi di fase 1.

---

## 4. Model Data

### 4.1 Opsi identitas staff code

**Rekomendasi: kolom di `users`** (lebih sederhana; staff sudah = user).

Migration: `add_staff_referral_fields_to_users_table`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `staff_code` | string nullable, unique | `STF-A9K2`; diisi saat staff dibuat / backfill staff existing |
| `staff_referral_enabled` | boolean default true | Admin bisa matikan tanpa nonaktifkan akun |

Alternatif (jika nanti butuh metadata banyak): tabel `staff_referral_profiles` — **tidak diperlukan fase 1**.

### 4.2 Binding pada customer

**Rekomendasi: di `users` (customer) + snapshot opsional di profile notes.**

Migration: `add_referred_by_staff_id_to_users_table`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `referred_by_staff_id` | FK `users.id` nullable | Staff yang mereferensikan; hanya meaningful jika role customer |
| `referred_at` | timestamp nullable | Waktu binding |

Index: `referred_by_staff_id`.

Catatan:

- Jangan taruh hanya di `customer_profiles` jika login user adalah sumber kebenaran registrasi; profile bisa dibuat/diubah terpisah.
- Boleh **mirror** ke `customer_profiles.internal_notes` text (opsional) untuk admin yang sering baca notes — bukan sumber kebenaran.

### 4.3 `staff_referral_clicks` (metrik klik)

Tabel ringan, mirror pola `affiliate_referrals` tapi tanpa komisi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint PK | |
| staff_user_id | FK users | Field staff pemilik kode |
| visitor_token | string nullable | Opsional |
| registered_user_id | FK users nullable | Diisi saat register berhasil dari cookie ini |
| landing_url | string nullable | |
| ip_address | string nullable | |
| user_agent | string nullable | |
| clicked_at | timestamp | |
| expires_at | timestamp nullable | |
| created_at / updated_at | | |

Index: `staff_user_id`, `clicked_at`, `registered_user_id`.

### 4.4 Hook transaksi (tanpa komisi)

Migration: `add_referred_by_staff_id_to_orders_and_bookings_tables`

| Tabel | Kolom | Keterangan |
|-------|-------|------------|
| `orders` | `referred_by_staff_id` nullable FK users | Attribution report, **bukan** komisi |
| `bookings` | `referred_by_staff_id` nullable FK users | Sama |

**Tidak** membuat `staff_commissions`, `staff_payouts`, `staff_commission_rules` di fase 1.

### 4.5 Relasi Eloquent (ringkas)

```
User (field_staff)
  staff_code
  hasMany staffReferralClicks
  hasMany referredCustomers (User where referred_by_staff_id)

User (customer)
  belongsTo referredByStaff (User)
  hasOne customerProfile
  hasMany orders / bookings (existing)

Order / Booking
  belongsTo referredByStaff (User) // nullable
```

---

## 5. Alur Bisnis

### 5.1 Generate `staff_code`

Trigger:

1. `StaffController@store` — setelah create user `field_staff`, generate code unik.
2. Command / seeder one-shot: backfill staff existing tanpa code.
3. (Opsional) regenerate hanya admin pusat jika bentrok (jarang).

Generator (service):

- Prefix `STF-`
- 4–6 char alphanumeric uppercase
- Retry jika unique collision
- File: `app/Services/StaffReferral/StaffCodeGenerator.php` (mirror `AffiliateCodeGenerator`)

### 5.2 Tracking klik

```
GET /s/{staffCode}?redirect=/register
  → resolve staff: role=field_staff, is_active, staff_referral_enabled, staff_code match
  → set cookie staff_ref = STAFF_CODE (30 hari)
  → insert staff_referral_clicks
  → redirect ke register (default) atau query redirect (whitelist path internal saja)
```

Keamanan redirect:

- Hanya allow relative path internal (`/register`, `/`, `/products`, …)
- Tolak URL absolut eksternal (open redirect)

### 5.3 Registrasi

```
GET /register
  → (opsional) prefill info "Anda diundang oleh {staff name}" jika cookie valid
  → jangan expose data sensitif staff selain nama tampilan

POST /register
  → create User + CustomerProfile (existing)
  → resolve staff dari cookie staff_ref (dan/atau input ref tersembunyi)
  → jika valid:
       user.referred_by_staff_id = staff.id
       user.referred_at = now()
       update click row (jika bisa di-match) set registered_user_id
  → login + redirect dashboard (existing)
```

Aturan:

- Registrasi **tidak gagal** hanya karena referral invalid.
- Staff inactive / disabled → treat as no referral.
- Customer yang sudah punya `referred_by_staff_id` tidak diubah di login berikutnya.

### 5.4 Soft-fill transaksi (fase 1.1, ringan)

Saat order dibayar / booking dibuat (titik yang sama affiliate attribution dipanggil):

```
if order.referred_by_staff_id is null:
  order.referred_by_staff_id = buyer.referred_by_staff_id
  // atau resolveFromStaffCookie(request) jika ingin first-touch cookie juga
```

**Tidak** membuat baris komisi.  
Hanya menyimpan atribusi untuk laporan “customer dari staff X bertransaksi”.

Prioritas usulan soft-fill:

1. `user.referred_by_staff_id` (registration attribution — primary)
2. Cookie `staff_ref` aktif (jika user daftar dulu tanpa cookie, belanja lewat link staff — opsional)

Jangan override `affiliate_id` existing.

### 5.5 OfflineSale

`OfflineSale.field_staff_id` sudah berarti “staff yang menjual”.  
**Tidak diganti** oleh referral registrasi.  
Laporan bisa menampilkan keduanya terpisah:

- **Operational staff** = `field_staff_id`
- **Acquisition staff** = customer → `referred_by_staff_id`

---

## 6. Service Layer

Namespace: `app/Services/StaffReferral/`

| Service | Tanggung jawab |
|---------|----------------|
| `StaffCodeGenerator` | Generate unique `STF-xxxx` |
| `StaffReferralAttributionService` | resolveByCode, trackClick, resolveFromCookie, bindOnRegister, resolveForTransaction |
| (nanti) `StaffReferralReportService` | Aggregate counts — boleh query di controller dulu di fase 1 |

**Jangan** reuse class Affiliate untuk cookie name / resolve; copy pola, pisah file, agar tidak salah atribusi.

---

## 7. Routes

### Public

```
GET /s/{staffCode}  → StaffReferralTrackController  name: staff-referral.track
```

### Field (auth field_staff)

```
GET /field/referral  → FieldStaffReferralController@show  name: field.referral.show
```

Isi page: kode, URL lengkap, tombol salin, metrik sederhana (klik, total register).

### Admin

```
GET /admin/staff-referrals              → daftar staff + counts
GET /admin/staff-referrals/{staff}      → detail: clicks, registered users (paginate)
```

Atau **lebih minimal fase 1**:

- Extend `Admin/Staff/Index` + `Show/Edit` dengan kolom `staff_code` + count referred
- Skip halaman admin terpisah dulu

**Rekomendasi UI fase 1:** extend Staff admin + page Field referral; admin report page terpisah boleh fase 1.5.

---

## 8. UI / UX

Ikuti design system project (bukan invent theme baru).

| Halaman | Layout | Isi |
|---------|--------|-----|
| Field referral | `FieldLayout` | Card kode + URL, copy button, metric: total klik, total daftar |
| Admin staff index | `AdminLayout` | Kolom `Kode Referral`, `Total Daftar` |
| Admin staff detail (opsional) | `AdminLayout` | Tabel customer referred |
| Register | `GuestLayout` / Auth | Banner opsional “Diundang oleh {Nama}” jika cookie valid |

Komponen:

- Reuse pola copy-to-clipboard dari dashboard affiliate customer jika sudah ada
- Metric card pola admin/field existing

---

## 9. Integrasi Titik Kode (blast radius)

| File / area | Perubahan fase 1 |
|-------------|------------------|
| `StaffController@store` (+ update jika perlu) | Generate `staff_code` |
| Migration users | `staff_code`, `staff_referral_enabled`, `referred_by_staff_id`, `referred_at` |
| Migration clicks | `staff_referral_clicks` |
| Migration orders/bookings | `referred_by_staff_id` nullable |
| `RegisteredUserController` | Bind referral on register |
| `Auth/Register` page | Opsional banner + hidden ref |
| New track controller + route `/s/{code}` | Cookie + click log |
| `FieldLayout` nav | Menu “Referral” |
| New Field page | Link & stats |
| `CheckoutService` / booking create | Soft-fill `referred_by_staff_id` (fase 1.1) |
| `User` model | Relasi + helper `isFieldStaff()`, `staffReferralUrl()` |
| Tests | Feature tests baru |

**Tidak disentuh untuk komisi:**

- `AffiliateCommissionService`
- `AffiliatePayoutService`
- Tabel `affiliate_*`

---

## 10. Aturan Validasi & Edge Cases

| Kasus | Perilaku |
|-------|----------|
| Kode tidak dikenal | Track: redirect register tanpa cookie; Register: ignore |
| Staff nonaktif | Sama seperti invalid |
| `staff_referral_enabled = false` | Tidak track / tidak bind |
| User sudah login buka `/s/...` | Tetap set cookie (untuk belanja nanti); **jangan** ubah `referred_by_staff_id` user existing |
| Admin/staff mencoba register lewat form customer | Alur register existing hanya buat customer; tidak special-case |
| Double submit register | Unique email existing; referral hanya di create sukses |
| Cookie affiliate + staff bersama | Keduanya valid di domain masing-masing; tidak saling hapus |
| Branch scope admin | Daftar referred customer: filter staff by branch seperti staff index |

---

## 11. Metrik Fase 1 (minimal)

Per staff:

- Total klik (`staff_referral_clicks`)
- Total registrasi (`users.referred_by_staff_id = staff.id`)
- (Opsional 1.1) Total order / booking dengan `referred_by_staff_id`
- (Opsional 1.1) GMV order attributed — **bukan** komisi

Admin pusat: semua cabang.  
Admin cabang: hanya staff cabangnya.

---

## 12. Fase Implementasi

### Fase 1 — Registration referral (inti)

1. Migration users + clicks + orders/bookings hook columns  
2. `StaffCodeGenerator` + backfill command  
3. `StaffReferralAttributionService`  
4. Track route `/s/{code}`  
5. Integrasi `RegisteredUserController` + UI register tipis  
6. Generate code di create staff  
7. Field page salin link + metric  
8. Admin staff list: tampilkan code + count  
9. Feature tests  

### Fase 1.1 — Transaction attribution (tanpa komisi)

1. Soft-fill `orders.referred_by_staff_id` / `bookings.referred_by_staff_id`  
2. Admin filter/report sederhana “transaksi dari referral staff”  
3. Tests checkout/booking attribution  

### Fase 2 — (backlog, butuh keputusan bisnis baru)

- Komisi staff (hanya jika diminta; **pisah** dari affiliate rules)
- Payout staff
- Leaderboard cabang/tim
- QR code print untuk event
- Manual reassign referral oleh admin

---

## 13. Rencana Testing

Tanpa menjalankan suite penuh sampai user minta; saat implementasi, prioritaskan test fokus:

| Test | Assert |
|------|--------|
| Track valid code | Cookie `staff_ref` ter-set, click row created, redirect register |
| Track invalid code | No cookie / no fail hard, redirect aman |
| Register dengan cookie valid | `referred_by_staff_id` terisi, `referred_at` set |
| Register tanpa cookie | null referral, sukses tetap |
| Register cookie staff inactive | null referral |
| Staff create | `staff_code` auto unique |
| Field page | Hanya field_staff aktif; menampilkan URL sendiri |
| Admin branch scope | Tidak lihat staff cabang lain |
| Soft-fill order (1.1) | Order mewarisi staff dari user referred |
| Affiliate regression | Checkout affiliate masih set `affiliate_id` + komisi |

---

## 14. Naming & Konsistensi

| Konsep | Nama yang dipakai |
|--------|-------------------|
| Kode staff | `staff_code` |
| Cookie | `staff_ref` |
| Route track | `/s/{staffCode}`, name `staff-referral.track` |
| Service NS | `App\Services\StaffReferral` |
| Bukan | `affiliate_*`, `partner_code` untuk staff |

---

## 15. Open Points (minor — default sudah dipilih)

Boleh override sebelum implementasi:

1. **Redirect default track** → `/register` (bisa diganti home + CTA daftar)
2. **Banner di register** → ya, nama staff saja
3. **Admin page terpisah** vs extend Staff index → extend dulu
4. **Soft-fill transaksi di fase 1 bersamaan** vs 1.1 → disarankan **ikut fase 1** karena migration kolom sudah ada; logic-nya kecil
5. **Backfill code** otomatis di migration/seeder vs artisan command → artisan `staff-referral:backfill-codes`

Jika Anda setuju default di atas, status dokumen bisa diubah ke **“Draft disetujui”** lalu implementasi dimulai.

---

## 16. Checklist Implementasi

- [x] Migration `users`: `staff_code`, `staff_referral_enabled`, `referred_by_staff_id`, `referred_at`
- [x] Migration `staff_referral_clicks`
- [x] Migration `orders` + `bookings`: `referred_by_staff_id`
- [x] Models + relasi
- [x] `StaffCodeGenerator`, `StaffReferralAttributionService`
- [x] Track controller + route `/s/{staffCode}`
- [x] Wire `RegisteredUserController` + Register page
- [x] Wire `StaffController@store` (+ backfill command `staff-referral:backfill-codes`)
- [x] Soft-fill order/booking di `CheckoutService` + `BookingController`
- [x] Field UI + nav (`Field/Referral/Show`)
- [x] Admin staff columns (kode + total daftar)
- [x] Feature tests (`tests/Feature/StaffReferralTest.php` — 9 passed)
- [x] Admin monitoring page (`Admin/StaffReferrals/*`, routes, nav)
- [x] Scope pusat (semua cabang + filter) / cabang (hanya cabang sendiri)
- [x] Feature tests admin (`tests/Feature/AdminStaffReferralTest.php` — 7 passed)
- [x] Update `.docs/system-flow.md` / `features-modules.md` ringkas (opsional, follow-up)

---

## 17. Ringkasan Satu Kalimat

**Staff mendapat link `/s/{STF-xxxx}` yang mengikat customer baru saat registrasi; komisi tetap hanya di modul Affiliate untuk customer mitra; kolom atribusi di order/booking disiapkan tanpa engine komisi staff.**
