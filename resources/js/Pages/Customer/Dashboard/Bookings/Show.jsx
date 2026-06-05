import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, ClipboardPlus, Leaf } from 'lucide-react';

import CustomerCard from '@/Components/Customer/CustomerCard';
import CustomerDetailRow from '@/Components/Customer/CustomerDetailRow';
import CustomerEmptyState from '@/Components/Customer/CustomerEmptyState';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import CustomerStatusBadge from '@/Components/Customer/CustomerStatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(Number(value ?? 0));
}

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function readableLabel(value) {
    return String(value ?? 'Tidak diketahui')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function serviceName(booking) {
    return booking.service?.name ?? `Layanan #${booking.service_id ?? '-'}`;
}

export default function CustomerBookingShow({ booking }) {
    const title = booking.booking_number ?? `Booking #${booking.id}`;
    const examinations = booking.examinations ?? [];

    return (
        <>
            <Head title={title} />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-primary-container bg-white px-4 py-2 font-body-sm text-sm font-bold text-primary-container transition hover:bg-primary-container hover:text-white"
                            href={route('customer.dashboard.index')}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Dashboard
                        </Link>
                    )}
                    description="Pantau jadwal layanan, tipe kunjungan, catatan keluhan, dan hasil pemeriksaan yang terkait dengan booking ini."
                    eyebrow="Detail Booking"
                    icon={CalendarCheck}
                    title={title}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <CustomerCard className="p-5">
                        <CustomerSectionHeader eyebrow="Booking" title="Ringkasan Booking" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CustomerDetailRow label="Nomor Booking">{title}</CustomerDetailRow>
                            <CustomerDetailRow label="Status"><CustomerStatusBadge status={booking.status} /></CustomerDetailRow>
                            <CustomerDetailRow label="Tipe Kunjungan"><CustomerStatusBadge status={booking.visit_type} label={readableLabel(booking.visit_type)} /></CustomerDetailRow>
                            <CustomerDetailRow label="Jadwal Diinginkan">{formatDateTime(booking.desired_schedule_at)}</CustomerDetailRow>
                            <CustomerDetailRow className="sm:col-span-2" label="Catatan Keluhan">{booking.complaint_notes || 'Belum ada catatan keluhan.'}</CustomerDetailRow>
                        </div>
                    </CustomerCard>

                    <CustomerCard className="p-5">
                        <CustomerSectionHeader eyebrow="Layanan" title="Detail Layanan" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CustomerDetailRow label="Nama Layanan">{serviceName(booking)}</CustomerDetailRow>
                            <CustomerDetailRow label="Tipe Layanan">{readableLabel(booking.service?.visit_type)}</CustomerDetailRow>
                            <CustomerDetailRow label="Harga">{formatCurrency(booking.service?.price)}</CustomerDetailRow>
                            <CustomerDetailRow label="Dibuat Pada">{formatDateTime(booking.created_at)}</CustomerDetailRow>
                            <CustomerDetailRow className="sm:col-span-2" label="Deskripsi">{booking.service?.description}</CustomerDetailRow>
                        </div>
                    </CustomerCard>
                </div>

                <CustomerCard className="p-5">
                    <CustomerSectionHeader eyebrow="Pemeriksaan" title="Catatan Pemeriksaan" />
                    <div className="space-y-4">
                        {examinations.length === 0 ? (
                            <CustomerEmptyState
                                description="Jika pemeriksaan sudah dilakukan, ringkasan hasil dan rekomendasi akan tampil di sini."
                                icon={ClipboardPlus}
                                title="Belum ada pemeriksaan untuk booking ini."
                            />
                        ) : (
                            examinations.map((examination) => {
                                const recommendations = examination.product_recommendations ?? [];

                                return (
                                    <div className="rounded-3xl border border-outline-variant/80 bg-surface-container-low p-4" key={examination.id}>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <CustomerDetailRow label="Keluhan">{examination.complaint}</CustomerDetailRow>
                                            <CustomerDetailRow label="Hasil">{examination.result}</CustomerDetailRow>
                                            <CustomerDetailRow label="Ringkasan">{examination.summary}</CustomerDetailRow>
                                        </div>
                                        <div className="mt-4">
                                            <CustomerSectionHeader eyebrow="Produk" title="Rekomendasi dari Pemeriksaan" />
                                            {recommendations.length === 0 ? (
                                                <CustomerEmptyState
                                                    description="Belum ada produk yang direkomendasikan untuk pemeriksaan ini."
                                                    icon={Leaf}
                                                    title="Rekomendasi belum tersedia."
                                                />
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    {recommendations.map((recommendation) => (
                                                        <div className="rounded-2xl border border-outline-variant bg-white px-4 py-3" key={recommendation.id}>
                                                            <p className="font-body-sm text-sm font-bold text-on-surface">
                                                                {recommendation.product?.name ?? `Produk #${recommendation.product_id}`}
                                                            </p>
                                                            <p className="mt-1 font-body-sm text-xs leading-5 text-on-surface-variant">
                                                                {recommendation.notes || 'Direkomendasikan oleh tim Phoenix.'}
                                                            </p>
                                                            <p className="mt-2 font-body-sm text-sm font-extrabold text-primary-container">
                                                                {formatCurrency(recommendation.product?.price)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CustomerCard>
            </div>
        </>
    );
}

CustomerBookingShow.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
