# Mapping Akun dan Cabang

Dokumen ini mengunci kontrak domain akun (`users`) setelah modul cabang aktif.

Status: **keputusan final** (14 Juli 2026)

Sumber:

- `app/Models/User.php`
- `.docs/branch-module-plan.md`
- `.docs/data-structure-plan.md`
- Diskusi mapping akun (fork keputusan produk)

## 1. Keputusan Final Fork Produk

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | Nilai final `admin_scope` | `central` \| `branch` (seluruh layer: migration, model, seeder, UI, docs) |
| 2 | Admin cabang vs master produk/layanan | **B**: boleh edit master produk/layanan global; stok hanya cabangnya |
| 3 | Admin cabang vs staff | **B**: boleh kelola staff di cabangnya (scoped `branch_id`) |
| 4 | Halaman Kelola Admin | **Perlu sekarang** (CRUD admin user, set scope + cabang) |

## 2. Jenis Akun

Satu tabel `users` untuk semua login.

```text
users
├── admin
│   ├── admin_scope = central  → Admin Pusat
│   └── admin_scope = branch   → Admin Cabang
├── field_staff                → Staff lapangan
└── customer                   → Customer e-commerce
```

### 2.1 Matriks field

| Field | Admin Pusat | Admin Cabang | Field Staff | Customer |
|---|---|---|---|---|
| `role` | `admin` | `admin` | `field_staff` | `customer` |
| `admin_scope` | `central` | `branch` | `null` (diabaikan) | `null` (diabaikan) |
| `branch_id` | opsional (default Pusat) | **wajib** | **wajib** | selalu `null` |
| `team_id` | tidak dipakai | tidak dipakai | opsional | tidak dipakai |
| `position_id` | tidak dipakai | tidak dipakai | hierarchy staff | tidak dipakai |
| `phone_number` / `photo` | opsional | opsional | opsional | tidak dipakai di flow utama |
| `customerProfile` | tidak | tidak | tidak | ya |

### 2.2 Arti `users.branch_id`

- Untuk **admin/staff**: afiliasi operasional / default cabang kerja.
- Untuk **customer**: tidak dipakai.
- Cabang belanja customer publik = `session('selected_branch_id')`, **bukan** `users.branch_id`.

## 3. Kontrak `admin_scope`

### Nilai resmi

```text
central | branch
```

### Aturan

1. `admin_scope` hanya meaningful jika `role = admin`.
2. Non-admin: `admin_scope` diset `null` (atau diabaikan helper; jangan dipakai untuk auth).
3. Default admin baru: `central` jika tidak diisi, kecuali form admin eksplisit memilih `branch`.
4. Admin cabang **wajib** punya `branch_id` yang valid dan aktif.
5. Helper model:

```php
isAdminPusat()  // role === 'admin' && admin_scope === 'central'
isAdminCabang() // role === 'admin' && admin_scope === 'branch'
```

### Perbaikan inkonsistensi existing

| Layer | Nilai lama / salah | Nilai target |
|---|---|---|
| Migration default | `all` | `central` (atau nullable + validasi role) |
| Plan lama | `all` \| `branch` | `central` \| `branch` |
| Model helper | `central` \| `branch` | tetap |
| Seeder / UI | `central` \| `branch` | tetap |

Migration baru untuk data lama:

- `admin_scope = 'all'` → `central`
- admin aktif tanpa `admin_scope` valid → `central`
- non-admin → `null` (opsional cleanup)

## 4. Capability Matrix (MVP)

