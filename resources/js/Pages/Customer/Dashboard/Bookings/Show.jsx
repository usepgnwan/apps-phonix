import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, ClipboardPlus, Leaf } from 'lucide-react';

import CustomerEmptyState from '@/Components/Customer/CustomerEmptyState';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import { DetailRow } from '@/Components/Panel/FormFields';
import PanelCard from '@/Components/Panel/PanelCard';
import StatusBadge from '@/Components/Panel/StatusBadge';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency, formatDateTime, readableLabel } from '@/utils/format';

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
                            className="inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] bg-white px-4 py-2 text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
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
                    <PanelCard className="p-5">
                        <CustomerSectionHeader eyebrow="Booking" title="Ringkasan Booking" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nomor Booking">{title}</DetailRow>
                            <DetailRow label="Status"><StatusBadge status={booking.status} /></DetailRow>
                            <DetailRow label="Tipe Kunjungan"><StatusBadge status={booking.visit_type} label={readableLabel(booking.visit_type)} /></DetailRow>
                            <DetailRow label="Jadwal Diinginkan">{formatDateTime(booking.desired_schedule_at)}</DetailRow>
                            <DetailRow className="sm:col-span-2" label="Catatan Keluhan">{booking.complaint_notes || 'Belum ada catatan keluhan.'}</DetailRow>
                        </div>
                    </PanelCard>

                    <PanelCard className="p-5">
                        <CustomerSectionHeader eyebrow="Layanan" title="Detail Layanan" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Layanan">{serviceName(booking)}</DetailRow>
                            <DetailRow label="Tipe Layanan">{readableLabel(booking.service?.visit_type)}</DetailRow>
                            <DetailRow label="Harga">{formatCurrency(booking.service?.price)}</DetailRow>
                            <DetailRow label="Dibuat Pada">{formatDateTime(booking.created_at)}</DetailRow>
                            <DetailRow className="sm:col-span-2" label="Deskripsi">{booking.service?.description}</DetailRow>
                        </div>
                    </PanelCard>
                </div>

                <PanelCard className="p-5">
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
                                    <div className="rounded-3xl border border-[#E5E7EB] bg-[#F6F7F7] p-4" key={examination.id}>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <DetailRow label="Keluhan">{examination.complaint}</DetailRow>
                                            <DetailRow label="Hasil">{examination.result}</DetailRow>
                                            <DetailRow label="Ringkasan">{examination.summary}</DetailRow>
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
                                                        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3" key={recommendation.id}>
                                                            <p className="text-sm font-bold text-[#333333]">
                                                                {recommendation.product?.name ?? `Produk #${recommendation.product_id}`}
                                                            </p>
                                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                                {recommendation.notes || 'Direkomendasikan oleh tim Phoenix.'}
                                                            </p>
                                                            <p className="mt-2 text-sm font-extrabold text-[#1E4D3A]">
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
                </PanelCard>
            </div>
        </>
    );
}

CustomerBookingShow.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
