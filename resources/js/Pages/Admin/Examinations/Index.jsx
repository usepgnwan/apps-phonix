import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ClipboardList,
    Eye,
    FileText,
    MapPin,
    PackageCheck,
    Plus,
    RotateCcw,
    Search,
    UserCheck,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import DateRangePicker from '@/Components/Admin/DateRangePicker';
import EmptyState from '@/Components/Admin/EmptyState';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatNumber, formatDateTime } from '@/utils/format';

const inputClassName =
    'w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-sm font-body-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]';

const filterLabelClassName =
    'mb-2 block font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400';

function serviceName(examination) {
    return examination.service_type
        ?? examination.booking?.service?.name
        ?? examination.booking?.booking_number
        ?? '-';
}

function recommendations(examination) {
    return examination.product_recommendations ?? examination.productRecommendations ?? [];
}

function resolveBranchName(examination) {
    return examination.booking?.branch?.name
        ?? examination.assigned_staff?.branch?.name
        ?? examination.assignedStaff?.branch?.name
        ?? examination.creator?.branch?.name
        ?? null;
}

function customerName(examination) {
    return examination.customer_profile?.name
        ?? examination.customerProfile?.name
        ?? 'Customer';
}

function staffName(examination) {
    return examination.assigned_staff?.name
        ?? examination.assignedStaff?.name
        ?? '-';
}

function resultPdfUrl(path) {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `/storage/${String(path).replace(/^\/+/, '')}`;
}

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
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        filter: filters.filter && filters.filter !== 'all' ? filters.filter : undefined,
        branch_id: filters.branch_id || undefined,
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

