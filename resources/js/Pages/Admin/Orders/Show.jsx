import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

const shippingOptions = [
    'pending_shipping_confirmation',
    'shipping_cost_confirmed',
    'ready_to_ship',
    'shipped',
    'delivered',
    'cancelled',
];

const paymentOptions = ['pending', 'waiting_payment', 'paid', 'cancelled'];

const orderOptions = [
    'waiting_shipping_confirmation',
    'waiting_payment',
    'payment_received',
    'processing',
    'shipped',
    'completed',
    'cancelled',
];

const shippingStatusMap = {
    pending_shipping_confirmation: ['Menunggu Konfirmasi Ongkir', 'orange'],
    shipping_cost_confirmed: ['Ongkir Dikonfirmasi', 'blue'],
    ready_to_ship: ['Siap Dikirim', 'sage'],
    shipped: ['Dikirim', 'blue'],
    delivered: ['Terkirim', 'forest'],
    cancelled: ['Batal', 'red'],
};

function readableLabel(value) {
    return String(value ?? 'Tidak diketahui')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

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

function formatDateTimeInput(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toISOString().slice(0, 16);
}

function paymentMethodNama(method) {
    if (!method) {
        return '-';
    }

    return [method.type, method.bank_name, method.account_holder_name].filter(Boolean).join(' / ') || '-';
}

function customerName(order) {
    return order.customer_profile?.name ?? order.customer_name ?? order.user?.name ?? 'Customer';
}

function itemNama(item) {
    return item.product?.name ?? item.product_name ?? item.name ?? `Item #${item.id}`;
}

function lineTotal(item) {
    return item.line_total ?? item.total ?? Number(item.quantity ?? 0) * Number(item.unit_price ?? item.price ?? 0);
}

function shippingBadge(status) {
    const mapped = shippingStatusMap[status];

    if (!mapped) {
        return <StatusBadge status={status} />;
    }

    return <StatusBadge label={mapped[0]} tone={mapped[1]} />;
}

function PrimarySubmitButton({ children, disabled }) {
    return (
        <button
            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
}

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p>;
}

function TextField({ error, label, name, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                type={type}
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

function SelectField({ children, error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <select
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                value={value ?? ''}
            >
                {children}
            </select>
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <textarea
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                rows="4"
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

function DetailRow({ label, children }) {
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

function SectionHeader({ eyebrow, title, description }) {
    return (
        <div className="mb-4">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                {eyebrow}
            </p>
            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                {title}
            </h2>
            {description && (
                <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}

function AdminOrderShow({ order, paymentMethods = [] }) {
    const orderItem = order.order_items ?? [];
    const voucher = order.voucher_redemption?.voucher ?? order.voucher;
    const title = order.order_number ?? `Order #${order.id}`;
    const shippingForm = useForm({
        courier_name: order.courier_name ?? '',
        tracking_number: order.tracking_number ?? '',
        shipping_cost: order.shipping_cost ?? '',
        shipping_status: order.shipping_status ?? 'pending_shipping_confirmation',
        shipping_notes: order.shipping_notes ?? '',
    });
    const paymentForm = useForm({
        payment_method_id: order.payment_method_id ?? order.payment_method?.id ?? '',
        payment_status: order.payment_status ?? 'pending',
        payment_received_at: formatDateTimeInput(order.payment_received_at),
        payment_notes: order.payment_notes ?? '',
    });
    const statusForm = useForm({
        status: order.status ?? 'waiting_shipping_confirmation',
        admin_notes: order.admin_notes ?? '',
    });

    function submitShipping(event) {
        event.preventDefault();
        shippingForm.patch(route('admin.orders.shipping.update', order.id), { preserveScroll: true });
    }

    function submitPayment(event) {
        event.preventDefault();
        paymentForm.patch(route('admin.orders.payment.update', order.id), { preserveScroll: true });
    }

    function submitStatus(event) {
        event.preventDefault();
        statusForm.patch(route('admin.orders.status.update', order.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Admin ${title}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.orders.index')}
                        >
                            Kembali ke Order
                        </Link>
                    )}
                    description="Kelola status order, pengiriman, dan pembayaran berdasarkan data checkout customer."
                    eyebrow="Commerce / Order"
                    title={title}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Order" title="Ringkasan Order" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nomor Order">{title}</DetailRow>
                            <DetailRow label="Status Order"><StatusBadge status={order.status} /></DetailRow>
                            <DetailRow label="Subtotal">{formatCurrency(order.subtotal)}</DetailRow>
                            <DetailRow label="Voucher Diskon">{formatCurrency(order.voucher_discount_amount)}</DetailRow>
                            <DetailRow label="Ongkir">{formatCurrency(order.shipping_cost)}</DetailRow>
                            <DetailRow label="Total">{formatCurrency(order.total)}</DetailRow>
                            <DetailRow label="Stok Dikurangi Pada">{formatDateTime(order.stock_decremented_at)}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Catatan Admin">{order.admin_notes || '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Customer" title="Customer" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Customer">{customerName(order)}</DetailRow>
                            <DetailRow label="WhatsApp">{order.customer_profile?.whatsapp_number ?? order.customer_whatsapp_number ?? '-'}</DetailRow>
                            <DetailRow label="Email User">{order.user?.email ?? '-'}</DetailRow>
                            <DetailRow label="Status Member">{order.customer_profile?.member_status ?? order.member_status ?? '-'}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Alamat Pengiriman">{order.shipping_address ?? '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <SectionHeader eyebrow="Item" title="Order Item" />
                    </div>
                    {orderItem.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Item order akan tampil ketika data checkout tersedia."
                                title="Belum ada item order."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Produk / Item', 'Jumlah', 'Unit Harga', 'Total Baris'].map((heading) => (
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
                                    {orderItem.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {itemNama(item)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {item.quantity ?? item.qty ?? 0}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatCurrency(item.unit_price ?? item.price)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(lineTotal(item))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Voucher" title="Voucher / Penukaran" />
                        {voucher ? (
                            <div className="space-y-3">
                                <DetailRow label="Voucher">{voucher.name ?? voucher.code ?? `Voucher #${voucher.id}`}</DetailRow>
                                <DetailRow label="Kode">{voucher.code ?? '-'}</DetailRow>
                                <DetailRow label="Diskon">{formatCurrency(order.voucher_discount_amount)}</DetailRow>
                            </div>
                        ) : (
                            <EmptyState
                                description="Order ini tidak memakai voucher atau redemption."
                                title="Tidak ada voucher."
                            />
                        )}
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Shipping" title="Shipping Current Info" />
                        <div className="space-y-3">
                            <DetailRow label="Status">{shippingBadge(order.shipping_status)}</DetailRow>
                            <DetailRow label="Courier">{order.courier_name ?? '-'}</DetailRow>
                            <DetailRow label="Tracking Number">{order.tracking_number ?? '-'}</DetailRow>
                            <DetailRow label="Catatan">{order.shipping_notes ?? '-'}</DetailRow>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Payment" title="Payment Current Info" />
                        <div className="space-y-3">
                            <DetailRow label="Status"><StatusBadge status={order.payment_status} /></DetailRow>
                            <DetailRow label="Method">{paymentMethodNama(order.payment_method)}</DetailRow>
                            <DetailRow label="Received At">{formatDateTime(order.payment_received_at)}</DetailRow>
                            <DetailRow label="Catatan">{order.payment_notes ?? '-'}</DetailRow>
                        </div>
                    </AdminCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Shipping" title="Perbarui Shipping" />
                        <form className="space-y-4" onSubmit={submitShipping}>
                            <SelectField
                                error={shippingForm.errors.shipping_status}
                                label="Shipping Status"
                                name="shipping_status"
                                onChange={(event) => shippingForm.setData('shipping_status', event.target.value)}
                                value={shippingForm.data.shipping_status}
                            >
                                {shippingOptions.map((option) => (
                                    <option key={option} value={option}>{readableLabel(option)}</option>
                                ))}
                            </SelectField>
                            <TextField error={shippingForm.errors.courier_name} label="Courier Nama" name="courier_name" onChange={(event) => shippingForm.setData('courier_name', event.target.value)} value={shippingForm.data.courier_name} />
                            <TextField error={shippingForm.errors.tracking_number} label="Tracking Number" name="tracking_number" onChange={(event) => shippingForm.setData('tracking_number', event.target.value)} value={shippingForm.data.tracking_number} />
                            <TextField error={shippingForm.errors.shipping_cost} label="Ongkir" name="shipping_cost" onChange={(event) => shippingForm.setData('shipping_cost', event.target.value)} type="number" value={shippingForm.data.shipping_cost} />
                            <TextAreaField error={shippingForm.errors.shipping_notes} label="Shipping Catatan" name="shipping_notes" onChange={(event) => shippingForm.setData('shipping_notes', event.target.value)} value={shippingForm.data.shipping_notes} />
                            <PrimarySubmitButton disabled={shippingForm.processing}>Simpan Shipping</PrimarySubmitButton>
                        </form>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Payment" title="Perbarui Payment" />
                        <form className="space-y-4" onSubmit={submitPayment}>
                            <SelectField error={paymentForm.errors.payment_status} label="Payment Status" name="payment_status" onChange={(event) => paymentForm.setData('payment_status', event.target.value)} value={paymentForm.data.payment_status}>
                                {paymentOptions.map((option) => (
                                    <option key={option} value={option}>{readableLabel(option)}</option>
                                ))}
                            </SelectField>
                            <SelectField error={paymentForm.errors.payment_method_id} label="Metode Pembayaran" name="payment_method_id" onChange={(event) => paymentForm.setData('payment_method_id', event.target.value)} value={paymentForm.data.payment_method_id}>
                                <option value="">Pilih payment method</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.id} value={method.id}>{paymentMethodNama(method)}</option>
                                ))}
                            </SelectField>
                            <TextField error={paymentForm.errors.payment_received_at} label="Payment Received At" name="payment_received_at" onChange={(event) => paymentForm.setData('payment_received_at', event.target.value)} type="datetime-local" value={paymentForm.data.payment_received_at} />
                            <TextAreaField error={paymentForm.errors.payment_notes} label="Payment Catatan" name="payment_notes" onChange={(event) => paymentForm.setData('payment_notes', event.target.value)} value={paymentForm.data.payment_notes} />
                            <PrimarySubmitButton disabled={paymentForm.processing}>Simpan Payment</PrimarySubmitButton>
                        </form>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Order" title="Perbarui Status Order" />
                        <div className="mb-4 rounded-2xl border border-[#F08A2B]/20 bg-[#F08A2B]/10 px-4 py-3">
                            <p className="font-body-sm text-xs leading-5 text-[#B57A2E]">
                                Setting status ke processing akan mengurangi stok satu kali. Kembaliend akan menolak jika stok tidak cukup.
                                {order.stock_decremented_at && ` Stok sudah dikurangi pada ${formatDateTime(order.stock_decremented_at)}.`}
                            </p>
                        </div>
                        <form className="space-y-4" onSubmit={submitStatus}>
                            <SelectField error={statusForm.errors.status} label="Status Order" name="status" onChange={(event) => statusForm.setData('status', event.target.value)} value={statusForm.data.status}>
                                {orderOptions.map((option) => (
                                    <option key={option} value={option}>{readableLabel(option)}</option>
                                ))}
                            </SelectField>
                            <TextAreaField error={statusForm.errors.admin_notes} label="Catatan Admin" name="admin_notes" onChange={(event) => statusForm.setData('admin_notes', event.target.value)} value={statusForm.data.admin_notes} />
                            <PrimarySubmitButton disabled={statusForm.processing}>Simpan Status</PrimarySubmitButton>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOrderShow;
