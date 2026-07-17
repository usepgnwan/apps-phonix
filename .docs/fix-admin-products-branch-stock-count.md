# Fix: Count stok/cabang di `/admin/products`

Tanggal: 2026-07-17

## Masalah (production)

Di list produk (`/admin/products`), label stok/cabang dan badge "Stok Rendah" terasa tidak sesuai dengan detail "Stok Per Cabang".

Contoh PASON di production:
- List: `STOK (6 CABANG) · 16 tersedia · Ambang -` + badge Stok Rendah
- Detail: 6 baris cabang, total 8+0+4+0+0+4 = 16

Total angka list/detail sebenarnya cocok, tetapi:
1. Badge "Stok Rendah" false-positive saat `low_stock_threshold = 0` dan ada cabang stok 0
2. Hitungan frontend rawan salah jika `stock_quantity` datang sebagai string (concat JS)
3. Baris stok cabang soft-deleted / orphan bisa ikut terhitung
4. Logika low-stock di Index vs Show tidak konsisten

## Perbaikan

### Frontend
- `resources/js/Pages/Admin/Products/Index.jsx`
  - Coerce `Number()` untuk quantity
  - Hanya hitung `branch_stocks` yang punya relasi `branch`
  - Low stock hanya jika `threshold > 0` dan `qty <= threshold`
  - Hitung `stockInfo` sekali per card (hindari recompute berulang)
- `resources/js/Pages/Admin/Products/Show.jsx`
  - Samakan logika total stok + low stock dengan Index
  - Stok 0 tetap ditandai merah di baris cabang (indikator visual stok kosong)
  - Badge "Stok Rendah" produk hanya jika ambang terkonfigurasi

### Backend
- `app/Models/BranchProductStock.php`
  - Cast `stock_quantity` dan `low_stock_threshold` ke integer
- `app/Http/Controllers/Admin/ProductController.php`
  - Load `branchStocks` dengan `whereHas('branch')` di index/show/edit
- `app/Http/Controllers/Admin/DashboardController.php`
  - Low stock query: `low_stock_threshold > 0` + `whereHas('branch')`

### Test
- `tests/Feature/AdminCatalogTest.php`
  - Test stok cabang valid vs soft-deleted
  - Assert cast integer
  - Helper Inertia version header

## Hasil untuk kasus PASON production

Setelah deploy:
- Total stok tetap **16**
- Label cabang tetap **6 Cabang** (semua baris stok valid)
- Badge **Stok Rendah** **tidak** muncul lagi jika semua ambang = 0
- Cabang stok 0 di detail tetap merah (stok kosong)

## Verifikasi

```bash
php artisan test --filter=AdminCatalogTest
```

Lolos: 11 tests.
