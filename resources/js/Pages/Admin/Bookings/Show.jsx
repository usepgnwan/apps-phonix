import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    ArrowLeft,
    CalendarClock,
    MapPin,
    MessageCircle,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { readableLabel, formatCurrency, formatDateTime, formatDateTimeInput } from '@/utils/format';
import { TextField, SelectField, TextAreaField, DetailRow } from '@/Components/Admin/FormFields';

const statusLabelMap = {
    waiting_confirmation: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const actionLabelMap = {
    waiting_confirmation: 'Kembalikan Menunggu',
    confirmed: 'Konfirmasi Booking',
    completed: 'Tandai Selesai',
    cancelled: 'Batalkan Booking',
};

const statusNextOptions = {
    waiting_confirmation: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

function statusLabel(value) {
    if (!value) {
        return '-';
    }

    return statusLabelMap[value] ?? readableLabel(value);
}

function actionLabel(value) {
    return actionLabelMap[value] ?? statusLabel(value);
}

function customerName(booking) {
    return booking.customer_profile?.name ?? booking.name ?? booking.user?.name ?? 'Customer';
}

function customerWhatsappNumber(booking) {
    return booking.customer_profile?.whatsapp_number ?? booking.whatsapp_number ?? null;
}

function serviceName(booking) {
    return booking.service?.name ?? `Layanan #${booking.service_id ?? '-'}`;
}

function normalizeWhatsappDigits(value) {
    if (!value) {
        return null;
    }

    let digits = String(value).replace(/\D+/g, '');

    if (!digits) {
        return null;
    }

    if (digits.startsWith('0')) {
        digits = `62${digits.slice(1)}`;
    } else if (!digits.startsWith('62')) {
        digits = `62${digits}`;
    }

    return digits;
}

function customerWhatsappUrl(booking) {
    const digits = normalizeWhatsappDigits(customerWhatsappNumber(booking));

    if (!digits) {
        return null;
    }

    const name = customerName(booking);
    const bookingNumber = booking.booking_number ?? `Booking #${booking.id}`;
    const schedule = formatDateTime(booking.desired_schedule_at);
    const service = serviceName(booking);
    const message = `Halo ${name}, terkait booking ${bookingNumber} untuk layanan ${service}${schedule && schedule !== '-' ? ` pada ${schedule}` : ''} di Phoenix.`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function nextStepHint(booking) {
    if (booking.status === 'cancelled') {
        return 'Booking ini sudah dibatalkan. Tidak ada aksi lanjutan.';
    }

    if (booking.status === 'completed') {
        return 'Booking sudah selesai. Tidak ada aksi lanjutan.';
    }

    if (booking.status === 'waiting_confirmation') {
        return 'Langkah berikutnya: konfirmasi booking atau sesuaikan jadwal jika perlu, lalu hubungi customer via WhatsApp.';
    }

    if (booking.status === 'confirmed') {
        return 'Langkah berikutnya: pastikan jadwal sudah final, lalu tandai selesai setelah layanan diberikan.';
    }

    return 'Pantau status booking dan lengkapi aksi yang tersedia.';
}

function statusSelectOptions(booking) {
    return statusNextOptions[booking.status] ?? [];
}

function canUpdateSchedule(booking) {
    return booking.status !== 'completed' && booking.status !== 'cancelled';
}

function PrimarySubmitButton({ children, disabled }) {
    return (
        <button
            className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
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

function AdminBookingShow({ booking }) {
    const title = booking.booking_number ?? `Booking #${booking.id}`;
    const chatUrl = useMemo(() => customerWhatsappUrl(booking), [booking]);
    const statusOptions = statusSelectOptions(booking);
    const canUpdateStatus = statusOptions.length > 0;
    const scheduleEditable = canUpdateSchedule(booking);
    const stepHint = nextStepHint(booking);
    const hasAvailableActions = canUpdateStatus || scheduleEditable;

    const statusForm = useForm({
        admin_notes: booking.admin_notes ?? '',
        status: '',
    });
    const scheduleForm = useForm({
        admin_notes: booking.admin_notes ?? '',
        desired_schedule_at: formatDateTimeInput(booking.desired_schedule_at),
    });

    const primaryAction = useMemo(() => {
        if (canUpdateStatus) {
            return { href: '#aksi-admin', label: actionLabel(statusOptions[0]) };
        }

        if (scheduleEditable) {
            return { href: '#aksi-admin', label: 'Perbarui Jadwal' };
        }

        return null;
    }, [canUpdateStatus, scheduleEditable, statusOptions]);

    function submitStatus(event) {
        event.preventDefault();
        statusForm.patch(route('admin.bookings.status.update', booking.id), { preserveScroll: true });
    }

    function submitJadwal(event) {
        event.preventDefault();
        scheduleForm.patch(route('admin.bookings.schedule.update', booking.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Admin ${title}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
                            {primaryAction ? (
                                <a
                                    className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                    href={primaryAction.href}
                                >
                                    {primaryAction.label}
                                </a>
                            ) : null}
                            {chatUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 font-body-sm text-sm font-bold text-[#128C7E] transition hover:bg-[#25D366]/20"
                                    href={chatUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageCircle aria-hidden="true" className="h-4 w-4" />
                                    WhatsApp
                                </a>
                            ) : null}
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-body-sm text-sm font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                href={route('admin.bookings.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Kelola konfirmasi status dan penjadwalan booking berdasarkan request layanan dari customer."
                    eyebrow="Booking & Customer / Booking"
                    title={title}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Status Booking">
                        <StatusBadge status={booking.status} />
                    </StatusPill>
                    <StatusPill label="Tipe Kunjungan">
                        <span className="font-body-sm text-xs font-bold text-[#333333]">
                            {readableLabel(booking.visit_type)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Jadwal">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                            <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatDateTime(booking.desired_schedule_at)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Harga Layanan">
                        <span className="font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                            {formatCurrency(booking.service?.price)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Cabang">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                            {booking.branch?.name ?? 'Tanpa cabang'}
                        </span>
                    </StatusPill>
                </div>

                <div className="rounded-2xl border border-[#A8C5B3]/50 bg-[#A8C5B3]/15 px-4 py-3">
                    <p className="font-body-sm text-sm font-medium text-[#1E4D3A]">
                        {stepHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5 xl:col-span-1">
                        <SectionHeader
                            action={chatUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 font-body-sm text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366]/20"
                                    href={chatUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                                    Chat
                                </a>
                            ) : null}
                            eyebrow="Customer"
                            title="Data Customer"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{customerName(booking)}</DetailRow>
                            <DetailRow label="WhatsApp">{customerWhatsappNumber(booking) || '-'}</DetailRow>
                            <DetailRow label="Email">{booking.user?.email ?? '-'}</DetailRow>
                            <DetailRow label="Status Member">{booking.customer_profile?.member_status ?? '-'}</DetailRow>
                            <div className="col-span-1">
                                <DetailRow label="Alamat Utama">{booking.customer_profile?.primary_address ?? '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5 xl:col-span-1">
                        <SectionHeader eyebrow="Booking" title="Ringkasan Booking" />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nomor Booking">{title}</DetailRow>
                            <DetailRow label="Cabang Tujuan">
                                {booking.branch ? (
                                    <span className="font-bold text-[#1E4D3A]">{booking.branch.name}</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </DetailRow>
                            <DetailRow label="Status"><StatusBadge status={booking.status} /></DetailRow>
                            <DetailRow label="Tipe Kunjungan">{readableLabel(booking.visit_type)}</DetailRow>
                            <DetailRow label="Jadwal Diinginkan">{formatDateTime(booking.desired_schedule_at)}</DetailRow>
                            <div className="col-span-1">
                                <DetailRow label="Catatan Admin">{booking.admin_notes || '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <div className="space-y-6 scroll-mt-24 xl:col-span-1" id="aksi-admin">
                        {canUpdateStatus ? (
                            <AdminCard className="border-[#1E4D3A]/15 p-5 shadow-sm shadow-[#1E4D3A]/5">
                                <SectionHeader
                                    description="Pilih aksi status sesuai tahap booking saat ini."
                                    eyebrow="Aksi"
                                    title="Perbarui Status Booking"
                                />
                                <form className="space-y-4" onSubmit={submitStatus}>
                                    <SelectField
                                        error={statusForm.errors.status}
                                        label="Aksi Status"
                                        name="status"
                                        onChange={(event) => statusForm.setData('status', event.target.value)}
                                        value={statusForm.data.status}
                                    >
                                        <option value="">Pilih aksi status</option>
                                        {statusOptions.map((option) => (
                                            <option key={option} value={option}>{actionLabel(option)}</option>
                                        ))}
                                    </SelectField>
                                    <TextAreaField
                                        error={statusForm.errors.admin_notes}
                                        label="Catatan Admin"
                                        name="admin_notes"
                                        onChange={(event) => statusForm.setData('admin_notes', event.target.value)}
                                        value={statusForm.data.admin_notes}
                                    />
                                    <PrimarySubmitButton disabled={statusForm.processing || !statusForm.data.status}>
                                        Simpan Status
                                    </PrimarySubmitButton>
                                </form>
                            </AdminCard>
                        ) : null}

                        {scheduleEditable ? (
                            <AdminCard className="p-5">
                                <SectionHeader
                                    description="Tanggal dan jam harus berada setelah waktu saat ini sesuai validasi backend."
                                    eyebrow="Jadwal"
                                    title="Perbarui Jadwal"
                                />
                                <form className="space-y-4" onSubmit={submitJadwal}>
                                    <TextField
                                        error={scheduleForm.errors.desired_schedule_at}
                                        label="Waktu Jadwal Diinginkan"
                                        name="desired_schedule_at"
                                        onChange={(event) => scheduleForm.setData('desired_schedule_at', event.target.value)}
                                        type="datetime-local"
                                        value={scheduleForm.data.desired_schedule_at}
                                    />
                                    <TextAreaField
                                        error={scheduleForm.errors.admin_notes}
                                        label="Catatan Admin"
                                        name="admin_notes"
                                        onChange={(event) => scheduleForm.setData('admin_notes', event.target.value)}
                                        value={scheduleForm.data.admin_notes}
                                    />
                                    <PrimarySubmitButton disabled={scheduleForm.processing}>
                                        Simpan Jadwal
                                    </PrimarySubmitButton>
                                </form>
                            </AdminCard>
                        ) : null}

                        {!hasAvailableActions ? (
                            <AdminCard className="p-5">
                                <SectionHeader
                                    description="Booking sudah di tahap akhir. Anda masih bisa menghubungi customer jika diperlukan."
                                    eyebrow="Aksi"
                                    title="Tidak Ada Aksi"
                                />
                                <p className="font-body-sm text-sm text-gray-500">
                                    Status saat ini: <span className="font-bold text-[#333333]">{statusLabel(booking.status)}</span>
                                </p>
                            </AdminCard>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Layanan" title="Detail Layanan" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Layanan">{serviceName(booking)}</DetailRow>
                            <DetailRow label="Tipe Kunjungan Layanan">{readableLabel(booking.service?.visit_type)}</DetailRow>
                            <DetailRow label="Harga">{formatCurrency(booking.service?.price)}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Deskripsi">{booking.service?.description ?? '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Catatan" title="Catatan Keluhan" />
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-4 font-body-sm text-sm leading-6 text-gray-600">
                            {booking.complaint_notes || 'Customer belum menambahkan catatan keluhan.'}
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminBookingShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminBookingShow;
