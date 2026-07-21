import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck,
    ClipboardPlus,
    Leaf,
    Package,
    ReceiptText,
    ShoppingBag,
    Sparkles,
    Star,
} from 'lucide-react';

import MetricCard from '@/Components/Panel/MetricCard';
import PanelCard from '@/Components/Panel/PanelCard';
import PanelEmptyState from '@/Components/Panel/PanelEmptyState';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import PanelSectionHeader from '@/Components/Panel/PanelSectionHeader';
import StatusBadge from '@/Components/Panel/StatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency, formatNumber } from '@/utils/format';

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
        both: 'Home visit & klinik',
        clinic_visit: 'Datang ke klinik',
        home_visit: 'Home visit',
        office_visit: 'Kunjungan klinik',
        online: 'Online',
    };

    return labels[visitType] ?? 'Layanan Phoenix';
}

function resolveImage(path) {
    if (!path) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}

function orderNextAction(order) {
    if (order.status === 'waiting_shipping_confirmation' || order.shipping_status === 'pending_shipping_confirmation') {
        return 'Menunggu konfirmasi ongkir dari admin.';
    }

    if (order.status === 'waiting_payment' || order.payment_status === 'pending') {
        return 'Selesaikan pembayaran di detail order.';
    }

    return 'Cek status order dan pengiriman terbaru.';
}

function SectionLink({ href, label = 'Lihat semua' }) {
    if (!href) {
        return null;
    }

    return (
        <Link
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A]/8"
            href={href}
        >
            {label}
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
    );
}

