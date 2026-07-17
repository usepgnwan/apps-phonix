# Fitur: Stok Cabang (Admin Pusat)

Tanggal: 2026-07-17

## Request client

Ingin melihat stok keseluruhan produk per cabang.

## Keputusan MVP

| Poin | Keputusan |
|---|---|
| Akses | Admin Pusat saja |
| Alur | Default cabang Pusat/Head Office; bisa ganti cabang |
| Mode | Read-only |
| Export | Tidak (fase berikutnya) |
| Filter stok | Hanya `stock_quantity > 0` |
| Produk nonaktif | Tetap tampil jika stok > 0 |

## Implementasi

### Route
- `GET /admin/stock` → `admin.stock.index`

### Backend
- `app/Http/Controllers/Admin/BranchStockController.php`
  - `authorizeAdminPusat()`
  - Dropdown cabang aktif
  - Default cabang: code `PST` / nama mengandung `pusat` / `head office`; fallback cabang aktif pertama
  - Query `BranchProductStock` per cabang, `stock_quantity > 0`
  - Search nama produk
  - Summary: jumlah produk berstok + total unit
  - Pagination

### Frontend
- `resources/js/Pages/Admin/Stock/Index.jsx`
  - Filter cabang wajib
  - Search + per page
  - Summary cards
  - Tabel read-only + link Detail produk

### Navigasi
- Menu **Master Data → Stok Cabang** (`centralOnly: true`)
- Icon: `Warehouse`

## Out of scope (fase berikutnya)
- Export Excel/CSV
- Matriks multi-cabang
- Edit stok inline
- Admin cabang
- Tampilkan stok 0

## Verifikasi

```bash
php artisan test --filter=AdminBranchStockTest
```
