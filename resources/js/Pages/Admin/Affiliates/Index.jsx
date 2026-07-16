import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatNumber } from '@/utils/format';

const STATUS_FILTERS = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Aktif' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'suspended', label: 'Suspended' },
];

function AdminAffiliatesIndex({ affiliates, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newStatus, newPerPage) => {
        router.get(
            route('admin.affiliates.index'),
            {
                search: newSearch || undefined,
                status: newStatus && newStatus !== 'all' ? newStatus : undefined,
                per_page: newPerPage,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        handleFilterChange(event.target.value, status, perPage);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        handleFilterChange(search, event.target.value, perPage);
    };

    const handleLimitChange = (event) => {
        setPerPage(event.target.value);
        handleFilterChange(search, status, event.target.value);
    };

    return (
        <>
            <Head title="Admin Affiliate" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Kelola pengajuan mitra affiliate, status aktivasi, dan ringkasan performa referral."
                    eyebrow="Affiliate / Daftar Affiliate"
                    title="Daftar Affiliate"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Semua pengajuan affiliate" icon="member" label="Total" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Menunggu review admin" icon="menunggu" label="Pending" tone="orange" value={formatNumber(metrics.pending)} />
                    <MetricCard helper="Mitra aktif" icon="aktif" label="Aktif" tone="sage" value={formatNumber(metrics.active)} />
                    <MetricCard helper="Pengajuan ditolak" icon="nonaktif" label="Ditolak" tone="brown" value={formatNumber(metrics.rejected)} />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                onChange={handleSearch}
                                placeholder="Cari nama, email, WhatsApp, atau kode..."
                                type="text"
                                value={search}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <select
                                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                onChange={handleStatusChange}
                                value={status}
                            >
                                {STATUS_FILTERS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <span>Tampilkan</span>
                                <select
                                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={handleLimitChange}
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

                    {affiliates.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Pengajuan affiliate akan tampil di sini setelah customer mendaftar sebagai mitra."
                                title="Belum ada affiliate."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Affiliate', 'Kontak', 'Kota', 'Kode', 'Status', 'Referral', 'Aksi'].map((heading) => (
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
                                    {affiliates.data.map((affiliate) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={affiliate.id}>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="font-body-sm text-sm font-bold text-[#333333]">
                                                    {affiliate.full_name}
                                                </div>
                                                <div className="font-body-sm text-xs text-gray-500">
                                                    {affiliate.user?.name ?? '-'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <div>{affiliate.email}</div>
                                                <div className="text-xs text-gray-500">{affiliate.whatsapp || '-'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {affiliate.city || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <div className="font-bold text-[#333333]">{affiliate.partner_code || '-'}</div>
                                                <div className="text-xs text-gray-500">{affiliate.coupon_code || '-'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={affiliate.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {formatNumber(affiliate.total_referrals ?? 0)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <Link
                                                    className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                    href={route('admin.affiliates.show', affiliate.id)}
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="border-t border-[#E5E7EB] p-5">
                                <Pagination links={affiliates.links} />
                            </div>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminAffiliatesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminAffiliatesIndex;
