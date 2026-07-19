import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    RotateCcw,
    Search,
    UserCheck,
    UserRound,
    Users,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import DateRangePicker from '@/Components/Admin/DateRangePicker';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatNumber, readableLabel } from '@/utils/format';

const inputClassName =
    'w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-sm font-body-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]';

const filterLabelClassName =
    'mb-2 block font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400';

function customerName(profile) {
    return profile.name ?? profile.user?.name ?? `Customer #${profile.id}`;
}

function userEmail(profile) {
    return profile.user?.email ?? '-';
}

function MemberBadge({ status }) {
    return (
        <StatusBadge
            label={readableLabel(status)}
            tone={status === 'member' ? 'forest' : 'gray'}
        />
    );
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
        member_status: filters.member_status && filters.member_status !== 'all'
            ? filters.member_status
            : undefined,
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

function CustomerActionButtons({ profile }) {
    return (
        <div className="flex items-center gap-1.5">
            <Link
                aria-label="Lihat detail customer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E4D3A]/20 bg-[#1E4D3A]/5 text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                href={route('admin.customers.show', profile.id)}
                title="Detail"
            >
                <Eye aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}

function AdminCustomerIndex({
    customerProfiles = {},
    metrics = {},
    filters = {},
}) {
    const items = customerProfiles?.data ?? [];
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const lifecycleCards = [
        { id: 'all', label: 'Semua Customer', count: metrics.total, icon: Users },
        { id: 'member', label: 'Member', count: metrics.members, icon: UserCheck },
        { id: 'non_member', label: 'Non Member', count: metrics.nonMembers, icon: UserRound },
    ];

    const currentMemberStatus = filters.member_status || 'all';
    const selectedMemberLabel = lifecycleCards.find((card) => card.id === currentMemberStatus)?.label;
    const hasActiveFilters = Boolean(
        filters.search ||
        filters.start_date ||
        filters.end_date ||
        (filters.member_status && filters.member_status !== 'all') ||
        (filters.per_page && Number(filters.per_page) !== 10),
    );

    const applyFilters = (overrides = {}) => {
        router.get(
            route('admin.customers.index'),
            buildFilterParams(filters, {
                page: 1,
                search: searchValue || null,
                ...overrides,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleMemberChipClick = (statusId) => {
        applyFilters({ member_status: statusId === 'all' ? null : statusId });
    };

    const handleSearchSubmit = () => {
        applyFilters({ search: searchValue || null });
    };

    const handleResetFilters = () => {
        setSearchValue('');
        router.get(
            route('admin.customers.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Admin Customer" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Pantau profil customer, status member, dan ringkasan aktivitas order, booking, serta voucher dari panel admin Phoenix."
                    eyebrow="Booking & Customer / Customer"
                    title="Customer"
                />

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Booking & Customer
                                </p>
                                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                    Daftar Customer
                                </h2>
                                {(filters.member_status && filters.member_status !== 'all') || filters.start_date || filters.end_date ? (
                                    <p className="mt-1 flex flex-wrap items-center gap-2 font-body-sm text-xs text-gray-500">
                                        {filters.member_status && filters.member_status !== 'all' ? (
                                            <span className="inline-flex items-center rounded-full bg-[#1E4D3A]/10 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                                {selectedMemberLabel || filters.member_status}
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
                            <p className={filterLabelClassName}>Status Member</p>
                            <div className="flex flex-wrap gap-2.5">
                                {lifecycleCards.map((card) => (
                                    <StatusFilterChip
                                        key={card.id}
                                        label={card.label}
                                        count={card.count}
                                        icon={card.icon}
                                        isActive={currentMemberStatus === card.id}
                                        onClick={() => handleMemberChipClick(card.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_auto]">
                            <div className="min-w-0">
                                <label className={filterLabelClassName} htmlFor="customers-filter-search">
                                    Pencarian
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="customers-filter-search"
                                        type="text"
                                        placeholder="Cari nama, WhatsApp, email, atau alamat..."
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
                                <label className={filterLabelClassName} htmlFor="customers-filter-per-page">
                                    Tampilkan
                                </label>
                                <div className="relative w-[7.5rem]">
                                    <select
                                        id="customers-filter-per-page"
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
                                description="Data customer tidak ditemukan dengan filter yang diberikan."
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
                                            'Customer',
                                            'Email',
                                            'WhatsApp',
                                            'Status Member',
                                            'Order',
                                            'Booking',
                                            'Voucher',
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
                                    {items.map((profile) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={profile.id}>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <CustomerActionButtons profile={profile} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {customerName(profile)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {userEmail(profile)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {profile.whatsapp_number ?? '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <MemberBadge status={profile.member_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {formatNumber(profile.orders_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {formatNumber(profile.bookings_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {formatNumber(profile.voucher_redemptions_count)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {customerProfiles.links && (
                        <div className="border-t border-[#E5E7EB] p-5">
                            <Pagination links={customerProfiles.links} />
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminCustomerIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminCustomerIndex;
