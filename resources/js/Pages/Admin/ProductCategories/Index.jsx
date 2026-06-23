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

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function AdminProductKategoriIndex({ productCategories, filters }) {
    const productKategori = productCategories.data || productCategories;
    
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.product-categories.index'), { search: newSearch, per_page: newPerPage }, {
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
            <Head title="Admin Kategori Produk" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('admin.product-categories.create')}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Kategori
                        </Link>
                    )}
                    description="Kelola kategori produk herbal dan terapi agar katalog tetap rapi untuk customer."
                    eyebrow="Catalog / Kategori Produk"
                    title="Kategori Produk"
                />

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Catalog
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Daftar Kategori Produk
                            </h2>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari kategori..."
                                    value={search}
                                    onChange={handleSearch}
                                    className="w-full rounded-2xl border border-[#E5E7EB] py-2 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                                <span>Tampilkan</span>
                                <select
                                    value={perPage}
                                    onChange={handleLimitChange}
                                    className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {productKategori.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Kategori produk akan tampil di sini setelah dibuat."
                                title="Belum ada kategori produk."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Nama', 'Slug', 'Status', 'Dibuat', 'Aksi'].map((heading) => (
                                            <th
                                                className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                                key={heading}
                                                scope="col"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {productKategori.map((productKategori) => (
                                        <tr
                                            className="transition hover:bg-[#A8C5B3]/10"
                                            key={productKategori.id}
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {productKategori.name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {productKategori.slug ?? '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge
                                                    label={productKategori.is_active ? 'Aktif' : 'Nonaktif'}
                                                    tone={productKategori.is_active ? 'forest' : 'gray'}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDate(productKategori.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                        href={route('admin.product-categories.show', productKategori.id)}
                                                    >
                                                        Detail
                                                    </Link>
                                                    <Link
                                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                                        href={route('admin.product-categories.edit', productKategori.id)}
                                                    >
                                                        Edit
                                                    </Link>
                                                    <AdminDeleteButton
                                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                                        description="Kategori produk akan dihapus dari master katalog admin."
                                                        itemName={productKategori.name}
                                                        routeName="admin.product-categories.destroy"
                                                        routeParams={productKategori.id}
                                                        title="Hapus kategori produk?"
                                                    >
                                                        Hapus
                                                    </AdminDeleteButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {productCategories.links?.length > 0 && (
                                <div className="p-5 border-t border-[#E5E7EB]">
                                    <Pagination links={productCategories.links} />
                                </div>
                            )}
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminProductKategoriIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductKategoriIndex;
