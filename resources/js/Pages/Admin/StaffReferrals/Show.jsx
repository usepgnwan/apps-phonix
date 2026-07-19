import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Copy, Link2 } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import ReferralQrCode from '@/Components/ReferralQrCode';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDateTime, formatNumber } from '@/utils/format';

function copyText(value) {
    if (!value) {
        return;
    }

    if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(value);
        return;
    }

    window.prompt('Salin teks berikut:', value);
}

export default function Show({ staff, trackingUrl, metrics, registrations, recentClicks = [] }) {
    return (
        <AdminLayout>
            <Head title={`Referral — ${staff.name}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#F6F7F7]"
                            href={route('admin.staff-referrals.index')}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Kembali
                        </Link>
                    )}
                    description={[
                        staff.branch?.name ? `Cabang ${staff.branch.name}` : null,
                        staff.position?.name,
                        staff.team?.name ? `Tim ${staff.team.name}` : null,
                    ]
                        .filter(Boolean)
                        .join(' · ') || 'Detail performa referral staff'}
                    eyebrow="Organisasi / Referral Staff"
                    title={staff.name}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        helper="Klik tracking"
                        icon="K"
                        label="Total Klik"
                        tone="sage"
                        value={formatNumber(metrics.click_count)}
                    />
                    <MetricCard
                        helper="Customer terdaftar"
                        icon="D"
                        label="Total Daftar"
                        tone="forest"
                        value={formatNumber(metrics.registration_count)}
                    />
                    <MetricCard
                        helper="Order teratribusi"
                        icon="O"
                        label="Order"
                        tone="orange"
                        value={formatNumber(metrics.order_count)}
                    />
                    <MetricCard
                        helper="Booking teratribusi"
                        icon="B"
                        label="Booking"
                        tone="blue"
                        value={formatNumber(metrics.booking_count)}
                    />
                </div>

                <AdminCard className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Kode & Link Referral
                            </p>
                            <p className="mt-1 text-xl font-extrabold tracking-wider text-[#1E4D3A]">
                                {staff.staff_code || '-'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Status program:{' '}
                                <span className="font-semibold text-[#333333]">
                                    {staff.staff_referral_enabled ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-sm text-[#333333]">
                            <Link2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1E4D3A]" />
                            <span className="truncate">{trackingUrl || '-'}</span>
                        </div>
                        <button
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#163B2C]"
                            onClick={() => copyText(trackingUrl)}
                            type="button"
                        >
                            <Copy aria-hidden="true" className="h-4 w-4" />
                            Salin Link
                        </button>
                    </div>

                    <ReferralQrCode
                        fileName={`referral-${staff.staff_code || staff.id}`}
                        helper="QR per staff untuk cetak materi cabang atau dibagikan ke field staff."
                        label="QR Code Referral"
                        value={trackingUrl}
                    />
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">
                            Customer Terdaftar
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Customer yang `referred_by_staff_id` mengarah ke staff ini.
                        </p>
                    </div>
                    {registrations.data.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                description="Belum ada customer yang mendaftar lewat link staff ini."
                                title="Belum ada pendaftaran"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['Nama', 'Email', 'WhatsApp', 'Waktu Daftar'].map((heading) => (
                                                <th
                                                    className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                                    key={heading}
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {registrations.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-[#333333]">
                                                    {row.customer_profile?.name || row.name}
                                                </td>
                                                <td className="px-5 py-3 text-gray-600">{row.email}</td>
                                                <td className="px-5 py-3 text-gray-600">
                                                    {row.customer_profile?.whatsapp_number || '-'}
                                                </td>
                                                <td className="px-5 py-3 text-gray-600">
                                                    {formatDateTime(row.referred_at || row.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-[#E5E7EB] p-5">
                                <Pagination links={registrations.links} />
                            </div>
                        </>
                    )}
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">
                            Klik Terbaru
                        </h2>
                    </div>
                    {recentClicks.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                description="Belum ada klik tracking untuk kode staff ini."
                                title="Belum ada klik"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Waktu', 'Landing URL', 'IP', 'Jadi Daftar'].map((heading) => (
                                            <th
                                                className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                                key={heading}
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {recentClicks.map((click) => (
                                        <tr key={click.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                                                {formatDateTime(click.clicked_at)}
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 text-gray-600">
                                                {click.landing_url || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                                                {click.ip_address || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#333333]">
                                                {click.registered_user_id ? 'Ya' : 'Belum'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
