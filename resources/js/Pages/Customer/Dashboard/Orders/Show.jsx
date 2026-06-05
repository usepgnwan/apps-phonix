import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ReceiptText } from 'lucide-react';

import CustomerCard from '@/Components/Customer/CustomerCard';
import CustomerDetailRow from '@/Components/Customer/CustomerDetailRow';
import CustomerEmptyState from '@/Components/Customer/CustomerEmptyState';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import CustomerStatusBadge from '@/Components/Customer/CustomerStatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(Number(value ?? 0));
}

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function itemName(item) {
    return item.product?.name ?? item.product_name ?? item.name ?? `Item #${item.id}`;
}

function lineTotal(item) {
    return item.line_total ?? Number(item.quantity ?? 0) * Number(item.unit_price ?? item.price ?? 0);
}

function paymentMethodLabel(paymentMethod) {
    if (!paymentMethod) {
        return '-';
    }

    if (paymentMethod.type === 'qris') {
        return 'QRIS';
    }

    if (paymentMethod.bank_name) {
        return `Transfer Bank ${paymentMethod.bank_name}`;
    }

    return String(paymentMethod.type ?? 'Metode Pembayaran').replaceAll('_', ' ');
}

export default function CustomerOrderShow({ order }) {
    const title = order.order_number ?? `Order #${order.id}`;
    const items = order.order_items ?? [];
    const voucher = order.voucher_redemption?.voucher ?? order.voucher;
    const paymentMethod = order.payment_method;

    return (
        <>
            <Head title={title} />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-primary-container bg-white px-4 py-2 font-body-sm text-sm font-bold text-primary-container transition hover:bg-primary-container hover:text-white"
                            href={route('customer.dashboard.index')}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Dashboard
                        </Link>
                    )}
                    description="Detail order produk Phoenix Anda, termasuk status pembayaran, pengiriman, dan item yang dipesan."
                    eyebrow="Detail Order"
                    icon={ReceiptText}
                    title={title}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <CustomerCard className="p-5">
                        <CustomerSectionHeader eyebrow="Ringkasan" title="Status Order" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CustomerDetailRow label="Nomor Order">{title}</CustomerDetailRow>
                            <CustomerDetailRow label="Status Order"><CustomerStatusBadge status={order.status} /></CustomerDetailRow>
                            <CustomerDetailRow label="Pembayaran"><CustomerStatusBadge status={order.payment_status} /></CustomerDetailRow>
                            <CustomerDetailRow label="Pengiriman"><CustomerStatusBadge status={order.shipping_status} /></CustomerDetailRow>
                            <CustomerDetailRow label="Dibuat Pada">{formatDateTime(order.created_at)}</CustomerDetailRow>
                            <CustomerDetailRow label="Total">{formatCurrency(order.total)}</CustomerDetailRow>
                        </div>
                    </CustomerCard>

                    <CustomerCard className="p-5">
                        <CustomerSectionHeader eyebrow="Alamat" title="Pengiriman" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CustomerDetailRow label="Nama Penerima">{order.customer_name}</CustomerDetailRow>
                            <CustomerDetailRow label="WhatsApp">{order.customer_whatsapp_number}</CustomerDetailRow>
                            <CustomerDetailRow label="Ongkir">{formatCurrency(order.shipping_cost)}</CustomerDetailRow>
                            <CustomerDetailRow label="Voucher">{voucher?.code ?? voucher?.name ?? '-'}</CustomerDetailRow>
                            <CustomerDetailRow className="sm:col-span-2" label="Alamat Pengiriman">{order.shipping_address}</CustomerDetailRow>
                        </div>
                    </CustomerCard>
                </div>

                <CustomerCard className="overflow-hidden">
                    <div className="border-b border-outline-variant/80 px-5 py-4">
                        <CustomerSectionHeader eyebrow="Item" title="Produk dalam Order" />
                    </div>
                    {items.length === 0 ? (
                        <div className="p-5">
                            <CustomerEmptyState description="Item order akan tampil saat data checkout tersedia." title="Belum ada item order." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-outline-variant/80">
                                <thead className="bg-surface-container-low">
                                    <tr>
                                        {['Produk', 'Jumlah', 'Harga', 'Subtotal'].map((heading) => (
                                            <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant" key={heading} scope="col">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/80 bg-white">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-4 font-body-sm text-sm font-bold text-on-surface">{itemName(item)}</td>
                                            <td className="px-4 py-4 font-body-sm text-sm text-on-surface-variant">{item.quantity ?? 0}</td>
                                            <td className="px-4 py-4 font-body-sm text-sm text-on-surface-variant">{formatCurrency(item.unit_price ?? item.price)}</td>
                                            <td className="px-4 py-4 font-body-sm text-sm font-extrabold text-primary-container">{formatCurrency(lineTotal(item))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CustomerCard>

                <CustomerCard className="p-5">
                    <CustomerSectionHeader eyebrow="Instruksi" title="Pembayaran & Pengiriman" />
                    <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/80 bg-surface-container-low px-4 py-3">
                                <div>
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/70">
                                        Status Pengiriman
                                    </p>
                                    <div className="mt-2">
                                        <CustomerStatusBadge status={order.shipping_status} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/70">
                                        Ongkir
                                    </p>
                                    <p className="mt-1 font-body-sm text-sm font-extrabold text-primary-container">
                                        {formatCurrency(order.shipping_cost)}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <CustomerDetailRow label="Kurir">{order.courier_name}</CustomerDetailRow>
                                <CustomerDetailRow label="Nomor Resi">{order.tracking_number}</CustomerDetailRow>
                                <CustomerDetailRow className="sm:col-span-2" label="Catatan Pengiriman">{order.shipping_notes}</CustomerDetailRow>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-2xl border border-primary-fixed-dim bg-primary-fixed/30 px-4 py-3">
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-primary-container/80">
                                    Metode Pembayaran
                                </p>
                                <p className="mt-1 font-body-sm text-base font-extrabold text-primary-container">
                                    {paymentMethodLabel(paymentMethod)}
                                </p>
                                {paymentMethod?.account_number && (
                                    <p className="mt-2 font-body-sm text-sm font-semibold text-on-surface">
                                        {paymentMethod.account_number}
                                    </p>
                                )}
                                {paymentMethod?.account_holder_name && (
                                    <p className="font-body-sm text-xs leading-5 text-on-surface-variant">
                                        a.n. {paymentMethod.account_holder_name}
                                    </p>
                                )}
                                {paymentMethod?.qris_image_path && (
                                    <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                                        QRIS tersedia pada instruksi pembayaran dari admin.
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <CustomerDetailRow label="Status Pembayaran"><CustomerStatusBadge status={order.payment_status} /></CustomerDetailRow>
                                <CustomerDetailRow label="Diterima Pada">{formatDateTime(order.payment_received_at)}</CustomerDetailRow>
                                <CustomerDetailRow className="sm:col-span-2" label="Instruksi Pembayaran">{paymentMethod?.instructions}</CustomerDetailRow>
                                <CustomerDetailRow className="sm:col-span-2" label="Catatan Pembayaran">{order.payment_notes}</CustomerDetailRow>
                                <CustomerDetailRow className="sm:col-span-2" label="Catatan Admin">{order.admin_notes}</CustomerDetailRow>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-primary-container/15 bg-white px-4 py-3 text-right">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/70">
                            Total Akhir yang Dibayar
                        </p>
                        <p className="mt-1 font-headline-lg text-2xl font-bold text-primary-container">
                            {formatCurrency(order.total)}
                        </p>
                    </div>
                </CustomerCard>

                <CustomerCard className="p-5">
                    <CustomerSectionHeader eyebrow="Pembayaran" title="Rincian Biaya" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <CustomerDetailRow label="Subtotal">{formatCurrency(order.subtotal)}</CustomerDetailRow>
                        <CustomerDetailRow label="Diskon Voucher">{formatCurrency(order.voucher_discount_amount)}</CustomerDetailRow>
                        <CustomerDetailRow label="Ongkir">{formatCurrency(order.shipping_cost)}</CustomerDetailRow>
                        <CustomerDetailRow label="Total">{formatCurrency(order.total)}</CustomerDetailRow>
                    </div>
                </CustomerCard>
            </div>
        </>
    );
}

CustomerOrderShow.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
