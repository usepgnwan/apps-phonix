import { Head } from '@inertiajs/react';
import { Copy, Link2, UserPlus } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import FieldLayout from '@/Layouts/FieldLayout';
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

export default function Show({
    staffCode,
    trackingUrl,
    referralEnabled = true,
    metrics = {},
    recentRegistrations = [],
}) {
    return (
        <FieldLayout>
            <Head title="Referral Staff" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Bagikan link referral Anda agar customer mendaftar lewat tautan ini. Tidak ada komisi di tahap ini."
                    eyebrow="Field Staff"
                    title="Link Referral"
                />

                {!referralEnabled && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Program referral Anda sedang dinonaktifkan oleh admin. Link tidak akan mencatat
                        pendaftaran baru.
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <MetricCard
                        helper="Klik tracking tercatat"
                        icon="K"
                        label="Total Klik"
                        tone="sage"
                        value={formatNumber(metrics.click_count)}
                    />
                    <MetricCard
                        helper="Customer yang mendaftar lewat link Anda"
                        icon="D"
                        label="Total Daftar"
                        tone="forest"
                        value={formatNumber(metrics.registration_count)}
                    />
                </div>

                <AdminCard className="space-y-5 p-5">
                    <div>
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Kode Referral
                        </p>
                        <p className="mt-1 font-body-lg text-xl font-extrabold tracking-wider text-[#1E4D3A]">
                            {staffCode || '-'}
                        </p>
                    </div>

                    <div>
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Tautan Referral
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
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
                        <p className="mt-2 text-xs text-gray-500">
                            Link mengarah ke halaman daftar. Cookie referral berlaku 30 hari.
                        </p>
                    </div>
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <UserPlus aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                            <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">
                                Pendaftaran Terbaru
                            </h2>
                        </div>
                    </div>

                    {recentRegistrations.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                description="Customer yang mendaftar lewat link Anda akan tampil di sini."
                                title="Belum ada pendaftaran"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Email</th>
                                        <th className="px-5 py-3">Waktu Daftar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {recentRegistrations.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 font-semibold text-[#333333]">
                                                {row.name}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{row.email}</td>
                                            <td className="px-5 py-3 text-gray-600">
                                                {formatDateTime(row.referred_at || row.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>
        </FieldLayout>
    );
}