function ExaminationActionButtons({ examination }) {
    const pdfUrl = resultPdfUrl(examination.result_pdf_path);

    return (
        <div className="flex items-center gap-1.5">
            <Link
                aria-label="Lihat detail pemeriksaan"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E4D3A]/20 bg-[#1E4D3A]/5 text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                href={route('admin.examinations.show', examination.id)}
                title="Detail"
            >
                <Eye aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            {pdfUrl ? (
                <a
                    aria-label="Lihat hasil PDF"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition hover:bg-gray-100 hover:text-[#333333]"
                    href={pdfUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="Hasil PDF"
                >
                    <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
            ) : null}
        </div>
    );
}

function AdminPemeriksaanIndex({
    examinations = {},
    metrics = {},
    filters = {},
    branches = [],
    showBranchFilter = false,
    lockedBranchName = null,
}) {
    const items = examinations?.data ?? [];
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const lifecycleCards = [
        { id: 'all', label: 'Semua', count: metrics.total, icon: ClipboardList },
        { id: 'with_recommendations', label: 'Dengan Rekomendasi', count: metrics.withRecommendations, icon: PackageCheck },
        { id: 'assigned', label: 'Staff Assigned', count: metrics.assignedToStaff, icon: UserCheck },
    ];

    const currentFilter = filters.filter || 'all';
    const hasBranchesOption = showBranchFilter && branches && branches.length > 0;
    const selectedBranchName = filters.branch_id
        ? (branches.find((branch) => String(branch.id) === String(filters.branch_id))?.name ?? null)
        : null;
    const selectedFilterLabel = lifecycleCards.find((card) => card.id === currentFilter)?.label;
    const hasActiveFilters = Boolean(
        filters.search ||
        filters.start_date ||
        filters.end_date ||
        (filters.filter && filters.filter !== 'all') ||
        (showBranchFilter && filters.branch_id) ||
        (filters.per_page && Number(filters.per_page) !== 10),
    );

    const applyFilters = (overrides = {}) => {
        router.get(
            route('admin.examinations.index'),
            buildFilterParams(filters, {
                page: 1,
                search: searchValue || null,
                ...overrides,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleFilterChipClick = (filterId) => {
        applyFilters({ filter: filterId === 'all' ? null : filterId });
    };

    const handleSearchSubmit = () => {
        applyFilters({ search: searchValue || null });
    };

    const handleResetFilters = () => {
        setSearchValue('');
        router.get(
            route('admin.examinations.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Admin Pemeriksaan" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('admin.examinations.create')}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Pemeriksaan
                        </Link>
                    )}
                    description="Kelola riwayat hasil pemeriksaan customer dan rekomendasi produk. Input pemeriksaan baru tersedia di halaman terpisah."
                    eyebrow="Booking & Customer / Pemeriksaan"
                    title="Pemeriksaan"
                />

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Booking & Customer
                                </p>
                                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                    Daftar Pemeriksaan
                                </h2>
                                {(filters.filter && filters.filter !== 'all') || filters.start_date || filters.end_date ? (
                                    <p className="mt-1 flex flex-wrap items-center gap-2 font-body-sm text-xs text-gray-500">
                                        {filters.filter && filters.filter !== 'all' ? (
                                            <span className="inline-flex items-center rounded-full bg-[#1E4D3A]/10 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                                {selectedFilterLabel || filters.filter}
                                            </span>
                                        ) : null}
                                        {filters.start_date || filters.end_date ? (
                                            <span className="inline-flex items-center rounded-full bg-[#A8C5B3]/25 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                                {filters.start_date || '…'} — {filters.end_date || '…'}
                                            </span>
                                        ) : null}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end">
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                                    <MapPin aria-hidden="true" className="h-3 w-3" />
                                    {lockedBranchName || selectedBranchName || 'Semua Cabang'}
                                </span>
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
                            <p className={filterLabelClassName}>Filter Cepat</p>
                            <div className="flex flex-wrap gap-2.5">
                                {lifecycleCards.map((card) => (
                                    <StatusFilterChip
                                        key={card.id}
                                        label={card.label}
                                        count={card.count}
                                        icon={card.icon}
                                        isActive={currentFilter === card.id}
                                        onClick={() => handleFilterChipClick(card.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                            <div className="min-w-0">
                                <label className={filterLabelClassName} htmlFor="examinations-filter-search">
                                    Pencarian
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="examinations-filter-search"
                                        type="text"
                                        placeholder="Cari customer, staff, keluhan, layanan, no. booking..."
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

                            <div className="min-w-0">
                                <label className={filterLabelClassName} htmlFor="examinations-filter-branch">
                                    Cabang
                                </label>
                                {hasBranchesOption ? (
                                    <div className="relative">
                                        <MapPin
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E4D3A]"
                                        />
                                        <select
                                            id="examinations-filter-branch"
                                            className={`${inputClassName} appearance-none pl-10 pr-10`}
                                            value={filters.branch_id || ''}
                                            onChange={(e) => applyFilters({ branch_id: e.target.value || null })}
                                        >
                                            <option value="">Semua Cabang</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            aria-hidden="true"
                                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                        />
                                    </div>
                                ) : lockedBranchName ? (
                                    <div className="inline-flex h-[42px] w-full items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-3.5 font-body-sm text-sm font-bold text-[#1E4D3A]">
                                        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{lockedBranchName}</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex h-[42px] w-full items-center rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3.5 font-body-sm text-sm text-gray-400">
                                        Semua Cabang
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className={filterLabelClassName}>Periode Dibuat</p>
                                <DateRangePicker
                                    startDate={filters.start_date || null}
                                    endDate={filters.end_date || null}
                                    onChange={({ start_date, end_date }) =>
                                        applyFilters({
                                            start_date: start_date || null,
                                            end_date: end_date || null,
                                        })
                                    }
                                />
                            </div>

                            <div className="w-full sm:w-auto sm:justify-self-start xl:w-[7.5rem]">
                                <label className={filterLabelClassName} htmlFor="examinations-filter-per-page">
                                    Tampilkan
                                </label>
                                <div className="relative w-[7.5rem]">
                                    <select
                                        id="examinations-filter-per-page"
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
                                description="Data pemeriksaan tidak ditemukan dengan filter yang diberikan."
                                title="Data kosong."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto border-t border-[#E5E7EB]">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        <th
                                            className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                            scope="col"
                                        >
                                            Aksi
                                        </th>
                                        {[
                                            'Tanggal',
                                            'Cabang',
                                            'Customer',
                                            'Layanan / Booking',
                                            'Keluhan',
                                            'Staff',
                                            'Rekomendasi',
                                        ].map((heading) => (
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
                                    {items.map((examination) => {
                                        const branchName = resolveBranchName(examination);
                                        const recs = recommendations(examination);

                                        return (
                                            <tr className="transition hover:bg-[#A8C5B3]/10" key={examination.id}>
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <ExaminationActionButtons examination={examination} />
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                    {formatDateTime(examination.created_at)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    {branchName ? (
                                                        <span className="inline-flex rounded-full bg-[#1E4D3A]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E4D3A]">
                                                            {branchName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-xs font-medium text-[#333333]">
                                                    {customerName(examination)}
                                                </td>
                                                <td className="px-4 py-4 font-body-sm text-sm text-gray-600">
                                                    <div className="min-w-[140px] max-w-[220px]">
                                                        <p className="line-clamp-2 font-medium text-[#333333]">
                                                            {serviceName(examination)}
                                                        </p>
                                                        {examination.booking?.booking_number ? (
                                                            <p className="mt-0.5 text-xs text-gray-400">
                                                                {examination.booking.booking_number}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-body-sm text-sm text-gray-600">
                                                    <p className="line-clamp-2 min-w-[140px] max-w-[240px]">
                                                        {examination.complaint || '-'}
                                                    </p>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                    {staffName(examination)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-[#A8C5B3]/25 px-2.5 py-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                                                        {formatNumber(recs.length)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {examinations.links && (
                        <div className="border-t border-[#E5E7EB] p-5">
                            <Pagination links={examinations.links} />
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminPemeriksaanIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPemeriksaanIndex;
