import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import Modal from '@/Components/Modal';

export default function Index({ teams, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const handleSearch = (e) => {
        setSearch(e.target.value);
        router.get(route('admin.teams.index'), { search: e.target.value }, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (team) => {
        setSelectedTeam(team);
        setData({
            name: team.name,
            description: team.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (team) => {
        setSelectedTeam(team);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.teams.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('admin.teams.update', selectedTeam.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                setSelectedTeam(null);
            }
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.teams.destroy', selectedTeam.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedTeam(null);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Tim" />
            <AdminPageHeader 
                title="Tim" 
                subtitle="Kelola data tim untuk staff lapangan"
                action={
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm transition hover:bg-[#163B2C] focus:outline-none focus:ring-2 focus:ring-[#1E4D3A] focus:ring-offset-2"
                    >
                        <Plus aria-hidden="true" className="h-4 w-4" />
                        Tambah Tim
                    </button>
                }
            />

            <AdminCard className="overflow-hidden">
                <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama tim..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                        />
                    </div>
                </div>

                {teams.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Nama Tim</th>
                                    <th className="px-6 py-4">Deskripsi</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] font-body-sm">
                                {teams.data.map((team) => (
                                    <tr key={team.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-[#333333]">{team.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{team.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(team)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(team)}
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
                    </div>
                ) : (
                    <div className="py-12">
                        <EmptyState 
                            title="Tidak ada tim" 
                            description="Belum ada data tim yang ditambahkan." 
                        />
                    </div>
                )}
            </AdminCard>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="text-lg font-bold text-[#333333] mb-4">Tambah Tim</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tim</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                            <textarea
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
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
                    <h2 className="text-lg font-bold text-[#333333] mb-4">Edit Tim</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tim</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                            <textarea
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#1E4D3A] focus:ring-1 focus:ring-[#1E4D3A]"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
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
                    <h2 className="text-lg font-bold text-[#333333] mb-4">Hapus Tim</h2>
                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus tim <strong>{selectedTeam?.name}</strong>?
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
