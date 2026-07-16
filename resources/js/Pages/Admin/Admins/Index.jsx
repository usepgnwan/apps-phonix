import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Admin/Pagination';

const emptyForm = {
    name: '',
    email: '',
    phone_number: '',
    password: '',
    admin_scope: 'central',
    branch_id: '',
    is_active: true,
};

const inputClassName =
    'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]';

function AdminFormFields({ data, setData, errors, branches, isEdit }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                    type="text"
                    className={inputClassName}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    className={inputClassName}
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input
                    type="text"
                    className={inputClassName}
                    value={data.phone_number}
                    onChange={(e) => setData('phone_number', e.target.value)}
                />
                {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {isEdit ? '(opsional)' : ''}
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className={`${inputClassName} pr-11`}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Default: password123'}
                        autoComplete={isEdit ? 'new-password' : 'new-password'}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-[#1E4D3A] focus:outline-none"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                        {showPassword ? (
                            <EyeOff aria-hidden="true" className="h-4 w-4" />
                        ) : (
                            <Eye aria-hidden="true" className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope Admin</label>
                <select
                    className={inputClassName}
                    value={data.admin_scope}
                    onChange={(e) => {
                        const scope = e.target.value;
                        setData({
                            ...data,
                            admin_scope: scope,
                            branch_id: scope === 'branch' ? data.branch_id : '',
                        });
                    }}
                    required
                >
                    <option value="central">Admin Pusat</option>
                    <option value="branch">Admin Cabang</option>
                </select>
                {errors.admin_scope && <p className="mt-1 text-xs text-red-500">{errors.admin_scope}</p>}
            </div>
            {data.admin_scope === 'branch' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
                    <select
                        className={inputClassName}
                        value={data.branch_id}
                        onChange={(e) => setData('branch_id', e.target.value)}
                        required
                    >
                        <option value="">-- Pilih Cabang --</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}{b.code ? ` (${b.code})` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.branch_id && <p className="mt-1 text-xs text-red-500">{errors.branch_id}</p>}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Akun</label>
                <select
                    className={inputClassName}
                    value={data.is_active ? '1' : '0'}
                    onChange={(e) => setData('is_active', e.target.value === '1')}
                >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                </select>
                {errors.is_active && <p className="mt-1 text-xs text-red-500">{errors.is_active}</p>}
            </div>
        </div>
    );
}

export default function Index({ admins, branches = [], filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        ...emptyForm,
    });

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.admins.index'), { search: newSearch, per_page: newPerPage }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
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
        setData({ ...emptyForm });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (admin) => {
        setSelectedAdmin(admin);
        setData({
            name: admin.name || '',
            email: admin.email || '',
            phone_number: admin.phone_number || '',
            password: '',
            admin_scope: admin.admin_scope || 'central',
            branch_id: admin.branch_id || '',
            is_active: admin.is_active ?? true,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (admin) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.admins.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('admin.admins.update', selectedAdmin.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                setSelectedAdmin(null);
            },
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.admins.destroy', selectedAdmin.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedAdmin(null);
            },
        });
    };

    const scopeLabel = (admin) => {
        if (admin.admin_scope === 'central') {
            return 'Admin Pusat';
        }
        if (admin.admin_scope === 'branch') {
            return admin.branch?.name ? `Cabang: ${admin.branch.name}` : 'Admin Cabang';
        }
        return admin.admin_scope || '-';
    };

    return (
        <AdminLayout>
            <Head title="Kelola Admin" />
            <AdminPageHeader
                title="Kelola Admin"
                subtitle="Kelola Admin Pusat dan Admin Cabang"
                action={
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm transition hover:bg-[#163B2C] focus:outline-none focus:ring-2 focus:ring-[#1E4D3A] focus:ring-offset-2"
                        type="button"
                    >
                        <Plus aria-hidden="true" className="h-4 w-4" />
                        Tambah Admin
                    </button>
                }
            />

            <AdminCard className="overflow-hidden">
                <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
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
                        </select>
                        <span>data</span>
                    </div>
                </div>

                {admins.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">Scope</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] font-body-sm">
                                {admins.data.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#333333]">{admin.name}</p>
                                            <p className="text-xs text-gray-500">{admin.email}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{admin.phone_number || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                admin.admin_scope === 'central'
                                                    ? 'bg-[#1E4D3A]/10 text-[#1E4D3A]'
                                                    : 'bg-amber-50 text-amber-800'
                                            }`}>
                                                {scopeLabel(admin)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                admin.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {admin.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                                    title="Edit"
                                                    type="button"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(admin)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                    title="Nonaktifkan"
                                                    type="button"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="border-t border-[#E5E7EB] px-5 py-4">
                            <Pagination links={admins.links} />
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        title="Belum ada admin"
                        description="Tambahkan Admin Pusat atau Admin Cabang untuk mulai mengelola akses."
                    />
                )}
            </AdminCard>

            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-bold text-[#1E4D3A] mb-4">Tambah Admin</h2>
                    <AdminFormFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        branches={branches}
                        isEdit={false}
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
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

            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="md">
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="text-lg font-bold text-[#1E4D3A] mb-4">Edit Admin</h2>
                    <AdminFormFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        branches={branches}
                        isEdit
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
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

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <form onSubmit={handleDelete} className="p-6">
                    <h2 className="text-lg font-bold text-[#1E4D3A] mb-2">Nonaktifkan Admin?</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Admin <span className="font-semibold">{selectedAdmin?.name}</span> akan dinonaktifkan
                        dan tidak bisa login.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Nonaktifkan
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
