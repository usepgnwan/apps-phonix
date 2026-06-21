import { Head, router } from '@inertiajs/react';
import { BarChart3, Banknote, CalendarCheck, ClipboardList, Download, FileText, ReceiptText, Store, UserRound, UsersRound } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

const periodOptions = [
    ['today', 'Hari Ini'],
    ['last_7_days', '7 Hari Terakhir'],
    ['month', 'Bulan Ini'],
    ['year', 'Tahun Ini'],
    ['custom', 'Custom'],
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

function readableLabel(value) {
    return String(value ?? 'Tidak diketahui')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function routeExists(routeName) {
    return typeof route === 'function' && route().has(routeName);
}

function filterParams(filters) {
    return {
        period: filters.period ?? 'month',
        start_date: filters.start_date,
        end_date: filters.end_date,
    };
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

function ReportRow({ title, meta, total, children }) {
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
                <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                    {formatNumber(total)}
                </span>
            </div>
        </div>
    );
}

function ReportGroup({ eyebrow, title, description, rows = [], emptyTitle, emptyDeskripsi, renderRow }) {
    return (
        <AdminCard className="p-5">
            <SectionHeader
                description={description}
                eyebrow={eyebrow}
                title={title}
            />
            <div className="space-y-3">
                {rows.length === 0 ? (
                    <EmptyState
                        description={emptyDeskripsi}
                        title={emptyTitle}
                    />
                ) : (
                    rows.map(renderRow)
                )}
            </div>
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
        xAxis: { axisLabel: { rotate: 20 }, data: rows.map((row) => readableLabel(row[labelKey] ?? row.status ?? row.activityType)), type: 'category' },
        yAxis: { type: 'value' },
        series: [{ data: rows.map((row) => Number(row.total ?? 0)), itemStyle: { color: '#1E4D3A', borderRadius: [6, 6, 0, 0] }, type: 'bar' }],
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

function PeriodFilter({ filters }) {
    function updateFilter(nextFilters) {
        router.get(route('admin.reports.index'), { ...filterParams(filters), ...nextFilters }, { preserveScroll: true, preserveState: true });
    }

    return (
        <AdminCard className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Filter Periode</p>
                    <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">Laporan Kantor Pusat</h2>
                    <p className="mt-1 font-body-sm text-xs text-gray-500">Data bersifat global kantor pusat. Filter cabang/lokasi tidak termasuk fase ini.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                        className="rounded-xl border-[#E5E7EB] font-body-sm text-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                        onChange={(event) => updateFilter({ period: event.target.value })}
                        value={filters.period ?? 'month'}
                    >
                        {periodOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <input
                        className="rounded-xl border-[#E5E7EB] font-body-sm text-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                        onChange={(event) => updateFilter({ period: 'custom', start_date: event.target.value })}
                        type="date"
                        value={filters.start_date ?? ''}
                    />
                    <input
                        className="rounded-xl border-[#E5E7EB] font-body-sm text-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                        onChange={(event) => updateFilter({ period: 'custom', end_date: event.target.value })}
                        type="date"
                        value={filters.end_date ?? ''}
                    />
                    <div className="flex gap-2">
                        {routeExists('admin.reports.export.xlsx') && (
                            <a className="inline-flex items-center gap-2 rounded-xl border border-[#1E4D3A] px-3 py-2 font-body-sm text-xs font-bold text-[#1E4D3A] hover:bg-[#1E4D3A] hover:text-white" download href={route('admin.reports.export.xlsx', filterParams(filters))}>
                                <Download className="h-4 w-4" /> XLSX
                            </a>
                        )}
                        {routeExists('admin.reports.export.pdf') && (
                            <a className="inline-flex items-center gap-2 rounded-xl bg-[#1E4D3A] px-3 py-2 font-body-sm text-xs font-bold text-white hover:bg-[#163B2C]" href={route('admin.reports.export.pdf', filterParams(filters))} rel="noreferrer" target="_blank">
                                <FileText className="h-4 w-4" /> PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </AdminCard>
    );
}

function AdminLaporan({ reports = {}, filters = {} }) {
    const kpis = reports.kpis ?? {};
    const charts = reports.charts ?? {};
    const leadsBySource = reports.leadsBySource ?? [];
    const leadsByAssignedStaff = reports.leadsByAssignedStaff ?? [];
    const bookingsByService = reports.bookingsByService ?? [];
    const bookingsByStatus = reports.bookingsByStatus ?? [];
    const ordersByStatus = reports.ordersByStatus ?? [];
    const fieldActivitiesByType = reports.fieldActivitiesByType ?? [];
    const productRecommendationsByProduct = reports.productRecommendationsByProduct ?? [];

    return (
        <>
            <Head title="Laporan Admin" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Analisis revenue, lead, booking, order, aktivitas lapangan, dan rekomendasi produk untuk operasional kantor pusat."
                    eyebrow="Panel Admin"
                    title="Laporan"
                />

                <PeriodFilter filters={filters} />

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
                    <ChartCard description="Tren revenue, lead, booking, dan order dalam periode terpilih." empty={(charts.trends?.websiteOrderRevenue ?? []).length === 0} option={lineOption(charts.trends)} title="Tren Performa Periode" />
                    <ChartCard description="Perbandingan revenue website dan penjualan offline." empty={(charts.revenueSplit ?? []).every((row) => Number(row.value) === 0)} option={pieOption(charts.revenueSplit)} title="Revenue Online vs Offline" />
                    <ChartCard description="Distribusi lead berdasarkan sumber." empty={leadsBySource.length === 0} option={barOption(leadsBySource)} title="Lead per Sumber" />
                    <ChartCard description="Distribusi lead berdasarkan staff yang ditugaskan." empty={leadsByAssignedStaff.length === 0} option={barOption(leadsByAssignedStaff)} title="Lead per Staff" />
                    <ChartCard description="Layanan dengan booking terbanyak." empty={bookingsByService.length === 0} option={barOption(bookingsByService)} title="Booking per Layanan" />
                    <ChartCard description="Status order website dalam periode laporan." empty={ordersByStatus.length === 0} option={barOption(ordersByStatus, 'status')} title="Order per Status" />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <ReportGroup
                        description="Sumber lead dengan kontribusi terbanyak."
                        emptyDeskripsi="Lead dari website, event, atau aktivitas tim akan tampil setelah tersedia."
                        emptyTitle="Belum ada data sumber lead."
                        eyebrow="CRM"
                        renderRow={(source) => <ReportRow key={source.id ?? source.name} title={source.name ?? `Sumber #${source.id}`} total={source.total} />}
                        rows={leadsBySource}
                        title="Lead per Sumber"
                    />

                    <ReportGroup
                        description="Distribusi lead berdasarkan staff yang ditugaskan."
                        emptyDeskripsi="Lead yang sudah memiliki staff akan tampil di sini."
                        emptyTitle="Belum ada lead per staff."
                        eyebrow="CRM"
                        renderRow={(staff) => <ReportRow key={staff.id ?? staff.email ?? staff.name} meta={staff.email ?? 'Email belum tersedia'} title={staff.name ?? `Staff #${staff.id}`} total={staff.total} />}
                        rows={leadsByAssignedStaff}
                        title="Lead per Staff Ditugaskan"
                    />

                    <ReportGroup
                        description="Layanan yang paling sering dipesan customer."
                        emptyDeskripsi="Booking layanan akan muncul setelah customer membuat booking."
                        emptyTitle="Belum ada booking per layanan."
                        eyebrow="Booking"
                        renderRow={(service) => <ReportRow key={service.id ?? service.name} title={service.name ?? `Layanan #${service.id}`} total={service.total} />}
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

                    <ReportGroup
                        description="Jenis aktivitas lapangan yang dicatat oleh tim."
                        emptyDeskripsi="Aktivitas lapangan akan muncul setelah tim mencatat kunjungan atau event."
                        emptyTitle="Belum ada aktivitas lapangan."
                        eyebrow="Lapangan"
                        renderRow={(activity) => <ReportRow key={activity.activityType} title={readableLabel(activity.activityType)} total={activity.total} />}
                        rows={fieldActivitiesByType}
                        title="Aktivitas Lapangan per Jenis"
                    />

                    <div className="xl:col-span-2">
                        <ReportGroup
                            description="Produk yang paling sering direkomendasikan dari pemeriksaan dan interaksi customer."
                            emptyDeskripsi="Rekomendasi produk akan tampil setelah data rekomendasi tersedia."
                            emptyTitle="Belum ada rekomendasi produk."
                            eyebrow="Katalog"
                            renderRow={(product) => <ReportRow key={product.id ?? product.slug ?? product.name} meta={product.slug ? `Slug: ${product.slug}` : 'Slug belum tersedia'} title={product.name ?? `Produk #${product.id}`} total={product.total} />}
                            rows={productRecommendationsByProduct}
                            title="Rekomendasi Produk per Produk"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

AdminLaporan.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLaporan;
