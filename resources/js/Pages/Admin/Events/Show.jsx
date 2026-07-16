import { Head, Link } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import MetricCard from '@/Components/Admin/MetricCard';
import { formatNumber } from '@/utils/format';
import { DetailRow } from '@/Components/Admin/FormFields';

function formatDate(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value)) : '-';
}

function StatusBadge({ isActive }) {
    return <span className={`inline-flex rounded-full px-3 py-1 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] ${isActive ? 'bg-[#1E4D3A] text-white' : 'bg-gray-200 text-gray-600'}`}>{isActive ? 'Aktif' : 'Nonaktif'}</span>;
}

function AdminEventShow({ event }) {
    return (
        <>
            <Head title={`Detail ${event.name}`} />
            <div className="space-y-8">
                <AdminPageHeader action={<div className="flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.events.index')}>Kembali</Link><Link className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.events.edit', event.id)}>Edit</Link><AdminDeleteButton className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50" description="Event akan dihapus dari data CRM dan field activity admin." itemName={event.name} routeName="admin.events.destroy" routeParams={event.id} title="Hapus event?">Hapus</AdminDeleteButton></div>} description="Detail event dan relasi lead serta penjualan offline yang terkait." eyebrow="CRM & Field / Event" title={event.name} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Periode mulai" icon="D" label="Tanggal Mulai" tone="forest" value={formatDate(event.start_date)} />
                    <MetricCard helper="Periode selesai" icon="E" label="Tanggal Selesai" tone="sage" value={formatDate(event.end_date)} />
                    <MetricCard helper="Lead terkait" icon="L" label="Lead" tone="blue" value={formatNumber(event.leads_count)} />
                    <MetricCard helper="Penjualan offline terkait" icon="S" label="Penjualan Offline" tone="brown" value={formatNumber(event.offline_sales_count)} />
                </div>
                <AdminCard className="p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailRow label="Nama">{event.name}</DetailRow>
                        <DetailRow label="Status"><StatusBadge isActive={event.is_active} /></DetailRow>
                        <DetailRow label="Cabang">{event.branch?.name || '-'}</DetailRow>
                        <DetailRow label="Tanggal Mulai">{formatDate(event.start_date)}</DetailRow>
                        <DetailRow label="Tanggal Selesai">{formatDate(event.end_date)}</DetailRow>
                        <DetailRow label="Lokasi">{event.location}</DetailRow>
                        <DetailRow label="Organizer">{event.organizer}</DetailRow>
                        <DetailRow label="Lead Count">{formatNumber(event.leads_count)}</DetailRow>
                        <DetailRow label="Penjualan Offline Count">{formatNumber(event.offline_sales_count)}</DetailRow>
                        <div className="sm:col-span-2"><DetailRow label="Catatan">{event.notes}</DetailRow></div>
                    </div>
                </AdminCard>
            </div>
        </>
    );
}

AdminEventShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminEventShow;
