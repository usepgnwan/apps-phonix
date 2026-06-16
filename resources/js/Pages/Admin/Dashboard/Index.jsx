import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck,
    ChevronDown,
    ClipboardPlus,
    Leaf,
    MapPin,
    Package,
    ReceiptText,
    Store,
    UserRound,
    UsersRound,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

const mainMetrics = [
    ['Produk & Layanan', 'productsAndServices', 'Produk trend data', Package, 'sage', 'bar'],
    ['Booking', 'bookings', 'Rsing-trend data', CalendarCheck, 'blue', 'line'],
    ['Order Website', 'ordersRevenue', 'Order-trend data', ReceiptText, 'forest', 'line'],
    ['Lead', 'leads', 'Lead', UserRound, 'brown', 'line'],
    ['Customer', 'customerProfiles', 'Customer', UsersRound, 'sage', 'bar'],
];

const secondaryMetrics = [
    ['Aktivitas lapangan', 'fieldActivities', ClipboardPlus],
    ['Penjualan offline', 'offlineSales', Store],
    ['Pemeriksaan internal', 'examinations', ClipboardPlus],
];

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

function SectionHeader({ eyebrow, title, actionHref, actionLabel }) {
    return (
        <div className="mb-4 flex items-start justify-between gap-4">
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                    {title}
                </h2>
            </div>
            {actionHref && actionLabel && (
                <Link
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                    href={actionHref}
                >
                    {actionLabel}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

function ListItem({ title, meta, amount, status, href }) {
    const content = (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 transition hover:border-[#A8C5B3] hover:bg-white">
            <div className="min-w-0">
                <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                    {title}
                </p>
                {meta && (
                    <p className="mt-1 font-body-sm text-xs text-gray-500">
                        {meta}
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

    if (!href) {
        return content;
    }

    return <Link href={href}>{content}</Link>;
}

function RecentOrders({ orders = [] }) {
    const href = routeExists('admin.orders.index') ? route('admin.orders.index') : null;

    return (
        <AdminCard className="p-5">
            <SectionHeader
                actionHref={href}
                actionLabel="Lihat semua"
                eyebrow="Commerce"
                title="Order Terbaru"
            />
            <div className="space-y-3">
                {orders.length === 0 ? (
                    <EmptyState title="Belum ada order terbaru." description="Order dari checkout akan tampil di sini." />
                ) : (
                    orders.map((order) => (
                        <ListItem
                            amount={formatCurrency(order.total)}
                            href={routeExists('admin.orders.show') ? route('admin.orders.show', order.id) : null}
                            key={order.id}
                            meta={`${order.customer_name ?? 'Customer'} · ${formatDate(order.created_at)}`}
                            status={order.status}
                            title={order.order_number ?? `Order #${order.id}`}
                        />
                    ))
                )}
            </div>
        </AdminCard>
    );
}

function RecentBookings({ bookings = [] }) {
    const href = routeExists('admin.bookings.index') ? route('admin.bookings.index') : null;

    return (
        <AdminCard className="p-5">
            <SectionHeader
                actionHref={href}
                actionLabel="Lihat semua"
                eyebrow="Booking"
                title="Booking Terbaru"
            />
            <div className="space-y-3">
                {bookings.length === 0 ? (
                    <EmptyState title="Belum ada booking terbaru." description="Booking layanan customer akan tampil di sini." />
                ) : (
                    bookings.map((booking) => (
                        <ListItem
                            href={routeExists('admin.bookings.show') ? route('admin.bookings.show', booking.id) : null}
                            key={booking.id}
                            meta={`${booking.customer_profile?.name ?? booking.name ?? 'Customer'} · ${booking.service?.name ?? 'Layanan'}`}
                            status={booking.status}
                            title={booking.booking_number ?? `Booking #${booking.id}`}
                        />
                    ))
                )}
            </div>
        </AdminCard>
    );
}

function RecentLeads({ leads = [] }) {
    const href = routeExists('admin.leads.index') ? route('admin.leads.index') : null;

    return (
        <AdminCard className="p-5">
            <SectionHeader
                actionHref={href}
                actionLabel="Lihat semua"
                eyebrow="CRM"
                title="Lead Terbaru"
            />
            <div className="space-y-3">
                {leads.length === 0 ? (
                    <EmptyState title="Belum ada lead terbaru." description="Lead dari website, event, atau tim lapangan akan tampil di sini." />
                ) : (
                    leads.map((lead) => (
                        <ListItem
                            href={routeExists('admin.leads.show') ? route('admin.leads.show', lead.id) : null}
                            key={lead.id}
                            meta={`${lead.lead_source?.name ?? 'Tanpa sumber'} · ${lead.assigned_staff?.name ?? 'Belum ditugaskan'}`}
                            status={lead.follow_up_status}
                            title={lead.name ?? `Lead #${lead.id}`}
                        />
                    ))
                )}
            </div>
        </AdminCard>
    );
}

function RecentOfflineSales({ offlineSales = [] }) {
    const href = routeExists('admin.offline-sales.index') ? route('admin.offline-sales.index') : null;

    return (
        <AdminCard className="p-5">
            <SectionHeader
                actionHref={href}
                actionLabel="Lihat semua"
                eyebrow="Offline"
                title="Penjualan Offline Terbaru"
            />
            <div className="space-y-3">
                {offlineSales.length === 0 ? (
                    <EmptyState title="Belum ada penjualan offline." description="Transaksi event atau door-to-door akan tampil di sini." />
                ) : (
                    offlineSales.map((sale) => (
                        <ListItem
                            amount={formatCurrency(sale.total)}
                            href={routeExists('admin.offline-sales.show') ? route('admin.offline-sales.show', sale.id) : null}
                            key={sale.id}
                            meta={`${sale.customer_name ?? sale.customer_profile?.name ?? 'Customer'} · ${sale.source ?? 'offline'}`}
                            title={sale.sale_number ?? `Penjualan #${sale.id}`}
                        />
                    ))
                )}
            </div>
        </AdminCard>
    );
}

function LowStockProducts({ products = [] }) {
    return (
        <AdminCard className="p-5">
            <SectionHeader eyebrow="Inventori" title="Produk Stok Rendah" />
            <div className="space-y-3">
                {products.length === 0 ? (
                    <EmptyState title="Stok produk aman." description="Produk stok rendah akan muncul saat stok melewati ambang." />
                ) : (
                    products.map((product) => (
                        <div
                            className="rounded-2xl border border-[#F08A2B]/20 bg-[#F08A2B]/10 px-4 py-3"
                            key={product.id}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                                        {product.name ?? `Produk #${product.id}`}
                                    </p>
                                    <p className="mt-1 font-body-sm text-xs text-[#B57A2E]">
                                        Ambang: {formatNumber(product.low_stock_threshold)}
                                    </p>
                                </div>
                                <StatusBadge
                                    label={`Stok ${formatNumber(product.stock_quantity)}`}
                                    tone="orange"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminCard>
    );
}

function AdminDashboard({ summary = {}, recent = {}, lowStockProducts = [], trends = {}, filters = {} }) {
    const handleDateRangeChange = (e, type) => {
        const newFilters = { ...filters, [type]: e.target.value };
        router.get(
            route('admin.dashboard.index'),
            newFilters,
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 shadow-sm">
                                <MapPin aria-hidden="true" className="h-4 w-4 text-[#333333]" />
                                <span className="font-body-sm text-sm font-medium text-[#333333]">Semua Cabang</span>
                                <ChevronDown aria-hidden="true" className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#1E4D3A]">
                                <CalendarCheck aria-hidden="true" className="h-4 w-4 text-[#333333]" />
                                <input 
                                    type="date" 
                                    value={filters.start_date || ''} 
                                    onChange={(e) => handleDateRangeChange(e, 'start_date')}
                                    className="border-none bg-transparent p-0 font-body-sm text-sm text-[#333333] focus:ring-0" 
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="date" 
                                    value={filters.end_date || ''} 
                                    onChange={(e) => handleDateRangeChange(e, 'end_date')}
                                    className="border-none bg-transparent p-0 font-body-sm text-sm text-[#333333] focus:ring-0" 
                                />
                            </div>
                        </div>
                    }
                    description="Pantau ringkasan commerce, booking, lead, aktivitas lapangan, dan stok Phoenix."
                    eyebrow="Panel Admin"
                    title="Dashboard"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {mainMetrics.map(([label, key, helper, IconComponent, tone, chartType]) => (
                        <MetricCard
                            chartType={chartType}
                            helper={helper}
                            icon={<IconComponent aria-hidden="true" className="h-5 w-5" />}
                            key={key}
                            label={label}
                            tone={tone}
                            trend={trends[key]}
                            value={key === 'ordersRevenue' ? formatCurrency(summary[key]) : formatNumber(summary[key]) + (key === 'productsAndServices' ? ' Item Aktif' : key === 'bookings' ? ' Kunjungan' : key === 'leads' ? ' Lead' : key === 'customerProfiles' ? ' Customer' : '')}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {secondaryMetrics.map(([label, key, IconComponent]) => (
                        <AdminCard className="flex items-center justify-between p-4" key={key}>
                            <div className="flex flex-col">
                                <span className="font-body-lg text-2xl font-extrabold text-[#333333]">
                                    {formatNumber(summary[key])}
                                </span>
                                <span className="font-body-sm text-xs font-medium text-gray-500 mt-1">
                                    {label}
                                </span>
                            </div>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600">
                                <span className="text-xl leading-none">+</span>
                            </button>
                        </AdminCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <RecentOrders orders={recent.orders ?? []} />
                    <LowStockProducts products={lowStockProducts ?? []} />
                    <RecentBookings bookings={recent.bookings ?? []} />
                    <RecentLeads leads={recent.leads ?? []} />
                    <div className="xl:col-span-2">
                        <RecentOfflineSales offlineSales={recent.offlineSales ?? []} />
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminDashboard;

