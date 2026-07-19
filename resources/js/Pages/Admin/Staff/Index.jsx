import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Admin/Pagination';

export default function Index({
    staff,
    filters,
    branches = [],
    showBranchFilter = false,
    lockedBranchName = null,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [branchId, setBranchId] = useState(filters?.branch_id || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const { delete: destroy, processing, reset } = useForm({});

    const handleFilterChange = (newSearch, newBranchId, newPerPage) => {
        router.get(
            route('admin.staff.index'),
            {
                search: newSearch || undefined,
                branch_id: newBranchId || undefined,
                per_page: newPerPage,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        handleFilterChange(e.target.value, branchId, perPage);
    };

    const handleBranchChange = (e) => {
        setBranchId(e.target.value);
        handleFilterChange(search, e.target.value, perPage);
    };

    const handleLimitChange = (e) => {
        setPerPage(e.target.value);
        handleFilterChange(search, branchId, e.target.value);
    };

    const openDeleteModal = (s) => {
        setSelectedStaff(s);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedStaff(null);
        reset();
    };

    const handleDelete = (e) => {
        e.preventDefault();
        if (!selectedStaff) {
            return;
        }

        destroy(route('admin.staff.destroy', selectedStaff.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Staff" />
            <AdminPageHeader
                title="Staff Lapangan"
                description={
                    lockedBranchName
                        ? `Kelola staff lapangan cabang ${lockedBranchName}.`
                        : 'Kelola data staff lapangan per cabang untuk penjualan offline dan referral.'
                }
                eyebrow="Organisasi / Staff"
                action={
                    <Link
                        href={route('admin.staff.create')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm transition hover:bg-[#163B2C] focus:outline-none focus:ring-2 focus:ring-[#1E4D3A] focus:ring-offset-2"
                    >
                        <Plus aria-hidden="true" className="h-4 w-4" />
                        Tambah Staff
                    </Link>
                }
            />

            <AdminCard className="overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, telp, atau kode..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {showBranchFilter ? (
                            <select
                                value={branchId || ''}
                                onChange={handleBranchChange}
                                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                            >
                                <option value="">Semua cabang</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        ) : lockedBranchName ? (
                            <span className="rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-3 py-2 text-xs font-semibold text-gray-600">
                                Cabang: {lockedBranchName}
                            </span>
                        ) : null}
                        <div className="flex items-center gap-2">
                            <span>Tampilkan</span>
                            <select
                                value={perPage}
                                onChange={handleLimitChange}
                                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>data</span>
                        </div>
                    </div>
                </div>

                {staff.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Informasi Staff</th>
                                    <th className="px-6 py-4">Tim & Jabatan</th>
                                    <th className="px-6 py-4">Cabang</th>
                                    <th className="px-6 py-4">Referral</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] font-body-sm">
                                {staff.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {s.photo ? (
                                                    <img
                                                        src={`/storage/${s.photo}`}
                                                        alt={s.name}
                                                        className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E4D3A]/10 font-bold text-[#1E4D3A]">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[#333333]">{s.name}</p>
                                                    <p className="text-xs text-gray-500">{s.email}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {s.phone_number || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#333333]">
                                                {s.position?.name || '-'}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {s.team ? `Tim: ${s.team.name}` : '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-full bg-[#F6F7F7] px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                {s.branch?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold tracking-wide text-[#1E4D3A]">
                                                {s.staff_code || '-'}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Daftar: {s.referred_customers_count ?? 0}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.staff.edit', s.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(s)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                                                    title="Hapus"
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
                        <div className="border-t border-[#E5E7EB] p-5">
                            <Pagination links={staff.links} />
                        </div>
                    </div>
                ) : (
                    <div className="py-12">
                        <EmptyState
                            title="Tidak ada staff"
                            description={
                                lockedBranchName
                                    ? `Belum ada staff lapangan di cabang ${lockedBranchName}.`
                                    : branchId
                                      ? 'Tidak ada staff di cabang yang dipilih. Coba cabang lain atau hapus filter.'
                                      : 'Belum ada data staff lapangan yang ditambahkan.'
                            }
                        />
                    </div>
                )}
            </AdminCard>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <form onSubmit={handleDelete} className="p-6">
                    <h2 className="mb-2 text-lg font-bold text-[#1E4D3A]">Hapus Staff</h2>
                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus staff{' '}
                        <strong>{selectedStaff?.name}</strong>?
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
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
