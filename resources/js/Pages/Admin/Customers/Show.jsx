import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    MessageCircle,
    Package,
    Ticket,
    UserRound,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatNumber, formatCurrency, formatDateTime, readableLabel } from '@/utils/format';
import { TextField, SelectField, TextAreaField, DetailRow } from '@/Components/Admin/FormFields';

const memberStatusOptions = ['non_member', 'member'];

function customerTitle(profile) {
    return profile.name ?? profile.user?.name ?? `Customer #${profile.id}`;
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

function customerWhatsappUrl(profile) {
    const digits = normalizeWhatsappDigits(profile.whatsapp_number);

    if (!digits) {
        return null;
    }

    const name = customerTitle(profile);
    const message = `Halo ${name}, kami menghubungi Anda dari Phoenix terkait layanan/customer care.`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function MemberBadge({ status }) {
    return (
        <StatusBadge
            label={readableLabel(status)}
            tone={status === 'member' ? 'forest' : 'gray'}
        />
    );
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

function AdminCustomerShow({ customerProfile }) {
    const title = customerTitle(customerProfile);
    const orders = customerProfile.orders ?? [];
    const bookings = customerProfile.bookings ?? [];
    const voucherPenukaran = customerProfile.voucher_redemptions ?? [];
    const chatUrl = customerWhatsappUrl(customerProfile);
    const form = useForm({
        internal_notes: customerProfile.internal_notes ?? '',
        member_status: customerProfile.member_status ?? 'non_member',
        name: customerProfile.name ?? '',
        primary_address: customerProfile.primary_address ?? '',
        whatsapp_number: customerProfile.whatsapp_number ?? '',
    });

    function submitProfile(event) {
        event.preventDefault();
        form.patch(route('admin.customers.update', customerProfile.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Admin ${title}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
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
                                href={route('admin.customers.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Lihat profil customer, aktivitas order dan booking, serta perbarui status member dari data existing."
                    eyebrow="Booking & Customer / Customer"
                    title={title}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Status Member">
                        <MemberBadge status={customerProfile.member_status} />
                    </StatusPill>
                    <StatusPill label="Order">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <Package aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(customerProfile.orders_count)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Booking">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(customerProfile.bookings_count)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Voucher">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <Ticket aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(customerProfile.voucher_redemptions_count)}
                        </span>
                    </StatusPill>
                    <StatusPill label="WhatsApp">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <UserRound aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {customerProfile.whatsapp_number || '-'}
                        </span>
                    </StatusPill>
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
                            eyebrow="Profile"
                            title="Profil Customer"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{title}</DetailRow>
                            <DetailRow label="Status Member">
                                <MemberBadge status={customerProfile.member_status} />
                            </DetailRow>
                            <DetailRow label="WhatsApp">{customerProfile.whatsapp_number ?? '-'}</DetailRow>
                            <DetailRow label="Email User">{customerProfile.user?.email ?? '-'}</DetailRow>
                            <DetailRow label="User Nama">{customerProfile.user?.name ?? '-'}</DetailRow>
                            <DetailRow label="Profile ID">#{customerProfile.id}</DetailRow>
                            <DetailRow label="Alamat Utama">{customerProfile.primary_address ?? '-'}</DetailRow>
                            <DetailRow label="Catatan Internal">{customerProfile.internal_notes || '-'}</DetailRow>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5 xl:col-span-2">
                        <SectionHeader
                            description="Field mengikuti validasi backend customer profile yang sudah ada."
                            eyebrow="Profile"
                            title="Perbarui Customer"
                        />
                        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submitProfile}>
                            <TextField
                                error={form.errors.name}
                                label="Nama"
                                name="name"
                                onChange={(event) => form.setData('name', event.target.value)}
                                value={form.data.name}
                            />
                            <TextField
                                error={form.errors.whatsapp_number}
                                label="Nomor WhatsApp"
                                name="whatsapp_number"
                                onChange={(event) => form.setData('whatsapp_number', event.target.value)}
                                value={form.data.whatsapp_number}
                            />
                            <SelectField
                                error={form.errors.member_status}
                                label="Status Member"
                                name="member_status"
                                onChange={(event) => form.setData('member_status', event.target.value)}
                                value={form.data.member_status}
                            >
                                {memberStatusOptions.map((option) => (
                                    <option key={option} value={option}>{readableLabel(option)}</option>
                                ))}
                            </SelectField>
                            <div className="sm:col-span-2">
                                <TextAreaField
                                    error={form.errors.primary_address}
                                    label="Alamat Utama"
                                    name="primary_address"
                                    onChange={(event) => form.setData('primary_address', event.target.value)}
                                    value={form.data.primary_address}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <TextAreaField
                                    error={form.errors.internal_notes}
                                    label="Catatan Internal"
                                    name="internal_notes"
                                    onChange={(event) => form.setData('internal_notes', event.target.value)}
                                    value={form.data.internal_notes}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <PrimarySubmitButton disabled={form.processing}>
                                    Simpan Customer
                                </PrimarySubmitButton>
                            </div>
                        </form>
                    </AdminCard>
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <SectionHeader eyebrow="Commerce" title="Order" description="Riwayat order terkait customer ini." />
                    </div>
                    {orders.length === 0 ? (
                        <div className="p-5">
                            <EmptyState description="Order customer akan tampil di sini setelah tersedia." title="Belum ada order." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Nomor Order', 'Status', 'Pembayaran', 'Total', 'Dibuat Pada'].map((heading) => (
                                            <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading} scope="col">{heading}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {orders.map((order) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={order.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                <Link
                                                    className="text-[#1E4D3A] underline-offset-4 hover:underline"
                                                    href={route('admin.orders.show', order.id)}
                                                >
                                                    {order.order_number ?? `Order #${order.id}`}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={order.status} /></td>
                                            <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={order.payment_status} /></td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">{formatCurrency(order.total)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{formatDateTime(order.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="overflow-hidden">
                        <div className="border-b border-[#E5E7EB] px-5 py-4">
                            <SectionHeader eyebrow="Booking" title="Booking" />
                        </div>
                        {bookings.length === 0 ? (
                            <div className="p-5">
                                <EmptyState description="Booking customer akan tampil di sini setelah tersedia." title="Belum ada booking." />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB]">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['Booking', 'Layanan', 'Jadwal', 'Status'].map((heading) => (
                                                <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading} scope="col">{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                        {bookings.map((booking) => (
                                            <tr className="transition hover:bg-[#A8C5B3]/10" key={booking.id}>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                    <Link
                                                        className="text-[#1E4D3A] underline-offset-4 hover:underline"
                                                        href={route('admin.bookings.show', booking.id)}
                                                    >
                                                        {booking.booking_number ?? `Booking #${booking.id}`}
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{serviceName(booking)}</td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{formatDateTime(booking.desired_schedule_at)}</td>
                                                <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={booking.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </AdminCard>

                    <AdminCard className="overflow-hidden">
                        <div className="border-b border-[#E5E7EB] px-5 py-4">
                            <SectionHeader eyebrow="Voucher" title="Voucher Penukaran" />
                        </div>
                        {voucherPenukaran.length === 0 ? (
                            <div className="p-5">
                                <EmptyState description="Riwayat penggunaan voucher customer akan tampil di sini." title="Belum ada redemption." />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB]">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['Voucher', 'Diskon', 'Ditukar Pada'].map((heading) => (
                                                <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading} scope="col">{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                        {voucherPenukaran.map((redemption) => (
                                            <tr className="transition hover:bg-[#A8C5B3]/10" key={redemption.id}>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                    {redemption.voucher?.name ?? redemption.voucher?.code ?? `Voucher #${redemption.voucher_id ?? '-'}`}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">{formatCurrency(redemption.discount_amount)}</td>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{formatDateTime(redemption.redeemed_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminCustomerShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminCustomerShow;
