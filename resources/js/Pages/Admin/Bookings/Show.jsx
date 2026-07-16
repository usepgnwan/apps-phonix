import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { readableLabel, formatCurrency, formatDateTime, formatDateTimeInput } from '@/utils/format';
import { FieldError, TextField, SelectField, TextAreaField, DetailRow } from '@/Components/Admin/FormFields';

const statusOptions = ['waiting_confirmation', 'confirmed', 'completed', 'cancelled'];

function customerName(booking) {
    return booking.customer_profile?.name ?? booking.name ?? booking.user?.name ?? 'Customer';
}

function serviceName(booking) {
    return booking.service?.name ?? `Layanan #${booking.service_id ?? '-'}`;
}

function PrimarySubmitButton({ children, disabled }) {
    return (
        <button
            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
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

function AdminBookingShow({ booking }) {
    const title = booking.booking_number ?? `Booking #${booking.id}`;
    const statusForm = useForm({
        admin_notes: booking.admin_notes ?? '',
        status: booking.status ?? 'waiting_confirmation',
    });
    const scheduleForm = useForm({
        admin_notes: booking.admin_notes ?? '',
        desired_schedule_at: formatDateTimeInput(booking.desired_schedule_at),
    });

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

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.bookings.index')}
                        >
                            Kembali ke Booking
                        </Link>
                    )}
                    description="Kelola konfirmasi status dan penjadwalan booking berdasarkan request layanan dari customer."
                    eyebrow="Booking & Customer / Booking"
                    title={title}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Booking" title="Ringkasan Booking" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                            <div className="sm:col-span-2">
                                <DetailRow label="Catatan Admin">{booking.admin_notes || '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Customer" title="Customer" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Customer">{customerName(booking)}</DetailRow>
                            <DetailRow label="WhatsApp">{booking.customer_profile?.whatsapp_number ?? booking.whatsapp_number ?? '-'}</DetailRow>
                            <DetailRow label="Email User">{booking.user?.email ?? '-'}</DetailRow>
                            <DetailRow label="Status Member">{booking.customer_profile?.member_status ?? '-'}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Alamat Utama">{booking.customer_profile?.primary_address ?? '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Layanan" title="Detail Layanan" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Layanan">{serviceName(booking)}</DetailRow>
                            <DetailRow label="Layanan Tipe Kunjungan">{readableLabel(booking.service?.visit_type)}</DetailRow>
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Jadwal" title="Perbarui Jadwal" description="Tanggal dan jam harus berada setelah waktu saat ini sesuai validasi backend." />
                        <form className="space-y-4" onSubmit={submitJadwal}>
                            <TextField error={scheduleForm.errors.desired_schedule_at} label="Waktu Jadwal Diinginkan" name="desired_schedule_at" onChange={(event) => scheduleForm.setData('desired_schedule_at', event.target.value)} type="datetime-local" value={scheduleForm.data.desired_schedule_at} />
                            <TextAreaField error={scheduleForm.errors.admin_notes} label="Catatan Admin" name="admin_notes" onChange={(event) => scheduleForm.setData('admin_notes', event.target.value)} value={scheduleForm.data.admin_notes} />
                            <PrimarySubmitButton disabled={scheduleForm.processing}>Simpan Jadwal</PrimarySubmitButton>
                        </form>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Status" title="Perbarui Status Booking" />
                        <form className="space-y-4" onSubmit={submitStatus}>
                            <SelectField error={statusForm.errors.status} label="Status Booking" name="status" onChange={(event) => statusForm.setData('status', event.target.value)} value={statusForm.data.status}>
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>{readableLabel(option)}</option>
                                ))}
                            </SelectField>
                            <TextAreaField error={statusForm.errors.admin_notes} label="Catatan Admin" name="admin_notes" onChange={(event) => statusForm.setData('admin_notes', event.target.value)} value={statusForm.data.admin_notes} />
                            <PrimarySubmitButton disabled={statusForm.processing}>Simpan Status</PrimarySubmitButton>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminBookingShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminBookingShow;
