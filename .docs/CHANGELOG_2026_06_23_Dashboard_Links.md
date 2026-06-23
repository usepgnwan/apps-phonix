# Changelog: Dashboard Admin Links

**Date:** 2026-06-23

## Perubahan

- **Admin Dashboard (resources/js/Pages/Admin/Dashboard/Index.jsx)**
  - Menambahkan link pada tombol `+` di card secondary metrics (Aktivitas lapangan, Penjualan offline, Pemeriksaan internal).
  - Update tombol `+` menjadi komponen `<Link>` dari Inertia yang mengarah ke masing-masing halaman index:
    - **Aktivitas lapangan:** `admin.leads.index`
    - **Penjualan offline:** `admin.offline-sales.index`
    - **Pemeriksaan internal:** `admin.examinations.index`
