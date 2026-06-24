import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, ClipboardPlus, Leaf, Package, ReceiptText, ShoppingBag, Sparkles, Star } from 'lucide-react';

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

function ListItem({ amount, helper, href, meta, status, title, actionNode }) {
    const content = (
        <div className="flex items-start justify-between gap-4 px-4 py-3">
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

    return (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface-container-low transition hover:border-primary-fixed-dim hover:bg-white">
            {href ? <Link className="block hover:bg-white/50" href={href}>{content}</Link> : content}
            {actionNode && (
                <div className="flex justify-end px-4 pb-3 border-t border-outline-variant/40 pt-3 bg-surface-container-lowest">
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
                            actionNode={
                                <a
                                    href={routeExists('customer.dashboard.orders.invoice') ? route('customer.dashboard.orders.invoice', order.id) : '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary-container/10 px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-container hover:text-white"
                                >
                                    <ReceiptText aria-hidden="true" className="h-3.5 w-3.5" />
                                    Download Invoice
                                </a>
                            }
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
        <div className="flex h-full min-h-[190px] flex-col justify-between rounded-3xl border border-outline-variant/80 bg-surface-container-low p-4 transition hover:border-primary-fixed-dim hover:bg-white">
            <div>
                <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary-fixed/45 px-3 py-1 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-primary-container">
                        {isProduct ? 'Produk' : 'Layanan'}
                    </span>
                    {item.is_featured && <Star aria-hidden="true" className="h-4 w-4 fill-tertiary-fixed-dim text-tertiary-container" />}
                </div>
                <p className="mt-4 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/75">
                    {meta}
                </p>
                <h3 className="mt-2 line-clamp-2 font-headline-md text-xl font-bold leading-tight text-primary-container">
                    {item.name}
                </h3>
                <p className="mt-3 line-clamp-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                    {description}
                </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-body-sm text-sm font-extrabold text-primary-container">
                    {formatCurrency(item.price)}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-white">
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
            </div>
        </div>
    );

    return href ? <Link className="block h-full min-w-[260px] sm:min-w-[300px]" href={href}>{content}</Link> : <div className="h-full min-w-[260px] sm:min-w-[300px]">{content}</div>;
}

function CompactCatalogItem({ item, type }) {
    const isProduct = type === 'product';
    const href = isProduct
        ? (item.slug && routeExists('products.show') ? route('products.show', item.slug) : (routeExists('products.index') ? route('products.index') : null))
        : (item.slug && routeExists('services.show') ? route('services.show', item.slug) : (routeExists('services.index') ? route('services.index') : null));
    const meta = isProduct ? productCategory(item)?.name : visitTypeLabel(item.visit_type);

    const content = (
        <div className="group flex h-full min-h-[152px] flex-col overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface-container-low text-left transition hover:border-primary-fixed-dim hover:bg-white hover:shadow-sm hover:shadow-primary-container/10">
            <div className="relative h-20 w-full overflow-hidden bg-primary-fixed/20 sm:h-24">
                {item.image_path ? (
                    <img alt={item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={item.image_path} />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary-container/35 transition duration-300 group-hover:text-primary-container/55">
                        <Package aria-hidden="true" className="h-7 w-7" />
                    </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-label-sm text-[9px] font-bold uppercase tracking-[0.14em] text-primary-container shadow-sm">
                    {isProduct ? 'Produk' : 'Layanan'}
                </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                    <h3 className="line-clamp-2 font-body-sm text-xs font-extrabold leading-snug text-on-surface">
                        {item.name}
                    </h3>
                    {meta && (
                        <p className="mt-1 truncate font-body-sm text-[10px] font-semibold text-on-surface-variant/75">
                            {meta}
                        </p>
                    )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="truncate font-body-sm text-xs font-extrabold text-primary-container">
                        {formatCurrency(item.price)}
                    </span>
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-white transition group-hover:bg-primary">
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );

    return href ? <Link className="block h-full min-w-[168px] sm:min-w-[184px]" href={href}>{content}</Link> : <div className="h-full min-w-[168px] sm:min-w-[184px]">{content}</div>;
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
            variant: 'secondary',
        },
        routeExists('customer.profile.show') && {
            href: route('customer.profile.show'),
            icon: ArrowRight,
            label: 'Lihat Profil',
            variant: 'outline',
        },
    ].filter(Boolean);

    return (
        <div className="flex flex-col gap-2 sm:min-w-[190px]">
            {actions.map((action) => {
                const IconComponent = action.icon;
                const className = action.variant === 'primary'
                    ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20 hover:bg-primary'
                    : action.variant === 'secondary'
                        ? 'border border-primary-fixed-dim bg-primary-fixed/45 text-primary-container hover:bg-primary-fixed'
                        : 'border border-primary-container bg-white text-primary-container hover:bg-primary-container hover:text-white';

                return (
                    <Link className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-body-sm text-sm font-bold transition ${className}`} href={action.href} key={action.label}>
                        {action.label}
                        <IconComponent aria-hidden="true" className="h-4 w-4" />
                    </Link>
                );
            })}
        </div>
    );
}

function Recommendations({ generalProducts = [], recommendations = [], serviceRecommendations = [] }) {
    return (
        <CustomerCard className="p-5">
            <CustomerSectionHeader eyebrow="Rekomendasi" title={recommendations.length === 0 ? 'Pilihan Phoenix untuk Anda' : 'Produk yang Disarankan'} />
            <div className="space-y-4">
                {recommendations.length === 0 ? (
                    [...generalProducts.map((product) => ({ item: product, type: 'product' })), ...serviceRecommendations.map((service) => ({ item: service, type: 'service' }))].length === 0 ? (
                        <CustomerEmptyState
                            description="Rekomendasi personal dari hasil pemeriksaan akan tampil di sini."
                            icon={Leaf}
                            title="Belum ada rekomendasi produk."
                        />
                    ) : (
                        [...generalProducts.map((product) => ({ item: product, type: 'product' })), ...serviceRecommendations.map((service) => ({ item: service, type: 'service' }))].map(({ item, type }) => (
                            <CatalogItem item={item} key={`${type}-${item.id}`} type={type} />
                        ))
                    )
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
        <CustomerCard className="overflow-hidden p-5">
            <CustomerSectionHeader
                action={routeExists('products.index') && (
                    <Link className="inline-flex items-center gap-2 rounded-full border border-primary-fixed-dim px-4 py-2 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('products.index')}>
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
        </CustomerCard>
    );
}

export default function CustomerDashboardIndex({ customerProfile, summary = {}, recentOrders = [], recentBookings = [], recentExaminations = [], recentProductRecommendations = [], generalProductRecommendations = [], featuredServiceRecommendation = [], miniCatalog = {} }) {
    const profileName = customerProfile?.name ?? 'Customer Phoenix';

    return (
        <>
            <Head title="Dashboard Customer" />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={<QuickActions />}
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
                </div>

                <MiniCatalog catalog={miniCatalog} />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentExaminations examinations={recentExaminations} />
                    <Recommendations generalProducts={generalProductRecommendations} recommendations={recentProductRecommendations} serviceRecommendations={featuredServiceRecommendation} />
                </div>
            </div>
        </>
    );
}

CustomerDashboardIndex.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
