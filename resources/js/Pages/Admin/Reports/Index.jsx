import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    BarChart3,
    Banknote,
    CalendarCheck,
    ChevronDown,
    ClipboardList,
    Download,
    ExternalLink,
    FileText,
    Loader2,
    MapPin,
    ReceiptText,
    Store,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import { adminBranchName, isBranchAdmin, isCentralAdmin } from '@/utils/adminScope';
import { formatNumber, formatCurrency, readableLabel } from '@/utils/format';

const TOP_N = 10;

const periodOptions = [
    ['today', 'Hari Ini'],
    ['last_7_days', '7 Hari'],
    ['month', 'Bulan Ini'],
    ['year', 'Tahun Ini'],
    ['custom', 'Custom'],
];

const reportTabs = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'crm', label: 'CRM' },
    { id: 'transaksi', label: 'Transaksi' },
    { id: 'lapangan', label: 'Lapangan' },
    { id: 'inventori', label: 'Inventori' },
];

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

function SectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
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
            {action}
        </div>
    );
}

function ReportRow({ title, meta, total, children, onClickTotal }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
            <div className="min-w-0">
                <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                    {title}
                </p>
                {meta && (
                    <p className="mt-1 truncate font-body-sm text-xs text-gray-500">
                        {meta}
                    </p>
                )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                {children}
                {onClickTotal ? (
                    <button
                        onClick={onClickTotal}
                        type="button"
                        className="flex cursor-pointer items-center gap-1 font-body-sm text-sm font-extrabold text-[#1E4D3A] underline decoration-[#1E4D3A]/30 transition hover:decoration-[#1E4D3A]"
                    >
                        {formatNumber(total)} <ExternalLink className="h-3 w-3" />
                    </button>
                ) : (
                    <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                        {formatNumber(total)}
                    </span>
                )}
            </div>
        </div>
    );
}