function ActivityItem({
    amount,
    helper,
    href,
    meta,
    status,
    title,
    actionNode,
}) {
    const body = (
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                    {title}
                </p>
                {meta ? (
                    <p className="mt-1 font-body-sm text-xs text-gray-500">
                        {meta}
                    </p>
                ) : null}
                {helper ? (
                    <p className="mt-2 font-body-sm text-xs font-semibold leading-5 text-[#1E4D3A]">
                        {helper}
                    </p>
                ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                {amount ? (
                    <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                        {amount}
                    </span>
                ) : null}
                {status ? <StatusBadge status={status} /> : null}
            </div>
        </div>
    );

    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7]/70 transition hover:border-[#A8C5B3] hover:bg-white">
            {href ? (
                <Link className="block px-4 py-3.5" href={href}>
                    {body}
                </Link>
            ) : (
                <div className="px-4 py-3.5">{body}</div>
            )}
            {actionNode ? (
                <div className="flex justify-end border-t border-[#E5E7EB]/80 px-4 py-2.5">
                    {actionNode}
                </div>
            ) : null}
        </div>
    );
}

function CatalogCard({ item, type }) {
    const isProduct = type === 'product';
    const href = isProduct
        ? (item.slug && routeExists('products.show')
            ? route('products.show', item.slug)
            : (routeExists('products.index') ? route('products.index') : null))
        : (item.slug && routeExists('services.show')
            ? route('services.show', item.slug)
            : (routeExists('bookings.create')
                ? route('bookings.create', { service_id: item.id })
                : (routeExists('services.index') ? route('services.index') : null)));

    const imageSrc = resolveImage(item.image_path);
    const meta = isProduct ? productCategory(item)?.name : visitTypeLabel(item.visit_type);

    const content = (
        <div className="group flex h-full min-h-[188px] w-[176px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:border-[#A8C5B3] hover:shadow-sm hover:shadow-[#1E4D3A]/8 sm:w-[196px]">
            <div className="relative h-24 overflow-hidden bg-[#A8C5B3]/15 sm:h-28">
                {imageSrc ? (
                    <img
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        src={imageSrc}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#1E4D3A]/35">
                        {isProduct ? (
                            <Package aria-hidden="true" className="h-7 w-7" />
                        ) : (
                            <Leaf aria-hidden="true" className="h-7 w-7" />
                        )}
                    </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 font-label-sm text-[9px] font-bold uppercase tracking-[0.12em] text-[#1E4D3A] shadow-sm">
                    {isProduct ? 'Produk' : 'Layanan'}
                </span>
                {item.is_featured ? (
                    <span className="absolute right-2 top-2 rounded-full bg-white/95 p-1 text-[#B57A2E] shadow-sm">
                        <Star aria-hidden="true" className="h-3 w-3 fill-[#F08A2B]/70" />
                    </span>
                ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                    <h3 className="line-clamp-2 font-body-sm text-xs font-extrabold leading-snug text-[#333333]">
                        {item.name}
                    </h3>
                    {meta ? (
                        <p className="mt-1 truncate font-body-sm text-[10px] font-semibold text-gray-400">
                            {meta}
                        </p>
                    ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="truncate font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                        {formatCurrency(item.price)}
                    </span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E4D3A] text-white transition group-hover:bg-[#163B2C]">
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );

    return href ? (
        <Link className="block shrink-0 snap-start" href={href}>
            {content}
        </Link>
    ) : (
        <div className="shrink-0 snap-start">{content}</div>
    );
}

function QuickActions() {
    const actions = [
        routeExists('products.index') && {
            href: route('products.index'),
            icon: ShoppingBag,
            label: 'Belanja Produk',
            primary: true,
        },
        routeExists('bookings.create') && {
            href: route('bookings.create'),
            icon: CalendarCheck,
            label: 'Booking Layanan',
            primary: false,
        },
    ].filter(Boolean);

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[190px] sm:items-stretch">
            {actions.map((action) => {
                const Icon = action.icon;
                const className = action.primary
                    ? 'bg-[#1E4D3A] text-white hover:bg-[#163B2C]'
                    : 'border border-[#1E4D3A]/20 bg-white text-[#1E4D3A] hover:border-[#1E4D3A] hover:bg-[#1E4D3A] hover:text-white';

                return (
                    <Link
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-body-sm text-sm font-bold transition ${className}`}
                        href={action.href}
                        key={action.label}
                    >
                        {action.label}
                        <Icon aria-hidden="true" className="h-4 w-4" />
                    </Link>
                );
            })}
        </div>
    );
}

function RecentOrders({ orders = [] }) {
    return (
        <PanelCard className="flex h-full flex-col p-5">
            <PanelSectionHeader
                eyebrow="Belanja"
                title="Order Terbaru"
            />
            <div className="flex flex-1 flex-col gap-2.5">
                {orders.length === 0 ? (
                    <PanelEmptyState
                        description="Order produk herbal Anda akan muncul di sini setelah checkout."
                        icon={ReceiptText}
                        title="Belum ada order"
                    />
                ) : (
                    orders.map((order) => (
                        <ActivityItem
                            actionNode={
                                routeExists('customer.dashboard.orders.invoice') ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4D3A]/20 px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:border-[#1E4D3A] hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('customer.dashboard.orders.invoice', order.id)}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <ReceiptText aria-hidden="true" className="h-3.5 w-3.5" />
                                        Invoice
                                    </a>
                                ) : null
                            }
                            amount={formatCurrency(order.total)}
                            helper={orderNextAction(order)}
                            href={routeExists('customer.dashboard.orders.show')
                                ? route('customer.dashboard.orders.show', order.id)
                                : null}
                            key={order.id}
                            meta={formatDate(order.created_at)}
                            status={order.status}
                            title={order.order_number ?? `Order #${order.id}`}
                        />
                    ))
                )}
            </div>
        </PanelCard>
    );
}

function RecentBookings({ bookings = [] }) {
    return (
        <PanelCard className="flex h-full flex-col p-5">
            <PanelSectionHeader
                eyebrow="Perawatan"
                title="Booking Terbaru"
            />
            <div className="flex flex-1 flex-col gap-2.5">
                {bookings.length === 0 ? (
                    <PanelEmptyState
                        description="Booking konsultasi atau terapi akan tampil di sini."
                        icon={CalendarCheck}
                        title="Belum ada booking"
                    />
                ) : (
                    bookings.map((booking) => (
                        <ActivityItem
                            href={routeExists('customer.dashboard.bookings.show')
                                ? route('customer.dashboard.bookings.show', booking.id)
                                : null}
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
        <PanelCard className="flex h-full flex-col p-5">
            <PanelSectionHeader
                eyebrow="Catatan terapi"
                title="Pemeriksaan Terbaru"
            />
            <div className="flex flex-1 flex-col gap-2.5">
                {examinations.length === 0 ? (
                    <PanelEmptyState
                        description="Hasil pemeriksaan dari tim Phoenix akan muncul di sini."
                        icon={ClipboardPlus}
                        title="Belum ada pemeriksaan"
                    />
                ) : (
                    examinations.map((examination) => (
                        <ActivityItem
                            key={examination.id}
                            meta={formatDate(examination.created_at)}
                            title={examination.summary || examination.complaint || `Pemeriksaan #${examination.id}`}
                            helper={examination.result
                                ? String(examination.result).slice(0, 120) + (String(examination.result).length > 120 ? '…' : '')
                                : null}
                        />
                    ))
                )}
            </div>
        </PanelCard>
    );
}

function RecommendationListCard({
    badge,
    category,
    description,
    featured = false,
    href,
    price,
    title,
}) {
    const content = (
        <div className="group relative flex h-full min-h-[190px] flex-col justify-between rounded-3xl border border-[#E5E7EB] bg-[#F6F7F7] p-4 transition hover:border-[#A8C5B3] hover:bg-white hover:shadow-sm hover:shadow-[#1E4D3A]/8">
            <div>
                <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#A8C5B3]/30 px-3 py-1 font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E4D3A]">
                        {badge}
                    </span>
                    {featured ? (
                        <Star aria-hidden="true" className="h-4 w-4 shrink-0 fill-[#F08A2B]/55 text-[#B57A2E]" />
                    ) : null}
                </div>
                {category ? (
                    <p className="mt-4 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        {category}
                    </p>
                ) : null}
                <h3 className="mt-2 line-clamp-2 font-headline-md text-xl font-bold leading-tight text-[#1E4D3A]">
                    {title}
                </h3>
                {description ? (
                    <p className="mt-3 line-clamp-2 font-body-sm text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                    {formatCurrency(price)}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1E4D3A] text-white transition group-hover:bg-[#163B2C]">
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
            </div>
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link className="block" href={href}>
            {content}
        </Link>
    );
}

function Recommendations({ generalProducts = [], recommendations = [], serviceRecommendations = [] }) {
    const hasPersonal = recommendations.length > 0;
    const fallbackItems = [
        ...generalProducts.map((product) => ({ item: product, type: 'product' })),
        ...serviceRecommendations.map((service) => ({ item: service, type: 'service' })),
    ];

    return (
        <PanelCard className="flex h-full flex-col p-5">
            <PanelSectionHeader
                eyebrow="Rekomendasi"
                title={hasPersonal ? 'Produk yang Disarankan' : 'Pilihan Phoenix untuk Anda'}
            />

            <div className="flex flex-1 flex-col gap-3">
                {hasPersonal ? (
                    recommendations.map((recommendation) => {
                        const product = recommendation.product;
                        const href = product?.slug && routeExists('products.show')
                            ? route('products.show', product.slug)
                            : (routeExists('products.index') ? route('products.index') : null);

                        return (
                            <RecommendationListCard
                                badge="Produk"
                                category="Rekomendasi personal"
                                description={recommendation.notes || 'Direkomendasikan oleh tim Phoenix.'}
                                featured={Boolean(product?.is_featured)}
                                href={href}
                                key={recommendation.id}
                                price={product?.price}
                                title={product?.name ?? `Produk #${recommendation.product_id}`}
                            />
                        );
                    })
                ) : fallbackItems.length === 0 ? (
                    <PanelEmptyState
                        description="Rekomendasi personal dari hasil pemeriksaan akan tampil di sini."
                        icon={Leaf}
                        title="Belum ada rekomendasi"
                    />
                ) : (
                    fallbackItems.map(({ item, type }) => {
                        const isProduct = type === 'product';
                        const href = isProduct
                            ? (item.slug && routeExists('products.show')
                                ? route('products.show', item.slug)
                                : (routeExists('products.index') ? route('products.index') : null))
                            : (item.slug && routeExists('services.show')
                                ? route('services.show', item.slug)
                                : (routeExists('bookings.create')
                                    ? route('bookings.create', { service_id: item.id })
                                    : (routeExists('services.index') ? route('services.index') : null)));

                        return (
                            <RecommendationListCard
                                badge={isProduct ? 'Produk' : 'Layanan'}
                                category={isProduct
                                    ? (productCategory(item)?.name || 'Produk herbal')
                                    : visitTypeLabel(item.visit_type)}
                                description={isProduct
                                    ? (item.short_description || 'Produk herbal Phoenix pilihan untuk rutinitas wellness Anda.')
                                    : (item.description || 'Layanan botanical care dari tim Phoenix.')}
                                featured={Boolean(item.is_featured)}
                                href={href}
                                key={`${type}-${item.id}`}
                                price={item.price}
                                title={item.name}
                            />
                        );
                    })
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
                action={(
                    <div className="flex flex-wrap gap-2">
                        {routeExists('products.index') ? (
                            <SectionLink href={route('products.index')} label="Katalog produk" />
                        ) : null}
                        {routeExists('services.index') ? (
                            <SectionLink href={route('services.index')} label="Layanan" />
                        ) : null}
                    </div>
                )}
                description="Geser untuk melihat produk herbal dan layanan botanical care pilihan Phoenix."
                eyebrow="Katalog"
                title="Pilihan Herbal & Layanan"
            />
            <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                {items.map(({ item, type }) => (
                    <CatalogCard item={item} key={`${type}-${item.id}`} type={type} />
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
    const firstName = String(profileName).trim().split(/\s+/)[0] || profileName;

    return (
        <>
            <Head title="Dashboard Customer" />

            <div className="space-y-6">
                <PanelPageHeader
                    description="Pantau order, booking, pemeriksaan, dan rekomendasi personal dalam satu ruang."
                    eyebrow="Ruang Customer"
                    icon={Sparkles}
                    title={`Halo, ${firstName}`}
                />

                <PanelCard className="overflow-hidden border-[#A8C5B3]/40 bg-gradient-to-br from-[#F3F8F5] via-white to-[#FFF8F0] p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 max-w-xl">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E4D3A]">
                                Ringkasan aktivitas
                            </p>
                            <h2 className="mt-2 font-body-lg text-xl font-extrabold text-[#1E4D3A] sm:text-2xl">
                                Lanjutkan perjalanan wellness Anda
                            </h2>
                            <p className="mt-2 font-body-sm text-sm leading-6 text-gray-600">
                                Belanja produk herbal, booking layanan, atau cek hasil pemeriksaan terbaru kapan saja.
                            </p>
                        </div>
                        <div className="shrink-0 sm:self-center">
                            <QuickActions />
                        </div>
                    </div>
                </PanelCard>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <MetricCard
                        helper="Order produk herbal"
                        icon={<ReceiptText aria-hidden="true" className="h-4 w-4" />}
                        label="Order"
                        tone="forest"
                        value={formatNumber(summary.ordersCount)}
                    />
                    <MetricCard
                        helper="Booking layanan"
                        icon={<CalendarCheck aria-hidden="true" className="h-4 w-4" />}
                        label="Booking"
                        tone="blue"
                        value={formatNumber(summary.bookingsCount)}
                    />
                    <MetricCard
                        helper="Voucher digunakan"
                        icon={<Package aria-hidden="true" className="h-4 w-4" />}
                        label="Voucher"
                        tone="sage"
                        value={formatNumber(summary.voucherRedemptionsCount)}
                    />
                    <MetricCard
                        helper="Catatan pemeriksaan"
                        icon={<ClipboardPlus aria-hidden="true" className="h-4 w-4" />}
                        label="Pemeriksaan"
                        tone="brown"
                        value={formatNumber(summary.examinationsCount)}
                    />
                    <MetricCard
                        helper="Produk personal"
                        icon={<Leaf aria-hidden="true" className="h-4 w-4" />}
                        label="Rekomendasi"
                        tone="orange"
                        value={formatNumber(summary.productRecommendationsCount)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <RecentOrders orders={recentOrders} />
                    <RecentBookings bookings={recentBookings} />
                </div>

                <MiniCatalog catalog={miniCatalog} />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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
