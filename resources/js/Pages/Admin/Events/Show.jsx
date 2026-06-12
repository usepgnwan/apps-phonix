import { Head, Link } from '@inertiajs/react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatDate(value) { return value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value)) : '-'; }
function formatNumber(value) { return new Intl.NumberFormat('id-ID').format(Number(value ?? 0)); }
function DetailRow({ label, children }) { return <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p><div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">{children || '-'}</div></div>; }

function AdminEventShow({ event }) {
    return <><Head title={`Detail ${event.name}`} /><div className="space-y-8"><AdminPageHeader action={<div className="flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.events.index')}>Kembali</Link><Link className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.events.edit', event.id)}>Edit</Link><AdminDeleteButton className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50" description="Event akan dihapus dari data CRM dan field activity admin." itemName={event.name} routeName="admin.events.destroy" routeParams={event.id} title="Hapus event?">Hapus</AdminDeleteButton></div>} description="Detail event dan relasi lead serta penjualan offline yang terkait." eyebrow="CRM & Field / Event" title={event.name} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard helper="Tanggal event" icon="D" label="Event Date" tone="forest" value={formatDate(event.event_date)} /><MetricCard helper="Lokasi event" icon="P" label="Lokasi" tone="sage" value={event.location} /><MetricCard helper="Lead terkait" icon="L" label="Lead" tone="blue" value={formatNumber(event.leads_count)} /><MetricCard helper="Penjualan offline terkait" icon="S" label="Penjualan Offline" tone="brown" value={formatNumber(event.offline_sales_count)} /></div><AdminCard className="p-5"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><DetailRow label="Nama">{event.name}</DetailRow><DetailRow label="Event Date">{formatDate(event.event_date)}</DetailRow><DetailRow label="Lokasi">{event.location}</DetailRow><DetailRow label="Organizer">{event.organizer}</DetailRow><DetailRow label="Lead Count">{formatNumber(event.leads_count)}</DetailRow><DetailRow label="Penjualan Offline Count">{formatNumber(event.offline_sales_count)}</DetailRow><div className="sm:col-span-2"><DetailRow label="Catatan">{event.notes}</DetailRow></div></div></AdminCard></div></>;
}

AdminEventShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminEventShow;
