import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}


function AdminLeadSumbersIndex({ leadSources, filters }) {
    const items = leadSources?.data ?? leadSources ?? [];

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.lead-sources.index'), { search: newSearch, per_page: newPerPage }, {
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

    // Calculate metrics based on the current page data for simplicity,
    // or we could use the metrics approach from Controller if needed.
    const metrics = {
        total: items.length,
        active: items.filter((source) => source.is_active).length,
        inactive: items.filter((source) => !source.is_active).length,
        leads: items.reduce((total, source) => total + Number(source.leads_count ?? 0), 0),
    };

    return (
        <>
            <Head title="Admin Sumber Lead" />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" href={route('admin.lead-sources.create')}><Plus aria-hidden="true" className="h-4 w-4" />Tambah Sumber</Link>} description="Kelola sumber lead yang dipakai untuk tracking kanal CRM Phoenix." eyebrow="Lead & CRM / Sumber Lead" title="Sumber Lead" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari sumber lead..."
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
                        <EmptyState description="Lead source akan tampil di sini setelah dibuat." title="Belum ada lead source." />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {items.map((source) => (
                            <AdminCard className="p-5" key={source.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{source.slug}</p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{source.name}</h2>
                                    </div>
                                    <StatusBadge label={source.is_active ? 'Aktif' : 'Nonaktif'} tone={source.is_active ? 'forest' : 'gray'} />
                                </div>
                                <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Lead Count</p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatNumber(source.leads_count)}</p>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.lead-sources.show', source.id)}>Detail</Link>
                                    <Link className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20" href={route('admin.lead-sources.edit', source.id)}>Edit</Link>
                                    <AdminDeleteButton className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50" description="Sumber lead akan dihapus dari master CRM admin." itemName={source.name} routeName="admin.lead-sources.destroy" routeParams={source.id} title="Hapus sumber lead?">Hapus</AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                        {leadSources.links?.length > 0 && (
                            <div className="col-span-1 xl:col-span-2 flex justify-center mt-2">
                                <Pagination links={leadSources.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

AdminLeadSumbersIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSumbersIndex;
