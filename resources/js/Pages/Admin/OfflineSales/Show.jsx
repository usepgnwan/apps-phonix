import { Head, Link } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatCurrency(value) { return new Intl.NumberFormat('id-ID', { currency: 'IDR', maximumFractionDigits: 0, style: 'currency' }).format(Number(value ?? 0)); }
function formatDateTime(value) { return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-'; }
function formatNumber(value) { return new Intl.NumberFormat('id-ID').format(Number(value ?? 0)); }
function readableLabel(value) { return String(value ?? '-').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function DetailRow({ label, children }) { return <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p><div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">{children || '-'}</div></div>; }

function AdminOfflineSalesShow({ offlineSale }) {
    const items = offlineSale.offline_sale_items ?? [];
    const title = offlineSale.sale_number ?? `Offline Sale #${offlineSale.id}`;

    return <><Head title={`Admin ${title}`} /><div className="space-y-8"><AdminPageHeader action={<Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.offline-sales.index')}>Kembali</Link>} description="Detail transaksi offline dan item produk yang dicatat." eyebrow="Commerce / Penjualan Offline" title={title} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard helper="Total transaksi" icon="T" label="Total" tone="forest" value={formatCurrency(offlineSale.total)} /><MetricCard helper="Jumlah item baris" icon="I" label="Item" tone="sage" value={formatNumber(items.length)} /><MetricCard helper="Sumber transaksi" icon="S" label="Sumber" tone="blue" value={readableLabel(offlineSale.source)} /><MetricCard helper="Waktu penjualan" icon="D" label="Tanggal Terjual" tone="brown" value={formatDateTime(offlineSale.sold_at)} /></div><AdminCard className="p-5"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><DetailRow label="Nama Customer">{offlineSale.customer_name}</DetailRow><DetailRow label="Customer WhatsApp">{offlineSale.customer_whatsapp_number}</DetailRow><DetailRow label="Profil Customer">{offlineSale.customer_profile?.name}</DetailRow><DetailRow label="Lead">{offlineSale.lead?.name}</DetailRow><DetailRow label="Staff Lapangan">{offlineSale.field_staff?.name}</DetailRow><DetailRow label="Event">{offlineSale.event?.name}</DetailRow><DetailRow label="Sumber">{readableLabel(offlineSale.source)}</DetailRow><DetailRow label="Tanggal Terjual">{formatDateTime(offlineSale.sold_at)}</DetailRow><div className="sm:col-span-2"><DetailRow label="Catatan">{offlineSale.notes}</DetailRow></div></div></AdminCard><AdminCard className="p-5"><div className="mb-4"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Item</p><h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">Produk Terjual</h2></div>{items.length === 0 ? <EmptyState description="Tidak ada item pada transaksi ini." title="Item kosong." /> : <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]"><div className="hidden grid-cols-[1fr_120px_160px_160px] bg-[#F6F7F7] px-4 py-3 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 md:grid"><span>Product</span><span>Qty</span><span>Unit Harga</span><span>Line Total</span></div>{items.map((item) => <div className="grid grid-cols-1 gap-2 border-t border-[#E5E7EB] px-4 py-4 md:grid-cols-[1fr_120px_160px_160px] md:items-center" key={item.id}><div><p className="font-body-sm text-sm font-bold text-[#333333]">{item.product_name ?? item.product?.name}</p><p className="font-body-sm text-xs text-gray-500">Product ID: {item.product_id}</p></div><p className="font-body-sm text-sm font-semibold text-[#333333]">{formatNumber(item.quantity)}</p><p className="font-body-sm text-sm font-semibold text-[#333333]">{formatCurrency(item.unit_price)}</p><p className="font-body-sm text-sm font-bold text-[#1E4D3A]">{formatCurrency(item.line_total)}</p></div>)}</div>}</AdminCard></div></>;
}

AdminOfflineSalesShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOfflineSalesShow;
