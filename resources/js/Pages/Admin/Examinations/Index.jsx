import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatNumber, formatDateTime } from '@/utils/format';

function serviceName(examination) {
    return examination.service_type ?? examination.booking?.service?.name ?? examination.booking?.booking_number ?? '-';
}

function recommendations(examination) {
    return examination.product_recommendations ?? examination.productRecommendations ?? [];
}

function AdminPemeriksaanIndex({ examinations, metrics, filters }) {
    const items = examinations?.data ?? examinations ?? [];
    
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.examinations.index'), { search: newSearch, per_page: newPerPage }, {
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
            <Head title="Admin Pemeriksaan" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.examinations.create')}>
                            <Plus aria-hidden="true" className="h-4 w-4" /> Tambah Pemeriksaan
                        </Link>
                    )}
                    description="Kelola riwayat hasil pemeriksaan customer dan rekomendasi produk. Input pemeriksaan baru tersedia di halaman terpisah."
                    eyebrow="Booking & Customer / Pemeriksaan"
                    title="Pemeriksaan"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <MetricCard helper="Seluruh pemeriksaan" icon="E" label="Total" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Produk direkomendasikan" icon="R" label="Dengan Rekomendasi" tone="sage" value={formatNumber(metrics.withRecommendations)} />
                    <MetricCard helper="Di-assign ke staff" icon="S" label="Staff Assigned" tone="blue" value={formatNumber(metrics.assignedToStaff)} />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari customer atau staff..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Tampilkan</span>
                        <select
                            value={perPage}
                            onChange={handleLimitChange}
                            className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-white shadow-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>data</span>
                    </div>
                </div>
                {items.length === 0 ? (
                    <AdminCard className="p-5"><EmptyState description="Pemeriksaan akan tampil di sini setelah dibuat." title="Belum ada pemeriksaan." /></AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {items.map((examination) => (
                            <AdminCard className="p-5" key={examination.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{formatDateTime(examination.created_at)}</p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{examination.customer_profile?.name ?? 'Customer'}</h2>
                                        <p className="mt-1 font-body-sm text-sm text-gray-500">{serviceName(examination)}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#A8C5B3]/25 px-4 py-2 text-right">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Rekomendasi</p>
                                        <p className="font-body-md text-lg font-black text-[#1E4D3A]">{formatNumber(recommendations(examination).length)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Keluhan</p>
                                        <p className="mt-1 line-clamp-2 font-body-sm text-sm text-[#333333]">{examination.complaint}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Staff Bertugas</p>
                                        <p className="mt-1 line-clamp-2 font-body-sm text-sm text-[#333333]">{examination.assigned_staff?.name ?? '-'}</p>
                                    </div>
                                </div>
                                {examination.result_pdf_path ? (
                                    <div className="mt-3 rounded-2xl bg-[#A8C5B3]/20 px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Hasil PDF</p>
                                        <a className="mt-1 inline-block font-body-sm text-sm font-bold text-[#1E4D3A] underline-offset-4 hover:underline" href={`/storage/${examination.result_pdf_path}`} target="_blank" rel="noreferrer">Lihat PDF</a>
                                    </div>
                                ) : null}
                                <div className="mt-4 flex justify-end">
                                    <Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.examinations.show', examination.id)}>
                                        Lihat Detail
                                    </Link>
                                </div>
                            </AdminCard>
                        ))}
                        {examinations.links?.length > 0 && (
                            <div className="col-span-1 xl:col-span-2 flex justify-center mt-2">
                                <Pagination links={examinations.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

AdminPemeriksaanIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPemeriksaanIndex;
