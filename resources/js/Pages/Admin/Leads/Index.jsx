import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function relationName(relation, fallback = '-') {
    return relation?.name ?? fallback;
}

function AdminLeadIndex({ leads = [] }) {
    const metrics = {
        total: leads.length,
        newLead: leads.filter((lead) => lead.follow_up_status === 'new').length,
        interested: leads.filter((lead) => lead.follow_up_status === 'interested').length,
        needsFollowUp: leads.filter((lead) => lead.follow_up_status === 'needs_follow_up').length,
        purchased: leads.filter((lead) => lead.follow_up_status === 'purchased').length,
    };

    return (
        <>
            <Head title="Admin Lead" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.leads.create')}>
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Lead
                        </Link>
                    )}
                    description="Pantau prospek, sumber lead, assignment staff, dan status follow-up CRM Phoenix."
                    eyebrow="Lead & CRM / Lead"
                    title="Lead"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard helper="Seluruh prospek" icon="L" label="Total Lead" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Lead baru" icon="N" label="Baru" tone="blue" value={formatNumber(metrics.newLead)} />
                    <MetricCard helper="Prospek tertarik" icon="I" label="Tertarik" tone="sage" value={formatNumber(metrics.interested)} />
                    <MetricCard helper="Perlu follow-up" icon="F" label="Perlu Follow Up" tone="orange" value={formatNumber(metrics.needsFollowUp)} />
                    <MetricCard helper="Sudah membeli" icon="P" label="Membeli" tone="brown" value={formatNumber(metrics.purchased)} />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Lead & CRM</p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">Daftar Lead</h2>
                    </div>

                    {leads.length === 0 ? (
                        <div className="p-5">
                            <EmptyState description="Lead CRM akan tampil di sini setelah dibuat." title="Belum ada lead." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Lead', 'WhatsApp', 'Sumber', 'Staff Ditugaskan', 'Customer', 'Event', 'Status', 'Aksi'].map((heading) => (
                                            <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading} scope="col">{heading}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {leads.map((lead) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={lead.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">{lead.name}</td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{lead.whatsapp_number}</td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{relationName(lead.lead_source)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{relationName(lead.assigned_staff, 'Belum ditugaskan')}</td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{relationName(lead.customer_profile, '-')}</td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{relationName(lead.event, '-')}</td>
                                            <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={lead.follow_up_status} /></td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.leads.show', lead.id)}>Detail</Link>
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

AdminLeadIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadIndex;
