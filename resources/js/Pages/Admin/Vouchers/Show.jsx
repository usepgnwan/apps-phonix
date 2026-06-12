import { Head, Link } from '@inertiajs/react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
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

function discountDisplay(voucher) {
    if (voucher.discount_type === 'percentage') {
        return `${formatNumber(voucher.discount_value)}%`;
    }

    return formatCurrency(voucher.discount_value);
}

function DetailRow({ children, label }) {
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

function AdminVouchersShow({ voucher }) {
    return (
        <>
            <Head title={`Detail ${voucher.code}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.vouchers.index')}
                            >
                                Kembali
                            </Link>
                            <Link
                                className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.vouchers.edit', voucher.id)}
                            >
                                Edit
                            </Link>
                            <Link
                                className="rounded-full border border-[#A8C5B3] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                href={route('admin.vouchers.redemptions.index', voucher.id)}
                            >
                                Penukaran
                            </Link>
                            <AdminDeleteButton
                                className="rounded-full border border-red-200 px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                description="Voucher akan dihapus dari admin dan tidak bisa digunakan untuk order baru."
                                itemName={voucher.code}
                                routeName="admin.vouchers.destroy"
                                routeParams={voucher.id}
                                title="Hapus voucher?"
                            >
                                Hapus
                            </AdminDeleteButton>
                        </div>
                    )}
                    description="Detail field voucher, status publish, periode berlaku, dan aktivitas penggunaan."
                    eyebrow="Commerce / Voucher"
                    title={voucher.code}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        helper="Nilai diskon voucher"
                        icon="D"
                        label="Diskon"
                        tone="forest"
                        value={discountDisplay(voucher)}
                    />
                    <MetricCard
                        helper="Minimum transaksi"
                        icon="M"
                        label="Minimum"
                        tone="sage"
                        value={voucher.minimum_purchase ? formatCurrency(voucher.minimum_purchase) : '-'}
                    />
                    <MetricCard
                        helper="Order yang memakai voucher"
                        icon="O"
                        label="Order"
                        tone="blue"
                        value={formatNumber(voucher.orders_count)}
                    />
                    <MetricCard
                        helper="Total penukaran"
                        icon="R"
                        label="Penukaran"
                        tone="brown"
                        value={formatNumber(voucher.voucher_redemptions_count)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Kode">{voucher.code}</DetailRow>
                            <DetailRow label="Nama">{voucher.name}</DetailRow>
                            <DetailRow label="Deskripsi">{voucher.description || '-'}</DetailRow>
                            <DetailRow label="Tipe Diskon">{voucher.discount_type}</DetailRow>
                            <DetailRow label="Nilai Diskon">{discountDisplay(voucher)}</DetailRow>
                            <DetailRow label="Minimum Pembelian">
                                {voucher.minimum_purchase ? formatCurrency(voucher.minimum_purchase) : '-'}
                            </DetailRow>
                            <DetailRow label="Batas Penggunaan">{voucher.usage_limit ?? 'Tanpa batas'}</DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge
                                    label={voucher.is_published ? 'Dipublikasikan' : 'Draf'}
                                    tone={voucher.is_published ? 'forest' : 'gray'}
                                />
                            </DetailRow>
                        </div>
                    </AdminCard>
                    <AdminCard className="p-5">
                        <div className="space-y-3">
                            <DetailRow label="Mulai Berlaku">{formatDateTime(voucher.starts_at)}</DetailRow>
                            <DetailRow label="Berakhir Pada">{formatDateTime(voucher.ends_at)}</DetailRow>
                            <DetailRow label="Periode Berlaku">
                                {formatDateTime(voucher.starts_at)} - {formatDateTime(voucher.ends_at)}
                            </DetailRow>
                            <DetailRow label="Jumlah Order">{formatNumber(voucher.orders_count)}</DetailRow>
                            <DetailRow label="Jumlah Penukaran">{formatNumber(voucher.voucher_redemptions_count)}</DetailRow>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminVouchersShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminVouchersShow;
