import { Head, Link, router } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
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

function DetailRow({ children, label }) {
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">
                {children ?? '-'}
            </div>
        </div>
    );
}

function deleteProduct(product) {
    if (window.confirm(`Hapus produk ${product.name}?`)) {
        router.delete(route('admin.products.destroy', product.id));
    }
}

function AdminProdukShow({ product }) {
    const category = productKategori(product);

    return (
        <>
            <Head title={`Detail ${product.name}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.products.index')}
                            >
                                Kembali
                            </Link>
                            <Link
                                className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.products.edit', product.id)}
                            >
                                Edit
                            </Link>
                            <button
                                className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                onClick={() => deleteProduct(product)}
                                type="button"
                            >
                                Hapus
                            </button>
                        </div>
                    )}
                    description="Detail produk, stok, harga, dan informasi katalog."
                    eyebrow="Katalog / Produk"
                    title={product.name}
                />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Kategori">{category?.name ?? '-'}</DetailRow>
                            <DetailRow label="Harga">{formatCurrency(product.price)}</DetailRow>
                            <DetailRow label="Stok">{product.stock_quantity ?? 0}</DetailRow>
                            <DetailRow label="Ambang Stok Rendah">{product.low_stock_threshold ?? 0}</DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge
                                    label={product.is_active ? 'Aktif' : 'Nonaktif'}
                                    tone={product.is_active ? 'forest' : 'gray'}
                                />
                            </DetailRow>
                            <DetailRow label="Unggulan">
                                {product.is_featured ? (
                                    <StatusBadge label="Unggulan" tone="sage" />
                                ) : (
                                    <StatusBadge label="Tidak" tone="gray" />
                                )}
                            </DetailRow>
                            {isLowStock(product) && (
                                <DetailRow label="Peringatan">
                                    <StatusBadge label="Stok Rendah" tone="orange" />
                                </DetailRow>
                            )}
                            <DetailRow label="Path Gambar">{product.image_path || '-'}</DetailRow>
                        </div>
                    </AdminCard>
                    <AdminCard className="p-5">
                        <div className="space-y-3">
                            <DetailRow label="Slug">{product.slug}</DetailRow>
                            <DetailRow label="Deskripsi Singkat">{product.short_description || '-'}</DetailRow>
                            <DetailRow label="Deskripsi Lengkap">{product.full_description || '-'}</DetailRow>
                            <DetailRow label="Manfaat">{product.benefits || '-'}</DetailRow>
                            <DetailRow label="Aturan Pakai">{product.usage_rules || '-'}</DetailRow>
                            <DetailRow label="Catatan">{product.notes || '-'}</DetailRow>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminProdukShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProdukShow;
