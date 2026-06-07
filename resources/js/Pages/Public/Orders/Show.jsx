import { Head } from '@inertiajs/react';

import { formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

const statusLabels = {
    cancelled: 'Dibatalkan',
    completed: 'Selesai',
    delivered: 'Terkirim',
    paid: 'Pembayaran Diterima',
    payment_received: 'Pembayaran Diterima',
    pending: 'Menunggu',
    pending_shipping_confirmation: 'Menunggu Konfirmasi Ongkir',
    processing: 'Diproses',
    ready_to_ship: 'Siap Dikirim',
    shipped: 'Dikirim',
    shipping_cost_confirmed: 'Ongkir Dikonfirmasi',
    waiting_payment: 'Menunggu Pembayaran',
    waiting_shipping_confirmation: 'Menunggu Konfirmasi Ongkir',
};

function statusLabel(status) {
    return statusLabels[status] ?? status;
}

function formatDate(value) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function StatusPill({ label, value }) {
    return (
        <div className="rounded-3xl border border-outline-variant bg-white p-4">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
            <p className="mt-2 font-body-sm text-sm font-extrabold text-primary-container">{statusLabel(value)}</p>
        </div>
    );
}

function displayShippingStatus(order) {
    if (order.shipping_status === 'shipping_cost_confirmed' && (order.payment_status === 'paid' || order.status === 'payment_received')) {
        return 'processing';
    }

    return order.shipping_status;
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

function orderGuidance(order) {
    if (order.payment_status === 'paid' || order.status === 'payment_received') {
        return 'Pembayaran sudah diterima. Pesanan Anda sedang diproses oleh admin Phoenix sebelum masuk ke tahap pengiriman.';
    }

    if (order.status === 'processing') {
        return 'Pesanan Anda sedang diproses. Admin Phoenix akan menyiapkan pengiriman dan memperbarui nomor resi saat tersedia.';
    }

    if (order.shipping_status === 'ready_to_ship') {
        return 'Pesanan Anda sudah siap dikirim. Nomor resi akan tampil setelah pengiriman diproses.';
    }

    if (order.shipping_status === 'shipped' || order.status === 'shipped') {
        return 'Pesanan Anda sudah dikirim. Gunakan nomor resi pada ringkasan untuk memantau pengiriman.';
    }

    if (order.status === 'completed' || order.shipping_status === 'delivered') {
        return 'Pesanan sudah selesai. Terima kasih sudah berbelanja di Phoenix.';
    }

    if (order.status === 'cancelled' || order.payment_status === 'cancelled') {
        return 'Pesanan ini dibatalkan. Hubungi admin Phoenix jika Anda membutuhkan bantuan lebih lanjut.';
    }

    if (order.shipping_status === 'shipping_cost_confirmed' || order.status === 'waiting_payment' || order.payment_status === 'waiting_payment') {
        return 'Ongkir sudah dikonfirmasi. Silakan lakukan pembayaran sesuai metode yang dipilih, lalu ikuti arahan admin Phoenix.';
    }

    return 'Total pembayaran final baru berlaku setelah admin mengisi ongkir. Admin Phoenix akan menghubungi WhatsApp Anda setelah ongkir dikonfirmasi.';
}

export default function OrderShow({ order }) {
    const items = order?.order_items ?? [];
    const paymentMethod = order?.payment_method;

    return (
        <>
            <Head title={`Pesanan ${order.order_number}`} />
            <div className="space-y-8">
                <section className="rounded-[2rem] border border-outline-variant/70 bg-white p-8 shadow-sm shadow-primary-container/5">
                    <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Pesanan Berhasil Dibuat</p>
                    <h1 className="mt-3 font-headline-xl text-4xl font-bold text-primary-container md:text-5xl">{order.order_number}</h1>
                    <p className="mt-4 font-body-md text-body-md text-on-surface-variant">Simpan nomor order ini untuk pengecekan berikutnya. Admin Phoenix akan menghubungi WhatsApp Anda setelah ongkir dikonfirmasi.</p>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <PublicCard className="p-6 md:p-8">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <StatusPill label="Status Order" value={order.status} />
                                <StatusPill label="Pengiriman" value={displayShippingStatus(order)} />
                                <StatusPill label="Pembayaran" value={order.payment_status} />
                            </div>
                            {paymentMethod ? (
                                <div className="mt-6 rounded-3xl border border-primary-fixed-dim bg-primary-fixed/25 p-5">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-primary-container/80">Metode Pembayaran</p>
                                    <p className="mt-2 font-body-sm text-base font-extrabold text-primary-container">{paymentMethodLabel(paymentMethod)}</p>
                                    {paymentMethod.account_number ? <p className="mt-2 font-body-sm text-sm font-semibold text-on-surface">{paymentMethod.account_number}</p> : null}
                                    {paymentMethod.account_holder_name ? <p className="font-body-sm text-xs leading-5 text-on-surface-variant">a.n. {paymentMethod.account_holder_name}</p> : null}
                                    {paymentMethod.qris_image_path ? <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">QRIS tersedia. Silakan ikuti instruksi pembayaran di bawah ini.</p> : null}
                                    {paymentMethod.instructions ? <p className="mt-3 font-body-sm text-sm leading-6 text-on-surface-variant">{paymentMethod.instructions}</p> : null}
                                </div>
                            ) : (
                                <div className="mt-6 rounded-3xl bg-primary-fixed/25 p-5">
                                    <p className="font-body-sm text-sm leading-6 text-on-surface-variant">{orderGuidance(order)}</p>
                                </div>
                            )}
                        </PublicCard>

                        <PublicCard className="p-6 md:p-8">
                            <h2 className="font-headline-lg text-headline-lg text-primary-container">Item Pesanan</h2>
                            <div className="mt-5 space-y-4">
                                {items.map((item) => (
                                    <div className="flex gap-3 rounded-3xl border border-outline-variant/70 p-3" key={`${item.product_name}-${item.quantity}-${item.line_total}`}>
                                        <ProductImage alt={item.product_name} className="h-16 w-16 rounded-2xl" imagePath={item.product?.image_path} />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-body-sm text-sm font-bold text-primary-container">{item.product_name}</p>
                                            <p className="mt-1 font-body-sm text-xs text-on-surface-variant">{item.quantity} x {formatRupiah(item.unit_price)}</p>
                                        </div>
                                        <p className="font-body-sm text-sm font-extrabold text-primary-container">{formatRupiah(item.line_total)}</p>
                                    </div>
                                ))}
                            </div>
                        </PublicCard>
                    </div>

                    <PublicCard className="h-fit p-6">
                        <h2 className="font-headline-lg text-headline-lg text-primary-container">Ringkasan</h2>
                        <div className="mt-5 space-y-3 border-y border-outline-variant py-4">
                            <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                <span>Nama</span>
                                <span className="text-right font-bold text-primary-container">{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                <span>Tanggal</span>
                                <span className="text-right font-bold text-primary-container">{formatDate(order.created_at)}</span>
                            </div>
                            <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                <span>Subtotal</span>
                                <span>{formatRupiah(order.subtotal)}</span>
                            </div>
                            {Number(order.voucher_discount_amount) > 0 && (
                                <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                    <span>Diskon Voucher</span>
                                    <span>-{formatRupiah(order.voucher_discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                <span>Ongkir</span>
                                <span>{formatRupiah(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between font-body-lg text-base font-extrabold text-primary-container">
                                <span>Total</span>
                                <span>{formatRupiah(order.total)}</span>
                            </div>
                        </div>
                        {order.courier_name && <p className="mt-4 font-body-sm text-sm text-on-surface-variant">Kurir: <strong className="text-primary-container">{order.courier_name}</strong></p>}
                        {order.tracking_number && <p className="mt-2 font-body-sm text-sm text-on-surface-variant">Resi: <strong className="text-primary-container">{order.tracking_number}</strong></p>}
                        <SecondaryLink className="mt-5 w-full" href={route('orders.lookup.create')}>Cek Pesanan Lain</SecondaryLink>
                        <PrimaryLink className="mt-3 w-full" href={route('products.index')}>Belanja Lagi</PrimaryLink>
                    </PublicCard>
                </div>
            </div>
        </>
    );
}

OrderShow.layout = (page) => <PublicShell>{page}</PublicShell>;
