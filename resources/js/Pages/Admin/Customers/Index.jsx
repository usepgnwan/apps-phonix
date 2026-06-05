import { Head, Link } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function readableLabel(value) {
    return String(value ?? 'Tidak diketahui')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

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

function AdminCustomerIndex({ customerProfiles = [] }) {
    const metrics = {
        total: customerProfiles.length,
        members: customerProfiles.filter((profile) => profile.member_status === 'member').length,
        nonMembers: customerProfiles.filter((profile) => profile.member_status === 'non_member').length,
        orders: customerProfiles.reduce((total, profile) => total + Number(profile.orders_count ?? 0), 0),
        bookings: customerProfiles.reduce((total, profile) => total + Number(profile.bookings_count ?? 0), 0),
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
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Booking & Customer
                        </p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                            Customer List
                        </h2>
                    </div>

                    {customerProfiles.length === 0 ? (
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
                                    {customerProfiles.map((profile) => (
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
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminCustomerIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminCustomerIndex;
