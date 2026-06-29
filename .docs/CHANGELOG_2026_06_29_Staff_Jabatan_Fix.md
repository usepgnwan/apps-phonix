# Fix: Dropdown Jabatan di Admin Staff Tidak Menampilkan Semua Jabatan

**Tanggal:** 2026-06-29  
**File yang diubah:** `app/Http/Controllers/Admin/StaffController.php`

---

## Deskripsi Masalah

Dropdown **Jabatan** di form Tambah dan Edit Staff (halaman `Admin/Staff/Index`) hanya menampilkan maksimal 4 pilihan jabatan, padahal di database terdapat lebih dari 4 jabatan.

## Root Cause

Di `StaffController`, terdapat constant yang men-hardcode nama-nama jabatan yang diperbolehkan:

```php
private const STAFF_HIERARCHY_POSITIONS = [
    'Executive Premier',
    'Executive Leader',
    'Junior Leader',
    'Business Crew',
];
```

Method `staffHierarchyPositions()` hanya mengambil jabatan dari database yang namanya **cocok persis** dengan list di atas:

```php
private function staffHierarchyPositions()
{
    return Position::query()
        ->whereIn('name', self::STAFF_HIERARCHY_POSITIONS)
        ->get()
        ->sortBy(fn (Position $position) => array_search($position->name, self::STAFF_HIERARCHY_POSITIONS, true))
        ->values();
}
```

Akibatnya, jabatan yang namanya tidak ada di constant tersebut tidak akan pernah muncul di dropdown, meskipun sudah ditambahkan melalui halaman Manajemen Jabatan.

## Perubahan yang Dilakukan

### 1. Mengambil semua jabatan di method `index()`
```php
// Sebelum
'positions' => $this->staffHierarchyPositions(),

// Sesudah
'positions' => Position::orderBy('name')->get(),
```

### 2. Menyederhanakan validation rule `position_id`
```php
// Sebelum — hanya mengizinkan jabatan dari STAFF_HIERARCHY_POSITIONS
'position_id' => ['nullable', $this->staffHierarchyPositionRule()],

// Sesudah — mengizinkan semua jabatan yang ada di tabel positions
'position_id' => 'nullable|exists:positions,id',
```
Perubahan ini berlaku di method `store()` dan `update()`.

### 3. Menghapus kode yang tidak lagi digunakan
- Constant `STAFF_HIERARCHY_POSITIONS` dihapus
- Method `staffHierarchyPositions()` dihapus
- Method `staffHierarchyPositionRule()` dihapus

## Dampak

- Semua jabatan yang ada di tabel `positions` kini tampil di dropdown form tambah/edit staff
- Jabatan baru yang ditambahkan melalui halaman **Manajemen Jabatan** langsung tersedia di form staff tanpa perlu update kode
- Tidak ada perubahan pada file frontend (`Admin/Staff/Index.jsx`)
