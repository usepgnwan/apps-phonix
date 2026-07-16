import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, ClipboardPlus, Leaf, Package, ReceiptText, ShoppingBag, Sparkles, Star } from 'lucide-react';

import PanelCard from '@/Components/Panel/PanelCard';
import PanelEmptyState from '@/Components/Panel/PanelEmptyState';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import PanelSectionHeader from '@/Components/Panel/PanelSectionHeader';
import MetricCard from '@/Components/Panel/MetricCard';
import StatusBadge from '@/Components/Panel/StatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatNumber, formatCurrency } from '@/utils/format';

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

function productCategory(product) {
    return product?.product_category ?? product?.productCategory ?? null;
}

function visitTypeLabel(visitType) {
    const labels = {
        clinic_visit: 'Datang ke klinik',
        home_visit: 'Home visit',
        online: 'Online',
    };

    return labels[visitType] ?? 'Layanan Phoenix';
}

function ListItem({ amount, helper, href, meta, status, title, actionNode }) {
    const content = (
        <div className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
                <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                    {title}
                </p>
                {meta && (
                    <p className="mt-1 font-body-sm text-xs text-gray-500">
                        {meta}
                    </p>
                )}
                {helper && (
                    <p className="mt-2 font-body-sm text-xs font-semibold leading-5 text-[#1E4D3A]">
                        {helper}
                    </p>
                )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                {amount && (
                    <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                        {amount}
                    </span>
                )}
                {status && <StatusBadge status={status} />}
            </div>
        </div>
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] transition hover:border-[#A8C5B3] hover:bg-white">
            {href ? <Link className="block" href={href}>{content}</Link> : content}
            {actionNode && (
                <div className="flex justify-end border-t border-[#E5E7EB] bg-white px-4 pb-3 pt-3">
                    {actionNode}
                </div>
            )}
        </div>
    );
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
        <PanelCard className="p-5">
            <PanelSectionHeader eyebrow="Belanja Herbal" title="Order Terbaru" />
            <div className="space-y-3">
                {orders.length === 0 ? (
                    <PanelEmptyState
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
                            actionNode={
                                <a
                                    href={routeExists('customer.dashboard.orders.invoice') ? route('customer.dashboard.orders.invoice', order.id) : '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                >
                                    <ReceiptText aria-hidden="true" className="h-3.5 w-3.5" />
                                    Download Invoice
                                </a>
                            }
                        />
                    ))
                )}
            </div>
        </PanelCard>
    );
}