function ReportGroup({
    eyebrow,
    title,
    description,
    rows = [],
    emptyTitle,
    emptyDeskripsi,
    renderRow,
    headers,
    topN = TOP_N,
}) {
    const [expanded, setExpanded] = useState(false);
    const hasMore = rows.length > topN;
    const visibleRows = expanded || !hasMore ? rows : rows.slice(0, topN);

    return (
        <AdminCard className="flex h-full flex-col p-5">
            <SectionHeader
                description={description}
                eyebrow={eyebrow}
                title={title}
            />
            {headers && rows.length > 0 && (
                <div className="mb-3 flex items-center justify-between border-b border-[#E5E7EB] pb-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <div className="flex-1 text-left">{headers[0]}</div>
                    <div className="min-w-[80px] shrink-0 pr-1 text-right">{headers[1]}</div>
                </div>
            )}
            <div className="flex-1 space-y-3">
                {rows.length === 0 ? (
                    <EmptyState
                        description={emptyDeskripsi}
                        title={emptyTitle}
                    />
                ) : (
                    visibleRows.map(renderRow)
                )}
            </div>
            {hasMore && (
                <div className="mt-4 border-t border-[#E5E7EB] pt-3">
                    <button
                        className="inline-flex items-center gap-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:text-[#163B2C]"
                        onClick={() => setExpanded((value) => !value)}
                        type="button"
                    >
                        {expanded ? 'Tampilkan lebih sedikit' : `Lihat semua (${rows.length})`}
                        <ChevronDown
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 transition ${expanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            )}
        </AdminCard>
    );
}

function ChartCard({ title, description, option, empty }) {
    return (
        <AdminCard className="p-5">
            <SectionHeader description={description} eyebrow="Visual" title={title} />
            {empty ? (
                <EmptyState description="Grafik akan tampil setelah ada data pada periode ini." title="Belum ada data grafik." />
            ) : (
                <ReactECharts option={option} style={{ height: 300, width: '100%' }} />
            )}
        </AdminCard>
    );
}

function barOption(rows, labelKey = 'name') {
    return {
        grid: { bottom: 32, containLabel: true, left: 8, right: 12, top: 16 },
        tooltip: { trigger: 'axis' },
        xAxis: {
            axisLabel: { rotate: 20 },
            data: rows.map((row) => readableLabel(row[labelKey] ?? row.status ?? row.activityType)),
            type: 'category',
        },
        yAxis: { type: 'value' },
        series: [{
            data: rows.map((row) => Number(row.total ?? 0)),
            itemStyle: { color: '#1E4D3A', borderRadius: [6, 6, 0, 0] },
            type: 'bar',
        }],
    };
}

function lineOption(trends = {}) {
    const firstSeries = trends.websiteOrderRevenue ?? [];
    return {
        grid: { bottom: 28, containLabel: true, left: 8, right: 16, top: 32 },
        legend: { top: 0 },
        tooltip: { trigger: 'axis' },
        xAxis: { data: firstSeries.map((row) => row.date), type: 'category' },
        yAxis: { type: 'value' },
        series: [
            { data: (trends.websiteOrderRevenue ?? []).map((row) => row.value), name: 'Revenue Website', smooth: true, type: 'line' },
            { data: (trends.offlineSalesRevenue ?? []).map((row) => row.value), name: 'Revenue Offline', smooth: true, type: 'line' },
            { data: (trends.leads ?? []).map((row) => row.value), name: 'Lead', smooth: true, type: 'line' },
            { data: (trends.bookings ?? []).map((row) => row.value), name: 'Booking', smooth: true, type: 'line' },
            { data: (trends.orders ?? []).map((row) => row.value), name: 'Order', smooth: true, type: 'line' },
        ],
    };
}

function pieOption(rows = []) {
    return {
        legend: { bottom: 0 },
        tooltip: { trigger: 'item' },
        series: [{ data: rows, radius: ['42%', '72%'], type: 'pie' }],
    };
}

function PeriodFilterBar({ filters, isFiltering, branches = [], showBranchFilter, lockedBranchName }) {
    const isCustom = (filters.period ?? 'month') === 'custom';
    const periodLabel = formatPeriodLabel(filters);
    const hasBranchesOption = showBranchFilter && branches && branches.length > 0;
    const selectedBranchName = filters.branch_id
        ? (branches.find((branch) => String(branch.id) === String(filters.branch_id))?.name ?? null)
        : null;

    function updateFilter(nextFilters) {
        const merged = { ...filterParams(filters), ...nextFilters };

        if (!showBranchFilter) {
            delete merged.branch_id;
        } else if (Object.prototype.hasOwnProperty.call(nextFilters, 'branch_id') && !nextFilters.branch_id) {
            delete merged.branch_id;
        }

        router.get(
            route('admin.reports.index'),
            merged,
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <div className="sticky top-16 z-20 -mx-1 space-y-3">
            <AdminCard className="border-[#A8C5B3]/40 p-4 shadow-md shadow-[#1E4D3A]/5 sm:p-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Filter Periode
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Laporan Operasional
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

                        <div className="flex shrink-0 gap-2">
                            {routeExists('admin.reports.export.xlsx') && (
                                <a
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#1E4D3A] px-3 py-2 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                    download
                                    href={route('admin.reports.export.xlsx', filterParams(filters))}
                                >
                                    <Download className="h-4 w-4" />
                                    XLSX
                                </a>
                            )}
                            {routeExists('admin.reports.export.pdf') && (
                                <a
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-3 py-2 font-body-sm text-xs font-bold text-white transition hover:bg-[#163B2C]"
                                    href={route('admin.reports.export.pdf', filterParams(filters))}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    <FileText className="h-4 w-4" />
                                    PDF
                                </a>
                            )}
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
                                                updateFilter({
                                                    period: 'custom',
                                                    start_date: filters.start_date,
                                                    end_date: filters.end_date,
                                                });
                                                return;
                                            }
                                            updateFilter({ period: value });
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
                                    onChange={(event) => updateFilter({ branch_id: event.target.value || null })}
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
                                <label className="shrink-0 font-body-sm text-xs font-bold text-gray-500" htmlFor="report-start-date">
                                    Dari
                                </label>
                                <input
                                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-body-sm text-sm text-[#333333] focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                    id="report-start-date"
                                    onChange={(event) => updateFilter({
                                        period: 'custom',
                                        start_date: event.target.value,
                                        end_date: filters.end_date,
                                    })}
                                    type="date"
                                    value={filters.start_date ?? ''}
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <label className="shrink-0 font-body-sm text-xs font-bold text-gray-500" htmlFor="report-end-date">
                                    Sampai
                                </label>
                                <input
                                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-body-sm text-sm text-[#333333] focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                    id="report-end-date"
                                    onChange={(event) => updateFilter({
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

function ReportTabs({ activeTab, onChange }) {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 sm:min-w-0">
                {reportTabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            className={`whitespace-nowrap rounded-xl px-3.5 py-2 font-body-sm text-xs font-bold transition sm:px-4 sm:text-sm ${
                                active
                                    ? 'bg-[#1E4D3A] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-[#F6F7F7] hover:text-[#1E4D3A]'
                            }`}
                            onClick={() => onChange(tab.id)}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function AdminLaporan({ reports = {}, filters = {}, branches = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const showBranchFilter = isCentralAdmin(user) && branches && branches.length > 0;
    const lockedBranchName = isBranchAdmin(user)
        ? (adminBranchName(user, branches) || 'Cabang Aktif')
        : null;

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [transactionsData, setTransactionsData] = useState(null);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [activeTab, setActiveTab] = useState('ringkasan');
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

    function fetchTransactions(productId, url = null) {
        setIsLoadingTransactions(true);
        const fetchUrl = url || route('admin.reports.product_sales', productId);
        axios.get(fetchUrl, { params: filterParams(filters) })
            .then((res) => {
                setTransactionsData(res.data);
                setIsLoadingTransactions(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoadingTransactions(false);
            });
    }

    function openTransactionsModal(product) {
        setSelectedProduct(product);
        setTransactionsData(null);
        fetchTransactions(product.id);
    }

    function closeTransactionsModal() {
        setSelectedProduct(null);
        setTransactionsData(null);
    }

    const kpis = reports.kpis ?? {};
    const charts = reports.charts ?? {};
    const leadsBySource = reports.leadsBySource ?? [];
    const leadsByAssignedStaff = reports.leadsByAssignedStaff ?? [];
    const bookingsByService = reports.bookingsByService ?? [];
    const bookingsByStatus = reports.bookingsByStatus ?? [];
    const ordersByStatus = reports.ordersByStatus ?? [];
    const fieldActivitiesByType = reports.fieldActivitiesByType ?? [];
    const productRecommendationsByProduct = reports.productRecommendationsByProduct ?? [];
    const productStockAndSales = reports.productStockAndSales ?? [];

    const topLeadsBySource = useMemo(() => leadsBySource.slice(0, TOP_N), [leadsBySource]);
    const topLeadsByStaff = useMemo(() => leadsByAssignedStaff.slice(0, TOP_N), [leadsByAssignedStaff]);
    const topBookingsByService = useMemo(() => bookingsByService.slice(0, TOP_N), [bookingsByService]);
    const topOrdersByStatus = useMemo(() => ordersByStatus.slice(0, TOP_N), [ordersByStatus]);

    return (
        <>
            <Head title="Laporan Admin" />

            <div className="space-y-6">
                <AdminPageHeader title="Laporan" />

                <PeriodFilterBar
                    branches={branches}
                    filters={filters}
                    isFiltering={isFiltering}
                    lockedBranchName={lockedBranchName}
                    showBranchFilter={showBranchFilter}
                />

                <ReportTabs activeTab={activeTab} onChange={setActiveTab} />

                <div className={`relative space-y-6 transition-opacity ${isFiltering ? 'pointer-events-none opacity-60' : ''}`}>
                    {activeTab === 'ringkasan' && (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard helper="Order website terbayar" icon={<Banknote aria-hidden="true" className="h-5 w-5" />} label="Revenue Website" tone="forest" value={formatCurrency(kpis.websiteOrderRevenue)} />
                                <MetricCard helper="Penjualan offline" icon={<Store aria-hidden="true" className="h-5 w-5" />} label="Revenue Offline" tone="orange" value={formatCurrency(kpis.offlineSalesRevenue)} />
                                <MetricCard helper="Total revenue pusat" icon={<BarChart3 aria-hidden="true" className="h-5 w-5" />} label="Total Revenue" tone="sage" value={formatCurrency(kpis.totalRevenue)} />
                                <MetricCard helper="Lead masuk" icon={<UserRound aria-hidden="true" className="h-5 w-5" />} label="Lead" tone="brown" value={formatNumber(kpis.totalLeads)} />
                                <MetricCard helper="Booking layanan" icon={<CalendarCheck aria-hidden="true" className="h-5 w-5" />} label="Booking" tone="blue" value={formatNumber(kpis.totalBookings)} />
                                <MetricCard helper="Order website" icon={<ReceiptText aria-hidden="true" className="h-5 w-5" />} label="Order" tone="forest" value={formatNumber(kpis.totalOrders)} />
                                <MetricCard helper="Aktivitas tim lapangan" icon={<ClipboardList aria-hidden="true" className="h-5 w-5" />} label="Aktivitas" tone="sage" value={formatNumber(kpis.totalFieldActivities)} />
                                <MetricCard helper="Produk direkomendasikan" icon={<UsersRound aria-hidden="true" className="h-5 w-5" />} label="Rekomendasi" tone="orange" value={formatNumber(kpis.totalProductRecommendations)} />
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <ChartCard
                                    description="Tren revenue, lead, booking, dan order dalam periode terpilih."
                                    empty={(charts.trends?.websiteOrderRevenue ?? []).length === 0}
                                    option={lineOption(charts.trends)}
                                    title="Tren Performa Periode"
                                />
                                <ChartCard
                                    description="Perbandingan revenue website dan penjualan offline."
                                    empty={(charts.revenueSplit ?? []).every((row) => Number(row.value) === 0)}
                                    option={pieOption(charts.revenueSplit)}
                                    title="Revenue Online vs Offline"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'crm' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <ChartCard
                                description="Distribusi lead berdasarkan sumber (top data visual)."
                                empty={topLeadsBySource.length === 0}
                                option={barOption(topLeadsBySource)}
                                title="Lead per Sumber"
                            />
                            <ChartCard
                                description="Distribusi lead berdasarkan staff yang ditugaskan."
                                empty={topLeadsByStaff.length === 0}
                                option={barOption(topLeadsByStaff)}
                                title="Lead per Staff"
                            />
                            <ReportGroup
                                description="Sumber lead dengan kontribusi terbanyak."
                                emptyDeskripsi="Lead dari website, event, atau aktivitas tim akan tampil setelah tersedia."
                                emptyTitle="Belum ada data sumber lead."
                                eyebrow="CRM"
                                renderRow={(source) => (
                                    <ReportRow
                                        key={source.id ?? source.name}
                                        title={source.name ?? `Sumber #${source.id}`}
                                        total={source.total}
                                    />
                                )}
                                rows={leadsBySource}
                                title="Lead per Sumber"
                            />
                            <ReportGroup
                                description="Distribusi lead berdasarkan staff yang ditugaskan."
                                emptyDeskripsi="Lead yang sudah memiliki staff akan tampil di sini."
                                emptyTitle="Belum ada lead per staff."
                                eyebrow="CRM"
                                renderRow={(staff) => (
                                    <ReportRow
                                        key={staff.id ?? staff.email ?? staff.name}
                                        meta={staff.email ?? 'Email belum tersedia'}
                                        title={staff.name ?? `Staff #${staff.id}`}
                                        total={staff.total}
                                    />
                                )}
                                rows={leadsByAssignedStaff}
                                title="Lead per Staff Ditugaskan"
                            />
                        </div>
                    )}

                    {activeTab === 'transaksi' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <ChartCard
                                description="Layanan dengan booking terbanyak."
                                empty={topBookingsByService.length === 0}
                                option={barOption(topBookingsByService)}
                                title="Booking per Layanan"
                            />
                            <ChartCard
                                description="Status order website dalam periode laporan."
                                empty={topOrdersByStatus.length === 0}
                                option={barOption(topOrdersByStatus, 'status')}
                                title="Order per Status"
                            />
                            <ReportGroup
                                description="Layanan yang paling sering dipesan customer."
                                emptyDeskripsi="Booking layanan akan muncul setelah customer membuat booking."
                                emptyTitle="Belum ada booking per layanan."
                                eyebrow="Booking"
                                renderRow={(service) => (
                                    <ReportRow
                                        key={service.id ?? service.name}
                                        title={service.name ?? `Layanan #${service.id}`}
                                        total={service.total}
                                    />
                                )}
                                rows={bookingsByService}
                                title="Booking per Layanan"
                            />
                            <ReportGroup
                                description="Status booking untuk memantau alur layanan."
                                emptyDeskripsi="Status booking akan tampil saat data booking tersedia."
                                emptyTitle="Belum ada booking per status."
                                eyebrow="Booking"
                                renderRow={(bookingStatus) => (
                                    <ReportRow key={bookingStatus.status} title={readableLabel(bookingStatus.status)} total={bookingStatus.total}>
                                        <StatusBadge status={bookingStatus.status} />
                                    </ReportRow>
                                )}
                                rows={bookingsByStatus}
                                title="Booking per Status"
                            />
                            <ReportGroup
                                description="Status order website dari checkout hingga selesai."
                                emptyDeskripsi="Order website akan tampil setelah transaksi tersedia."
                                emptyTitle="Belum ada order per status."
                                eyebrow="Commerce"
                                renderRow={(orderStatus) => (
                                    <ReportRow key={orderStatus.status} title={readableLabel(orderStatus.status)} total={orderStatus.total}>
                                        <StatusBadge status={orderStatus.status} />
                                    </ReportRow>
                                )}
                                rows={ordersByStatus}
                                title="Order per Status"
                            />
                        </div>
                    )}

                    {activeTab === 'lapangan' && (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <ChartCard
                                description="Jenis aktivitas lapangan yang dicatat oleh tim."
                                empty={fieldActivitiesByType.length === 0}
                                option={barOption(fieldActivitiesByType, 'activityType')}
                                title="Aktivitas Lapangan"
                            />
                            <ReportGroup
                                description="Jenis aktivitas lapangan yang dicatat oleh tim."
                                emptyDeskripsi="Aktivitas lapangan akan muncul setelah tim mencatat kunjungan atau event."
                                emptyTitle="Belum ada aktivitas lapangan."
                                eyebrow="Lapangan"
                                renderRow={(activity) => (
                                    <ReportRow
                                        key={activity.activityType}
                                        title={readableLabel(activity.activityType)}
                                        total={activity.total}
                                    />
                                )}
                                rows={fieldActivitiesByType}
                                title="Aktivitas Lapangan per Jenis"
                            />
                        </div>
                    )}

                    {activeTab === 'inventori' && (
                        <div className="space-y-6">
                            <ReportGroup
                                description="Produk yang paling sering direkomendasikan dari pemeriksaan dan interaksi customer."
                                emptyDeskripsi="Rekomendasi produk akan tampil setelah data rekomendasi tersedia."
                                emptyTitle="Belum ada rekomendasi produk."
                                eyebrow="Katalog"
                                renderRow={(product) => (
                                    <ReportRow
                                        key={product.id ?? product.slug ?? product.name}
                                        meta={product.slug ? `Slug: ${product.slug}` : 'Slug belum tersedia'}
                                        title={product.name ?? `Produk #${product.id}`}
                                        total={product.total}
                                    />
                                )}
                                rows={productRecommendationsByProduct}
                                title="Rekomendasi Produk per Produk"
                            />
                            <ReportGroup
                                description="Informasi stok produk tersedia dan jumlah terjual pada periode terkait. Klik angka terjual untuk detail transaksi."
                                emptyDeskripsi="Stok dan penjualan produk akan tampil di sini."
                                emptyTitle="Belum ada data stok produk."
                                eyebrow="Inventaris"
                                headers={['Produk', 'Terjual']}
                                renderRow={(product) => (
                                    <ReportRow
                                        key={product.id ?? product.name}
                                        meta={product.slug ?? 'Tidak ada data'}
                                        onClickTotal={product.total > 0 ? () => openTransactionsModal(product) : undefined}
                                        title={product.name}
                                        total={product.total}
                                    />
                                )}
                                rows={productStockAndSales}
                                title="Stok & Penjualan Produk"
                            />
                        </div>
                    )}
                </div>
            </div>

            <Modal maxWidth="2xl" onClose={closeTransactionsModal} show={selectedProduct !== null}>
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-body-lg text-lg font-extrabold text-[#333333]">
                                Transaksi: {selectedProduct?.name}
                            </h2>
                            <p className="mt-1 font-body-sm text-sm text-gray-500">
                                Rincian penjualan online dan offline.
                            </p>
                        </div>
                        <button
                            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            onClick={closeTransactionsModal}
                            type="button"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
                        <div className="max-h-[50vh] overflow-x-auto overflow-y-auto">
                            <table className="w-full text-left font-body-sm text-sm">
                                <thead className="sticky top-0 z-10 bg-[#F6F7F7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-gray-600">Tanggal</th>
                                        <th className="px-4 py-3 font-bold text-gray-600">Referensi</th>
                                        <th className="px-4 py-3 font-bold text-gray-600">Sumber</th>
                                        <th className="px-4 py-3 text-right font-bold text-gray-600">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {isLoadingTransactions && !transactionsData ? (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-gray-500" colSpan="4">
                                                Memuat data transaksi...
                                            </td>
                                        </tr>
                                    ) : transactionsData?.data?.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-gray-500" colSpan="4">
                                                Tidak ada transaksi pada periode ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactionsData?.data?.map((trx, i) => (
                                            <tr key={i} className="transition hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    {new Date(trx.date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-600">
                                                    {trx.reference ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        label={trx.source}
                                                        tone={trx.source === 'Online' ? 'forest' : 'blue'}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-[#333333]">
                                                    {trx.quantity}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {transactionsData?.links?.length > 3 && (
                        <div className="mt-4 flex justify-center">
                            <div className="flex flex-wrap items-center justify-center gap-1">
                                {transactionsData.links.map((link, index) => {
                                    const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                                    if (link.url === null) {
                                        return (
                                            <div
                                                className="cursor-not-allowed rounded border border-transparent px-3 py-2 text-sm text-gray-400"
                                                dangerouslySetInnerHTML={{ __html: label }}
                                                key={index}
                                            />
                                        );
                                    }
                                    return (
                                        <button
                                            className={`rounded border px-3 py-2 text-sm transition ${
                                                link.active
                                                    ? 'border-[#1E4D3A] bg-[#1E4D3A] font-bold text-white'
                                                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                            key={index}
                                            onClick={() => fetchTransactions(selectedProduct.id, link.url)}
                                            type="button"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}

AdminLaporan.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLaporan;