| Capability | Admin Pusat | Admin Cabang | Field Staff | Customer |
|---|---|---|---|---|
| CRUD master cabang | ✅ | ❌ | ❌ | ❌ |
| CRUD master produk/layanan | ✅ | ✅ (global master) | ❌ | ❌ |
| Atur stok per cabang | ✅ semua cabang | ✅ **hanya cabangnya** | ❌ | ❌ |
| Order / booking / lead / event / offline sale | ✅ semua | ✅ cabangnya | lead assigned (+ konteks cabang) | milik sendiri |
| Kelola staff | ✅ semua | ✅ staff `branch_id` = cabangnya | ❌ | ❌ |
| Kelola admin user | ✅ | ❌ | ❌ | ❌ |
| Settings global, payment method, voucher global | ✅ | ❌ | ❌ | ❌ |
| Team / Position master | ✅ | ❌ (boleh pakai list read-only jika form staff butuh) | ❌ | ❌ |
| Customer list / examination | ✅ | ✅ hanya data terkait cabangnya (order/booking/lead/offline sale; exam via booking/staff/creator/customer) | ❌ | ❌ |

### Catatan stok (keputusan #2)

- Master `products` / `services` = global.
- `branch_product_stocks` = source of truth stok cabang.
- Admin cabang:
  - boleh create/update master produk/layanan,
  - pada form stok cabang, hanya boleh ubah baris `branch_id = user.branch_id`,
  - tidak boleh mengubah stok cabang lain (UI hide + backend reject).

### Catatan staff (keputusan #3)

- Admin cabang:
  - list/create/update/delete staff hanya jika target `role = field_staff` dan `branch_id = user.branch_id`,
  - create staff default `branch_id` = cabang admin login,
  - tidak boleh assign staff ke cabang lain.
- Admin pusat:
  - full akses staff semua cabang.

## 5. Redirect Login

Sudah ada di `AuthenticatedSessionController`:

| Role | Dashboard |
|---|---|
| `admin` | `admin.dashboard.index` |
| `field_staff` | `field.dashboard.index` |
| `customer` | `customer.dashboard.index` |

Tidak perlu redirect berbeda antara admin pusat vs cabang; perbedaan hanya scope data di dalam panel admin.

## 6. Modul Akun yang Diperlukan

### 6.1 Existing

| Modul | Status | Penyesuaian |
|---|---|---|
| Staff CRUD (`Admin/Staff`) | Ada | Scope admin cabang; `branch_id` wajib; filter list by branch |
| Register customer | Ada | Tetap; jangan set field internal admin/staff |
| Customer admin list | Ada | Hardening scope cabang belakangan jika dibutuhkan |
| Field panel | Ada | Tetap berbasis assignment lead |

### 6.2 Baru: Kelola Admin (sekarang)

Route usulan:

```text
GET    /admin/admins
POST   /admin/admins
PUT    /admin/admins/{user}
DELETE /admin/admins/{user}
```

Constraint target user:

- Hanya `role = admin`
- Hanya Admin Pusat yang boleh akses modul ini

Field form:

- `name`, `email`, `password` (opsional saat update)
- `admin_scope` (`central` | `branch`)
- `branch_id` (required_if admin_scope=branch)
- `is_active`
- `phone_number` opsional

Aturan destroy:

- Jangan hapus diri sendiri
- Jangan hapus admin pusat terakhir yang aktif
- Prefer soft-deactivate (`is_active = false`) jika admin sudah punya jejak audit; hard delete hanya jika aman

UI:

- Halaman `Admin/Admins/Index` (pola mirip Staff)
- Menu sidebar Admin: “Admin” / “Kelola Admin” (hanya tampil untuk `admin_scope === 'central'`)

## 7. Helper Akses yang Direkomendasikan

Tambahkan di `User` (atau service kecil) agar controller tidak copy-paste:

```php
public function isAdmin(): bool
{
    return $this->role === 'admin' && $this->is_active;
}

public function canAccessBranch(?int $branchId): bool
{
    if (! $this->isAdmin()) {
        return false;
    }

    if ($this->isAdminPusat()) {
        return true;
    }

    return $this->isAdminCabang()
        && $branchId !== null
        && (int) $this->branch_id === (int) $branchId;
}

public function accessibleBranchIds(): ?array
{
    // null = semua cabang (admin pusat)
    // array = daftar cabang diizinkan
    if ($this->isAdminPusat()) {
        return null;
    }

    if ($this->isAdminCabang() && $this->branch_id) {
        return [(int) $this->branch_id];
    }

    return [];
}
```

