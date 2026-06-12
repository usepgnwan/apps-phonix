import { Head, Link } from '@inertiajs/react';
import { Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

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

function AdminProdukIndex({ products = [] }) {
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
                {products.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState
                            description="Produk akan tampil di sini setelah dibuat."
                            title="Belum ada produk."
                        />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {products.map((product) => (
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
                )}
            </div>
        </>
    );
}

AdminProdukIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProdukIndex;
