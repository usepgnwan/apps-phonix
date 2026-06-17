import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

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

function AdminLayananIndex({ services = [] }) {
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
                {services.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState
                            description="Layanan akan tampil di sini setelah dibuat."
                            title="Belum ada layanan."
                        />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {services.map((service) => (
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
                    </div>
                )}
            </div>
        </>
    );
}

AdminLayananIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLayananIndex;
