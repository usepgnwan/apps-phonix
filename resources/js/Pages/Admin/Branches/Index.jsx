import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Trash2, Edit, MapPin } from 'lucide-react';

import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import Modal from '@/Components/Modal';

export default function Index({ branches }) {
    const [search, setSearch] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const { delete: destroy, processing, reset } = useForm({});

    const filteredBranches = branches.filter(
        (branch) =>
            branch.name.toLowerCase().includes(search.toLowerCase()) ||
            branch.code.toLowerCase().includes(search.toLowerCase()),
    );

    const openDeleteModal = (branch) => {
        setSelectedBranch(branch);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedBranch(null);
        reset();
    };

    const handleDelete = (event) => {
        event.preventDefault();
        if (!selectedBranch) {
            return;
        }

        destroy(route('admin.branches.destroy', selectedBranch.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    return (
        <>
            <Head title="Manajemen Cabang" />
            <div className="space-y-8">
                <AdminPageHeader
                    title="Cabang Phoenix"
                    description="Kelola data lokasi cabang dan toko offline"
                    eyebrow="Sistem / Cabang"
                    action={
                        <Link
                            href={route('admin.branches.create')}
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm transition hover:bg-[#163B2C] focus:outline-none focus:ring-2 focus:ring-[#1E4D3A] focus:ring-offset-2"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Cabang
                        </Link>
                    }
                />

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau kode cabang..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                            />
                        </div>
                    </div>

                    {filteredBranches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Informasi Cabang</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] font-body-sm">
                                    {filteredBranches.map((branch) => (
                                        <tr key={branch.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E4D3A]/10 text-[#1E4D3A]">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-bold text-[#333333]">{branch.name}</p>
                                                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                                {branch.code}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-gray-500">{branch.address || '-'}</p>
                                                        <p className="mt-0.5 text-xs text-gray-500">{branch.phone_number || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        branch.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {branch.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('admin.branches.edit', branch.id)}
                                                        className="text-gray-400 transition hover:text-[#1E4D3A]"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(branch)}
                                                        className="text-gray-400 transition hover:text-red-500"
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
                        </div>
                    ) : (
                        <EmptyState
                            icon={MapPin}
                            title={search ? 'Cabang tidak ditemukan' : 'Belum ada data cabang'}
                            description={
                                search
                                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                                    : 'Mulai dengan menambahkan data cabang pertama Anda.'
                            }
                            action={
                                search ? null : (
                                    <Link
                                        href={route('admin.branches.create')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm transition hover:bg-[#163B2C]"
                                    >
                                        <Plus aria-hidden="true" className="h-4 w-4" />
                                        Tambah Cabang
                                    </Link>
                                )
                            }
                        />
                    )}
                </AdminCard>
            </div>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="mb-2 text-center text-lg font-bold text-[#333333]">Hapus Cabang</h2>
                    <p className="mb-6 text-center font-body-sm text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus cabang &quot;{selectedBranch?.name}&quot;? Data yang sudah
                        dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            className="inline-flex w-full justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus Cabang'}
                        </button>
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;
