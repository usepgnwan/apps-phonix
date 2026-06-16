import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function typeLabel(type) {
    if (type === 'qris') return 'QRIS';
    if (type === 'cash') return 'Cash / Tunai';
    return 'Bank Transfer';
}

function methodTitle(paymentMethod) {
    if (paymentMethod.type === 'qris') {
        return paymentMethod.qris_image_path || 'QRIS';
    }
    if (paymentMethod.type === 'cash') {
        return paymentMethod.bank_name || 'Pembayaran Tunai';
    }
    return paymentMethod.bank_name || 'Bank Transfer';
}

function detailSummary(paymentMethod) {
    if (paymentMethod.type === 'qris') {
        return paymentMethod.qris_image_path || 'Path QRIS belum diisi.';
    }
    if (paymentMethod.type === 'cash') {
        return 'Pembayaran dilakukan secara langsung.';
    }
    return [paymentMethod.account_number, paymentMethod.account_holder_name]
        .filter(Boolean)
        .join(' / ') || 'Detail rekening belum diisi.';
}

function AdminPaymentMethodsIndex({ paymentMethods = [] }) {
    const metrics = {
        total: paymentMethods.length,
        active: paymentMethods.filter((paymentMethod) => paymentMethod.is_active).length,
        bankTransfer: paymentMethods.filter((paymentMethod) => paymentMethod.type === 'bank_transfer').length,
        qris: paymentMethods.filter((paymentMethod) => paymentMethod.type === 'qris').length,
        cash: paymentMethods.filter((paymentMethod) => paymentMethod.type === 'cash').length,
        orders: paymentMethods.reduce(
            (total, paymentMethod) => total + Number(paymentMethod.orders_count ?? 0),
            0,
        ),
    };

    return (
        <>
            <Head title="Admin Metode Pembayaran" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('admin.payment-methods.create')}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Metode
                        </Link>
                    )}
                    description="Kelola metode pembayaran yang tersedia untuk pembayaran order Phoenix."
                    eyebrow="Commerce / Metode Pembayaran"
                    title="Metode Pembayaran"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <MetricCard
                        helper="Seluruh metode admin"
                        icon="P"
                        label="Total"
                        tone="forest"
                        value={formatNumber(metrics.total)}
                    />
                    <MetricCard
                        helper="Metode yang aktif"
                        icon="A"
                        label="Aktif"
                        tone="sage"
                        value={formatNumber(metrics.active)}
                    />
                    <MetricCard
                        helper="Rekening bank transfer"
                        icon="B"
                        label="Bank Transfer"
                        tone="blue"
                        value={formatNumber(metrics.bankTransfer)}
                    />
                    <MetricCard
                        helper="Path QRIS tersimpan"
                        icon="Q"
                        label="QRIS"
                        tone="brown"
                        value={formatNumber(metrics.qris)}
                    />
                    <MetricCard
                        helper="Metode tunai"
                        icon="C"
                        label="Cash / Tunai"
                        tone="orange"
                        value={formatNumber(metrics.cash)}
                    />
                    <MetricCard
                        helper="Order terkait"
                        icon="O"
                        label="Order"
                        tone="forest"
                        value={formatNumber(metrics.orders)}
                    />
                </div>

                {paymentMethods.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState
                            description="Metode pembayaran akan tampil di sini setelah dibuat."
                            title="Belum ada metode pembayaran."
                        />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {paymentMethods.map((paymentMethod) => (
                            <AdminCard className="p-5" key={paymentMethod.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            {typeLabel(paymentMethod.type)}
                                        </p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                            {methodTitle(paymentMethod)}
                                        </h2>
                                        <p className="mt-2 line-clamp-2 font-body-sm text-sm leading-6 text-gray-500">
                                            {paymentMethod.instructions || 'Instruksi pembayaran belum tersedia.'}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        label={paymentMethod.is_active ? 'Aktif' : 'Nonaktif'}
                                        tone={paymentMethod.is_active ? 'forest' : 'gray'}
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatusBadge
                                        label={typeLabel(paymentMethod.type)}
                                        tone={paymentMethod.type === 'qris' ? 'brown' : 'blue'}
                                    />
                                    <StatusBadge
                                        label={`${formatNumber(paymentMethod.orders_count)} Order`}
                                        tone="sage"
                                    />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Details
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {detailSummary(paymentMethod)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Jumlah Order
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {formatNumber(paymentMethod.orders_count)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('admin.payment-methods.show', paymentMethod.id)}
                                    >
                                        Detail
                                    </Link>
                                    <Link
                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        href={route('admin.payment-methods.edit', paymentMethod.id)}
                                    >
                                        Edit
                                    </Link>
                                    <AdminDeleteButton
                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                        description="Metode pembayaran akan dihapus dari daftar metode pembayaran admin."
                                        itemName={methodTitle(paymentMethod)}
                                        routeName="admin.payment-methods.destroy"
                                        routeParams={paymentMethod.id}
                                        title="Hapus metode pembayaran?"
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

AdminPaymentMethodsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPaymentMethodsIndex;
