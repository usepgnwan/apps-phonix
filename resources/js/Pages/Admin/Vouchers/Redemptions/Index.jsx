import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatNumber, formatCurrency, formatDateTime } from '@/utils/format';

function customerName(redemption) {
    return redemption.customer_profile?.name ?? redemption.customerProfile?.name ?? 'Customer';
}

function orderLabel(redemption) {
    const order = redemption.order;

    if (!order) {
        return '-';
    }

    return order.order_number ?? `Order #${order.id}`;
}

function discountDisplay(voucher) {
    if (voucher.discount_type === 'percentage') {
        return `${formatNumber(voucher.discount_value)}%`;
    }

    return formatCurrency(voucher.discount_value);
}

function AdminVoucherPenukaranIndex({ voucher, redemptions, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.vouchers.redemptions.index', voucher.id), { search: newSearch, per_page: newPerPage }, {
            preserveState: true,
            replace: true,
            preserveScroll: true
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

    return (
        <>
            <Head title={`Penukaran ${voucher.code}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.vouchers.show', voucher.id)}
                            >
                                Detail Voucher
                            </Link>
                            <Link
                                className="rounded-full border border-[#A8C5B3] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                href={route('admin.vouchers.index')}
                            >
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Daftar customer dan order yang sudah menukarkan voucher ini."
                    eyebrow="Commerce / Voucher / Penukaran"
                    title={`Penukaran ${voucher.code}`}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        helper={voucher.name}
                        icon="V"
                        label="Voucher"
                        tone="forest"
                        value={voucher.code}
                    />
                    <MetricCard
                        helper="Nilai diskon voucher"
                        icon="D"
                        label="Diskon"
                        tone="sage"
                        value={discountDisplay(voucher)}
                    />
                    <MetricCard
                        helper="Total penukaran tercatat"
                        icon="R"
                        label="Penukaran"
                        tone="blue"
                        value={formatNumber(metrics.total_redemptions)}
                    />
                    <MetricCard
                        helper="Akumulasi diskon diberikan"
                        icon="T"
                        label="Nilai Diskon"
                        tone="brown"
                        value={formatCurrency(metrics.total_discount)}
                    />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Voucher Context
                                </p>
                                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                    {voucher.name}
                                </h2>
                            </div>
                            <StatusBadge
                                label={voucher.is_published ? 'Dipublikasikan' : 'Draf'}
                                tone={voucher.is_published ? 'forest' : 'gray'}
                            />
                        </div>
                    </div>
                    
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari profil customer atau order..."
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

                    {redemptions.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Customer redemption akan tampil di sini setelah voucher digunakan pada order."
                                title="Belum ada redemption."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Profil Customer', 'Order', 'Nilai Diskon', 'Ditukar Pada'].map((heading) => (
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
                                    {redemptions.data.map((redemption) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={redemption.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {customerName(redemption)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {orderLabel(redemption)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(redemption.discount_amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDateTime(redemption.redeemed_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {redemptions.links?.length > 0 && (
                                <div className="p-5 border-t border-[#E5E7EB]">
                                    <Pagination links={redemptions.links} />
                                </div>
                            )}
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminVoucherPenukaranIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminVoucherPenukaranIndex;
