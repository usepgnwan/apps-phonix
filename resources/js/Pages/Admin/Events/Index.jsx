import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatDate(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '-';
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function deleteEvent(event) {
    if (window.confirm(`Hapus event ${event.name}?`)) {
        router.delete(route('admin.events.destroy', event.id));
    }
}

function AdminEventIndex({ events = [] }) {
    const metrics = {
        total: events.length,
        leads: events.reduce((total, event) => total + Number(event.leads_count ?? 0), 0),
        offlineSales: events.reduce((total, event) => total + Number(event.offline_sales_count ?? 0), 0),
        upcoming: events.filter((event) => event.event_date && new Date(event.event_date) >= new Date()).length,
    };

    return (
        <>
            <Head title="Admin Event" />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.events.create')}><Plus aria-hidden="true" className="h-4 w-4" />Tambah Event</Link>} description="Kelola event lapangan dan pameran yang menjadi sumber lead dan penjualan offline." eyebrow="CRM & Field / Event" title="Event" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Seluruh event" icon="E" label="Total Event" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Event hari ini dan mendatang" icon="U" label="Akan Datang" tone="sage" value={formatNumber(metrics.upcoming)} />
                    <MetricCard helper="Lead dari event" icon="L" label="Lead" tone="blue" value={formatNumber(metrics.leads)} />
                    <MetricCard helper="Penjualan offline terkait" icon="S" label="Penjualan Offline" tone="brown" value={formatNumber(metrics.offlineSales)} />
                </div>
                {events.length === 0 ? <AdminCard className="p-5"><EmptyState description="Event akan tampil di sini setelah dibuat." title="Belum ada event." /></AdminCard> : <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{events.map((event) => <AdminCard className="p-5" key={event.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{formatDate(event.event_date)}</p><h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{event.name}</h2><p className="mt-1 font-body-sm text-sm text-gray-500">{event.location}</p></div><div className="rounded-2xl bg-[#A8C5B3]/25 px-4 py-2 text-right"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Organizer</p><p className="font-body-sm text-sm font-bold text-[#333333]">{event.organizer || '-'}</p></div></div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Lead</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(event.leads_count)}</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Penjualan Offline</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(event.offline_sales_count)}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.events.show', event.id)}>Detail</Link><Link className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20" href={route('admin.events.edit', event.id)}>Edit</Link><button className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50" onClick={() => deleteEvent(event)} type="button">Hapus</button></div></AdminCard>)}</div>}
            </div>
        </>
    );
}

AdminEventIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminEventIndex;
