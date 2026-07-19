import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    FileText,
    MapPin,
    PackageCheck,
    UserRound,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatNumber, formatDateTime } from '@/utils/format';
import { DetailRow } from '@/Components/Admin/FormFields';

function recommendations(examination) {
    return examination.product_recommendations ?? examination.productRecommendations ?? [];
}

function customerName(examination) {
    return examination.customer_profile?.name
        ?? examination.customerProfile?.name
        ?? 'Customer';
}

function staffName(examination) {
    return examination.assigned_staff?.name
        ?? examination.assignedStaff?.name
        ?? null;
}

function creatorName(examination) {
    return examination.creator?.name ?? null;
}

function serviceName(examination) {
    return examination.service_type
        ?? examination.booking?.service?.name
        ?? '-';
}

function resolveBranchName(examination) {
    return examination.booking?.branch?.name
        ?? examination.assigned_staff?.branch?.name
        ?? examination.assignedStaff?.branch?.name
        ?? examination.creator?.branch?.name
        ?? null;
}

function resultPdfUrl(path) {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `/storage/${String(path).replace(/^\/+/, '')}`;
}

function SectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className={`mb-4 ${action ? 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between' : ''}`}>
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

function StatusPill({ label, children }) {
    return (
        <div className="inline-flex flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {label}
            </span>
            <div>{children}</div>
        </div>
    );
}

function TextBlock({ label, children }) {
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <p className="mt-2 whitespace-pre-line font-body-sm text-sm leading-6 text-[#333333]">
                {children || '-'}
            </p>
        </div>
    );
}

function AdminPemeriksaanShow({ examination }) {
    const productRecommendations = recommendations(examination);
    const title = examination.customer_profile?.name || examination.customerProfile?.name
        ? `Pemeriksaan ${customerName(examination)}`
        : `Pemeriksaan #${examination.id}`;
    const pdfUrl = resultPdfUrl(examination.result_pdf_path);
    const branchName = resolveBranchName(examination);
    const bookingId = examination.booking?.id ?? examination.booking_id ?? null;
    const bookingNumber = examination.booking?.booking_number ?? null;

    return (
        <>
            <Head title={`Admin ${title}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
                            {pdfUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                    href={pdfUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <FileText aria-hidden="true" className="h-4 w-4" />
                                    Lihat PDF
                                </a>
                            ) : null}
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-body-sm text-sm font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                href={route('admin.examinations.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Detail hasil pemeriksaan, layanan, staff bertugas, dan rekomendasi produk."
                    eyebrow="Booking & Customer / Pemeriksaan"
                    title={title}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Cabang">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                            {branchName ?? 'Tanpa cabang'}
                        </span>
                    </StatusPill>
                    <StatusPill label="Staff Bertugas">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <UserRound aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {staffName(examination) ?? '-'}
                        </span>
                    </StatusPill>
                    <StatusPill label="Rekomendasi">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <PackageCheck aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(productRecommendations.length)} produk
                        </span>
                    </StatusPill>
                    <StatusPill label="Hasil PDF">
                        {pdfUrl ? (
                            <span className="font-body-sm text-xs font-bold text-[#1E4D3A]">Tersedia</span>
                        ) : (
                            <span className="font-body-sm text-xs font-bold text-gray-400">Belum ada</span>
                        )}
                    </StatusPill>
                    <StatusPill label="Dibuat">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {formatDateTime(examination.created_at)}
                        </span>
                    </StatusPill>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader
                            eyebrow="Customer"
                            title="Data Customer"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{customerName(examination)}</DetailRow>
                            <DetailRow label="WhatsApp">
                                {examination.customer_profile?.whatsapp_number
                                    ?? examination.customerProfile?.whatsapp_number
                                    ?? '-'}
                            </DetailRow>
                            <DetailRow label="Status Member">
                                {examination.customer_profile?.member_status
                                    ?? examination.customerProfile?.member_status
                                    ?? '-'}
                            </DetailRow>
                            <div className="col-span-1">
                                <DetailRow label="Alamat Utama">
                                    {examination.customer_profile?.primary_address
                                        ?? examination.customerProfile?.primary_address
                                        ?? '-'}
                                </DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Pemeriksaan" title="Ringkasan" />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Cabang">{branchName ?? '-'}</DetailRow>
                            <DetailRow label="Jenis Layanan">{serviceName(examination)}</DetailRow>
                            <DetailRow label="Nomor Booking">
                                {bookingNumber && bookingId ? (
                                    <Link
                                        className="font-bold text-[#1E4D3A] underline-offset-4 hover:underline"
                                        href={route('admin.bookings.show', bookingId)}
                                    >
                                        {bookingNumber}
                                    </Link>
                                ) : (
                                    bookingNumber || '-'
                                )}
                            </DetailRow>
                            <DetailRow label="Staff Bertugas">{staffName(examination) ?? '-'}</DetailRow>
                            <DetailRow label="Dibuat Oleh">{creatorName(examination) ?? '-'}</DetailRow>
                            <DetailRow label="Dibuat Pada">{formatDateTime(examination.created_at)}</DetailRow>
                            <DetailRow label="Hasil PDF">
                                {pdfUrl ? (
                                    <a
                                        className="inline-flex items-center gap-1.5 font-bold text-[#1E4D3A] underline-offset-4 hover:underline"
                                        href={pdfUrl}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                                        Buka PDF
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </DetailRow>
                        </div>
                    </AdminCard>
                </div>

                <AdminCard className="p-5">
                    <SectionHeader
                        description="Catatan klinis dan temuan dari pemeriksaan."
                        eyebrow="Hasil"
                        title="Keluhan & Temuan"
                    />
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <TextBlock label="Keluhan">{examination.complaint}</TextBlock>
                        <TextBlock label="Hasil">{examination.result}</TextBlock>
                        <TextBlock label="Rekomendasi Internal">{examination.internal_recommendation}</TextBlock>
                    </div>
                </AdminCard>

                <AdminCard className="p-5">
                    <SectionHeader
                        description="Produk yang direkomendasikan untuk customer berdasarkan hasil pemeriksaan."
                        eyebrow="Produk"
                        title="Rekomendasi Produk"
                    />
                    {productRecommendations.length === 0 ? (
                        <EmptyState
                            description="Pemeriksaan ini belum memiliki rekomendasi produk."
                            title="Tidak ada rekomendasi."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {productRecommendations.map((recommendation) => (
                                <div
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] p-4"
                                    key={recommendation.id}
                                >
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Produk
                                    </p>
                                    <h3 className="mt-1 font-body-lg text-base font-extrabold text-[#333333]">
                                        {recommendation.product?.name ?? `Produk #${recommendation.product_id}`}
                                    </h3>
                                    <p className="mt-3 whitespace-pre-line font-body-sm text-sm leading-6 text-gray-600">
                                        {recommendation.notes || 'Tidak ada catatan tambahan.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminPemeriksaanShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPemeriksaanShow;
