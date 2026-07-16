import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import { DetailRow, TextAreaField } from '@/Components/Admin/FormFields';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency, formatDateTime, formatNumber, readableLabel } from '@/utils/format';

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

function ActionButton({ children, className = '', disabled, onClick, type = 'button' }) {
    return (
        <button
            className={`rounded-full px-4 py-2 font-body-sm text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
}

function AdminAffiliateShow({ affiliate, metrics, commissions }) {
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
    const [processingAction, setProcessingAction] = useState(null);

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const platforms = Array.isArray(affiliate.platforms)
        ? affiliate.platforms
        : affiliate.platforms && typeof affiliate.platforms === 'object'
            ? Object.keys(affiliate.platforms)
            : [];
    const platformLinks =
        affiliate.platforms && typeof affiliate.platforms === 'object' && !Array.isArray(affiliate.platforms)
            ? affiliate.platforms
            : null;

    function postAction(action, options = {}) {
        const { data = {}, onSuccess, onFinish, ...rest } = options;

        setProcessingAction(action);
        router.post(route(`admin.affiliates.${action}`, affiliate.id), data, {
            preserveScroll: true,
            ...rest,
            onFinish: (page) => {
                setProcessingAction(null);
                onFinish?.(page);
            },
            onSuccess: (page) => {
                setIsApproveModalOpen(false);
                setIsSuspendModalOpen(false);
                setIsReactivateModalOpen(false);
                onSuccess?.(page);
            },
        });
    }

    function handleApproveConfirm() {
        postAction('approve');
    }

    function handleSuspendConfirm() {
        postAction('suspend');
    }

    function handleReactivateConfirm() {
        postAction('reactivate');
    }

    function handleReject(event) {
        event.preventDefault();
        rejectForm.post(route('admin.affiliates.reject', affiliate.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsRejectModalOpen(false);
                rejectForm.reset();
            },
        });
    }

    return (
        <>
            <Head title={`Admin Affiliate · ${affiliate.full_name}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                href={route('admin.affiliates.index')}
                            >
                                Kembali
                            </Link>
                            {(affiliate.status === 'pending' || affiliate.status === 'rejected') && (
                                <ActionButton
                                    className="bg-[#1E4D3A] text-white hover:bg-[#013625]"
                                    disabled={processingAction === 'approve'}
                                    onClick={() => setIsApproveModalOpen(true)}
                                >
                                    Setujui
                                </ActionButton>
                            )}
                            {affiliate.status === 'pending' && (
                                <ActionButton
                                    className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                    disabled={processingAction === 'reject'}
                                    onClick={() => setIsRejectModalOpen(true)}
                                >
                                    Tolak
                                </ActionButton>
                            )}
                            {affiliate.status === 'active' && (
                                <ActionButton
                                    className="border border-orange-200 bg-orange-50 text-[#B57A2E] hover:bg-orange-100"
                                    disabled={processingAction === 'suspend'}
                                    onClick={() => setIsSuspendModalOpen(true)}
                                >
                                    Suspend
                                </ActionButton>
                            )}
                            {affiliate.status === 'suspended' && (
                                <ActionButton
                                    className="bg-[#1E4D3A] text-white hover:bg-[#013625]"
                                    disabled={processingAction === 'reactivate'}
                                    onClick={() => setIsReactivateModalOpen(true)}
                                >
                                    Aktifkan Ulang
                                </ActionButton>
                            )}
                        </div>
                    )}
                    description="Review data pengajuan, status, saldo komisi, dan riwayat komisi terbaru."
                    eyebrow="Affiliate / Detail Affiliate"
                    title={affiliate.full_name}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Status saat ini" icon="member" label="Status" tone="forest" value={readableLabel(affiliate.status)} />
                    <MetricCard helper="Saldo siap cair" icon="revenue" label="Siap Cair" tone="sage" value={formatCurrency(metrics.approved_balance)} />
                    <MetricCard helper="Komisi masih hold" icon="menunggu" label="Hold" tone="orange" value={formatCurrency(metrics.hold_balance)} />
                    <MetricCard helper="Klik tracking link" icon="lead" label="Klik" tone="blue" value={formatNumber(metrics.click_count)} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Profil" title="Data Affiliate" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama Lengkap">{affiliate.full_name}</DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge status={affiliate.status} />
                            </DetailRow>
                            <DetailRow label="Email">{affiliate.email}</DetailRow>
                            <DetailRow label="WhatsApp">{affiliate.whatsapp || '-'}</DetailRow>
                            <DetailRow label="Kota">{affiliate.city || '-'}</DetailRow>
                            <DetailRow label="Usia">{affiliate.age ?? '-'}</DetailRow>
                            <DetailRow label="User Akun">{affiliate.user?.name ?? '-'}</DetailRow>
                            <DetailRow label="Email User">{affiliate.user?.email ?? '-'}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Platform & Link Media Sosial">
                                    {platformLinks ? (
                                        <ul className="space-y-1">
                                            {Object.entries(platformLinks).map(([platform, url]) => (
                                                <li key={platform}>
                                                    <span className="font-semibold capitalize">{platform}</span>
                                                    {': '}
                                                    {url ? (
                                                        <a
                                                            className="text-[#1E4D3A] underline break-all"
                                                            href={url}
                                                            rel="noreferrer"
                                                            target="_blank"
                                                        >
                                                            {url}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : platforms.length > 0 ? (
                                        <span>
                                            {platforms.join(', ')}
                                            {affiliate.media_url ? ` · ${affiliate.media_url}` : ''}
                                        </span>
                                    ) : (
                                        affiliate.media_url || '-'
                                    )}
                                </DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Kode & Payout" title="Tracking & Rekening" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Partner Code">{affiliate.partner_code || '-'}</DetailRow>
                            <DetailRow label="Coupon Code">{affiliate.coupon_code || '-'}</DetailRow>
                            <DetailRow label="Voucher">{affiliate.voucher?.code || affiliate.voucher?.name || '-'}</DetailRow>
                            <DetailRow label="Metode Payout">{readableLabel(affiliate.payout_method, '-')}</DetailRow>
                            <DetailRow label="No. Rekening">{affiliate.payout_account_number || '-'}</DetailRow>
                            <DetailRow label="Nama Rekening">{affiliate.payout_account_name || '-'}</DetailRow>
                            <DetailRow label="Diajukan">{formatDateTime(affiliate.submitted_at)}</DetailRow>
                            <DetailRow label="Disetujui">{formatDateTime(affiliate.approved_at)}</DetailRow>
                            <DetailRow label="Disetujui Oleh">{affiliate.approved_by?.name || '-'}</DetailRow>
                            <DetailRow label="Ditolak">{formatDateTime(affiliate.rejected_at)}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Alasan Penolakan">{affiliate.rejection_reason || '-'}</DetailRow>
                            </div>
                            <div className="sm:col-span-2">
                                <DetailRow label="Catatan Admin">{affiliate.admin_notes || '-'}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <SectionHeader
                            description="20 komisi terbaru milik affiliate ini."
                            eyebrow="Komisi"
                            title="Riwayat Komisi"
                        />
                    </div>
                    {commissions.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Komisi akan muncul setelah order/booking beratribusi ke affiliate ini."
                                title="Belum ada komisi."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Item', 'Sumber', 'Transaksi', 'Komisi', 'Status', 'Hold Until'].map((heading) => (
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
                                    {commissions.map((commission) => (
                                        <tr key={commission.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {commission.item_name || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {readableLabel(commission.source_type)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatCurrency(commission.transaction_amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(commission.commission_amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={commission.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDateTime(commission.hold_until)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>

            <Modal onClose={() => setIsApproveModalOpen(false)} show={isApproveModalOpen}>
                <div className="p-6">
                    <h2 className="mb-2 font-body-lg text-lg font-extrabold text-[#333333]">
                        Setujui Pengajuan Affiliate
                    </h2>
                    <p className="mb-2 font-body-sm text-sm text-gray-600">
                        Setujui pengajuan <strong>{affiliate.full_name}</strong>?
                    </p>
                    <ul className="mb-6 list-disc space-y-1 pl-5 font-body-sm text-sm text-gray-600">
                        <li>Status menjadi <strong>active</strong></li>
                        <li>Kode mitra (partner code) akan digenerate jika belum ada</li>
                        <li>Kupon affiliate & voucher tracking akan digenerate/diaktifkan</li>
                    </ul>
                    <div className="flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            disabled={processingAction === 'approve'}
                            onClick={() => setIsApproveModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-[#013625] disabled:opacity-50"
                            disabled={processingAction === 'approve'}
                            onClick={handleApproveConfirm}
                            type="button"
                        >
                            {processingAction === 'approve' ? 'Memproses...' : 'Ya, Setujui'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal onClose={() => setIsRejectModalOpen(false)} show={isRejectModalOpen}>
                <form className="p-6" onSubmit={handleReject}>
                    <h2 className="mb-2 font-body-lg text-lg font-extrabold text-[#333333]">
                        Tolak Pengajuan Affiliate
                    </h2>
                    <p className="mb-4 font-body-sm text-sm text-gray-600">
                        Berikan alasan penolakan untuk <strong>{affiliate.full_name}</strong>.
                    </p>
                    <TextAreaField
                        error={rejectForm.errors.rejection_reason}
                        label="Alasan Penolakan"
                        name="rejection_reason"
                        onChange={(event) => rejectForm.setData('rejection_reason', event.target.value)}
                        value={rejectForm.data.rejection_reason}
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            onClick={() => setIsRejectModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-red-600 px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            disabled={rejectForm.processing}
                            type="submit"
                        >
                            Tolak Pengajuan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal onClose={() => setIsSuspendModalOpen(false)} show={isSuspendModalOpen}>
                <div className="p-6">
                    <h2 className="mb-2 font-body-lg text-lg font-extrabold text-[#333333]">
                        Suspend Affiliate
                    </h2>
                    <p className="mb-6 font-body-sm text-sm text-gray-600">
                        Suspend akun mitra <strong>{affiliate.full_name}</strong>? Atribusi baru akan dihentikan; komisi yang sudah ada tetap diproses.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            disabled={processingAction === 'suspend'}
                            onClick={() => setIsSuspendModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-orange-600 px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                            disabled={processingAction === 'suspend'}
                            onClick={handleSuspendConfirm}
                            type="button"
                        >
                            {processingAction === 'suspend' ? 'Memproses...' : 'Ya, Suspend'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal onClose={() => setIsReactivateModalOpen(false)} show={isReactivateModalOpen}>
                <div className="p-6">
                    <h2 className="mb-2 font-body-lg text-lg font-extrabold text-[#333333]">
                        Aktifkan Ulang Affiliate
                    </h2>
                    <p className="mb-6 font-body-sm text-sm text-gray-600">
                        Aktifkan kembali mitra <strong>{affiliate.full_name}</strong>? Atribusi dan tracking akan berjalan lagi.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            disabled={processingAction === 'reactivate'}
                            onClick={() => setIsReactivateModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-[#013625] disabled:opacity-50"
                            disabled={processingAction === 'reactivate'}
                            onClick={handleReactivateConfirm}
                            type="button"
                        >
                            {processingAction === 'reactivate' ? 'Memproses...' : 'Ya, Aktifkan'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

AdminAffiliateShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminAffiliateShow;
