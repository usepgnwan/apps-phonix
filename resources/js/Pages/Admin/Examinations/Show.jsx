import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatDateTime(value) { return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-'; }
function formatNumber(value) { return new Intl.NumberFormat('id-ID').format(Number(value ?? 0)); }
function recommendations(examination) { return examination.product_recommendations ?? examination.productRecommendations ?? []; }
function DetailRow({ label, children }) { return <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p><div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">{children || '-'}</div></div>; }
function TextBlock({ label, children }) { return <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p><p className="mt-2 whitespace-pre-line font-body-sm text-sm leading-6 text-[#333333]">{children || '-'}</p></div>; }

function AdminPemeriksaanShow({ examination }) {
    const productRecommendations = recommendations(examination);
    const title = examination.customer_profile?.name ? `Pemeriksaan ${examination.customer_profile.name}` : `Pemeriksaan #${examination.id}`;

    return (
        <>
            <Head title={`Admin ${title}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.examinations.index')}>Kembali</Link>
                            <Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.examinations.create')}>
                                <Plus aria-hidden="true" className="h-4 w-4" />Tambah Pemeriksaan
                            </Link>
                        </div>
                    )}
                    description="Detail hasil pemeriksaan, ringkasan, dan rekomendasi produk."
                    eyebrow="Booking & Customer / Pemeriksaan"
                    title={title}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Produk direkomendasikan" icon="R" label="Rekomendasi" tone="forest" value={formatNumber(productRecommendations.length)} />
                    <MetricCard helper="Booking terkait" icon="B" label="Booking" tone="sage" value={examination.booking?.booking_number ?? '-'} />
                    <MetricCard helper="Dibuat oleh admin" icon="A" label="Dibuat Oleh" tone="blue" value={examination.creator?.name ?? '-'} />
                    <MetricCard helper="Tanggal dibuat" icon="D" label="Dibuat Pada" tone="brown" value={formatDateTime(examination.created_at)} />
                </div>
                <AdminCard className="p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailRow label="Customer">{examination.customer_profile?.name}</DetailRow>
                        <DetailRow label="WhatsApp">{examination.customer_profile?.whatsapp_number}</DetailRow>
                        <DetailRow label="Nomor Booking">{examination.booking?.booking_number}</DetailRow>
                        <DetailRow label="Layanan">{examination.booking?.service?.name}</DetailRow>
                        <DetailRow label="Pembuat">{examination.creator?.name}</DetailRow>
                        <DetailRow label="Dibuat Pada">{formatDateTime(examination.created_at)}</DetailRow>
                    </div>
                </AdminCard>
                <AdminCard className="p-5">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <TextBlock label="Keluhan">{examination.complaint}</TextBlock>
                        <TextBlock label="Hasil">{examination.result}</TextBlock>
                        <TextBlock label="Ringkasan">{examination.summary}</TextBlock>
                        <TextBlock label="Rekomendasi Internal">{examination.internal_recommendation}</TextBlock>
                    </div>
                </AdminCard>
                <AdminCard className="p-5">
                    <div className="mb-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Produk Rekomendasi</p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">Rekomendasi Produk</h2>
                    </div>
                    {productRecommendations.length === 0 ? (
                        <EmptyState description="Pemeriksaan ini belum memiliki rekomendasi produk." title="Tidak ada rekomendasi." />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {productRecommendations.map((recommendation) => (
                                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] p-4" key={recommendation.id}>
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Produk</p>
                                    <h3 className="mt-1 font-body-lg text-base font-extrabold text-[#333333]">{recommendation.product?.name ?? `Produk #${recommendation.product_id}`}</h3>
                                    <p className="mt-3 whitespace-pre-line font-body-sm text-sm leading-6 text-gray-600">{recommendation.notes || 'Tidak ada catatan tambahan.'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminPemeriksaanShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPemeriksaanShow;
