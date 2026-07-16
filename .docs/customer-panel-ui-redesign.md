# Customer Panel UI Redesign

Tanggal: 2026-07-14  
Referensi: `.docs/DESIGN.md`, `.docs/admin-ui-style-guide.md`  
Keputusan user: scope seluruh area customer, layout sidebar (seperti admin), rapikan shared components.

## Tujuan

Menyelaraskan UI/UX panel customer dengan panel admin:

- shell sidebar + topbar via `PanelShell`
- token visual panel: Forest `#1E4D3A`, border `#E5E7EB`, bg `#F6F7F7`, text `#333333`
- primitives bersama agar admin/field/customer tidak menduplikasi style

## Arsitektur Komponen

### Shared (`resources/js/Components/Panel/`)

| File | Peran |
| --- | --- |
| `PanelCard.jsx` | Card surface putih rounded-3xl |
| `PanelPageHeader.jsx` | Page header flat (eyebrow + title + description + action) |
| `PanelSectionHeader.jsx` | Section header di dalam card |
| `PanelEmptyState.jsx` | Empty state dashed |
| `StatusBadge.jsx` | Badge status (merge map admin + customer) |
| `DetailRow.jsx` | Baris detail label/value |
| `MetricCard.jsx` | Metric card (re-export / move dari Admin) |
| `PanelShell.jsx` | Shell sidebar (pindah dari Admin, tetap kompatibel) |
| `FormFields.jsx` | TextField, TextAreaField, SelectField, FieldError, SubmitButton |

### Compatibility re-exports

- `Components/Admin/*` yang diganti → re-export dari `Panel/*`
- `Components/Customer/*` → re-export dari `Panel/*` (nama lama tetap jalan)

### Layout

- `CustomerLayout.jsx` memakai `PanelShell` seperti `AdminLayout` / `FieldLayout`
- Nav groups customer:
  - Utama: Dashboard, Profil
  - Affiliate: Dashboard Affiliate / Daftar Affiliate, Komisi, Pengaturan (kondisional)

## Halaman yang diubah

- `Pages/Customer/Dashboard/Index.jsx`
- `Pages/Customer/Dashboard/Orders/Show.jsx`
- `Pages/Customer/Dashboard/Bookings/Show.jsx`
- `Pages/Customer/Profile/{Show,Edit,Create}.jsx`
- `Pages/Customer/Affiliate/{Dashboard,Commissions,Settings,Apply}.jsx`

## Out of scope

- Backend / controller / data payload
- Public storefront pages
- Install dependency baru
- npm run build / dev server (butuh izin user)

## Status implementasi

Selesai (2026-07-14):

- Shared `Components/Panel/*` + re-export Admin/Customer
- `CustomerLayout` memakai `PanelShell` (sidebar)
- Semua page customer di-restyle ke token admin panel
- Cleanup navigasi redundant:
  - Dashboard: hapus quick action "Lihat Profil"
  - Affiliate Dashboard: hapus link "Lihat riwayat komisi" / "Pengaturan akun"
  - Affiliate Commissions & Settings: hapus tombol "Kembali ke ringkasan"
- Import mati (`Link`, `ArrowLeft`) di page affiliate sudah dibersihkan

Verifikasi yang belum dijalankan (butuh izin user):

- `npm run dev` / visual QA browser
- `npm run build`
