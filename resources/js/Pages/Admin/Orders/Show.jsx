import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    FileText,
    MapPin,
    MessageCircle,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency, formatDateTime, formatDateTimeInput } from '@/utils/format';
import { DetailRow, SelectField, TextAreaField, TextField } from '@/Components/Admin/FormFields';

const paymentNextOptions = {
    waiting_payment: ['paid', 'cancelled'],
};

const orderNextOptions = {
    payment_received: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['completed'],
};

const statusLabelMap = {
    pending: 'Pending',
    waiting_shipping_confirmation: 'Menunggu Ongkir',
    shipping_cost_confirmed: 'Ongkir Dikonfirmasi',
    ready_to_ship: 'Siap Dikirim',
    waiting_payment: 'Menunggu Bayar',
    payment_received: 'Pembayaran Diterima',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Terkirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    paid: 'Lunas',
    pending_shipping_confirmation: 'Menunggu Konfirmasi Ongkir',
};

const shippingStatusMap = {
    pending_shipping_confirmation: ['Menunggu Konfirmasi Ongkir', 'orange'],
    shipping_cost_confirmed: ['Ongkir Dikonfirmasi', 'blue'],
    ready_to_ship: ['Siap Dikirim', 'sage'],
    shipped: ['Dikirim', 'blue'],
    delivered: ['Terkirim', 'forest'],
    cancelled: ['Dibatalkan', 'red'],
};

const actionLabelMap = {
    shipping_cost_confirmed: 'Konfirmasi Ongkir',
    ready_to_ship: 'Tandai Siap Dikirim',
    paid: 'Tandai Lunas',
    cancelled: 'Batalkan',
    processing: 'Proses Order',
    shipped: 'Tandai Dikirim',
    completed: 'Selesaikan Order',
};

function statusLabel(value) {
    if (!value) {
        return '-';
    }

    return statusLabelMap[value] ?? String(value).replaceAll('_', ' ');
}

function actionLabel(value) {
    return actionLabelMap[value] ?? statusLabel(value);
}

function paymentMethodNama(method) {
    if (!method) {
        return '-';
    }

    return [method.type, method.bank_name].filter(Boolean).join(' / ') || '-';
}

function uniqueOptions(options) {
    return [...new Set(options.filter(Boolean))];
}

function shippingSelectOptions(order) {
    if (order.shipping_status === 'pending_shipping_confirmation') {
        return ['shipping_cost_confirmed'];
    }

    if (order.shipping_status === 'shipping_cost_confirmed' && order.payment_status === 'paid') {
        return ['ready_to_ship'];
    }

    return [];
}

function paymentSelectOptions(order) {
    return uniqueOptions(paymentNextOptions[order.payment_status] ?? []);
}

function orderStatusSelectOptions(order) {
    if (order.shipping_status !== 'ready_to_ship') {
        return [];
    }

    return uniqueOptions(orderNextOptions[order.status] ?? []);
}

function customerName(order) {
    return order.customer_profile?.name ?? order.customer_name ?? order.user?.name ?? 'Customer';
}

function customerWhatsappNumber(order) {
    return order.customer_profile?.whatsapp_number ?? order.customer_whatsapp_number ?? null;
}

function normalizeWhatsappDigits(value) {
    if (!value) {
        return null;
    }

    let digits = String(value).replace(/\D+/g, '');

    if (!digits) {
        return null;
    }

    if (digits.startsWith('0')) {
        digits = `62${digits.slice(1)}`;
    } else if (!digits.startsWith('62')) {
        digits = `62${digits}`;
    }

    return digits;
}

function customerWhatsappUrl(order) {
    const digits = normalizeWhatsappDigits(customerWhatsappNumber(order));

    if (!digits) {
        return null;
    }

    const name = customerName(order);
    const orderNumber = order.order_number ?? `Order #${order.id}`;
    const message = `Halo ${name}, terkait pesanan ${orderNumber} di Phoenix.`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
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

function qrisImageUrl(path) {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `/storage/${String(path).replace(/^\/+/, '')}`;
}

function nextStepHint(order) {
    if (order.status === 'cancelled' || order.shipping_status === 'cancelled') {
        return 'Order ini sudah dibatalkan. Tidak ada aksi lanjutan.';
    }

    if (order.status === 'completed') {
        return 'Order sudah selesai. Tidak ada aksi lanjutan.';
    }

    if (
        order.shipping_status === 'pending_shipping_confirmation'
        || order.status === 'pending'
        || order.status === 'waiting_shipping_confirmation'
    ) {
        return 'Langkah berikutnya: konfirmasi ongkir agar customer bisa membayar.';
    }

    if (order.payment_status === 'waiting_payment' || order.status === 'waiting_payment') {
        return 'Langkah berikutnya: verifikasi pembayaran setelah customer transfer. Stok akan dikurangi saat ditandai lunas.';
    }

    if (order.payment_status === 'paid' && order.shipping_status === 'shipping_cost_confirmed') {
        return 'Langkah berikutnya: tandai siap dikirim (isi kurir/resi bila perlu).';
    }

    if (order.shipping_status === 'ready_to_ship' && order.status === 'payment_received') {
        return 'Langkah berikutnya: proses order untuk fulfillment.';
    }

    if (order.status === 'processing') {
        return 'Langkah berikutnya: tandai dikirim setelah paket diserahkan ke kurir.';
    }

    if (order.status === 'shipped') {
        return 'Langkah berikutnya: selesaikan order setelah customer menerima paket.';
    }

    return 'Pantau status order dan lengkapi aksi yang tersedia.';
}

function PrimarySubmitButton({ children, disabled }) {
    return (
        <button
            className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
}

function SectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className={`mb-4 ${action ? 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between' : ''}`}>
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

function StatusPill({ label, children }) {
    return (
        <div className="inline-flex flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {label}
            </span>
            <div>{children}</div>
        </div>
    );
}

function AdminOrderShow({ order }) {
    const orderItem = order.order_items ?? [];
    const voucher = order.voucher_redemption?.voucher ?? order.voucher;
    const title = order.order_number ?? `Order #${order.id}`;
    const { props } = usePage();
    const whatsappUrl = props?.flash?.whatsappUrl;
    const chatUrl = useMemo(() => customerWhatsappUrl(order), [order]);
    const qrisUrl = qrisImageUrl(order.payment_method?.qris_image_path);

    useEffect(() => {
        if (!whatsappUrl) {
            return;
        }

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, [whatsappUrl]);

    const shippingForm = useForm({
        courier_name: order.courier_name ?? '',
        tracking_number: order.tracking_number ?? '',
        shipping_cost: order.shipping_cost ?? '',
        shipping_status: '',
        shipping_notes: order.shipping_notes ?? '',
    });
    const paymentForm = useForm({
        payment_status: '',
        payment_received_at: formatDateTimeInput(order.payment_received_at) || formatDateTimeInput(new Date()),
        payment_notes: order.payment_notes ?? '',
    });
    const statusForm = useForm({
        status: '',
        admin_notes: order.admin_notes ?? '',
    });

    const shippingOptions = shippingSelectOptions(order);
    const paymentOptions = paymentSelectOptions(order);
    const orderOptions = orderStatusSelectOptions(order);
    const isPaymentPaid = order.payment_status === 'paid';
    const canUpdateShipping = shippingOptions.length > 0;
    const canUpdatePayment = paymentOptions.length > 0;
    const canUpdateOrderStatus = orderOptions.length > 0;
    const paymentMayDecrementStock = canUpdatePayment && paymentOptions.includes('paid');
    const hasAvailableActions = canUpdateShipping || canUpdatePayment || canUpdateOrderStatus;
    const stepHint = nextStepHint(order);

    const primaryAction = useMemo(() => {
        if (canUpdateShipping) {
            return { href: '#aksi-admin', label: actionLabel(shippingOptions[0]) };
        }

        if (canUpdatePayment) {
            return { href: '#aksi-admin', label: actionLabel(paymentOptions[0]) };
        }

        if (canUpdateOrderStatus) {
            return { href: '#aksi-admin', label: actionLabel(orderOptions[0]) };
        }

        return null;
    }, [canUpdateShipping, canUpdatePayment, canUpdateOrderStatus, shippingOptions, paymentOptions, orderOptions]);

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

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
                            {primaryAction ? (
                                <a
                                    className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                    href={primaryAction.href}
                                >
                                    {primaryAction.label}
                                </a>
                            ) : null}
                            {chatUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 font-body-sm text-sm font-bold text-[#128C7E] transition hover:bg-[#25D366]/20"
                                    href={chatUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageCircle aria-hidden="true" className="h-4 w-4" />
                                    WhatsApp
                                </a>
                            ) : null}
                            <a
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.orders.invoice', order.id)}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <FileText aria-hidden="true" className="h-4 w-4" />
                                Invoice PDF
                            </a>
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-body-sm text-sm font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                href={route('admin.orders.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Kelola status order, pengiriman, dan pembayaran berdasarkan data checkout customer."
                    eyebrow="Commerce / Order"
                    title={title}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Status Order">
                        <StatusBadge status={order.status} />
                    </StatusPill>
                    <StatusPill label="Pembayaran">
                        <StatusBadge status={order.payment_status} />
                    </StatusPill>
                    <StatusPill label="Pengiriman">
                        {shippingBadge(order.shipping_status)}
                    </StatusPill>
                    <StatusPill label="Total">
                        <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                            {formatCurrency(order.total)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Cabang">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                            {order.branch?.name ?? 'Tanpa cabang'}
                        </span>
                    </StatusPill>
                </div>

                <div className="rounded-2xl border border-[#A8C5B3]/50 bg-[#A8C5B3]/15 px-4 py-3">
                    <p className="font-body-sm text-sm font-medium text-[#1E4D3A]">
                        {stepHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5 xl:col-span-1">
                        <SectionHeader
                            action={chatUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 font-body-sm text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366]/20"
                                    href={chatUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                                    Chat
                                </a>
                            ) : null}
                            eyebrow="Customer"
                            title="Data Customer"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{customerName(order)}</DetailRow>
                            <DetailRow label="WhatsApp">{customerWhatsappNumber(order) || '-'}</DetailRow>
                            <DetailRow label="Email">{order.user?.email ?? order.customer_email ?? '-'}</DetailRow>
                            <DetailRow label="Status Member">{order.customer_profile?.member_status ?? order.member_status ?? '-'}</DetailRow>
                            <DetailRow label="Staf Referal Profil">
                                {order.user?.referred_by_staff
                                    ? `${order.user.referred_by_staff.name}${order.user.referred_by_staff.staff_code ? ` (${order.user.referred_by_staff.staff_code})` : ''}`
                                    : '-'}
                            </DetailRow>
                            <DetailRow label="Staf Referal Transaksi">
                                {order.referred_by_staff
                                    ? `${order.referred_by_staff.name}${order.referred_by_staff.staff_code ? ` (${order.referred_by_staff.staff_code})` : ''}`
                                    : '-'}
                            </DetailRow>
                            <div className="col-span-1">
                                <DetailRow label="Alamat Pengiriman">{order.shipping_address ?? order.customer_profile?.primary_address ?? '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5 xl:col-span-1">
                        <SectionHeader eyebrow="Order" title="Ringkasan Biaya" />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nomor Order">{title}</DetailRow>
                            <DetailRow label="Subtotal">{formatCurrency(order.subtotal)}</DetailRow>
                            <DetailRow label="Diskon Voucher">{formatCurrency(order.voucher_discount_amount)}</DetailRow>
                            <DetailRow label="Ongkir">{formatCurrency(order.shipping_cost)}</DetailRow>
                            <DetailRow label="Total">
                                <span className="font-extrabold text-[#1E4D3A]">{formatCurrency(order.total)}</span>
                            </DetailRow>
                            <DetailRow label="Stok Dikurangi">{formatDateTime(order.stock_decremented_at)}</DetailRow>
                            <div className="col-span-1">
                                <DetailRow label="Catatan Admin">{order.admin_notes || '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <div className="space-y-6 scroll-mt-24 xl:col-span-1" id="aksi-admin">
                        {canUpdateShipping ? (
                            <AdminCard className="border-[#1E4D3A]/15 p-5 shadow-sm shadow-[#1E4D3A]/5">
                                <SectionHeader
                                    description="Isi ongkir dan status pengiriman sesuai tahap order."
                                    eyebrow="Aksi"
                                    title="Perbarui Pengiriman"
                                />
                                <form className="space-y-4" onSubmit={submitShipping}>
                                    <SelectField
                                        error={shippingForm.errors.shipping_status}
                                        label="Aksi Pengiriman"
                                        name="shipping_status"
                                        onChange={(event) => {
                                            const nextStatus = event.target.value;

                                            shippingForm.setData((currentData) => ({
                                                ...currentData,
                                                shipping_status: nextStatus,
                                                tracking_number: nextStatus === 'ready_to_ship' ? currentData.tracking_number : '',
                                            }));
                                        }}
                                        value={shippingForm.data.shipping_status}
                                    >
                                        <option value="">Pilih aksi pengiriman</option>
                                        {shippingOptions.map((option) => (
                                            <option key={option} value={option}>{actionLabel(option)}</option>
                                        ))}
                                    </SelectField>
                                    <TextField
                                        disabled={isPaymentPaid}
                                        error={shippingForm.errors.courier_name}
                                        label="Nama Kurir"
                                        name="courier_name"
                                        onChange={(event) => shippingForm.setData('courier_name', event.target.value)}
                                        value={shippingForm.data.courier_name}
                                    />
                                    {shippingForm.data.shipping_status === 'ready_to_ship' ? (
                                        <TextField
                                            error={shippingForm.errors.tracking_number}
                                            label="Nomor Resi"
                                            name="tracking_number"
                                            onChange={(event) => shippingForm.setData('tracking_number', event.target.value)}
                                            value={shippingForm.data.tracking_number}
                                        />
                                    ) : null}
                                    <TextField
                                        disabled={isPaymentPaid}
                                        error={shippingForm.errors.shipping_cost}
                                        label="Ongkir"
                                        name="shipping_cost"
                                        onChange={(event) => shippingForm.setData('shipping_cost', event.target.value)}
                                        type="number"
                                        value={shippingForm.data.shipping_cost}
                                    />
                                    <TextAreaField
                                        error={shippingForm.errors.shipping_notes}
                                        label="Catatan Pengiriman"
                                        name="shipping_notes"
                                        onChange={(event) => shippingForm.setData('shipping_notes', event.target.value)}
                                        value={shippingForm.data.shipping_notes}
                                    />
                                    <PrimarySubmitButton disabled={shippingForm.processing || !shippingForm.data.shipping_status}>
                                        Simpan Pengiriman
                                    </PrimarySubmitButton>
                                </form>
                            </AdminCard>
                        ) : null}

                        {canUpdatePayment ? (
                            <AdminCard className="border-[#1E4D3A]/15 p-5 shadow-sm shadow-[#1E4D3A]/5">
                                <SectionHeader
                                    description="Tandai pembayaran setelah transfer customer terverifikasi."
                                    eyebrow="Aksi"
                                    title="Perbarui Pembayaran"
                                />
                                {paymentMayDecrementStock ? (
                                    <div className="mb-4 rounded-2xl border border-[#F08A2B]/20 bg-[#F08A2B]/10 px-4 py-3">
                                        <p className="font-body-sm text-xs leading-5 text-[#B57A2E]">
                                            Menandai lunas akan mengurangi stok cabang satu kali. Sistem menolak jika stok tidak cukup.
                                            {order.stock_decremented_at
                                                ? ` Stok sudah dikurangi pada ${formatDateTime(order.stock_decremented_at)}.`
                                                : ''}
                                        </p>
                                    </div>
                                ) : null}
                                <form className="space-y-4" onSubmit={submitPayment}>
                                    <SelectField
                                        error={paymentForm.errors.payment_status}
                                        label="Aksi Pembayaran"
                                        name="payment_status"
                                        onChange={(event) => paymentForm.setData('payment_status', event.target.value)}
                                        value={paymentForm.data.payment_status}
                                    >
                                        <option value="">Pilih aksi pembayaran</option>
                                        {paymentOptions.map((option) => (
                                            <option key={option} value={option}>{actionLabel(option)}</option>
                                        ))}
                                    </SelectField>
                                    <TextField
                                        error={paymentForm.errors.payment_received_at}
                                        label="Waktu Pembayaran Diterima"
                                        name="payment_received_at"
                                        onChange={(event) => paymentForm.setData('payment_received_at', event.target.value)}
                                        type="datetime-local"
                                        value={paymentForm.data.payment_received_at}
                                    />
                                    <TextAreaField
                                        error={paymentForm.errors.payment_notes}
                                        label="Catatan Pembayaran"
                                        name="payment_notes"
                                        onChange={(event) => paymentForm.setData('payment_notes', event.target.value)}
                                        value={paymentForm.data.payment_notes}
                                    />
                                    <PrimarySubmitButton disabled={paymentForm.processing || !paymentForm.data.payment_status}>
                                        Simpan Pembayaran
                                    </PrimarySubmitButton>
                                </form>
                            </AdminCard>
                        ) : null}

                        {canUpdateOrderStatus ? (
                            <AdminCard className="border-[#1E4D3A]/15 p-5 shadow-sm shadow-[#1E4D3A]/5">
                                <SectionHeader
                                    description="Ubah status fulfillment setelah pengiriman siap."
                                    eyebrow="Aksi"
                                    title="Perbarui Status Order"
                                />
                                <form className="space-y-4" onSubmit={submitStatus}>
                                    <SelectField
                                        error={statusForm.errors.status}
                                        label="Status Order"
                                        name="status"
                                        onChange={(event) => statusForm.setData('status', event.target.value)}
                                        value={statusForm.data.status}
                                    >
                                        <option value="">Pilih aksi order</option>
                                        {orderOptions.map((option) => (
                                            <option key={option} value={option}>{actionLabel(option)}</option>
                                        ))}
                                    </SelectField>
                                    <TextAreaField
                                        error={statusForm.errors.admin_notes}
                                        label="Catatan Admin"
                                        name="admin_notes"
                                        onChange={(event) => statusForm.setData('admin_notes', event.target.value)}
                                        value={statusForm.data.admin_notes}
                                    />
                                    <PrimarySubmitButton disabled={statusForm.processing || !statusForm.data.status}>
                                        Simpan Status
                                    </PrimarySubmitButton>
                                </form>
                            </AdminCard>
                        ) : null}

                        {!hasAvailableActions ? (
                            <AdminCard className="p-5">
                                <EmptyState
                                    description="Status order saat ini tidak membutuhkan update admin."
                                    title="Tidak ada aksi."
                                />
                            </AdminCard>
                        ) : null}
                    </div>
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <SectionHeader eyebrow="Item" title="Barang Order" />
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
                                        {['Produk', 'Jumlah', 'Harga Satuan', 'Subtotal'].map((heading) => (
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
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={item.id}>
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
                        <SectionHeader eyebrow="Voucher" title="Voucher" />
                        {voucher ? (
                            <div className="space-y-3">
                                <DetailRow label="Nama">{voucher.name ?? voucher.code ?? `Voucher #${voucher.id}`}</DetailRow>
                                <DetailRow label="Kode">
                                    <span className="font-bold uppercase text-[#1E4D3A]">{voucher.code ?? '-'}</span>
                                </DetailRow>
                                <DetailRow label="Diskon">{formatCurrency(order.voucher_discount_amount)}</DetailRow>
                            </div>
                        ) : (
                            <EmptyState
                                description="Order ini tidak memakai voucher."
                                title="Tidak ada voucher."
                            />
                        )}
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Pengiriman" title="Info Pengiriman" />
                        <div className="space-y-3">
                            <DetailRow label="Status">{shippingBadge(order.shipping_status)}</DetailRow>
                            <DetailRow label="Kurir">{order.courier_name ?? '-'}</DetailRow>
                            <DetailRow label="Nomor Resi">{order.tracking_number ?? '-'}</DetailRow>
                            <DetailRow label="Catatan">{order.shipping_notes ?? '-'}</DetailRow>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Pembayaran" title="Info Pembayaran" />
                        <div className="space-y-3">
                            <DetailRow label="Status"><StatusBadge status={order.payment_status} /></DetailRow>
                            <DetailRow label="Metode">{paymentMethodNama(order.payment_method)}</DetailRow>
                            <DetailRow label="No. Rekening">{order.payment_method?.account_number ?? '-'}</DetailRow>
                            <DetailRow label="Atas Nama">{order.payment_method?.account_holder_name ?? '-'}</DetailRow>
                            {qrisUrl ? (
                                <div>
                                    <p className="mb-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                        QRIS
                                    </p>
                                    <img
                                        alt="QRIS pembayaran"
                                        className="max-h-48 rounded-xl border border-[#E5E7EB] bg-white object-contain p-2"
                                        src={qrisUrl}
                                    />
                                </div>
                            ) : null}
                            {order.payment_method?.instructions ? (
                                <DetailRow label="Instruksi">{order.payment_method.instructions}</DetailRow>
                            ) : null}
                            <DetailRow label="Diterima Pada">{formatDateTime(order.payment_received_at)}</DetailRow>
                            <DetailRow label="Catatan">{order.payment_notes ?? '-'}</DetailRow>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOrderShow;
