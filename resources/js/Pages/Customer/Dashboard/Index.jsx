import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, ClipboardPlus, Leaf, Package, ReceiptText, Sparkles } from 'lucide-react';

import CustomerCard from '@/Components/Customer/CustomerCard';
import CustomerEmptyState from '@/Components/Customer/CustomerEmptyState';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import CustomerStatusBadge from '@/Components/Customer/CustomerStatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';

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

function routeExists(routeName) {
    return typeof route === 'function' && route().has(routeName);
}

function MetricTile({ icon: IconComponent, label, value, helper }) {
    return (
        <CustomerCard className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
                        {label}
                    </p>
                    <p className="mt-3 font-headline-lg text-3xl font-bold text-primary-container">
                        {formatNumber(value)}
                    </p>
                    <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                        {helper}
                    </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed/50 text-primary-container">
                    <IconComponent aria-hidden="true" className="h-6 w-6" />
                </div>
            </div>
        </CustomerCard>
    );
}

function ListItem({ amount, helper, href, meta, status, title }) {
    const content = (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-outline-variant/80 bg-surface-container-low px-4 py-3 transition hover:border-primary-fixed-dim hover:bg-white">
            <div className="min-w-0">
                <p className="truncate font-body-sm text-sm font-bold text-on-surface">
                    {title}
                </p>
                {meta && (
                    <p className="mt-1 font-body-sm text-xs text-on-surface-variant">
                        {meta}
                    </p>
                )}
                {helper && (
                    <p className="mt-2 font-body-sm text-xs font-semibold leading-5 text-primary-container">
                        {helper}
                    </p>
                )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                {amount && (
                    <span className="font-body-sm text-sm font-extrabold text-primary-container">
                        {amount}
                    </span>
                )}
                {status && <CustomerStatusBadge status={status} />}
            </div>
        </div>
    );

    return href ? <Link className="block" href={href}>{content}</Link> : content;
}

function orderNextAction(order) {
    if (order.status === 'waiting_shipping_confirmation' || order.shipping_status === 'pending_shipping_confirmation') {
        return 'Menunggu ongkir dari admin Phoenix.';
    }

    if (order.status === 'waiting_payment' || order.payment_status === 'pending') {
        return 'Lihat instruksi pembayaran di detail order.';
    }

    return 'Cek status order dan pengiriman terbaru.';
}

function RecentOrders({ orders = [] }) {
    return (
        <CustomerCard className="p-5">
            <CustomerSectionHeader eyebrow="Belanja Herbal" title="Order Terbaru" />
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <CustomerEmptyState
                        description="Saat Anda mulai checkout produk Phoenix, ringkasan order akan tampil di sini."
                        icon={ReceiptText}
                        title="Belum ada order."
                    />
                ) : (
                    orders.map((order) => (
                        <ListItem
                            amount={formatCurrency(order.total)}
                            helper={orderNextAction(order)}
                            href={routeExists('customer.dashboard.orders.show') ? route('customer.dashboard.orders.show', order.id) : null}
                            key={order.id}
                            meta={formatDate(order.created_at)}
                            status={order.status}
                            title={order.order_number ?? `Order #${order.id}`}
                        />
                    ))
                )}
            </div>
        </CustomerCard>
    );
}

function RecentBookings({ bookings = [] }) {
    return (
        <CustomerCard className="p-5">
            <CustomerSectionHeader eyebrow="Perawatan" title="Booking Terbaru" />
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <CustomerEmptyState
                        description="Booking konsultasi atau terapi Anda akan tampil setelah dibuat."
                        icon={CalendarCheck}
                        title="Belum ada booking."
                    />
                ) : (
                    bookings.map((booking) => (
                        <ListItem
                            href={routeExists('customer.dashboard.bookings.show') ? route('customer.dashboard.bookings.show', booking.id) : null}
                            key={booking.id}
                            meta={`${booking.service?.name ?? 'Layanan Phoenix'} · ${formatDate(booking.desired_schedule_at ?? booking.created_at)}`}
                            status={booking.status}
                            title={booking.booking_number ?? `Booking #${booking.id}`}
                        />
                    ))
                )}
            </div>
        </CustomerCard>
    );
}

