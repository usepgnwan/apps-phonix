import { Head, Link } from '@inertiajs/react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/utils/format';
import { DetailRow } from '@/Components/Admin/FormFields';

function productKategori(product) {
    return product.product_category ?? product.productKategori;
}

function getValidBranchStocks(product) {
    return (product.branch_stocks ?? []).filter((stock) => stock?.branch != null);
}

function toStockNumber(value) {
    const n = Number(value ?? 0);
    return Number.isNaN(n) ? 0 : n;
}

function isBranchLowStock(stock) {
    const qty = toStockNumber(stock?.stock_quantity);
    const threshold = toStockNumber(stock?.low_stock_threshold);

    return threshold > 0 && qty <= threshold;
}

function getTotalStock(product) {
    const stocks = getValidBranchStocks(product);

    if (stocks.length > 0) {
        return stocks.reduce((acc, bs) => acc + toStockNumber(bs.stock_quantity), 0);
    }

    return toStockNumber(product.stock_quantity);
}

function isLowStock(product) {
    const stocks = getValidBranchStocks(product);

    if (stocks.length > 0) {
        return stocks.some(isBranchLowStock);
    }

    const totalStock = toStockNumber(product.stock_quantity);
    const totalThreshold = toStockNumber(product.low_stock_threshold);

    return totalThreshold > 0 && totalStock <= totalThreshold;
}

function AdminProdukShow({ product }) {
    const category = productKategori(product);
    const branchStocks = getValidBranchStocks(product);
    const totalStock = getTotalStock(product);
    const productIsLowStock = isLowStock(product);

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
                            <AdminDeleteButton
                                className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                description="Produk akan dihapus dari katalog admin dan tidak bisa dipulihkan lewat panel ini."
                                itemName={product.name}
                                routeName="admin.products.destroy"
                                routeParams={product.id}
                                title="Hapus produk?"
                            >
                                Hapus
                            </AdminDeleteButton>
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
                            <DetailRow label="Total Stok">
                                {totalStock}
                            </DetailRow>
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
                            {productIsLowStock && (
                                <DetailRow label="Peringatan">
                                    <StatusBadge label="Stok Rendah" tone="orange" />
                                </DetailRow>
                            )}
                            <DetailRow label="Path Gambar">{product.image_path || '-'}</DetailRow>
                        </div>
                    </AdminCard>
                    <AdminCard className="p-5">
                        <div className="space-y-3">
                            <h3 className="font-bold text-[#333333] border-b border-[#E5E7EB] pb-2 mb-2">Stok Per Cabang</h3>
                            {branchStocks.length > 0 ? (
                                <div className="space-y-2">
                                    {branchStocks.map((bs) => {
                                        const qty = toStockNumber(bs.stock_quantity);
                                        const threshold = toStockNumber(bs.low_stock_threshold);
                                        const isLow = isBranchLowStock(bs) || qty === 0;

                                        return (
                                            <div key={bs.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                <span className="font-medium text-sm text-gray-700">{bs.branch?.name ?? `Cabang #${bs.branch_id}`}</span>
                                                <span className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {qty} <span className="font-normal text-xs text-gray-500">(Batas: {threshold})</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada data stok per cabang.</p>
                            )}
                        </div>
                    </AdminCard>
                    <AdminCard className="p-5">
                        <div className="space-y-3">
                            <DetailRow label="Slug">{product.slug}</DetailRow>
                            <DetailRow label="Deskripsi Singkat">{product.short_description || '-'}</DetailRow>
                            <DetailRow label="Deskripsi Lengkap">{product.full_description || '-'}</DetailRow>
                            <DetailRow label="Komposisi">{product.composition || '-'}</DetailRow>
                            <DetailRow label="No. BPOM">{product.bpom_number || '-'}</DetailRow>
                            <DetailRow label="Tipe Kemasan">{product.packaging_type || '-'}</DetailRow>
                            <DetailRow label="Berat / Jumlah Isi">{product.content_amount ? `${product.content_amount} ${product.content_unit || ''}` : '-'}</DetailRow>
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