Pola query:

```php
$query->when($user->isAdminCabang(), fn ($q) => $q->where('branch_id', $user->branch_id));
```

## 8. Validasi Create/Update User per Role

### Admin

```text
role = admin
admin_scope = required|in:central,branch
branch_id = required_if:admin_scope,branch|nullable|exists:branches,id
team_id = prohibited
position_id = prohibited
```

### Field staff

```text
role = field_staff
admin_scope = null / prohibited
branch_id = required|exists:branches,id
team_id = nullable|exists:teams,id
position_id = nullable|exists:positions,id (hierarchy list)
```

### Customer

```text
role = customer
admin_scope = null
branch_id = null
team_id = null
position_id = null
+ customer_profiles
```

## 9. Tahapan Implementasi

### Phase A — Kontrak data (blocking)

1. Migration perbaikan `admin_scope`:
   - backfill `all` → `central`
   - default column ke `central` atau nullable sesuai keputusan teknis final
2. Update docs internal yang masih menyebut `all`
3. Pastikan seeder dummy:
   - `admin@phoenix.test` → central + branch Pusat
   - `admin.cabang@phoenix.test` → branch + Cabang Bandung
4. Factory states: `adminCentral()`, `adminBranch()`, `fieldStaff()`, `customer()`

### Phase B — Helper & hardening authz

1. Helper `isAdmin()`, `canAccessBranch()`, `accessibleBranchIds()`
2. StaffController scoped untuk admin cabang
3. Product stock update: admin cabang hanya boleh ubah stok cabangnya
4. Sisa controller operasional yang belum konsisten (audit terpisah)

### Phase C — Kelola Admin (produk sekarang)

1. `Admin/AdminUserController` (atau `AdminController`)
2. Form request store/update
3. Page Inertia `Admin/Admins/Index`
4. Menu sidebar hanya admin pusat
5. Test feature: create admin cabang, forbid admin cabang mengakses modul, forbid self-delete

### Phase D — Hardening backend modul global

1. Lock backend modul `centralOnly` ke `isAdminPusat()` (Settings, Voucher, Payment, Lead Source, Video, Testimoni)
2. Normalisasi `authorizeAdmin()` operasional ke `isAdmin()`
3. Pesan error 403 yang jelas untuk modul pusat-only
4. Label UI “Admin Pusat” / nama cabang (sudah di `AdminLayout`)
5. Test coverage factory + policy scope (opsional batch berikutnya)

## 10. Akun Dummy Referensi

| Email | Role | Scope | Cabang |
|---|---|---|---|
| `admin@phoenix.test` | admin | central | Pusat |
| `admin.cabang@phoenix.test` | admin | branch | Cabang Bandung |
| `field@phoenix.test` | field_staff | - | Cabang Bandung |
| `customer@phoenix.test` | customer | - | - |
| `customer.nonmember@phoenix.test` | customer | - | - |

Password seeder: `password`

## 11. Out of Scope Dokumen Ini

- Permission granular per menu (RBAC package)
- Multi-cabang per satu user
- Transfer staff antar cabang massal
- Komisi staff per cabang
- Admin super-root terpisah dari admin pusat

## 12. Checklist Implementasi (update 14 Juli 2026)

