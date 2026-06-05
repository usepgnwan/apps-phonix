import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { currency: 'IDR', maximumFractionDigits: 0, style: 'currency' }).format(Number(value ?? 0));
}

function formatDateTime(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function readableLabel(value) {
    return String(value ?? '-').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function AdminOfflineSalesIndex({ offlineSales = [] }) {
    const metrics = {
        total: offlineSales.length,
        revenue: offlineSales.reduce((total, sale) => total + Number(sale.total ?? 0), 0),
        events: offlineSales.filter((sale) => sale.source === 'event').length,
        doorToDoor: offlineSales.filter((sale) => sale.source === 'door_to_door').length,
    };

    return (
        <>
            <Head title="Admin Penjualan Offline" />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.offline-sales.create')}><Plus aria-hidden="true" className="h-4 w-4" />Tambah Penjualan Offline</Link>} description="Kelola pencatatan penjualan offline dari event, door to door, dan transaksi langsung." eyebrow="Commerce / Penjualan Offline" title="Penjualan Offline" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Seluruh transaksi offline" icon="O" label="Total Penjualan" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Akumulasi total transaksi" icon="R" label="Revenue" tone="sage" value={formatCurrency(metrics.revenue)} />
                    <MetricCard helper="Transaksi dari event" icon="E" label="Penjualan Event" tone="blue" value={formatNumber(metrics.events)} />
                    <MetricCard helper="Transaksi door to door" icon="D" label="Door to Door" tone="brown" value={formatNumber(metrics.doorToDoor)} />
                </div>
                {offlineSales.length === 0 ? <AdminCard className="p-5"><EmptyState description="Penjualan offline akan tampil di sini setelah dicatat." title="Belum ada offline sale." /></AdminCard> : <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{offlineSales.map((sale) => <AdminCard className="p-5" key={sale.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{sale.sale_number}</p><h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{sale.customer_name}</h2><p className="mt-1 font-body-sm text-sm text-gray-500">{sale.customer_whatsapp_number || '-'}</p></div><div className="rounded-2xl bg-[#A8C5B3]/25 px-4 py-2 text-right"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Total</p><p className="font-body-sm text-sm font-bold text-[#333333]">{formatCurrency(sale.total)}</p></div></div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Sumber</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{readableLabel(sale.source)}</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Tanggal Terjual</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatDateTime(sale.sold_at)}</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Staff Lapangan</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{sale.field_staff?.name ?? '-'}</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Event</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{sale.event?.name ?? '-'}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.offline-sales.show', sale.id)}>Detail</Link></div></AdminCard>)}</div>}
            </div>
        </>
    );
}

AdminOfflineSalesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOfflineSalesIndex;
