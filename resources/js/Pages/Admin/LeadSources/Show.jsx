import { Head, Link, router } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value) { return new Intl.NumberFormat('id-ID').format(Number(value ?? 0)); }
function deleteLeadSumber(leadSumber) { if (window.confirm(`Hapus lead source ${leadSumber.name}?`)) router.delete(route('admin.lead-sources.destroy', leadSumber.id)); }
function DetailRow({ label, children }) { return <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p><div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">{children ?? '-'}</div></div>; }

function AdminLeadSumbersShow({ leadSource: leadSumber }) {
    return <><Head title={`Detail ${leadSumber.name}`} /><div className="space-y-8"><AdminPageHeader action={<div className="flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.lead-sources.index')}>Kembali</Link><Link className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.lead-sources.edit', leadSumber.id)}>Edit</Link><button className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50" onClick={() => deleteLeadSumber(leadSumber)} type="button">Hapus</button></div>} description="Detail source CRM dan jumlah lead yang memakai source ini." eyebrow="Lead & CRM / Sumber Lead" title={leadSumber.name} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard helper="Status source" icon="S" label="Status" tone={leadSumber.is_active ? 'forest' : 'brown'} value={leadSumber.is_active ? 'Aktif' : 'Nonaktif'} /><MetricCard helper="Lead terkait" icon="L" label="Lead" tone="blue" value={formatNumber(leadSumber.leads_count)} /><MetricCard helper="Slug route/source" icon="G" label="Slug" tone="sage" value={leadSumber.slug} /><MetricCard helper="ID source" icon="#" label="ID" tone="brown" value={leadSumber.id} /></div><AdminCard className="p-5"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><DetailRow label="Nama">{leadSumber.name}</DetailRow><DetailRow label="Slug">{leadSumber.slug}</DetailRow><DetailRow label="Status"><StatusBadge label={leadSumber.is_active ? 'Aktif' : 'Nonaktif'} tone={leadSumber.is_active ? 'forest' : 'gray'} /></DetailRow><DetailRow label="Lead Count">{formatNumber(leadSumber.leads_count)}</DetailRow></div></AdminCard></div></>;
}

AdminLeadSumbersShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSumbersShow;
