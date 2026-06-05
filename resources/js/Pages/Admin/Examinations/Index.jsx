import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatDateTime(value) { return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-'; }
function formatNumber(value) { return new Intl.NumberFormat('id-ID').format(Number(value ?? 0)); }
function serviceName(examination) { return examination.booking?.service?.name ?? examination.booking?.booking_number ?? '-'; }
function recommendations(examination) { return examination.product_recommendations ?? examination.productRecommendations ?? []; }

function AdminPemeriksaanIndex({ examinations = [] }) {
    const items = examinations?.data ?? examinations ?? [];
    const metrics = {
        total: items.length,
        recommendations: items.reduce((total, examination) => total + recommendations(examination).length, 0),
        withBooking: items.filter((examination) => Boolean(examination.booking_id ?? examination.booking?.id)).length,
        manual: items.filter((examination) => !(examination.booking_id ?? examination.booking?.id)).length,
    };

    return <><Head title="Admin Pemeriksaan" /><div className="space-y-8"><AdminPageHeader action={<Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.examinations.create')}><Plus aria-hidden="true" className="h-4 w-4" />Tambah Pemeriksaan</Link>} description="Kelola hasil pemeriksaan customer dan rekomendasi produk herbal Phoenix." eyebrow="Booking & Customer / Pemeriksaan" title="Pemeriksaan" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard helper="Seluruh pemeriksaan" icon="E" label="Total" tone="forest" value={formatNumber(metrics.total)} /><MetricCard helper="Produk direkomendasikan" icon="R" label="Rekomendasi" tone="sage" value={formatNumber(metrics.recommendations)} /><MetricCard helper="Terhubung booking" icon="B" label="Dengan Booking" tone="blue" value={formatNumber(metrics.withBooking)} /><MetricCard helper="Pemeriksaan manual" icon="M" label="Manual" tone="brown" value={formatNumber(metrics.manual)} /></div>{items.length === 0 ? <AdminCard className="p-5"><EmptyState description="Pemeriksaan akan tampil di sini setelah dibuat." title="Belum ada pemeriksaan." /></AdminCard> : <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{items.map((examination) => <AdminCard className="p-5" key={examination.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{formatDateTime(examination.created_at)}</p><h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{examination.customer_profile?.name ?? 'Customer'}</h2><p className="mt-1 font-body-sm text-sm text-gray-500">{serviceName(examination)}</p></div><div className="rounded-2xl bg-[#A8C5B3]/25 px-4 py-2 text-right"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Rekomendasi</p><p className="font-body-sm text-sm font-bold text-[#333333]">{formatNumber(recommendations(examination).length)}</p></div></div><div className="mt-4 grid grid-cols-1 gap-3"><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Keluhan</p><p className="mt-1 line-clamp-2 font-body-sm text-sm font-semibold text-[#333333]">{examination.complaint}</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Summary</p><p className="mt-1 line-clamp-2 font-body-sm text-sm font-semibold text-[#333333]">{examination.summary}</p></div></div><div className="mt-4 flex flex-col gap-1 font-body-sm text-xs text-gray-500"><span>Dibuat oleh: <strong className="text-[#333333]">{examination.creator?.name ?? '-'}</strong></span><span>Booking: <strong className="text-[#333333]">{examination.booking?.booking_number ?? '-'}</strong></span></div><div className="mt-5 flex flex-wrap gap-2"><Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.examinations.show', examination.id)}>Detail</Link></div></AdminCard>)}</div>}</div></>;
}

AdminPemeriksaanIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPemeriksaanIndex;
