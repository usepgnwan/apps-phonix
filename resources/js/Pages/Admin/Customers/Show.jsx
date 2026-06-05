import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

const memberStatusOptions = ['non_member', 'member'];

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

function customerTitle(profile) {
    return profile.name ?? profile.user?.name ?? `Customer #${profile.id}`;
}

function serviceName(booking) {
    return booking.service?.name ?? `Layanan #${booking.service_id ?? '-'}`;
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
            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
}

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p>;
}

function TextField({ error, label, name, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                type={type}
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

function SelectField({ children, error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <select
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                value={value ?? ''}
            >
                {children}
            </select>
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <textarea
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                rows="4"
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

function DetailRow({ label, children }) {
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">
                {children ?? '-'}
            </div>
        </div>
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

function AdminCustomerShow({ customerProfile }) {
    const title = customerTitle(customerProfile);
    const orders = customerProfile.orders ?? [];
    const bookings = customerProfile.bookings ?? [];
    const voucherPenukaran = customerProfile.voucher_redemptions ?? [];
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

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.customers.index')}
                        >
                            Kembali ke Customer
                        </Link>
                    )}
                    description="Lihat profil customer, aktivitas order dan booking, serta perbarui status member dari data existing."
                    eyebrow="Booking & Customer / Customer"
                    title={title}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Order terkait customer" icon="O" label="Order" tone="blue" value={formatNumber(customerProfile.orders_count)} />
                    <MetricCard helper="Booking terkait customer" icon="B" label="Booking" tone="orange" value={formatNumber(customerProfile.bookings_count)} />
                    <MetricCard helper="Voucher pernah dipakai" icon="V" label="Voucher Penukaran" tone="brown" value={formatNumber(customerProfile.voucher_redemptions_count)} />
                    <MetricCard helper="Status membership" icon="M" label="Status Member" tone={customerProfile.member_status === 'member' ? 'forest' : 'sage'} value={readableLabel(customerProfile.member_status)} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Profile" title="Profil Customer" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama">{title}</DetailRow>
                            <DetailRow label="Status Member"><MemberBadge status={customerProfile.member_status} /></DetailRow>
                            <DetailRow label="WhatsApp">{customerProfile.whatsapp_number ?? '-'}</DetailRow>
                            <DetailRow label="Email User">{customerProfile.user?.email ?? '-'}</DetailRow>
                            <DetailRow label="User Nama">{customerProfile.user?.name ?? '-'}</DetailRow>
                            <DetailRow label="Profile ID">#{customerProfile.id}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Alamat Utama">{customerProfile.primary_address ?? '-'}</DetailRow>
                            </div>
                            <div className="sm:col-span-2">
                                <DetailRow label="Catatan Internal">{customerProfile.internal_notes || '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Profile" title="Perbarui Customer" description="Field mengikuti validasi backend customer profile yang sudah ada." />
                        <form className="space-y-4" onSubmit={submitProfile}>
                            <TextField error={form.errors.name} label="Nama" name="name" onChange={(event) => form.setData('name', event.target.value)} value={form.data.name} />
                            <TextField error={form.errors.whatsapp_number} label="Nomor WhatsApp" name="whatsapp_number" onChange={(event) => form.setData('whatsapp_number', event.target.value)} value={form.data.whatsapp_number} />
                            <SelectField error={form.errors.member_status} label="Status Member" name="member_status" onChange={(event) => form.setData('member_status', event.target.value)} value={form.data.member_status}>
                                {memberStatusOptions.map((option) => (
                                    <option key={option} value={option}>{readableLabel(option)}</option>
                                ))}
                            </SelectField>
                            <TextAreaField error={form.errors.primary_address} label="Alamat Utama" name="primary_address" onChange={(event) => form.setData('primary_address', event.target.value)} value={form.data.primary_address} />
                            <TextAreaField error={form.errors.internal_notes} label="Catatan Internal" name="internal_notes" onChange={(event) => form.setData('internal_notes', event.target.value)} value={form.data.internal_notes} />
                            <PrimarySubmitButton disabled={form.processing}>Simpan Customer</PrimarySubmitButton>
                        </form>
                    </AdminCard>
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <SectionHeader eyebrow="Commerce" title="Order" />
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
                                        <tr key={order.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">{order.order_number ?? `Order #${order.id}`}</td>
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
                                            <tr key={booking.id}>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">{booking.booking_number ?? `Booking #${booking.id}`}</td>
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
                                            <tr key={redemption.id}>
                                                <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">{redemption.voucher?.name ?? redemption.voucher?.code ?? `Voucher #${redemption.voucher_id ?? '-'}`}</td>
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
