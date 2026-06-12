import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
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

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function discountDisplay(voucher) {
    if (voucher.discount_type === 'percentage') {
        return `${formatNumber(voucher.discount_value)}%`;
    }

    return formatCurrency(voucher.discount_value);
}

function validityWindow(voucher) {
    return `${formatDate(voucher.starts_at)} - ${formatDate(voucher.ends_at)}`;
}

function AdminVoucherIndex({ vouchers = [] }) {
    const metrics = {
        total: vouchers.length,
        published: vouchers.filter((voucher) => voucher.is_published).length,
        totalOrder: vouchers.reduce(
            (total, voucher) => total + Number(voucher.orders_count ?? 0),
            0,
        ),
        totalPenukaran: vouchers.reduce(
            (total, voucher) => total + Number(voucher.voucher_redemptions_count ?? 0),
            0,
        ),
    };

    return (
        <>
            <Head title="Admin Voucher" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('admin.vouchers.create')}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Voucher
                        </Link>
                    )}
                    description="Kelola voucher diskon, masa berlaku, batas penggunaan, dan aktivitas redemption untuk order Phoenix."
                    eyebrow="Commerce / Voucher"
                    title="Voucher"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        helper="Seluruh voucher admin"
                        icon="V"
                        label="Total Voucher"
                        tone="forest"
                        value={formatNumber(metrics.total)}
                    />
                    <MetricCard
                        helper="Voucher yang tampil untuk customer"
                        icon="P"
                        label="Dipublikasikan"
                        tone="sage"
                        value={formatNumber(metrics.published)}
                    />
                    <MetricCard
                        helper="Order yang memakai voucher"
                        icon="O"
                        label="Order"
                        tone="blue"
                        value={formatNumber(metrics.totalOrder)}
                    />
                    <MetricCard
                        helper="Total penukaran tercatat"
                        icon="R"
                        label="Penukaran"
                        tone="brown"
                        value={formatNumber(metrics.totalPenukaran)}
                    />
                </div>

                {vouchers.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState
                            description="Voucher akan tampil di sini setelah dibuat."
                            title="Belum ada voucher."
                        />
                    </AdminCard>
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {vouchers.map((voucher) => (
                            <AdminCard className="p-5" key={voucher.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            {voucher.code}
                                        </p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                            {voucher.name}
                                        </h2>
                                        <p className="mt-2 line-clamp-2 font-body-sm text-sm leading-6 text-gray-500">
                                            {voucher.description || 'Deskripsi voucher belum tersedia.'}
                                        </p>
                                    </div>
                                    <p className="shrink-0 font-body-sm text-base font-extrabold text-[#1E4D3A]">
                                        {discountDisplay(voucher)}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatusBadge
                                        label={voucher.is_published ? 'Dipublikasikan' : 'Draf'}
                                        tone={voucher.is_published ? 'forest' : 'gray'}
                                    />
                                    <StatusBadge
                                        label={voucher.discount_type === 'percentage' ? 'Persentase' : 'Nominal Tetap'}
                                        tone="sage"
                                    />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Validity
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {validityWindow(voucher)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Batas Penggunaan
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {voucher.usage_limit ?? 'Tanpa batas'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Order
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {formatNumber(voucher.orders_count)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Penukaran
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {formatNumber(voucher.voucher_redemptions_count)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('admin.vouchers.show', voucher.id)}
                                    >
                                        Detail
                                    </Link>
                                    <Link
                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        href={route('admin.vouchers.edit', voucher.id)}
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        href={route('admin.vouchers.redemptions.index', voucher.id)}
                                    >
                                        Penukaran
                                    </Link>
                                    <AdminDeleteButton
                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                        description="Voucher akan dihapus dari admin dan tidak bisa digunakan untuk order baru."
                                        itemName={voucher.code}
                                        routeName="admin.vouchers.destroy"
                                        routeParams={voucher.id}
                                        title="Hapus voucher?"
                                    >
                                        Hapus
                                    </AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AdminVoucherIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminVoucherIndex;
