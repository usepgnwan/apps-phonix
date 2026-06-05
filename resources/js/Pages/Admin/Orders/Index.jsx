import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, CreditCard, Eye, PackageCheck, ReceiptText } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

const shippingStatusMap = {
    pending_shipping_confirmation: ['Menunggu Konfirmasi Ongkir', 'orange'],
    shipping_cost_confirmed: ['Ongkir Dikonfirmasi', 'blue'],
    ready_to_ship: ['Siap Dikirim', 'sage'],
    shipped: ['Dikirim', 'blue'],
    delivered: ['Terkirim', 'forest'],
    cancelled: ['Batal', 'red'],
};

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(Number(value ?? 0));
}

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

function customerName(order) {
    return order.customer_profile?.name ?? order.customer_name ?? order.user?.name ?? 'Customer';
}

function paymentMethodNama(order) {
    const method = order.payment_method;

    if (!method) {
        return order.payment_method_name ?? '-';
    }

    return [method.type, method.bank_name, method.account_holder_name].filter(Boolean).join(' / ') || '-';
}

function ShippingBadge({ status }) {
    const mapped = shippingStatusMap[status];

    if (!mapped) {
        return <StatusBadge status={status} />;
    }

    return <StatusBadge label={mapped[0]} tone={mapped[1]} />;
}

function AdminOrderIndex({ orders = [] }) {
    const metrics = {
        totalOrder: orders.length,
        waitingPayment: orders.filter((order) => order.status === 'waiting_payment').length,
        paymentReceived: orders.filter((order) => order.status === 'payment_received').length,
        processing: orders.filter((order) => order.status === 'processing').length,
        completed: orders.filter((order) => order.status === 'completed').length,
    };

    return (
        <>
            <Head title="Admin Order" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Konfirmasi biaya pengiriman, verifikasi pembayaran, dan pantau fulfillment order website Phoenix dari satu halaman."
                    eyebrow="Commerce / Order"
                    title="Order"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard
                        helper="Seluruh order website"
                        icon={<ReceiptText aria-hidden="true" className="h-5 w-5" />}
                        label="Total Order"
                        tone="forest"
                        value={formatNumber(metrics.totalOrder)}
                    />
                    <MetricCard
                        helper="Menunggu pembayaran customer"
                        icon={<Clock3 aria-hidden="true" className="h-5 w-5" />}
                        label="Menunggu Payment"
                        tone="brown"
                        value={formatNumber(metrics.waitingPayment)}
                    />
                    <MetricCard
                        helper="Pembayaran sudah diterima"
                        icon={<CreditCard aria-hidden="true" className="h-5 w-5" />}
                        label="Payment Received"
                        tone="blue"
                        value={formatNumber(metrics.paymentReceived)}
                    />
                    <MetricCard
                        helper="Order sedang diproses"
                        icon={<PackageCheck aria-hidden="true" className="h-5 w-5" />}
                        label="Processing"
                        tone="sage"
                        value={formatNumber(metrics.processing)}
                    />
                    <MetricCard
                        helper="Order selesai"
                        icon={<CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
                        label="Selesai"
                        tone="forest"
                        value={formatNumber(metrics.completed)}
                    />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Commerce
                        </p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                            Daftar Order
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Order dari checkout customer akan tampil di sini setelah tersedia."
                                title="Belum ada order."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {[
                                            'Nomor Order',
                                            'Customer',
                                            'Status Order',
                                            'Status Pengiriman',
                                            'Status Pembayaran',
                                            'Metode Pembayaran',
                                            'Total',
                                            'Tanggal Dibuat',
                                            'Aksi',
                                        ].map((heading) => (
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
                                    {orders.map((order) => (
                                        <tr
                                            className="transition hover:bg-[#A8C5B3]/10"
                                            key={order.id}
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {order.order_number ?? `Order #${order.id}`}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {customerName(order)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <ShippingBadge status={order.shipping_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={order.payment_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {paymentMethodNama(order)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <Link
                                                    className="group inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                    href={route('admin.orders.show', order.id)}
                                                >
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A8C5B3]/25 transition group-hover:bg-white/15">
                                                        <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                                                    </span>
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminOrderIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOrderIndex;
