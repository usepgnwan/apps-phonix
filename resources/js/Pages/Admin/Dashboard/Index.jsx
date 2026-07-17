import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    ArrowRight,
    CalendarCheck,
    ChevronDown,
    ClipboardPlus,
    Loader2,
    MapPin,
    Package,
    ReceiptText,
    Store,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/format';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { adminBranchName, isBranchAdmin, isCentralAdmin } from '@/utils/adminScope';

const periodOptions = [
    ['today', 'Hari Ini'],
    ['last_7_days', '7 Hari'],
    ['month', 'Bulan Ini'],
    ['year', 'Tahun Ini'],
    ['custom', 'Custom'],
];

const commerceMetrics = [
    {
        label: 'Order Website',
        key: 'ordersRevenue',
        helper: 'Total nilai order di periode ini',
        icon: ReceiptText,
        tone: 'forest',
        chartType: 'line',
        routeName: 'admin.orders.index',
        format: 'currency',
    },
    {
        label: 'Booking',
        key: 'bookings',
        helper: 'Jumlah booking layanan di periode ini',
        icon: CalendarCheck,
        tone: 'blue',
        chartType: 'line',
        routeName: 'admin.bookings.index',
        format: 'count',
        suffix: ' Kunjungan',
    },
    {
        label: 'Penjualan Offline',
        key: 'offlineSales',
        helper: 'Transaksi offline di periode ini',
        icon: Store,
        tone: 'orange',
        chartType: 'line',
        routeName: 'admin.offline-sales.index',
        format: 'count',
        suffix: ' Transaksi',
    },
];

const crmMetrics = [
    {
        label: 'Lead',
        key: 'leads',
        helper: 'Lead masuk di periode ini',
        icon: UserRound,
        tone: 'brown',
        chartType: 'line',
        routeName: 'admin.leads.index',
        format: 'count',
        suffix: ' Lead',
    },
    {
        label: 'Customer',
        key: 'customerProfiles',
        helper: 'Profil customer baru di periode ini',
        icon: UsersRound,
        tone: 'sage',
        chartType: 'bar',
        routeName: 'admin.customers.index',
        format: 'count',
        suffix: ' Customer',
    },
];

const opsMetrics = [
    {
        label: 'Aktivitas lapangan',
        key: 'fieldActivities',
        helper: 'Kunjungan/aktivitas tim di periode ini',
        icon: ClipboardPlus,
        tone: 'sage',
        routeName: 'admin.leads.index',
    },
    {
        label: 'Pemeriksaan internal',
        key: 'examinations',
        helper: 'Pemeriksaan tercatat di periode ini',
        icon: ClipboardPlus,
        tone: 'blue',
        routeName: 'admin.examinations.index',
    },
    {
        label: 'Produk & Layanan',
        key: 'productsAndServices',
        helper: 'Total item aktif di katalog (tidak terikat periode)',
        icon: Package,
        tone: 'forest',
        routeName: 'admin.products.index',
    },
];

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

function formatPeriodLabel(filters) {
    if (!filters?.start_date || !filters?.end_date) {
        return 'Periode belum dipilih';
    }

    const formatter = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const start = formatter.format(new Date(`${filters.start_date}T00:00:00`));
    const end = formatter.format(new Date(`${filters.end_date}T00:00:00`));

    if (filters.start_date === filters.end_date) {
        return start;
    }

    return `${start} – ${end}`;
}

function periodChipLabel(period) {
    return periodOptions.find(([value]) => value === period)?.[1] ?? 'Bulan Ini';
}

function routeExists(routeName) {
    return typeof route === 'function' && route().has(routeName);
}

function filterParams(filters) {
    const params = {
        period: filters.period ?? 'month',
        start_date: filters.start_date,
        end_date: filters.end_date,
    };

    if (filters.branch_id) {
        params.branch_id = filters.branch_id;
    }

    return params;
}

function formatMetricValue(metric, summary) {
    const raw = summary[metric.key];

    if (metric.format === 'currency') {
        return formatCurrency(raw);
    }

    return `${formatNumber(raw)}${metric.suffix ?? ''}`;
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

    return (
        <Link className="block" href={href}>
            {content}
        </Link>
    );
}

