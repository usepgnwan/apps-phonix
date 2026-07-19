import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronDown,
    CircleOff,
    Eye,
    Layers,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
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

const inputClassName =
    'w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-sm font-body-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]';

const filterLabelClassName =
    'mb-2 block font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400';

const iconButtonClassName =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition';

const emptyForm = {
    name: '',
    slug: '',
    is_active: true,
};

function StatusFilterChip({ label, count, icon: IconComponent, isActive, onClick }) {
    const numericCount = Number(String(count).replace(/[^\d.-]/g, '')) || 0;
    const showBadge = numericCount > 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-body-sm text-xs font-bold transition ${
                isActive
                    ? 'border-[#1E4D3A] bg-[#1E4D3A] text-white shadow-sm shadow-[#1E4D3A]/20'
                    : 'border-[#E5E7EB] bg-white text-gray-600 hover:border-[#A8C5B3] hover:text-[#1E4D3A]'
            }`}
        >
            <IconComponent aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
            {showBadge && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white">
                    {numericCount > 99 ? '99+' : numericCount}
                </span>
            )}
        </button>
    );
}

function buildFilterParams(filters, overrides = {}) {
    const next = {
        search: filters.search || undefined,
        status: filters.status && filters.status !== 'all' ? filters.status : undefined,
        per_page: filters.per_page || undefined,
        ...overrides,
    };

    Object.keys(next).forEach((key) => {
        if (next[key] === null || next[key] === '' || next[key] === undefined) {
            delete next[key];
        }
    });

    return next;
}

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

function LeadSourceActionButtons({ source, onEdit }) {
    return (
        <div className="flex items-center gap-1.5">
            <Link
                aria-label="Lihat detail sumber lead"
                className={`${iconButtonClassName} border-[#1E4D3A]/20 bg-[#1E4D3A]/5 text-[#1E4D3A] hover:bg-[#1E4D3A] hover:text-white`}
                href={route('admin.lead-sources.show', source.id)}
                title="Detail"
            >
                <Eye aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <button
                aria-label="Edit sumber lead"
                className={`${iconButtonClassName} border-[#A8C5B3] bg-[#A8C5B3]/15 text-[#1E4D3A] hover:bg-[#A8C5B3]/35`}
                onClick={() => onEdit(source)}
                title="Edit"
                type="button"
            >
                <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <AdminDeleteButton
                className={`${iconButtonClassName} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                description="Sumber lead akan dihapus dari master CRM admin."
                itemName={source.name}
                routeName="admin.lead-sources.destroy"
                routeParams={source.id}
                title="Hapus sumber lead?"
            >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="sr-only">Hapus</span>
            </AdminDeleteButton>
        </div>
    );
}

function AdminLeadSourcesIndex({
    leadSources = {},
    metrics = {},
    filters = {},
}) {
    const items = leadSources?.data ?? [];
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        ...emptyForm,
    });

    const lifecycleCards = [
        { id: 'all', label: 'Semua Sumber', count: metrics.total, icon: Layers },
        { id: 'active', label: 'Aktif', count: metrics.active, icon: CheckCircle2 },
        { id: 'inactive', label: 'Nonaktif', count: metrics.inactive, icon: CircleOff },
    ];

    const currentStatus = filters.status || 'all';
    const selectedStatusLabel = lifecycleCards.find((card) => card.id === currentStatus)?.label;
    const hasActiveFilters = Boolean(
        filters.search ||
        (filters.status && filters.status !== 'all') ||
        (filters.per_page && Number(filters.per_page) !== 10),
    );

    const applyFilters = (overrides = {}) => {
        router.get(
            route('admin.lead-sources.index'),
            buildFilterParams(filters, {
                page: 1,
                search: searchValue || null,
                ...overrides,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleStatusClick = (status) => {
        applyFilters({ status: status === 'all' ? null : status });
    };

    const handleSearchSubmit = () => {
        applyFilters({ search: searchValue || null });
    };

    const handleResetFilters = () => {
        setSearchValue('');
        router.get(route('admin.lead-sources.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
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

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Lead & CRM
                                </p>
                                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                    Daftar Sumber Lead
                                </h2>
                                {filters.status && filters.status !== 'all' ? (
                                    <p className="mt-1 flex flex-wrap items-center gap-2 font-body-sm text-xs text-gray-500">
                                        <span className="inline-flex items-center rounded-full bg-[#1E4D3A]/10 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                            {selectedStatusLabel || filters.status}
                                        </span>
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-body-sm text-xs font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                    >
                                        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 bg-[#F9FAFB]/70 p-5 sm:p-6">
                        <div>
                            <p className={filterLabelClassName}>Status Sumber</p>
                            <div className="flex flex-wrap gap-2.5">
                                {lifecycleCards.map((card) => (
                                    <StatusFilterChip
                                        key={card.id}
                                        label={card.label}
                                        count={card.count}
                                        icon={card.icon}
                                        isActive={currentStatus === card.id}
                                        onClick={() => handleStatusClick(card.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_auto]">
                            <div className="min-w-0">
                                <label className={filterLabelClassName} htmlFor="lead-sources-filter-search">
                                    Pencarian
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="lead-sources-filter-search"
                                        type="text"
                                        placeholder="Cari nama atau slug sumber lead..."
                                        className={`${inputClassName} pl-11 pr-4`}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onBlur={handleSearchSubmit}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchSubmit();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-auto sm:justify-self-start xl:w-[7.5rem]">
                                <label className={filterLabelClassName} htmlFor="lead-sources-filter-per-page">
                                    Tampilkan
                                </label>
                                <div className="relative w-[7.5rem]">
                                    <select
                                        id="lead-sources-filter-per-page"
                                        value={filters.per_page || 10}
                                        onChange={(e) => applyFilters({ per_page: e.target.value })}
                                        className={`${inputClassName} appearance-none px-3 pr-8`}
                                    >
                                        <option value={10}>10 data</option>
                                        <option value={15}>15 data</option>
                                        <option value={25}>25 data</option>
                                        <option value={50}>50 data</option>
                                        <option value={100}>100 data</option>
                                    </select>
                                    <ChevronDown
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="border-t border-[#E5E7EB] p-5">
                            <EmptyState
                                description="Data sumber lead tidak ditemukan dengan filter yang diberikan."
                                title="Data kosong."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto border-t border-[#E5E7EB]">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" scope="col">
                                            Aksi
                                        </th>
                                        {['Nama', 'Slug', 'Jumlah Lead', 'Status'].map((heading) => (
                                            <th
                                                className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                                key={heading}
                                                scope="col"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {items.map((source) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={source.id}>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <LeadSourceActionButtons source={source} onEdit={openEditModal} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {source.name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {source.slug || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {formatNumber(source.leads_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge
                                                    label={source.is_active ? 'Aktif' : 'Nonaktif'}
                                                    tone={source.is_active ? 'forest' : 'gray'}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {leadSources.links && (
                        <div className="border-t border-[#E5E7EB] p-5">
                            <Pagination links={leadSources.links} />
                        </div>
                    )}
                </AdminCard>
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

AdminLeadSourcesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSourcesIndex;
