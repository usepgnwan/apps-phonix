import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { FieldError, TextField } from '@/Components/Admin/FormFields';
import { formatNumber } from '@/utils/format';

const emptyForm = {
    name: '',
    slug: '',
    is_active: true,
};

function CheckboxField({ checked, error, label, onChange }) {
    return (
        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
            <input
                checked={checked}
                className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type="checkbox"
            />
            <span>
                <span className="block font-body-sm text-sm font-bold text-[#333333]">{label}</span>
                <span className="block font-body-sm text-xs text-gray-500">
                    Sumber aktif dapat dipakai saat membuat lead.
                </span>
                <FieldError message={error} />
            </span>
        </label>
    );
}

function LeadSourceFormFields({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <TextField
                error={errors.name}
                label="Nama"
                name="name"
                onChange={(event) => setData('name', event.target.value)}
                value={data.name}
            />
            <TextField
                error={errors.slug}
                label="Slug"
                name="slug"
                onChange={(event) => setData('slug', event.target.value)}
                value={data.slug}
            />
            <CheckboxField
                checked={Boolean(data.is_active)}
                error={errors.is_active}
                label="Aktif"
                onChange={(event) => setData('is_active', event.target.checked)}
            />
        </div>
    );
}

function AdminLeadSumbersIndex({ leadSources, filters }) {
    const items = leadSources?.data ?? leadSources ?? [];

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        ...emptyForm,
    });

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.lead-sources.index'), { search: newSearch, per_page: newPerPage }, {
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
        clearErrors();
        reset();
        setData({ ...emptyForm });
        setSelectedSource(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (source) => {
        clearErrors();
        setSelectedSource(source);
        setData({
            name: source.name ?? '',
            slug: source.slug ?? '',
            is_active: Boolean(source.is_active),
        });
        setIsEditModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        clearErrors();
        reset();
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedSource(null);
        clearErrors();
        reset();
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.lead-sources.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setData({ ...emptyForm });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!selectedSource) {
            return;
        }

        patch(route('admin.lead-sources.update', selectedSource.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedSource(null);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Admin Sumber Lead" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            onClick={openCreateModal}
                            type="button"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Sumber
                        </button>
                    )}
                    description="Kelola sumber lead yang dipakai untuk tracking kanal CRM Phoenix."
                    eyebrow="Lead & CRM / Sumber Lead"
                    title="Sumber Lead"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari sumber lead..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Tampilkan</span>
                        <select
                            value={perPage}
                            onChange={handleLimitChange}
                            className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-white shadow-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>data</span>
                    </div>
                </div>

                {items.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState description="Lead source akan tampil di sini setelah dibuat." title="Belum ada lead source." />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {items.map((source) => (
                            <AdminCard className="p-5" key={source.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{source.slug}</p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{source.name}</h2>
                                    </div>
                                    <StatusBadge label={source.is_active ? 'Aktif' : 'Nonaktif'} tone={source.is_active ? 'forest' : 'gray'} />
                                </div>
                                <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Lead Count</p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(source.leads_count)}</p>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('admin.lead-sources.show', source.id)}
                                    >
                                        Detail
                                    </Link>
                                    <button
                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        onClick={() => openEditModal(source)}
                                        type="button"
                                    >
                                        Edit
                                    </button>
                                    <AdminDeleteButton
                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                        description="Sumber lead akan dihapus dari master CRM admin."
                                        itemName={source.name}
                                        routeName="admin.lead-sources.destroy"
                                        routeParams={source.id}
                                        title="Hapus sumber lead?"
                                    >
                                        Hapus
                                    </AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                        {leadSources.links?.length > 0 && (
                            <div className="col-span-1 xl:col-span-2 flex justify-center mt-2">
                                <Pagination links={leadSources.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Tambah Sumber Lead</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Tambahkan kanal sumber lead untuk tracking CRM Phoenix.
                    </p>
                    <LeadSourceFormFields data={data} setData={setData} errors={errors} />
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163B2C] disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Sumber'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="md">
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Edit Sumber Lead</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Perbarui sumber{selectedSource?.name ? `: ${selectedSource.name}` : ''}.
                    </p>
                    <LeadSourceFormFields data={data} setData={setData} errors={errors} />
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163B2C] disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

AdminLeadSumbersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSumbersIndex;