function RecentBookings({ bookings = [] }) {
    return (
        <PanelCard className="p-5">
            <PanelSectionHeader eyebrow="Perawatan" title="Booking Terbaru" />
            <div className="space-y-3">
                {bookings.length === 0 ? (
                    <PanelEmptyState
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
        </PanelCard>
    );
}

function RecentExaminations({ examinations = [] }) {
    return (
        <PanelCard className="p-5">
            <PanelSectionHeader eyebrow="Catatan Terapi" title="Pemeriksaan Terbaru" />
            <div className="space-y-3">
                {examinations.length === 0 ? (
                    <PanelEmptyState
                        description="Hasil pemeriksaan dari tim Phoenix akan muncul di ruang customer Anda."
                        icon={ClipboardPlus}
                        title="Belum ada pemeriksaan."
                    />
                ) : (
                    examinations.map((examination) => (
                        <div
                            className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"
                            key={examination.id}
                        >
                            <p className="font-body-sm text-sm font-bold text-[#333333]">
                                {examination.summary || examination.complaint || `Pemeriksaan #${examination.id}`}
                            </p>
                            <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                                {examination.result || `Dibuat pada ${formatDate(examination.created_at)}`}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </PanelCard>
    );
}

function CatalogItem({ item, type }) {
    const isProduct = type === 'product';
    const href = isProduct
        ? (routeExists('products.index') ? route('products.index') : null)
        : (routeExists('bookings.create') ? route('bookings.create', { service_id: item.id }) : (routeExists('services.index') ? route('services.index') : null));
    const description = isProduct
        ? (item.short_description || 'Produk herbal Phoenix pilihan untuk rutinitas wellness Anda.')
        : (item.description || 'Layanan botanical care dari tim Phoenix.');
    const meta = isProduct ? productCategory(item)?.name : visitTypeLabel(item.visit_type);

    const content = (
        <div className="flex h-full min-h-[190px] flex-col justify-between rounded-3xl border border-[#E5E7EB] bg-[#F6F7F7] p-4 transition hover:border-[#A8C5B3] hover:bg-white">
            <div>
                <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#A8C5B3]/25 px-3 py-1 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">
                        {isProduct ? 'Produk' : 'Layanan'}
                    </span>
                    {item.is_featured && (
                        <Star aria-hidden="true" className="h-4 w-4 fill-[#F08A2B]/60 text-[#B57A2E]" />
                    )}
                </div>
                <p className="mt-4 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    {meta}
                </p>
                <h3 className="mt-2 line-clamp-2 font-headline-md text-xl font-bold leading-tight text-[#1E4D3A]">
                    {item.name}
                </h3>
                <p className="mt-3 line-clamp-2 font-body-sm text-xs leading-5 text-gray-500">
                    {description}
                </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                    {formatCurrency(item.price)}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1E4D3A] text-white">
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
            </div>
        </div>
    );

    return href
        ? <Link className="block h-full min-w-[260px] sm:min-w-[300px]" href={href}>{content}</Link>
        : <div className="h-full min-w-[260px] sm:min-w-[300px]">{content}</div>;
}

function CompactCatalogItem({ item, type }) {
    const isProduct = type === 'product';
    const href = isProduct
        ? (item.slug && routeExists('products.show') ? route('products.show', item.slug) : (routeExists('products.index') ? route('products.index') : null))
        : (item.slug && routeExists('services.show') ? route('services.show', item.slug) : (routeExists('services.index') ? route('services.index') : null));
    const meta = isProduct ? productCategory(item)?.name : visitTypeLabel(item.visit_type);

    const content = (
        <div className="group flex h-full min-h-[152px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] text-left transition hover:border-[#A8C5B3] hover:bg-white hover:shadow-sm hover:shadow-[#1E4D3A]/10">
            <div className="relative h-20 w-full overflow-hidden bg-[#A8C5B3]/20 sm:h-24">
                {item.image_path ? (
                    <img
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        src={item.image_path}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#1E4D3A]/30 transition duration-300 group-hover:text-[#1E4D3A]/55">
                        <Package aria-hidden="true" className="h-7 w-7" />
                    </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-label-sm text-[9px] font-bold uppercase tracking-[0.14em] text-[#1E4D3A] shadow-sm">
                    {isProduct ? 'Produk' : 'Layanan'}
                </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                    <h3 className="line-clamp-2 font-body-sm text-xs font-extrabold leading-snug text-[#333333]">
                        {item.name}
                    </h3>
                    {meta && (
                        <p className="mt-1 truncate font-body-sm text-[10px] font-semibold text-gray-400">
                            {meta}
                        </p>
                    )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="truncate font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                        {formatCurrency(item.price)}
                    </span>
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1E4D3A] text-white transition group-hover:bg-[#163d2e]">
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );

    return href
        ? <Link className="block h-full min-w-[168px] sm:min-w-[184px]" href={href}>{content}</Link>
        : <div className="h-full min-w-[168px] sm:min-w-[184px]">{content}</div>;
}

function QuickActions() {
    const actions = [
        routeExists('products.index') && {
            href: route('products.index'),
            icon: ShoppingBag,
            label: 'Belanja Produk',
            variant: 'primary',
        },
        routeExists('bookings.create') && {
            href: route('bookings.create'),
            icon: CalendarCheck,
            label: 'Booking Layanan',
            variant: 'outline',
        },
    ].filter(Boolean);

    return (
        <div className="flex flex-col gap-2 sm:min-w-[190px]">
            {actions.map((action) => {
                const IconComponent = action.icon;
                const className = action.variant === 'primary'
                    ? 'bg-[#1E4D3A] text-white hover:bg-[#163d2e]'
                    : 'border border-[#1E4D3A] text-[#1E4D3A] bg-white hover:bg-[#1E4D3A] hover:text-white';

                return (
                    <Link
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-body-sm text-sm font-bold transition ${className}`}
                        href={action.href}
                        key={action.label}
                    >
                        {action.label}
                        <IconComponent aria-hidden="true" className="h-4 w-4" />
                    </Link>
                );
            })}
        </div>
    );
}

function Recommendations({ generalProducts = [], recommendations = [], serviceRecommendations = [] }) {
    const generalItems = [
        ...generalProducts.map((product) => ({ item: product, type: 'product' })),
        ...serviceRecommendations.map((service) => ({ item: service, type: 'service' })),
    ];

    return (
        <PanelCard className="p-5">
            <PanelSectionHeader
                eyebrow="Rekomendasi"
                title={recommendations.length === 0 ? 'Pilihan Phoenix untuk Anda' : 'Produk yang Disarankan'}
            />
            <div className="space-y-3">
                {recommendations.length === 0 ? (
                    generalItems.length === 0 ? (
                        <PanelEmptyState
                            description="Rekomendasi personal dari hasil pemeriksaan akan tampil di sini."
                            icon={Leaf}
                            title="Belum ada rekomendasi produk."
                        />
                    ) : (
                        generalItems.map(({ item, type }) => (
                            <CatalogItem item={item} key={`${type}-${item.id}`} type={type} />
                        ))
                    )
                ) : (
                    recommendations.map((recommendation) => (
                        <div
                            className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"
                            key={recommendation.id}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                                        {recommendation.product?.name ?? `Produk #${recommendation.product_id}`}
                                    </p>
                                    <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                                        {recommendation.notes || 'Direkomendasikan oleh tim Phoenix.'}
                                    </p>
                                </div>
                                <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                    {formatCurrency(recommendation.product?.price)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </PanelCard>
    );
}

function MiniCatalog({ catalog = {} }) {
    const products = catalog.products ?? [];
    const services = catalog.services ?? [];
    const items = [
        ...products.map((product) => ({ item: product, type: 'product' })),
        ...services.map((service) => ({ item: service, type: 'service' })),
    ];

    if (items.length === 0) {
        return null;
    }

    return (
        <PanelCard className="overflow-hidden p-5">
            <PanelSectionHeader
                action={routeExists('products.index') && (
                    <Link
                        className="inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                        href={route('products.index')}
                    >
                        Buka Katalog
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                )}
                description="Geser untuk melihat produk herbal dan layanan botanical care yang sedang ditonjolkan Phoenix."
                eyebrow="Mini Catalog"
                title="Pilihan Herbal & Layanan"
            />
            <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2">
                {items.map(({ item, type }) => (
                    <div className="snap-start" key={`${type}-${item.id}`}>
                        <CompactCatalogItem item={item} type={type} />
                    </div>
                ))}
            </div>
        </PanelCard>
    );
}

export default function CustomerDashboardIndex({
    customerProfile,
    summary = {},
    recentOrders = [],
    recentBookings = [],
    recentExaminations = [],
    recentProductRecommendations = [],
    generalProductRecommendations = [],
    featuredServiceRecommendation = [],
    miniCatalog = {},
}) {
    const profileName = customerProfile?.name ?? 'Customer Phoenix';

    return (
        <>
            <Head title="Dashboard Customer" />

            <div className="space-y-8">
                <PanelPageHeader
                    action={<QuickActions />}
                    description="Pantau order herbal, booking layanan, pemeriksaan, dan rekomendasi personal Anda dalam satu ruang yang hangat dan rapi."
                    eyebrow="Dashboard Customer"
                    icon={Sparkles}
                    title={`Selamat datang, ${profileName}`}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard
                        helper="Order produk herbal"
                        icon={<ReceiptText aria-hidden="true" className="h-5 w-5" />}
                        label="Order"
                        tone="forest"
                        value={formatNumber(summary.ordersCount)}
                    />
                    <MetricCard
                        helper="Booking layanan"
                        icon={<CalendarCheck aria-hidden="true" className="h-5 w-5" />}
                        label="Booking"
                        tone="blue"
                        value={formatNumber(summary.bookingsCount)}
                    />
                    <MetricCard
                        helper="Voucher digunakan"
                        icon={<Package aria-hidden="true" className="h-5 w-5" />}
                        label="Voucher"
                        tone="sage"
                        value={formatNumber(summary.voucherRedemptionsCount)}
                    />
                    <MetricCard
                        helper="Catatan pemeriksaan"
                        icon={<ClipboardPlus aria-hidden="true" className="h-5 w-5" />}
                        label="Pemeriksaan"
                        tone="brown"
                        value={formatNumber(summary.examinationsCount)}
                    />
                    <MetricCard
                        helper="Produk personal"
                        icon={<Leaf aria-hidden="true" className="h-5 w-5" />}
                        label="Rekomendasi"
                        tone="orange"
                        value={formatNumber(summary.productRecommendationsCount)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentOrders orders={recentOrders} />
                    <RecentBookings bookings={recentBookings} />
                </div>

                <MiniCatalog catalog={miniCatalog} />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentExaminations examinations={recentExaminations} />
                    <Recommendations
                        generalProducts={generalProductRecommendations}
                        recommendations={recentProductRecommendations}
                        serviceRecommendations={featuredServiceRecommendation}
                    />
                </div>
            </div>
        </>
    );
}

CustomerDashboardIndex.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
