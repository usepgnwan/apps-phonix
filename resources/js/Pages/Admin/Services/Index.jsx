import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';

const visitTipeLabels = { home_visit: 'Home Visit', office_visit: 'Office Visit', both: 'Home & Office' };

function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(Number(value));
}

function snippet(value) {
    if (!value) {
        return 'Deskripsi belum tersedia.';
    }

    return value.length > 140 ? `${value.slice(0, 140)}...` : value;
}

const storageImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? path : `/storage/${path}`;
};

function AdminLayananIndex({ services, filters }) {
    const items = services?.data ?? services ?? [];

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.services.index'), { search: newSearch, per_page: newPerPage }, {
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
            <Head title="Admin Layanan" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('admin.services.create')}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Layanan
                        </Link>
                    )}
                    description="Kelola layanan terapi, tipe kunjungan, harga, dan status unggulan."
                    eyebrow="Catalog / Layanan"
                    title="Layanan"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari layanan..."
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
                        <EmptyState
                            description="Layanan akan tampil di sini setelah dibuat."
                            title="Belum ada layanan."
                        />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {items.map((service) => (
                            <AdminCard className="p-5" key={service.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex gap-4">
                                        {service.image_path ? (
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                                <img 
                                                    src={storageImage(service.image_path)} 
                                                    alt={service.name} 
                                                    className="h-full w-full object-cover" 
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                                <span className="text-gray-400 text-xs">No image</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                {visitTipeLabels[service.visit_type] ?? service.visit_type ?? '-'}
                                            </p>
                                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                                {service.name}
                                            </h2>
                                            <p className="mt-2 font-body-sm text-sm leading-6 text-gray-500">
                                                {snippet(service.description)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="shrink-0 font-body-sm text-base font-extrabold text-[#1E4D3A]">
                                        {formatCurrency(service.price)}
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatusBadge
                                        label={service.is_active ? 'Aktif' : 'Nonaktif'}
                                        tone={service.is_active ? 'forest' : 'gray'}
                                    />
                                    {service.is_featured && (
                                        <StatusBadge label="Unggulan" tone="sage" />
                                    )}
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('admin.services.show', service.id)}
                                    >
                                        Detail
                                    </Link>
                                    <Link
                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        href={route('admin.services.edit', service.id)}
                                    >
                                        Edit
                                    </Link>
                                    <AdminDeleteButton
                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                        description="Layanan akan dihapus dari katalog admin dan halaman publik terkait."
                                        itemName={service.name}
                                        routeName="admin.services.destroy"
                                        routeParams={service.id}
                                        title="Hapus layanan?"
                                    >
                                        Hapus
                                    </AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                        {services.links?.length > 0 && (
                            <div className="col-span-1 xl:col-span-2 flex justify-center mt-2">
                                <Pagination links={services.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

AdminLayananIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLayananIndex;
