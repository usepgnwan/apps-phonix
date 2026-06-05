import { Head, Link } from '@inertiajs/react';

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

function customerName(booking) {
    return booking.customer_profile?.name ?? booking.name ?? booking.user?.name ?? 'Customer';
}

function serviceName(booking) {
    return booking.service?.name ?? `Layanan #${booking.service_id ?? '-'}`;
}

function AdminBookingIndex({ bookings = [] }) {
    const metrics = {
        totalBooking: bookings.length,
        waitingConfirmation: bookings.filter((booking) => booking.status === 'waiting_confirmation').length,
        confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
        completed: bookings.filter((booking) => booking.status === 'completed').length,
        cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
    };

    return (
        <>
            <Head title="Admin Booking" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Pantau permintaan konsultasi dan jadwal layanan Phoenix, lalu tindak lanjuti konfirmasi booking dari halaman admin."
                    eyebrow="Booking & Customer / Booking"
                    title="Booking"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard helper="Seluruh permintaan booking" icon="B" label="Total Booking" tone="forest" value={formatNumber(metrics.totalBooking)} />
                    <MetricCard helper="Menunggu konfirmasi admin" icon="W" label="Menunggu" tone="brown" value={formatNumber(metrics.waitingConfirmation)} />
                    <MetricCard helper="Jadwal sudah dikonfirmasi" icon="C" label="Dikonfirmasi" tone="blue" value={formatNumber(metrics.confirmed)} />
                    <MetricCard helper="Layanan selesai" icon="D" label="Selesai" tone="sage" value={formatNumber(metrics.completed)} />
                    <MetricCard helper="Booking dibatalkan" icon="X" label="Dibatalkan" tone="orange" value={formatNumber(metrics.cancelled)} />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Booking & Customer
                        </p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                            Daftar Booking
                        </h2>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Booking layanan dari customer akan tampil di sini setelah tersedia."
                                title="Belum ada booking."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Nomor Booking', 'Customer', 'Layanan', 'Tipe Kunjungan', 'Jadwal', 'Status', 'Layanan Harga', 'Aksi'].map((heading) => (
                                            <th
                                                className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                                key={heading}
                                                scope="col"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {bookings.map((booking) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={booking.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {booking.booking_number ?? `Booking #${booking.id}`}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {customerName(booking)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {serviceName(booking)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {readableLabel(booking.visit_type)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDateTime(booking.desired_schedule_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(booking.service?.price)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <Link
                                                    className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                    href={route('admin.bookings.show', booking.id)}
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminBookingIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminBookingIndex;
