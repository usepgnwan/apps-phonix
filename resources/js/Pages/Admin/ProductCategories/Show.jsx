import { Head, Link } from '@inertiajs/react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
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

function AdminProductKategoriShow({ productCategory: productKategori }) {
    return (
        <>
            <Head title={`Detail ${productKategori.name}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.product-categories.index')}
                            >
                                Kembali
                            </Link>
                            <Link
                                className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.product-categories.edit', productKategori.id)}
                            >
                                Edit
                            </Link>
                            <AdminDeleteButton
                                className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                description="Kategori produk akan dihapus dari master katalog admin."
                                itemName={productKategori.name}
                                routeName="admin.product-categories.destroy"
                                routeParams={productKategori.id}
                                title="Hapus kategori produk?"
                            >
                                Hapus
                            </AdminDeleteButton>
                        </div>
                    )}
                    description="Detail kategori produk dan status publikasinya."
                    eyebrow="Catalog / Kategori Produk"
                    title={productKategori.name}
                />

                <AdminCard className="p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <DetailRow label="Nama">{productKategori.name}</DetailRow>
                        <DetailRow label="Slug">{productKategori.slug}</DetailRow>
                        <DetailRow label="Status">
                            <StatusBadge
                                label={productKategori.is_active ? 'Aktif' : 'Nonaktif'}
                                tone={productKategori.is_active ? 'forest' : 'gray'}
                            />
                        </DetailRow>
                        <DetailRow label="Dibuat">{formatDateTime(productKategori.created_at)}</DetailRow>
                        <div className="md:col-span-2">
                            <DetailRow label="Deskripsi">{productKategori.description || '-'}</DetailRow>
                        </div>
                    </div>
                </AdminCard>
            </div>
        </>
    );
}

AdminProductKategoriShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductKategoriShow;