function RecentExaminations({ examinations = [] }) {
    return (
        <CustomerCard className="p-5">
            <CustomerSectionHeader eyebrow="Catatan Terapi" title="Pemeriksaan Terbaru" />
            <div className="space-y-4">
                {examinations.length === 0 ? (
                    <CustomerEmptyState
                        description="Hasil pemeriksaan dari tim Phoenix akan muncul di ruang customer Anda."
                        icon={ClipboardPlus}
                        title="Belum ada pemeriksaan."
                    />
                ) : (
                    examinations.map((examination) => (
                        <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-low px-4 py-3" key={examination.id}>
                            <p className="font-body-sm text-sm font-bold text-on-surface">
                                {examination.summary || examination.complaint || `Pemeriksaan #${examination.id}`}
                            </p>
                            <p className="mt-1 font-body-sm text-xs leading-5 text-on-surface-variant">
                                {examination.result || `Dibuat pada ${formatDate(examination.created_at)}`}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </CustomerCard>
    );
}

function Recommendations({ recommendations = [] }) {
    return (
        <CustomerCard className="p-5">
            <CustomerSectionHeader eyebrow="Rekomendasi" title="Produk yang Disarankan" />
            <div className="space-y-4">
                {recommendations.length === 0 ? (
                    <CustomerEmptyState
                        description="Rekomendasi personal dari hasil pemeriksaan akan tampil di sini."
                        icon={Leaf}
                        title="Belum ada rekomendasi produk."
                    />
                ) : (
                    recommendations.map((recommendation) => (
                        <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-low px-4 py-3" key={recommendation.id}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate font-body-sm text-sm font-bold text-on-surface">
                                        {recommendation.product?.name ?? `Produk #${recommendation.product_id}`}
                                    </p>
                                    <p className="mt-1 font-body-sm text-xs leading-5 text-on-surface-variant">
                                        {recommendation.notes || 'Direkomendasikan oleh tim Phoenix.'}
                                    </p>
                                </div>
                                <span className="font-body-sm text-sm font-extrabold text-primary-container">
                                    {formatCurrency(recommendation.product?.price)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </CustomerCard>
    );
}

export default function CustomerDashboardIndex({ customerProfile, summary = {}, recentOrders = [], recentBookings = [], recentExaminations = [], recentProductRecommendations = [] }) {
    const profileName = customerProfile?.name ?? 'Customer Phoenix';

    return (
        <>
            <Head title="Dashboard Customer" />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={routeExists('customer.profile.show') && (
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-primary-container bg-white px-4 py-2 font-body-sm text-sm font-bold text-primary-container transition hover:bg-primary-container hover:text-white"
                            href={route('customer.profile.show')}
                        >
                            Lihat Profil
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    )}
                    description="Pantau order herbal, booking layanan, pemeriksaan, dan rekomendasi personal Anda dalam satu ruang yang hangat dan rapi."
                    eyebrow="Dashboard Customer"
                    icon={Sparkles}
                    title={`Selamat datang, ${profileName}`}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricTile helper="Order produk herbal" icon={ReceiptText} label="Order" value={summary.ordersCount} />
                    <MetricTile helper="Booking layanan" icon={CalendarCheck} label="Booking" value={summary.bookingsCount} />
                    <MetricTile helper="Voucher digunakan" icon={Package} label="Voucher" value={summary.voucherRedemptionsCount} />
                    <MetricTile helper="Catatan pemeriksaan" icon={ClipboardPlus} label="Pemeriksaan" value={summary.examinationsCount} />
                    <MetricTile helper="Produk personal" icon={Leaf} label="Rekomendasi" value={summary.productRecommendationsCount} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentOrders orders={recentOrders} />
                    <RecentBookings bookings={recentBookings} />
                    <RecentExaminations examinations={recentExaminations} />
                    <Recommendations recommendations={recentProductRecommendations} />
                </div>
            </div>
        </>
    );
}

CustomerDashboardIndex.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