- [x] Migration backfill `admin_scope` legacy `all` → `central`; non-admin → `null`
- [x] Helper `isAdmin()`, `canAccessBranch()`, `accessibleBranchIds()` di `User`
- [x] Factory states: `adminCentral()`, `adminBranch()`, `fieldStaff()`, `customer()`
- [x] Staff scoped untuk admin cabang; `branch_id` wajib
- [x] Product stock sync hanya cabang yang diizinkan
- [x] Branch CRUD hanya Admin Pusat
- [x] Team/Position master hanya Admin Pusat
- [x] Menu sidebar filter `centralOnly` + item **Admin**
- [x] Modul Kelola Admin (`AdminUserController` + page + route)
- [x] Backend modul global (Settings/Voucher/Payment/LeadSource/Video/Testimonial) → `isAdminPusat()`
- [x] Normalisasi `authorizeAdmin()` operasional → `isAdmin()`
- [x] Migration `admin_scope` nullable (non-admin = null)
- [x] Seeder selaras: branch dulu, admin central/branch + branch_id, non-admin null
- [x] `php artisan migrate` + `php artisan db:seed` lokal sukses
- [x] Scope Customer + Examination untuk admin cabang (`visibleToAdmin` / `isVisibleToAdmin`)
- [x] Helper `User::applyBranchScope()`, `ensureCanAccessBranch()`, `forcedBranchId()`
- [x] Refactor Order / Booking / Staff memakai helper scope
- [x] Feature test isolasi cabang (`AdminBranchScopeIsolationTest` — 11 cases pass)
- [ ] Manual QA: login admin pusat vs admin cabang
- [ ] Refactor sisa controller (Lead/Event/OfflineSale/Report) ke helper (opsional)

## 13. File yang disentuh implementasi

### Phase A
- `database/migrations/2026_07_14_100000_normalize_admin_scope_on_users_table.php`
- `database/factories/UserFactory.php`
- `database/seeders/DatabaseSeeder.php`
- `app/Models/User.php`

### Phase B
- `app/Http/Controllers/Admin/StaffController.php`
- `app/Http/Controllers/Admin/ProductController.php`
- `app/Http/Requests/Admin/StoreProductRequest.php`
- `app/Http/Requests/Admin/UpdateProductRequest.php`
- `app/Http/Controllers/BranchController.php`
- `app/Http/Controllers/Admin/TeamController.php`
- `app/Http/Controllers/Admin/PositionController.php`
- `resources/js/Layouts/AdminLayout.jsx`
- `resources/js/Pages/Admin/Staff/Index.jsx`

### Phase C
- `app/Http/Controllers/Admin/AdminUserController.php`
- `resources/js/Pages/Admin/Admins/Index.jsx`
- `routes/web.php`

### Phase D
- Pusat-only: `SettingController`, `VoucherController`, `PaymentMethodController`, `LeadSourceController`, `TestimonialController`, `VideoController`
- Operasional (`isAdmin()`): `BookingController`, `CustomerController`, `DashboardController`, `EventController`, `ExaminationController`, `LeadController`, `OfflineSaleController`, `OrderController`, `ProductCategoryController`, `ReportController`, `ServiceController`
- Schema/seed: `2026_07_14_120000_make_admin_scope_nullable_on_users_table.php`, `DatabaseSeeder.php`, `BranchSeeder.php`, `2026_07_13_043550_add_admin_scope_to_users_table.php` (nullable untuk install baru)

### Hardening Customer + Examination
- `app/Models/CustomerProfile.php` — `scopeWithActivityInBranch`, `scopeVisibleToAdmin`, `isVisibleToAdmin`
- `app/Models/Examination.php` — `scopeVisibleToAdmin`, `isVisibleToAdmin`
- `app/Http/Controllers/Admin/CustomerController.php`
- `app/Http/Controllers/Admin/ExaminationController.php`
- `app/Http/Requests/Admin/UpdateCustomerProfileRequest.php`
- `app/Http/Requests/Admin/StoreExaminationRequest.php`
- `app/Models/User.php` — `isAdminPusat()` treat non-`branch` as pusat (kompatibel admin lama tanpa scope)

### Phase helper + test isolasi
- `app/Models/User.php` — `applyBranchScope()`, `ensureCanAccessBranch()`, `forcedBranchId()`
- Refactor: `OrderController`, `BookingController`, `StaffController`
- `tests/Feature/AdminBranchScopeIsolationTest.php`
