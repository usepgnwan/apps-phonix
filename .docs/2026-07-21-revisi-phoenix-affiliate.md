# Revisi Phoenix Affiliate (21 Jul 2026)

Implementasi berdasarkan dokumen revisi:

1. Portal Marketing Kit (Bahan Promosi)
2. Menu Skema Komisi di dashboard afiliator
3. Menu Affiliate di header website publik

## 1. Marketing Kit

### Admin
- Route: `/admin/marketing-kits`
- Menu sidebar: **Affiliate → Marketing Kit**
- Fitur: upload, edit, hapus materi (gambar / copywriting / video / PDF)
- File disimpan di `public/files/marketing-kits/`

### Afiliator
- Route: `/customer/affiliate/marketing-kits`
- Menu sidebar: **Bahan Promosi**
- Fitur: filter kategori, salin teks, unduh file, lihat/play

### Database
- Tabel: `marketing_kits`
- Migration: `2026_07_21_100001_create_marketing_kits_table.php`

## 2. Skema Komisi

- Route: `/customer/affiliate/commission-scheme`
- Menu sidebar: **Skema Komisi**
- Data diambil dari `affiliate_commission_rules` aktif
- Kolom: kategori, nama item, harga jual, skema komisi, nominal komisi

## 3. Header Website

- Menu **Affiliate** ditambahkan di `PublicShell` (desktop nav)
- Posisi: setelah **Cek Pesanan** (paling kanan di nav)
- Link: `route('affiliate.landing') + #skema-komisi` → `/affiliate#skema-komisi`

## File utama

### Backend
- `app/Models/MarketingKit.php`
- `app/Http/Controllers/Admin/MarketingKitController.php`
- `app/Http/Requests/Admin/StoreMarketingKitRequest.php`
- `app/Http/Requests/Admin/UpdateMarketingKitRequest.php`
- `app/Http/Controllers/Customer/AffiliateDashboardController.php` (method baru)
- `routes/web.php`

### Frontend
- `resources/js/Pages/Admin/MarketingKits/Index.jsx`
- `resources/js/Pages/Customer/Affiliate/MarketingKits.jsx`
- `resources/js/Pages/Customer/Affiliate/CommissionScheme.jsx`
- `resources/js/Layouts/AdminLayout.jsx`
- `resources/js/Layouts/CustomerLayout.jsx`
- `resources/js/Components/Public/commerce.jsx`

## Setup setelah pull

```bash
php artisan migrate
```

Tidak ada package dependency baru.
