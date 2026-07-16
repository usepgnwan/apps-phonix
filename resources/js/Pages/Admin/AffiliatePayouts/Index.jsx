import { Head, router, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import StatusBadge from '@/Components/Admin/StatusBadge';
import { TextAreaField } from '@/Components/Admin/FormFields';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency, formatDateTime, formatNumber, readableLabel } from '@/utils/format';

const STATUS_FILTERS = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
    { value: 'rejected', label: 'Rejected' },
];

function AdminAffiliatePayoutsIndex({ readyAffiliates, payouts, minimumAmount, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [processingAffiliateId, setProcessingAffiliateId] = useState(null);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const confirmForm = useForm({
        admin_notes: '',
    });

    const handleFilterChange = (newSearch, newStatus, newPerPage) => {
        router.get(
            route('admin.affiliate-payouts.index'),
            {
                search: newSearch || undefined,
                status: newStatus && newStatus !== 'all' ? newStatus : undefined,
                per_page: newPerPage,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearch = (event) => {
        setSearch(event.target.value);
        handleFilterChange(event.target.value, status, perPage);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        handleFilterChange(search, event.target.value, perPage);
    };

    const handleLimitChange = (event) => {
        setPerPage(event.target.value);
        handleFilterChange(search, status, event.target.value);
    };

    function createPayout(affiliate) {
        if (!window.confirm(`Buat pencairan untuk ${affiliate.full_name} sebesar ${formatCurrency(affiliate.approved_balance)}?`)) {
            return;
        }

        setProcessingAffiliateId(affiliate.id);
        router.post(route('admin.affiliate-payouts.store', affiliate.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessingAffiliateId(null),
        });
    }

    function openConfirmModal(payout) {
        setSelectedPayout(payout);
        confirmForm.setData('admin_notes', '');
        confirmForm.clearErrors();
        setIsConfirmModalOpen(true);
    }

    function handleConfirm(event) {
        event.preventDefault();
        if (!selectedPayout) {
            return;
        }

        confirmForm.post(route('admin.affiliate-payouts.confirm', selectedPayout.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsConfirmModalOpen(false);
                setSelectedPayout(null);
                confirmForm.reset();
            },
        });
    }

    const readyTotal = readyAffiliates.reduce((sum, row) => sum + Number(row.approved_balance || 0), 0);
    const pendingCount = payouts.data.filter((payout) => payout.status === 'pending' || payout.status === 'processing').length;

    return (
        <>
            <Head title="Admin Pencairan Affiliate" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Buat dan konfirmasi pencairan komisi affiliate yang sudah melewati minimum amount."
                    eyebrow="Affiliate / Pencairan Komisi"
                    title="Pencairan Komisi"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <MetricCard
                        helper={`Minimum pencairan ${formatCurrency(minimumAmount)}`}
                        icon="member"
                        label="Siap Cair"
                        tone="forest"
                        value={formatNumber(readyAffiliates.length)}
                    />
                    <MetricCard
                        helper="Total saldo approved yang eligible"
                        icon="revenue"
                        label="Nilai Siap Cair"
                        tone="sage"
                        value={formatCurrency(readyTotal)}
                    />
                    <MetricCard
                        helper="Payout pending/processing di halaman ini"
                        icon="menunggu"
                        label="Perlu Diproses"
                        tone="orange"
                        value={formatNumber(pendingCount)}
                    />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <h2 className="font-body-lg text-lg font-extrabold text-[#333333]">Affiliate Siap Cair</h2>
                        <p className="mt-1 font-body-sm text-xs text-gray-500">
                            Daftar affiliate aktif dengan saldo approved ≥ {formatCurrency(minimumAmount)}.
                        </p>
                    </div>
                    {readyAffiliates.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Affiliate akan muncul di sini jika saldo approved mencapai minimum pencairan."
                                title="Belum ada affiliate siap cair."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Affiliate', 'Kode', 'Rekening', 'Saldo Approved', 'Aksi'].map((heading) => (
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
                                    {readyAffiliates.map((affiliate) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={affiliate.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {affiliate.full_name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {affiliate.partner_code || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <div>{readableLabel(affiliate.payout_method, '-')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {affiliate.payout_account_number || '-'} · {affiliate.payout_account_name || '-'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(affiliate.approved_balance)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <button
                                                    className="rounded-full bg-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-white transition hover:bg-[#013625] disabled:opacity-50"
                                                    disabled={processingAffiliateId === affiliate.id}
                                                    onClick={() => createPayout(affiliate)}
                                                    type="button"
                                                >
                                                    Buat Payout
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-body-lg text-lg font-extrabold text-[#333333]">Riwayat Payout</h2>
                            <p className="mt-1 font-body-sm text-xs text-gray-500">Semua permintaan pencairan affiliate.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={handleSearch}
                                    placeholder="Cari nama atau kode..."
                                    type="text"
                                    value={search}
                                />
                            </div>
                            <select
                                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                onChange={handleStatusChange}
                                value={status}
                            >
                                {STATUS_FILTERS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <span>Tampilkan</span>
                                <select
                                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={handleLimitChange}
                                    value={perPage}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {payouts.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Riwayat payout akan tampil setelah admin membuat pencairan."
                                title="Belum ada payout."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Affiliate', 'Jumlah', 'Metode', 'Status', 'Diajukan', 'Dibayar', 'Aksi'].map((heading) => (
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
                                    {payouts.data.map((payout) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={payout.id}>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="font-body-sm text-sm font-bold text-[#333333]">
                                                    {payout.affiliate?.full_name || '-'}
                                                </div>
                                                <div className="font-body-sm text-xs text-gray-500">
                                                    {payout.affiliate?.partner_code || '-'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(payout.amount)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <div>{readableLabel(payout.payout_method, '-')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {payout.payout_account_number || '-'} · {payout.payout_account_name || '-'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={payout.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDateTime(payout.requested_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <div>{formatDateTime(payout.paid_at)}</div>
                                                <div className="text-xs text-gray-500">{payout.paid_by?.name || '-'}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                {(payout.status === 'pending' || payout.status === 'processing') ? (
                                                    <button
                                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                        onClick={() => openConfirmModal(payout)}
                                                        type="button"
                                                    >
                                                        Konfirmasi Bayar
                                                    </button>
                                                ) : (
                                                    <span className="font-body-sm text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="border-t border-[#E5E7EB] p-5">
                                <Pagination links={payouts.links} />
                            </div>
                        </div>
                    )}
                </AdminCard>
            </div>

            <Modal onClose={() => setIsConfirmModalOpen(false)} show={isConfirmModalOpen}>
                <form className="p-6" onSubmit={handleConfirm}>
                    <h2 className="mb-2 font-body-lg text-lg font-extrabold text-[#333333]">
                        Konfirmasi Pencairan
                    </h2>
                    <p className="mb-4 font-body-sm text-sm text-gray-600">
                        Tandai payout <strong>{selectedPayout?.affiliate?.full_name}</strong> sebesar{' '}
                        <strong>{formatCurrency(selectedPayout?.amount)}</strong> sebagai sudah ditransfer.
                    </p>
                    <TextAreaField
                        error={confirmForm.errors.admin_notes}
                        label="Catatan Admin (opsional)"
                        name="admin_notes"
                        onChange={(event) => confirmForm.setData('admin_notes', event.target.value)}
                        value={confirmForm.data.admin_notes}
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            onClick={() => setIsConfirmModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-[#013625] disabled:opacity-50"
                            disabled={confirmForm.processing}
                            type="submit"
                        >
                            Konfirmasi Sudah Bayar
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

AdminAffiliatePayoutsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminAffiliatePayoutsIndex;
