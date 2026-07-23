import { Head } from '@inertiajs/react';

import PanelCard from '@/Components/Panel/PanelCard';
import PanelEmptyState from '@/Components/Panel/PanelEmptyState';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency, formatNumber } from '@/utils/format';

function schemeLabel(rule) {
    if (rule.commission_type === 'percent') {
        return `${formatNumber(rule.commission_value)}%`;
    }

    return `Fix ${formatCurrency(rule.commission_value)}`;
}

function categoryBadgeClass(category) {
    return category === 'Produk'
        ? 'bg-sky-100 text-sky-800'
        : 'bg-violet-100 text-violet-800';
}

export default function AffiliateCommissionScheme({ affiliate, rules = [] }) {
    return (
        <>
            <Head title="Skema Komisi Affiliate" />

            <div className="space-y-8">
                <PanelPageHeader
                    description={`Transparansi kalkulasi harga jual & nominal komisi otomatis · Mitra ${affiliate.partner_code}`}
                    eyebrow="Portal Mitra"
                    title="Dashboard Skema Komisi Afiliator"
                />

                <PanelCard className="overflow-hidden p-0">
                    <div className="border-b border-[#E5E7EB] bg-[#1E4D3A] px-5 py-4 text-center text-white">
                        <h2 className="text-lg font-extrabold">Dashboard Skema Komisi Afiliator</h2>
                        <p className="mt-1 text-xs font-medium text-white/80">
                            Transparansi Kalkulasi Harga Jual & Nominal Komisi Otomatis
                        </p>
                    </div>

                    {rules.length === 0 ? (
                        <div className="p-6">
                            <PanelEmptyState
                                description="Admin belum mengatur aturan komisi aktif."
                                title="Belum ada skema komisi"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-[#F6F7F7]">
                                    <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                        <th className="px-5 py-3">Kategori</th>
                                        <th className="px-5 py-3">Nama Item</th>
                                        <th className="px-5 py-3">Harga Jual</th>
                                        <th className="px-5 py-3">Skema Komisi</th>
                                        <th className="px-5 py-3">Nominal Komisi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {rules.map((rule) => (
                                        <tr className="hover:bg-[#F6F7F7]/60" key={rule.id}>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${categoryBadgeClass(rule.category)}`}>
                                                    {rule.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-[#333333]">
                                                {rule.item_name}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-[#333333]">
                                                {formatCurrency(rule.price)}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-extrabold text-[#C2410C]">
                                                {schemeLabel(rule)}
                                            </td>
                                            <td className="bg-[#ECFDF3] px-5 py-4 text-sm font-extrabold text-[#166534]">
                                                {formatCurrency(rule.commission_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </PanelCard>

                <p className="text-xs leading-5 text-gray-500">
                    Catatan: nominal dihitung dari harga jual item saat ini. Komisi aktual mengikuti transaksi
                    yang berhasil dan melewati masa hold sesuai kebijakan.
                </p>
            </div>
        </>
    );
}

AffiliateCommissionScheme.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
