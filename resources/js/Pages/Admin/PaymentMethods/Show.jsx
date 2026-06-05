import { Head, Link, router } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function typeLabel(type) {
    return type === 'qris' ? 'QRIS' : 'Bank Transfer';
}

function methodTitle(paymentMethod) {
    if (paymentMethod.type === 'qris') {
        return paymentMethod.qris_image_path || 'QRIS';
    }

    return paymentMethod.bank_name || 'Bank Transfer';
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

function deletePaymentMethod(paymentMethod) {
    if (window.confirm(`Hapus metode pembayaran ${methodTitle(paymentMethod)}?`)) {
        router.delete(route('admin.payment-methods.destroy', paymentMethod.id));
    }
}

function AdminPaymentMethodsShow({ paymentMethod }) {
    return (
        <>
            <Head title={`Detail ${methodTitle(paymentMethod)}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.payment-methods.index')}
                            >
                                Kembali
                            </Link>
                            <Link
                                className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.payment-methods.edit', paymentMethod.id)}
                            >
                                Edit
                            </Link>
                            <button
                                className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                onClick={() => deletePaymentMethod(paymentMethod)}
                                type="button"
                            >
                                Hapus
                            </button>
                        </div>
                    )}
                    description="Detail field metode pembayaran, status aktif, instruksi, dan jumlah order terkait."
                    eyebrow="Commerce / Metode Pembayaran"
                    title={methodTitle(paymentMethod)}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        helper="Jenis metode pembayaran"
                        icon="T"
                        label="Tipe"
                        tone="forest"
                        value={typeLabel(paymentMethod.type)}
                    />
                    <MetricCard
                        helper="Status tampil admin"
                        icon="S"
                        label="Status"
                        tone={paymentMethod.is_active ? 'sage' : 'brown'}
                        value={paymentMethod.is_active ? 'Aktif' : 'Nonaktif'}
                    />
                    <MetricCard
                        helper="Order yang memakai metode ini"
                        icon="O"
                        label="Order"
                        tone="blue"
                        value={formatNumber(paymentMethod.orders_count)}
                    />
                    <MetricCard
                        helper="ID metode pembayaran"
                        icon="#"
                        label="ID"
                        tone="brown"
                        value={paymentMethod.id}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Tipe">
                                {typeLabel(paymentMethod.type)}
                            </DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge
                                    label={paymentMethod.is_active ? 'Aktif' : 'Nonaktif'}
                                    tone={paymentMethod.is_active ? 'forest' : 'gray'}
                                />
                            </DetailRow>
                            <DetailRow label="Nama Bank">
                                {paymentMethod.bank_name || '-'}
                            </DetailRow>
                            <DetailRow label="Nomor Rekening">
                                {paymentMethod.account_number || '-'}
                            </DetailRow>
                            <DetailRow label="Nama Pemilik Rekening">
                                {paymentMethod.account_holder_name || '-'}
                            </DetailRow>
                            <DetailRow label="Path Gambar QRIS">
                                {paymentMethod.qris_image_path || '-'}
                            </DetailRow>
                        </div>
                    </AdminCard>
                    <AdminCard className="p-5">
                        <div className="space-y-3">
                            <DetailRow label="Instruksi">
                                {paymentMethod.instructions || '-'}
                            </DetailRow>
                            <DetailRow label="Jumlah Order">
                                {formatNumber(paymentMethod.orders_count)}
                            </DetailRow>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminPaymentMethodsShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPaymentMethodsShow;
