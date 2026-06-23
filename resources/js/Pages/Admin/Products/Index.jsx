import { Head, Link, router } from '@inertiajs/react';
import { Eye, Package, Pencil, Plus, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(Number(value ?? 0));
}

function productKategori(product) {
    return product.product_category ?? product.productKategori;
}

function isLowStock(product) {
    return Number(product.stock_quantity ?? 0) <= Number(product.low_stock_threshold ?? 0);
}

function AdminProdukIndex({ products, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.products.index'), { search: newSearch, per_page: newPerPage }, {
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
            <Head title="Produk Admin" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('admin.products.create')}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Produk
                        </Link>
                    )}
                    description="Kelola produk herbal, stok, harga, dan status unggulan untuk katalog Phoenix."
                    eyebrow="Katalog / Produk"
                    icon={Package}
                    title="Produk"
                />
                
                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama produk..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
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
                            <span>data</span>
                        </div>
                    </div>
                </AdminCard>
                {products.data.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState
                            description="Produk tidak ditemukan."
                            title="Belum ada produk."
                        />
                    </AdminCard>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            {products.data.map((product) => (
                            <AdminCard className="p-5" key={product.id}>
                                <div className="flex gap-4 items-start">
                                    {/* Thumbnail */}
                                    <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F6F7F7] flex items-center justify-center">
                                        {product.image_path ? (
                                            <img
                                                src={product.image_path}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                        <div className="min-w-0">
                                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                {productKategori(product)?.name ?? 'Tanpa kategori'}
                                            </p>
                                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                                {product.name}
                                            </h2>
                                            <p className="mt-1 line-clamp-2 font-body-sm text-sm leading-6 text-gray-500">
                                                {product.short_description || 'Deskripsi singkat belum tersedia.'}
                                            </p>
                                            {product.bpom_number && (
                                                <p className="mt-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]/75">
                                                    No. BPOM {product.bpom_number}
                                                </p>
                                            )}
                                        </div>
                                        <p className="shrink-0 font-body-sm text-base font-extrabold text-[#1E4D3A]">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatusBadge
                                        label={product.is_active ? 'Aktif' : 'Nonaktif'}
                                        tone={product.is_active ? 'forest' : 'gray'}
                                    />
                                    {product.is_featured && (
                                        <StatusBadge label="Unggulan" tone="sage" />
                                    )}
                                    {isLowStock(product) && (
                                        <StatusBadge label="Stok Rendah" tone="orange" />
                                    )}
                                </div>
                                <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Stok
                                    </p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                        {product.stock_quantity ?? 0} tersedia · Ambang {product.low_stock_threshold ?? 0}
                                    </p>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('admin.products.show', product.id)}
                                    >
                                        <Eye aria-hidden="true" className="h-4 w-4" />
                                        Detail
                                    </Link>
                                    <Link
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        href={route('admin.products.edit', product.id)}
                                    >
                                        <Pencil aria-hidden="true" className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <AdminDeleteButton
                                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                        description="Produk akan dihapus dari katalog admin dan tidak bisa dipulihkan lewat panel ini."
                                        itemName={product.name}
                                        routeName="admin.products.destroy"
                                        routeParams={product.id}
                                        title="Hapus produk?"
                                    >
                                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                                        Hapus
                                    </AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                        </div>
                        <div className="flex justify-center">
                            <Pagination links={products.links} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AdminProdukIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProdukIndex;