function MetricSection({ title, description, metrics, summary, trends }) {
    return (
        <section className="space-y-3">
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {title}
                </p>
                {description && (
                    <p className="mt-1 font-body-sm text-xs text-gray-500">
                        {description}
                    </p>
                )}
            </div>
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${metrics.length >= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
                {metrics.map((metric) => {
                    const IconComponent = metric.icon;
                    const href = metric.routeName && routeExists(metric.routeName)
                        ? route(metric.routeName)
                        : null;
                    const card = (
                        <MetricCard
                            chartType={metric.chartType}
                            helper={metric.helper}
                            icon={<IconComponent aria-hidden="true" className="h-5 w-5" />}
                            label={metric.label}
                            tone={metric.tone}
                            trend={trends[metric.key]}
                            value={formatMetricValue(metric, summary)}
                        />
                    );

                    if (!href) {
                        return <div key={metric.key}>{card}</div>;
                    }

                    return (
                        <Link
                            className="block transition hover:-translate-y-0.5 hover:opacity-95"
                            href={href}
                            key={metric.key}
                        >
                            {card}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function OpsMetricCards({ summary }) {
    return (
        <section className="space-y-3">
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Operasional
                </p>
                <p className="mt-1 font-body-sm text-xs text-gray-500">
                    Aktivitas tim, pemeriksaan, dan ringkasan katalog.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {opsMetrics.map((metric) => {
                    const href = metric.routeName && routeExists(metric.routeName)
                        ? route(metric.routeName)
                        : null;

                    return (
                        <AdminCard className="flex items-center justify-between p-4" key={metric.key}>
                            <div className="min-w-0">
                                <span className="font-body-lg text-2xl font-extrabold text-[#333333]">
                                    {formatNumber(summary[metric.key])}
                                </span>
                                <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                    {metric.label}
                                </p>
                                <p className="mt-0.5 font-body-sm text-xs text-gray-500">
                                    {metric.helper}
                                </p>
                            </div>
                            {href ? (
                                <Link
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                    href={href}
                                >
                                    Lihat
                                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <span className="inline-flex shrink-0 items-center rounded-full border border-[#E5E7EB] px-3 py-1.5 font-body-sm text-xs font-bold text-gray-400">
                                    Lihat
                                </span>
                            )}
                        </AdminCard>
                    );
                })}
            </div>
        </section>
    );
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

function LowStockProducts({ products = [], count = 0 }) {
    const stockHref = routeExists('admin.stock.index')
        ? route('admin.stock.index')
        : (routeExists('admin.products.index') ? route('admin.products.index') : null);

    return (
        <AdminCard className="p-5">
            <SectionHeader
                actionHref={stockHref}
                actionLabel={count > 0 ? 'Kelola stok' : null}
                eyebrow="Inventori"
                title="Produk Stok Rendah"
            />
            {count > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F08A2B]/30 bg-[#F08A2B]/10 px-4 py-3">
                    <div>
                        <p className="font-body-sm text-sm font-bold text-[#B57A2E]">
                            {formatNumber(count)} item stok di bawah ambang
                        </p>
                        <p className="mt-0.5 font-body-sm text-xs text-[#B57A2E]/90">
                            Prioritaskan restock agar operasional tidak terganggu.
                        </p>
                    </div>
                    {stockHref && (
                        <Link
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#B57A2E] px-3 py-1.5 font-body-sm text-xs font-bold text-white transition hover:bg-[#9a6827]"
                            href={stockHref}
                        >
                            Buka stok
                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            )}
            <div className="space-y-3">
                {products.length === 0 ? (
                    <EmptyState title="Stok produk aman." description="Produk stok rendah akan muncul saat stok melewati ambang." />
                ) : (
                    products.map((stock) => (
                        <div
                            className="rounded-2xl border border-[#F08A2B]/20 bg-[#F08A2B]/10 px-4 py-3"
                            key={stock.id}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                                        {stock.product?.name ?? `Produk #${stock.product_id}`}
                                    </p>
                                    <p className="mt-1 font-body-sm text-xs text-[#B57A2E]">
                                        {stock.branch?.name} · Ambang: {formatNumber(stock.low_stock_threshold)}
                                    </p>
                                </div>
                                <StatusBadge
                                    label={`Stok ${formatNumber(stock.stock_quantity)}`}
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

function DashboardFilter({
    filters,
    branches,
    showBranchFilter,
    lockedBranchName,
    isFiltering,
    onUpdateFilter,
}) {
    const isCustom = (filters.period ?? 'month') === 'custom';
    const hasBranchesOption = showBranchFilter && branches && branches.length > 0;
    const selectedBranchName = filters.branch_id
        ? (branches.find((branch) => String(branch.id) === String(filters.branch_id))?.name ?? null)
        : null;
    const periodLabel = formatPeriodLabel(filters);

    return (
        <div className="sticky top-16 z-20 -mx-1">
            <AdminCard className="border-[#A8C5B3]/40 p-4 shadow-md shadow-[#1E4D3A]/5 sm:p-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Filter Data
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Ringkasan Operasional
                            </h2>
                            <p className="mt-1 flex flex-wrap items-center gap-2 font-body-sm text-xs text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-[#A8C5B3]/25 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                    {periodChipLabel(filters.period ?? 'month')}
                                </span>
                                <span>{periodLabel}</span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 font-bold text-[#1E4D3A]">
                                    <MapPin aria-hidden="true" className="h-3 w-3" />
                                    {lockedBranchName || selectedBranchName || 'Semua Cabang'}
                                </span>
                                {isFiltering && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-[#1E4D3A]">
                                        <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                                        Memuat...
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {periodOptions.map(([value, label]) => {
                                const active = (filters.period ?? 'month') === value;
                                return (
                                    <button
                                        key={value}
                                        className={`rounded-full px-3.5 py-2 font-body-sm text-xs font-bold transition ${
                                            active
                                                ? 'bg-[#1E4D3A] text-white shadow-sm shadow-[#1E4D3A]/20'
                                                : 'border border-[#E5E7EB] bg-white text-gray-600 hover:border-[#A8C5B3] hover:text-[#1E4D3A]'
                                        }`}
                                        onClick={() => {
                                            if (value === 'custom') {
                                                onUpdateFilter({
                                                    period: 'custom',
                                                    start_date: filters.start_date,
                                                    end_date: filters.end_date,
                                                });
                                                return;
                                            }
                                            onUpdateFilter({ period: value });
                                        }}
                                        type="button"
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {hasBranchesOption && (
                            <div className="relative flex w-full items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white py-1.5 pl-3 pr-8 shadow-sm sm:w-auto sm:min-w-[220px]">
                                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-[#333333]" />
                                <select
                                    className="min-w-0 flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-1 font-body-sm text-sm font-medium text-[#333333] focus:ring-0 [background-image:none] [-webkit-appearance:none] [-moz-appearance:none]"
                                    onChange={(event) => onUpdateFilter({ branch_id: event.target.value || null })}
                                    value={filters.branch_id || ''}
                                >
                                    <option value="">Semua Cabang</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    aria-hidden="true"
                                    className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        )}

                        {!showBranchFilter && lockedBranchName && (
                            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-3 py-1.5 font-body-sm text-sm font-bold text-[#1E4D3A]">
                                <MapPin aria-hidden="true" className="h-4 w-4" />
                                {lockedBranchName}
                            </div>
                        )}
                    </div>

                    {isCustom && (
                        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#A8C5B3]/70 bg-[#F6F7F7] p-3 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <label className="shrink-0 font-body-sm text-xs font-bold text-gray-500" htmlFor="dashboard-start-date">
                                    Dari
                                </label>
                                <input
                                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-body-sm text-sm text-[#333333] focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                    id="dashboard-start-date"
                                    onChange={(event) => onUpdateFilter({
                                        period: 'custom',
                                        start_date: event.target.value,
                                        end_date: filters.end_date,
                                    })}
                                    type="date"
                                    value={filters.start_date ?? ''}
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <label className="shrink-0 font-body-sm text-xs font-bold text-gray-500" htmlFor="dashboard-end-date">
                                    Sampai
                                </label>
                                <input
                                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-body-sm text-sm text-[#333333] focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                    id="dashboard-end-date"
                                    onChange={(event) => onUpdateFilter({
                                        period: 'custom',
                                        start_date: filters.start_date,
                                        end_date: event.target.value,
                                    })}
                                    type="date"
                                    value={filters.end_date ?? ''}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </AdminCard>
        </div>
    );
}

function AdminDashboard({
    summary = {},
    recent = {},
    lowStockProducts = [],
    lowStockCount = 0,
    trends = {},
    filters = {},
    branches = [],
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const showBranchFilter = isCentralAdmin(user) && branches && branches.length > 0;
    const lockedBranchName = isBranchAdmin(user)
        ? (adminBranchName(user, branches) || 'Cabang Aktif')
        : null;
    const [isFiltering, setIsFiltering] = useState(false);

    useEffect(() => {
        const start = router.on('start', () => setIsFiltering(true));
        const finish = router.on('finish', () => setIsFiltering(false));
        const error = router.on('error', () => setIsFiltering(false));

        return () => {
            start();
            finish();
            error();
        };
    }, []);

    function updateFilter(nextFilters) {
        const merged = { ...filterParams(filters), ...nextFilters };

        if (!showBranchFilter) {
            delete merged.branch_id;
        } else if (Object.prototype.hasOwnProperty.call(nextFilters, 'branch_id') && !nextFilters.branch_id) {
            delete merged.branch_id;
        }

        router.get(
            route('admin.dashboard.index'),
            merged,
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Dashboard Admin" />

            <div className="space-y-6">
                <AdminPageHeader title="Dashboard" />

                <DashboardFilter
                    branches={branches}
                    filters={filters}
                    isFiltering={isFiltering}
                    lockedBranchName={lockedBranchName}
                    onUpdateFilter={updateFilter}
                    showBranchFilter={showBranchFilter}
                />

                <div className={`space-y-8 transition-opacity ${isFiltering ? 'pointer-events-none opacity-60' : ''}`}>
                    <MetricSection
                        description="Performa penjualan dan layanan pada periode terpilih."
                        metrics={commerceMetrics}
                        summary={summary}
                        title="Commerce"
                        trends={trends}
                    />

                    <MetricSection
                        description="Pertumbuhan lead dan customer pada periode terpilih."
                        metrics={crmMetrics}
                        summary={summary}
                        title="CRM"
                        trends={trends}
                    />

                    <OpsMetricCards summary={summary} />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <RecentOrders orders={recent.orders ?? []} />
                        <LowStockProducts
                            count={lowStockCount || (lowStockProducts?.length ?? 0)}
                            products={lowStockProducts ?? []}
                        />
                        <RecentBookings bookings={recent.bookings ?? []} />
                        <RecentLeads leads={recent.leads ?? []} />
                        <div className="xl:col-span-2">
                            <RecentOfflineSales offlineSales={recent.offlineSales ?? []} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminDashboard;
