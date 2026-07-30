import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatNumber } from '@/utils/format';

export default function Index({
    staff,
    metrics,
    filters,
    branches = [],
    showBranchFilter = false,
    lockedBranchName = null,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [branchId, setBranchId] = useState(filters?.branch_id || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newBranchId, newPerPage) => {
        router.get(
            route('admin.staff-referrals.index'),
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

    return (
        <AdminLayout>
            <Head title="Monitoring Referral Staff" />

            <div className="space-y-8">
                <AdminPageHeader
                    description={
                        lockedBranchName
                            ? `Monitoring referral staff cabang ${lockedBranchName}. Tanpa komisi. Daftar = staf di profil customer; Order/Booking = staf di transaksi (bisa beda jika diisi ulang di checkout).`
                            : 'Pantau performa referral staff. Daftar = staf akuisisi profil; Order/Booking = staf referal transaksi (boleh beda dari profil). Tanpa komisi.'
                    }
                    eyebrow="Organisasi / Referral Staff"
                    title="Monitoring Referral Staff"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <MetricCard
                        helper="Field staff yang punya kode"
                        icon="S"
                        label="Staff + Kode"
                        tone="forest"
                        value={formatNumber(metrics.staff_with_code)}
                    />
                    <MetricCard
                        helper="Klik tracking tercatat"
                        icon="K"
                        label="Total Klik"
                        tone="sage"
                        value={formatNumber(metrics.total_clicks)}
                    />
                    <MetricCard
                        helper="Customer terdaftar lewat referral"
                        icon="D"
                        label="Total Daftar"
                        tone="blue"
                        value={formatNumber(metrics.total_registrations)}
                    />
                    <MetricCard
                        helper="Order dengan staf referal transaksi"
                        icon="O"
                        label="Order"
                        tone="orange"
                        value={formatNumber(metrics.total_orders)}
                    />
                    <MetricCard
                        helper="Booking dengan staf referal transaksi"
                        icon="B"
                        label="Booking"
                        tone="brown"
                        value={formatNumber(metrics.total_bookings)}
                    />
                    <MetricCard
                        helper="Offline sale dengan staf referal transaksi"
                        icon="F"
                        label="Offline"
                        tone="sage"
                        value={formatNumber(metrics.total_offline_sales)}
                    />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    handleFilterChange(event.target.value, branchId, perPage);
                                }}
                                placeholder="Cari nama, email, telp, atau kode..."
                                type="text"
                                value={search}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            {showBranchFilter ? (
                                <select
                                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={(event) => {
                                        setBranchId(event.target.value);
                                        handleFilterChange(search, event.target.value, perPage);
                                    }}
                                    value={branchId || ''}
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
                                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={(event) => {
                                        setPerPage(event.target.value);
                                        handleFilterChange(search, branchId, event.target.value);
                                    }}
                                    value={perPage}
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

                    {staff.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Staff lapangan dengan data referral akan tampil di sini sesuai cabang Anda."
                                title="Belum ada data referral staff."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {[
                                            'Staff',
                                            'Cabang',
                                            'Kode',
                                            'Klik',
                                            'Daftar',
                                            'Order',
                                            'Booking',
                                            'Offline',
                                            'Aksi',
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
                                    {staff.data.map((row) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={row.id}>
                                            <td className="px-4 py-4">
                                                <p className="font-body-sm text-sm font-bold text-[#333333]">
                                                    {row.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{row.email}</p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {row.position?.name || '-'}
                                                    {row.team?.name ? ` · ${row.team.name}` : ''}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                                                {row.branch?.name || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-bold tracking-wide text-[#1E4D3A]">
                                                {row.staff_code || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-[#333333]">
                                                {formatNumber(row.click_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-[#333333]">
                                                {formatNumber(row.registration_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                                                {formatNumber(row.order_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                                                {formatNumber(row.booking_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                                                {formatNumber(row.offline_sale_count)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <Link
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                                                    href={route('admin.staff-referrals.show', row.id)}
                                                    title="Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="border-t border-[#E5E7EB] p-5">
                                <Pagination links={staff.links} />
                            </div>
                        </div>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
