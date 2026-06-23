import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Admin/Pagination';

export default function Index({ staff, positions, teams, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_number: '',
        team_id: '',
        position_id: '',
        password: '',
        photo: null,
        _method: 'post',
    });

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.staff.index'), { search: newSearch, per_page: newPerPage }, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        handleFilterChange(e.target.value, perPage);
    };

    const handleLimitChange = (e) => {
        setPerPage(e.target.value);
        handleFilterChange(search, e.target.value);
    };

    const openCreateModal = () => {
        reset();
        setData('_method', 'post');
        setPhotoPreview(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (s) => {
        setSelectedStaff(s);
        setPhotoPreview(s.photo ? `/storage/${s.photo}` : null);
        setData({
            name: s.name,
            email: s.email,
            phone_number: s.phone_number || '',
            team_id: s.team_id || '',
            position_id: s.position_id || '',
            password: '',
            photo: null,
            _method: 'put',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (s) => {
        setSelectedStaff(s);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.staff.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setPhotoPreview(null);
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        // Gunakan post karena form mengandung file (method spoofing)
        post(route('admin.staff.update', selectedStaff.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                setSelectedStaff(null);
                setPhotoPreview(null);
            }
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.staff.destroy', selectedStaff.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedStaff(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Staff" />
            <AdminPageHeader 
                title="Staff Lapangan" 
                subtitle="Kelola data staff untuk penjualan offline"
                action={
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm transition hover:bg-[#163B2C] focus:outline-none focus:ring-2 focus:ring-[#1E4D3A] focus:ring-offset-2"
                    >
                        <Plus aria-hidden="true" className="h-4 w-4" />
                        Tambah Staff
                    </button>
                }
            />

            <AdminCard className="overflow-hidden">
                <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, telp, atau tim..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Tampilkan</span>
                        <select
                            value={perPage}
                            onChange={handleLimitChange}
                            className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>data</span>
                    </div>
                </div>

                {staff.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Informasi Staff</th>
                                    <th className="px-6 py-4">Tim & Jabatan</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] font-body-sm">
                                {staff.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {s.photo ? (
                                                    <img src={`/storage/${s.photo}`} alt={s.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E4D3A]/10 text-[#1E4D3A] font-bold">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[#333333]">{s.name}</p>
                                                    <p className="text-xs text-gray-500">{s.email}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{s.phone_number || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#333333]">{s.position?.name || '-'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{s.team ? `Tim: ${s.team.name}` : '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(s)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(s)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-5 border-t border-[#E5E7EB]">
                            <Pagination links={staff.links} />
                        </div>
                    </div>
                ) : (
                    <div className="py-12">
                        <EmptyState 
                            title="Tidak ada staff" 
                            description="Belum ada data staff lapangan yang ditambahkan." 
                        />
                    </div>
                )}
            </AdminCard>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-bold text-[#333333] mb-4">Tambah Staff Lapangan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.phone_number}
                                onChange={e => setData('phone_number', e.target.value)}
                            />
                            {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.position_id}
                                onChange={e => setData('position_id', e.target.value)}
                            >
                                <option value="">-- Pilih Jabatan --</option>
                                {positions.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.position_id && <p className="mt-1 text-xs text-red-500">{errors.position_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tim</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.team_id}
                                onChange={e => setData('team_id', e.target.value)}
                            >
                                <option value="">-- Pilih Tim --</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.team_id && <p className="mt-1 text-xs text-red-500">{errors.team_id}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Profil (Opsional)</label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A]/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1E4D3A] hover:file:bg-[#1E4D3A]/20"
                                />
                            </div>
                            {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Biarkan kosong untuk password default (password123)"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163B2C] disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="text-lg font-bold text-[#333333] mb-4">Edit Staff Lapangan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.phone_number}
                                onChange={e => setData('phone_number', e.target.value)}
                            />
                            {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.position_id}
                                onChange={e => setData('position_id', e.target.value)}
                            >
                                <option value="">-- Pilih Jabatan --</option>
                                {positions.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.position_id && <p className="mt-1 text-xs text-red-500">{errors.position_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tim</label>
                            <select
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.team_id}
                                onChange={e => setData('team_id', e.target.value)}
                            >
                                <option value="">-- Pilih Tim --</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.team_id && <p className="mt-1 text-xs text-red-500">{errors.team_id}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Profil (Opsional)</label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A]/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#1E4D3A] hover:file:bg-[#1E4D3A]/20"
                                />
                            </div>
                            {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Biarkan kosong jika tidak ingin mengubah password"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163B2C] disabled:opacity-50"
                        >
                            Perbarui
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <form onSubmit={handleDelete} className="p-6">
                    <h2 className="text-lg font-bold text-[#333333] mb-4">Hapus Staff</h2>
                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus staff <strong>{selectedStaff?.name}</strong>?
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Hapus
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
