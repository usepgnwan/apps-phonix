import { Head } from '@inertiajs/react';

import Pagination from '@/Components/Admin/Pagination';
import PanelCard from '@/Components/Panel/PanelCard';
import PanelEmptyState from '@/Components/Panel/PanelEmptyState';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import StatusBadge from '@/Components/Panel/StatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency, formatDateTime } from '@/utils/format';

export default function AffiliateCommissions({ affiliate, commissions }) {
    const rows = commissions?.data ?? [];

    return (
        <>
            <Head title="Riwayat Komisi Affiliate" />

            <div className="space-y-8">
                <PanelPageHeader
                    description={`Kode mitra ${affiliate.partner_code} · Kupon ${affiliate.coupon_code}`}
                    eyebrow="Portal Mitra"
                    title="Riwayat Komisi"
                />

                <PanelCard className="p-0">
                    {rows.length === 0 ? (
                        <div className="p-6">
                            <PanelEmptyState description="Belum ada komisi tercatat." title="Kosong" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                            <th className="px-5 py-3">Tanggal</th>
                                            <th className="px-5 py-3">Sumber</th>
                                            <th className="px-5 py-3">Item</th>
                                            <th className="px-5 py-3">Transaksi</th>
                                            <th className="px-5 py-3">Komisi</th>
                                            <th className="px-5 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {rows.map((row) => (
                                            <tr className="hover:bg-[#F6F7F7]/60" key={row.id}>
                                                <td className="px-5 py-3 text-sm text-gray-500">
                                                    {formatDateTime(row.created_at)}
                                                </td>
                                                <td className="px-5 py-3 text-sm capitalize text-[#333333]">
                                                    {row.source_type}
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
                            <div className="border-t border-[#E5E7EB] px-5 py-4">
                                <Pagination links={commissions.links} preserveScroll preserveState />
                            </div>
                        </>
                    )}
                </PanelCard>
            </div>
        </>
    );
}

AffiliateCommissions.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
