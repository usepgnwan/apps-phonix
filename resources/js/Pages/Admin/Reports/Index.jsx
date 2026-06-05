import { Head } from '@inertiajs/react';
import { Banknote, Store } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

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

function AdminLaporan({ reports = {} }) {
    const leadsBySumber = reports.leadsBySumber ?? [];
    const leadsByDitugaskanStaff = reports.leadsByDitugaskanStaff ?? [];
    const bookingsByLayanan = reports.bookingsByLayanan ?? [];
    const bookingsByStatus = reports.bookingsByStatus ?? [];
    const ordersByStatus = reports.ordersByStatus ?? [];
    const fieldActivitiesByTipe = reports.fieldActivitiesByTipe ?? [];
    const productRecommendationsByProduct = reports.productRecommendationsByProduct ?? [];

    return (
        <>
            <Head title="Laporan Admin" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Lihat ringkasan revenue, lead, booking, order, aktivitas lapangan, dan rekomendasi produk Phoenix dalam format hanya-baca."
                    eyebrow="Panel Admin"
                    title="Laporan"
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <MetricCard
                        helper="Total revenue dari order website"
                        icon={<Banknote aria-hidden="true" className="h-5 w-5" />}
                        label="Revenue Order Website"
                        tone="forest"
                        value={formatCurrency(reports.websiteOrderRevenue)}
                    />
                    <MetricCard
                        helper="Total revenue dari penjualan offline"
                        icon={<Store aria-hidden="true" className="h-5 w-5" />}
                        label="Revenue Penjualan Offline"
                        tone="orange"
                        value={formatCurrency(reports.offlineSalesRevenue)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                        rows={leadsBySumber}
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
                        rows={leadsByDitugaskanStaff}
                        title="Lead per Staff Ditugaskan"
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
                        rows={bookingsByLayanan}
                        title="Booking per Layanan"
                    />

                    <ReportGroup
                        description="Status booking untuk memantau alur layanan."
                        emptyDeskripsi="Status booking akan tampil saat data booking tersedia."
                        emptyTitle="Belum ada booking per status."
                        eyebrow="Booking"
                        renderRow={(bookingStatus) => (
                            <ReportRow
                                key={bookingStatus.status}
                                title={readableLabel(bookingStatus.status)}
                                total={bookingStatus.total}
                            >
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
                            <ReportRow
                                key={orderStatus.status}
                                title={readableLabel(orderStatus.status)}
                                total={orderStatus.total}
                            >
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
                        renderRow={(activity) => (
                            <ReportRow
                                key={activity.activityTipe}
                                title={readableLabel(activity.activityTipe)}
                                total={activity.total}
                            />
                        )}
                        rows={fieldActivitiesByTipe}
                        title="Aktivitas Lapangan per Jenis"
                    />

                    <div className="xl:col-span-2">
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
                    </div>
                </div>
            </div>
        </>
    );
}

AdminLaporan.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLaporan;
