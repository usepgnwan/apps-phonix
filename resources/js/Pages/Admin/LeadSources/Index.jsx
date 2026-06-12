import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}


function AdminLeadSumbersIndex({ leadSources = [] }) {
    const metrics = {
        total: leadSources.length,
        active: leadSources.filter((source) => source.is_active).length,
        inactive: leadSources.filter((source) => !source.is_active).length,
        leads: leadSources.reduce((total, source) => total + Number(source.leads_count ?? 0), 0),
    };

    return (
        <>
            <Head title="Admin Sumber Lead" />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.lead-sources.create')}><Plus aria-hidden="true" className="h-4 w-4" />Tambah Sumber</Link>} description="Kelola sumber lead yang dipakai untuk tracking kanal CRM Phoenix." eyebrow="Lead & CRM / Sumber Lead" title="Sumber Lead" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Seluruh sumber lead" icon="S" label="Total Sumber" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Sumber aktif" icon="A" label="Aktif" tone="sage" value={formatNumber(metrics.active)} />
                    <MetricCard helper="Sumber nonaktif" icon="I" label="Nonaktif" tone="brown" value={formatNumber(metrics.inactive)} />
                    <MetricCard helper="Lead terkait" icon="L" label="Lead" tone="blue" value={formatNumber(metrics.leads)} />
                </div>
                {leadSources.length === 0 ? <AdminCard className="p-5"><EmptyState description="Lead source akan tampil di sini setelah dibuat." title="Belum ada lead source." /></AdminCard> : <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{leadSources.map((source) => <AdminCard className="p-5" key={source.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{source.slug}</p><h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{source.name}</h2></div><StatusBadge label={source.is_active ? 'Aktif' : 'Nonaktif'} tone={source.is_active ? 'forest' : 'gray'} /></div><div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Lead Count</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(source.leads_count)}</p></div><div className="mt-5 flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.lead-sources.show', source.id)}>Detail</Link><Link className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20" href={route('admin.lead-sources.edit', source.id)}>Edit</Link><AdminDeleteButton className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50" description="Sumber lead akan dihapus dari master CRM admin." itemName={source.name} routeName="admin.lead-sources.destroy" routeParams={source.id} title="Hapus sumber lead?">Hapus</AdminDeleteButton></div></AdminCard>)}</div>}
            </div>
        </>
    );
}

AdminLeadSumbersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSumbersIndex;
