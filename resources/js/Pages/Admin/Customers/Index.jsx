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
import { formatNumber, readableLabel } from '@/utils/format';

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

function AdminCustomerIndex({ customerProfiles, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.customers.index'), { search: newSearch, per_page: newPerPage }, {
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
            <Head title="Admin Customer" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Pantau profil customer, status member, dan ringkasan aktivitas order, booking, serta voucher dari panel admin Phoenix."
                    eyebrow="Booking & Customer / Customer"
                    title="Customer"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard helper="Seluruh profil customer" icon="C" label="Total Customer" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Customer berstatus member" icon="M" label="Members" tone="sage" value={formatNumber(metrics.members)} />
                    <MetricCard helper="Customer non-member" icon="N" label="Non Members" tone="brown" value={formatNumber(metrics.nonMembers)} />
                    <MetricCard helper="Total order terkait" icon="O" label="Order" tone="blue" value={formatNumber(metrics.orders)} />
                    <MetricCard helper="Total booking terkait" icon="B" label="Booking" tone="orange" value={formatNumber(metrics.bookings)} />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau nomor HP..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Tampilkan</span>
                            <select
                                value={perPage}
                                onChange={handleLimitChange}
                                className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>data</span>
                        </div>
                    </div>

                    {customerProfiles.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Profil customer akan tampil di sini setelah customer membuat profile atau melakukan transaksi."
                                title="Belum ada customer."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Customer', 'Email User', 'WhatsApp', 'Status Member', 'Order', 'Booking', 'Voucher Penukaran', 'Aksi'].map((heading) => (
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
                                    {customerProfiles.data.map((profile) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={profile.id}>
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
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <Link
                                                    className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                    href={route('admin.customers.show', profile.id)}
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-5 border-t border-[#E5E7EB]">
                                <Pagination links={customerProfiles.links} />
                            </div>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminCustomerIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminCustomerIndex;
