import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function relationName(relation, fallback = '-') {
    return relation?.name ?? fallback;
}

function AdminLeadIndex({ leads, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.leads.index'), { search: newSearch, per_page: newPerPage }, {
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
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, WhatsApp, atau staff..."
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

                    {leads.data.length === 0 ? (
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
                                    {leads.data.map((lead) => (
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
                            <div className="p-5 border-t border-[#E5E7EB]">
                                <Pagination links={leads.links} />
                            </div>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminLeadIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadIndex;
