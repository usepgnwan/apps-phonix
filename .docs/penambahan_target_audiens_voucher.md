# Penambahan Pilihan Target Audiens pada Voucher

**Deskripsi Perubahan:**
Menambahkan opsi bagi admin untuk menentukan kepada siapa sebuah voucher berlaku, yaitu: **Semua Pengguna** (all), **Hanya Member** (member), atau **Hanya Non-Member** (non_member).

**Detail Modifikasi:**
1. **Database**: 
   - Dibuat file migration `add_target_audience_to_vouchers_table` untuk menambahkan kolom `target_audience` di tabel `vouchers`. Default value diset ke `'all'`.
2. **Backend**:
   - Menambahkan `target_audience` pada atribut `$fillable` di model `App\Models\Voucher`.
   - Menambahkan validasi `Rule::in(['all', 'member', 'non_member'])` untuk form request `StoreVoucherRequest` dan `UpdateVoucherRequest`.
3. **Frontend**:
   - Ditambahkan field pilihan tipe *dropdown* pada form tambah (`Create.jsx`) dan edit (`Edit.jsx`) untuk `target_audience`.
   - Informasi target audiens ditampilkan pada halaman rincian voucher (`Show.jsx`).

**Perbaikan Tambahan**:
- Bug query `is_active` pada widget KPI di controller `VoucherController` telah diperbaiki. Query kini memanggil kolom `is_published` dan `ends_at`.
