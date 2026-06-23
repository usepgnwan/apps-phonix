import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';

function formatDate(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '-';
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}


function AdminEventIndex({ events, metrics, filters }) {
    const items = events?.data ?? events ?? [];

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.events.index'), { search: newSearch, per_page: newPerPage }, {
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
            <Head title="Admin Event" />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.events.create')}><Plus aria-hidden="true" className="h-4 w-4" />Tambah Event</Link>} description="Kelola event lapangan dan pameran yang menjadi sumber lead dan penjualan offline." eyebrow="CRM & Field / Event" title="Event" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Seluruh event" icon="E" label="Total Event" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Event aktif saat ini" icon="A" label="Event Aktif" tone="sage" value={formatNumber(metrics.active)} />
                    <MetricCard helper="Event mendatang" icon="U" label="Akan Datang" tone="blue" value={formatNumber(metrics.upcoming)} />
                    <MetricCard helper="Event telah selesai" icon="P" label="Selesai" tone="brown" value={formatNumber(metrics.past)} />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau lokasi event..."
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
                    <AdminCard className="p-5">
                        <EmptyState description="Event akan tampil di sini setelah dibuat." title="Belum ada event." />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {items.map((event) => (
                            <AdminCard className="p-5" key={event.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                        </p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{event.name}</h2>
                                        <p className="mt-1 font-body-sm text-sm text-gray-500">{event.location}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#A8C5B3]/25 px-4 py-2 text-right">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Organizer</p>
                                        <p className="font-body-sm text-sm font-bold text-[#333333]">{event.organizer || '-'}</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Lead</p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(event.leads_count)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Penjualan Offline</p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(event.offline_sales_count)}</p>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.events.show', event.id)}>Detail</Link>
                                    <Link className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20" href={route('admin.events.edit', event.id)}>Edit</Link>
                                    <AdminDeleteButton className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50" description="Event akan dihapus dari data CRM dan field activity admin." itemName={event.name} routeName="admin.events.destroy" routeParams={event.id} title="Hapus event?">Hapus</AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                        {events.links?.length > 0 && (
                            <div className="col-span-1 xl:col-span-2 flex justify-center mt-2">
                                <Pagination links={events.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

AdminEventIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminEventIndex;
