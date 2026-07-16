import { Head, Link } from '@inertiajs/react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/utils/format';
import { DetailRow } from '@/Components/Admin/FormFields';

const visitTipeLabels = { home_visit: 'Home Visit', office_visit: 'Office Visit', both: 'Home & Office' };

function AdminLayananShow({ service }) {
    return (
        <>
            <Head title={`Detail ${service.name}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.services.index')}
                            >
                                Kembali
                            </Link>
                            <Link
                                className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.services.edit', service.id)}
                            >
                                Edit
                            </Link>
                            <AdminDeleteButton
                                className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                description="Layanan akan dihapus dari katalog admin dan halaman publik terkait."
                                itemName={service.name}
                                routeName="admin.services.destroy"
                                routeParams={service.id}
                                title="Hapus layanan?"
                            >
                                Hapus
                            </AdminDeleteButton>
                        </div>
                    )}
                    description="Detail layanan, harga, tipe kunjungan, dan status publikasi."
                    eyebrow="Catalog / Layanan"
                    title={service.name}
                />
                <AdminCard className="p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <DetailRow label="Nama">{service.name}</DetailRow>
                        <DetailRow label="Slug">{service.slug}</DetailRow>
                        <DetailRow label="Harga">{formatCurrency(service.price)}</DetailRow>
                        <DetailRow label="Tipe Kunjungan">
                            {visitTipeLabels[service.visit_type] ?? service.visit_type ?? '-'}
                        </DetailRow>
                        <DetailRow label="Status">
                            <StatusBadge
                                label={service.is_active ? 'Aktif' : 'Nonaktif'}
                                tone={service.is_active ? 'forest' : 'gray'}
                            />
                        </DetailRow>
                        <DetailRow label="Unggulan">
                            {service.is_featured ? (
                                <StatusBadge label="Unggulan" tone="sage" />
                            ) : (
                                <StatusBadge label="Tidak" tone="gray" />
                            )}
                        </DetailRow>
                        <DetailRow label="Path Gambar">{service.image_path || '-'}</DetailRow>
                        <div className="md:col-span-2">
                            <DetailRow label="Deskripsi">{service.description || '-'}</DetailRow>
                        </div>
                        <div className="md:col-span-2">
                            <DetailRow label="Keunggulan & Fitur Utama">{service.key_features || '-'}</DetailRow>
                        </div>
                        <div className="md:col-span-2">
                            <DetailRow label="Manfaat">{service.benefits || '-'}</DetailRow>
                        </div>
                    </div>
                </AdminCard>
            </div>
        </>
    );
}

AdminLayananShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLayananShow;
