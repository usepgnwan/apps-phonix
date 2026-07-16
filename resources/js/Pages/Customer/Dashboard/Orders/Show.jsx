import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ReceiptText } from 'lucide-react';

import CustomerEmptyState from '@/Components/Customer/CustomerEmptyState';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import { DetailRow } from '@/Components/Panel/FormFields';
import PanelCard from '@/Components/Panel/PanelCard';
import StatusBadge from '@/Components/Panel/StatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency, formatDateTime } from '@/utils/format';

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
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                className="inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] bg-white px-4 py-2 text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('customer.dashboard.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <a
                                href={route('customer.dashboard.orders.invoice', order.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#163B2C]"
                            >
                                <ReceiptText aria-hidden="true" className="h-4 w-4" />
                                Download Invoice
                            </a>
                        </div>
                    )}
                    description="Detail order produk Phoenix Anda, termasuk status pembayaran, pengiriman, dan item yang dipesan."
                    eyebrow="Detail Order"
                    icon={ReceiptText}
                    title={title}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <PanelCard className="p-5">
                        <CustomerSectionHeader eyebrow="Ringkasan" title="Status Order" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nomor Order">{title}</DetailRow>
                            <DetailRow label="Status Order"><StatusBadge status={order.status} /></DetailRow>
                            <DetailRow label="Pembayaran"><StatusBadge status={order.payment_status} /></DetailRow>
                            <DetailRow label="Pengiriman"><StatusBadge status={order.shipping_status} /></DetailRow>
                            <DetailRow label="Dibuat Pada">{formatDateTime(order.created_at)}</DetailRow>
                            <DetailRow label="Total">{formatCurrency(order.total)}</DetailRow>
                        </div>
                    </PanelCard>

                    <PanelCard className="p-5">
                        <CustomerSectionHeader eyebrow="Alamat" title="Pengiriman" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Penerima">{order.customer_name}</DetailRow>
                            <DetailRow label="WhatsApp">{order.customer_whatsapp_number}</DetailRow>
                            <DetailRow label="Ongkir">{formatCurrency(order.shipping_cost)}</DetailRow>
                            <DetailRow label="Voucher">{voucher?.code ?? voucher?.name ?? '-'}</DetailRow>
                            <DetailRow className="sm:col-span-2" label="Alamat Pengiriman">{order.shipping_address}</DetailRow>
                        </div>
                    </PanelCard>
                </div>

                <PanelCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <CustomerSectionHeader eyebrow="Item" title="Produk dalam Order" />
                    </div>
                    {items.length === 0 ? (
                        <div className="p-5">
                            <CustomerEmptyState description="Item order akan tampil saat data checkout tersedia." title="Belum ada item order." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Produk', 'Jumlah', 'Harga', 'Subtotal'].map((heading) => (
                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading} scope="col">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-4 text-sm font-bold text-[#333333]">{itemName(item)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{item.quantity ?? 0}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(item.unit_price ?? item.price)}</td>
                                            <td className="px-4 py-4 text-sm font-extrabold text-[#1E4D3A]">{formatCurrency(lineTotal(item))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </PanelCard>

                <PanelCard className="p-5">
                    <CustomerSectionHeader eyebrow="Instruksi" title="Pembayaran & Pengiriman" />
                    <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Status Pengiriman
                                    </p>
                                    <div className="mt-2">
                                        <StatusBadge status={order.shipping_status} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Ongkir
                                    </p>
                                    <p className="mt-1 text-sm font-extrabold text-[#1E4D3A]">
                                        {formatCurrency(order.shipping_cost)}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DetailRow label="Kurir">{order.courier_name}</DetailRow>
                                <DetailRow label="Nomor Resi">{order.tracking_number}</DetailRow>
                                <DetailRow className="sm:col-span-2" label="Catatan Pengiriman">{order.shipping_notes}</DetailRow>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-2xl border border-[#A8C5B3] bg-[#A8C5B3]/20 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]/80">
                                    Metode Pembayaran
                                </p>
                                <p className="mt-1 text-base font-extrabold text-[#1E4D3A]">
                                    {paymentMethodLabel(paymentMethod)}
                                </p>
                                {paymentMethod?.account_number && (
                                    <p className="mt-2 text-sm font-semibold text-[#333333]">
                                        {paymentMethod.account_number}
                                    </p>
                                )}
                                {paymentMethod?.account_holder_name && (
                                    <p className="text-xs leading-5 text-gray-500">
                                        a.n. {paymentMethod.account_holder_name}
                                    </p>
                                )}
                                {paymentMethod?.qris_image_path && (
                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        QRIS tersedia pada instruksi pembayaran dari admin.
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DetailRow label="Status Pembayaran"><StatusBadge status={order.payment_status} /></DetailRow>
                                <DetailRow label="Diterima Pada">{formatDateTime(order.payment_received_at)}</DetailRow>
                                <DetailRow className="sm:col-span-2" label="Instruksi Pembayaran">{paymentMethod?.instructions}</DetailRow>
                                <DetailRow className="sm:col-span-2" label="Catatan Pembayaran">{order.payment_notes}</DetailRow>
                                <DetailRow className="sm:col-span-2" label="Catatan Admin">{order.admin_notes}</DetailRow>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-[#1E4D3A]/15 bg-white px-4 py-3 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                            Total Akhir yang Dibayar
                        </p>
                        <p className="mt-1 text-2xl font-bold text-[#1E4D3A]">
                            {formatCurrency(order.total)}
                        </p>
                    </div>
                </PanelCard>

                <PanelCard className="p-5">
                    <CustomerSectionHeader eyebrow="Pembayaran" title="Rincian Biaya" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <DetailRow label="Subtotal">{formatCurrency(order.subtotal)}</DetailRow>
                        <DetailRow label="Diskon Voucher">{formatCurrency(order.voucher_discount_amount)}</DetailRow>
                        <DetailRow label="Ongkir">{formatCurrency(order.shipping_cost)}</DetailRow>
                        <DetailRow label="Total">{formatCurrency(order.total)}</DetailRow>
                    </div>
                </PanelCard>
            </div>
        </>
    );
}

CustomerOrderShow.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
