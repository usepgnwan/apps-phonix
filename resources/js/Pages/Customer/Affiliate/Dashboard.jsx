import { Head } from '@inertiajs/react';
import { Copy, Link2, MousePointerClick, Ticket, Wallet } from 'lucide-react';

import MetricCard from '@/Components/Panel/MetricCard';
import PanelCard from '@/Components/Panel/PanelCard';
import PanelEmptyState from '@/Components/Panel/PanelEmptyState';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import StatusBadge from '@/Components/Panel/StatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format';

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

export default function AffiliateDashboard({ affiliate, metrics, recentCommissions = [] }) {
    return (
        <>
            <Head title="Portal Mitra Affiliate" />

            <div className="space-y-8">
                <PanelPageHeader
                    description={`Pantau performa referral dan saldo kemitraan Anda. ID mitra: ${affiliate.partner_code}`}
                    eyebrow="Portal Mitra"
                    title={`Selamat datang, ${affiliate.full_name}`}
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        helper="Saldo approved minimum cair Rp 100.000"
                        icon={<Wallet />}
                        label="Komisi Siap Cair"
                        tone="forest"
                        value={formatCurrency(metrics.approved_balance)}
                    />
                    <MetricCard
                        helper="Masa garansi 7 hari"
                        icon={<Wallet />}
                        label="Komisi Tertahan"
                        tone="orange"
                        value={formatCurrency(metrics.hold_balance)}
                    />
                    <MetricCard
                        helper="Klik tracking tercatat"
                        icon={<MousePointerClick />}
                        label="Total Klik Link"
                        tone="sage"
                        value={formatNumber(metrics.click_count)}
                    />
                </div>

                <PanelCard className="space-y-5 p-6">
                    <h2 className="text-lg font-extrabold text-[#1E4D3A]">Alat Promosi Personal</h2>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                            Tautan Afiliasi
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-sm text-[#333333]">
                                <Link2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1E4D3A]" />
                                <span className="truncate">{affiliate.tracking_url}</span>
                            </div>
                            <button
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#163B2C]"
                                onClick={() => copyText(affiliate.tracking_url)}
                                type="button"
                            >
                                <Copy aria-hidden="true" className="h-4 w-4" />
                                Salin Link
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                            Kode Kupon
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-sm font-extrabold tracking-wider text-[#1E4D3A]">
                                <Ticket aria-hidden="true" className="h-4 w-4" />
                                {affiliate.coupon_code}
                            </div>
                            <button
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1E4D3A] px-5 py-2.5 text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                onClick={() => copyText(affiliate.coupon_code)}
                                type="button"
                            >
                                <Copy aria-hidden="true" className="h-4 w-4" />
                                Salin Kupon
                            </button>
                        </div>
                    </div>
                </PanelCard>

                <PanelCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <h2 className="text-lg font-extrabold text-[#1E4D3A]">Riwayat Komisi Terbaru</h2>
                    </div>
                    {recentCommissions.length === 0 ? (
                        <div className="p-6">
                            <PanelEmptyState
                                description="Belum ada komisi. Bagikan link atau kupon Anda untuk mulai mencatat referral."
                                title="Belum ada transaksi"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-[#F6F7F7]">
                                    <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                        <th className="px-5 py-3">Tanggal</th>
                                        <th className="px-5 py-3">Item</th>
                                        <th className="px-5 py-3">Nilai</th>
                                        <th className="px-5 py-3">Komisi</th>
                                        <th className="px-5 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {recentCommissions.map((row) => (
                                        <tr className="hover:bg-[#F6F7F7]/60" key={row.id}>
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-semibold text-[#333333]">
                                                {row.item_name}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-[#333333]">
                                                {formatCurrency(row.transaction_amount)}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(row.commission_amount)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={row.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </PanelCard>
            </div>
        </>
    );
}

AffiliateDashboard.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
