import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    ChevronDown,
    Clock3,
    CreditCard,
    Download,
    Eye,
    FileText,
    MapPin,
    PackageCheck,
    ReceiptText,
    RotateCcw,
    Search,
    Truck,
    XCircle,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import DateRangePicker from '@/Components/Admin/DateRangePicker';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatCurrency } from '@/utils/format';

const inputClassName =
    'w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-sm font-body-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]';

const filterLabelClassName =
    'mb-2 block font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400';

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

function customerName(order) {
    return order.customer_profile?.name ?? order.customer_name ?? order.user?.name ?? 'Customer';
}

function paymentMethodNama(order) {
    const method = order.payment_method;

    if (!method) {
        return order.payment_method_name ?? '-';
    }

    return [method.type, method.bank_name, method.account_holder_name].filter(Boolean).join(' / ') || '-';
}

function orderItemsList(order) {
    return order.order_items ?? order.orderItems ?? [];
}

function OrderItemsCell({ order }) {
    const items = orderItemsList(order);

    if (items.length === 0) {
        return <span className="text-xs text-gray-400">-</span>;
    }

    const visibleItems = items.slice(0, 3);
    const remainingCount = items.length - visibleItems.length;

    return (
        <div className="min-w-[180px] max-w-[260px] space-y-1">
            {visibleItems.map((item) => (
                <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 font-body-sm text-xs text-gray-700"
                >
                    <span className="line-clamp-2 font-medium text-[#333333]">
                        {item.product_name || 'Produk'}
                    </span>
                    <span className="shrink-0 rounded-full bg-[#F6F7F7] px-1.5 py-0.5 font-bold text-gray-500">
                        ×{item.quantity}
                    </span>
                </div>
            ))}
            {remainingCount > 0 && (
                <p className="font-body-sm text-[11px] font-bold text-[#1E4D3A]">
                    +{remainingCount} item lain
                </p>
            )}
        </div>
    );
}

function OrderActionButtons({ order }) {
    return (
        <div className="flex items-center gap-1.5">
            <Link
                aria-label="Lihat detail order"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E4D3A]/20 bg-[#1E4D3A]/5 text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                href={route('admin.orders.show', order.id)}
                title="Detail"
            >
                <Eye aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <a
                aria-label="Download invoice PDF"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition hover:bg-gray-100 hover:text-[#333333]"
                href={route('admin.orders.invoice', order.id)}
                rel="noopener noreferrer"
                target="_blank"
                title="Invoice PDF"
            >
                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
        </div>
    );
}

function StatusFilterChip({ label, count, icon: IconComponent, isActive, onClick }) {
    const numericCount = Number(String(count).replace(/[^\d.-]/g, '')) || 0;
    const showBadge = numericCount > 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-body-sm text-xs font-bold transition ${
                isActive
                    ? 'border-[#1E4D3A] bg-[#1E4D3A] text-white shadow-sm shadow-[#1E4D3A]/20'
                    : 'border-[#E5E7EB] bg-white text-gray-600 hover:border-[#A8C5B3] hover:text-[#1E4D3A]'
            }`}
        >
            <IconComponent aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
            {showBadge && (
                <span
                    className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white ${
                        isActive ? 'bg-red-500' : 'bg-red-500'
                    }`}
                >
                    {numericCount > 99 ? '99+' : numericCount}
                </span>
            )}
        </button>
    );
}

function buildFilterParams(filters, overrides = {}) {
    const next = {
        search: filters.search || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        status: filters.status && filters.status !== 'all' ? filters.status : undefined,
        branch_id: filters.branch_id || undefined,
        per_page: filters.per_page || undefined,
        ...overrides,
    };

    Object.keys(next).forEach((key) => {
        if (next[key] === null || next[key] === '' || next[key] === undefined) {
            delete next[key];
        }
    });

    return next;
}

function AdminOrderIndex({
    orders = {},
    filters = {},
    metrics = {},
    branches = [],
    showBranchFilter = false,
    lockedBranchName = null,
}) {
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const currentPageOrderIds = useMemo(() => (orders.data ?? []).map((order) => order.id), [orders.data]);
    const selectedCount = selectedOrderIds.length;
    const isAllCurrentPageSelected = currentPageOrderIds.length > 0 && currentPageOrderIds.every((orderId) => selectedOrderIds.includes(orderId));
    const exportParams = selectedCount > 0 ? { order_ids: selectedOrderIds } : buildFilterParams(filters);

    const lifecycleCards = [
        { id: 'all', label: 'Semua Order', count: metrics.totalOrder, icon: ReceiptText },
        { id: 'waiting_shipping_confirmation', label: 'Menunggu Ongkir', count: metrics.waitingShippingConfirmation, icon: Clock3 },
        { id: 'waiting_payment', label: 'Menunggu Bayar', count: metrics.waitingPayment, icon: Banknote },
        { id: 'received', label: 'Pembayaran Diterima', count: metrics.received, icon: CreditCard },
        { id: 'processing', label: 'Diproses', count: metrics.processing, icon: PackageCheck },
        { id: 'shipped', label: 'Dikirim', count: metrics.shipped, icon: Truck },
        { id: 'completed', label: 'Selesai', count: metrics.completed, icon: CheckCircle2 },
        { id: 'cancelled', label: 'Dibatalkan', count: metrics.cancelled, icon: XCircle },
    ];

    const currentStatus = filters.status || 'all';
    const hasBranchesOption = showBranchFilter && branches && branches.length > 0;
    const selectedBranchName = filters.branch_id
        ? (branches.find((branch) => String(branch.id) === String(filters.branch_id))?.name ?? null)
        : null;
    const selectedStatusLabel = lifecycleCards.find((card) => card.id === currentStatus)?.label;
    const hasActiveFilters = Boolean(
        filters.search ||
        filters.start_date ||
        filters.end_date ||
        (filters.status && filters.status !== 'all') ||
        (showBranchFilter && filters.branch_id) ||
        (filters.per_page && Number(filters.per_page) !== 10),
    );

    const applyFilters = (overrides = {}) => {
        router.get(
            route('admin.orders.index'),
            buildFilterParams(filters, {
                page: 1,
                search: searchValue || null,
                ...overrides,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleStatusClick = (status) => {
        applyFilters({ status: status === 'all' ? null : status });
    };

    const handleSearchSubmit = () => {
        applyFilters({ search: searchValue || null });
    };

    const handleResetFilters = () => {
        setSearchValue('');
        setSelectedOrderIds([]);
        router.get(
            route('admin.orders.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const toggleCurrentPageSelection = () => {
        setSelectedOrderIds((currentIds) => {
            if (isAllCurrentPageSelected) {
                return currentIds.filter((orderId) => !currentPageOrderIds.includes(orderId));
            }

            return [...new Set([...currentIds, ...currentPageOrderIds])];
        });
    };

    const toggleOrderSelection = (orderId) => {
        setSelectedOrderIds((currentIds) => (
            currentIds.includes(orderId)
                ? currentIds.filter((selectedOrderId) => selectedOrderId !== orderId)
                : [...currentIds, orderId]
        ));
    };

    return (
        <>
            <Head title="Admin Order" />

            <div className="space-y-8">
                <AdminPageHeader
                    eyebrow="Commerce / Order"
                    title="Order"
                    description="Konfirmasi ongkir, verifikasi pembayaran, dan pantau fulfillment order."
                />

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Commerce
                                </p>
                                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                    Daftar Order
                                </h2>
                                {(filters.status && filters.status !== 'all') || filters.start_date || filters.end_date ? (
                                    <p className="mt-1 flex flex-wrap items-center gap-2 font-body-sm text-xs text-gray-500">
                                        {filters.status && filters.status !== 'all' ? (
                                            <span className="inline-flex items-center rounded-full bg-[#1E4D3A]/10 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                                {selectedStatusLabel || filters.status}
                                            </span>
                                        ) : null}
                                        {filters.start_date || filters.end_date ? (
                                            <span className="inline-flex items-center rounded-full bg-[#A8C5B3]/25 px-2.5 py-1 font-bold text-[#1E4D3A]">
                                                {filters.start_date || '…'} — {filters.end_date || '…'}
                                            </span>
                                        ) : null}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end">
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                                    <MapPin aria-hidden="true" className="h-3 w-3" />
                                    {lockedBranchName || selectedBranchName || 'Semua Cabang'}
                                </span>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 font-body-sm text-xs font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                    >
                                        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 bg-[#F9FAFB]/70 p-5 sm:p-6">
                        <div>
                            <p className={filterLabelClassName}>Status Order</p>
                            <div className="flex flex-wrap gap-2.5">
                                {lifecycleCards.map((card) => (
                                    <StatusFilterChip
                                        key={card.id}
                                        label={card.label}
                                        count={card.count}
                                        icon={card.icon}
                                        isActive={currentStatus === card.id}
                                        onClick={() => handleStatusClick(card.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                            <div className="min-w-0">
                                <label className={filterLabelClassName} htmlFor="orders-filter-search">
                                    Pencarian
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="orders-filter-search"
                                        type="text"
                                        placeholder="Cari no. order atau nama customer..."
                                        className={`${inputClassName} pl-11 pr-4`}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onBlur={handleSearchSubmit}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchSubmit();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <label className={filterLabelClassName} htmlFor="orders-filter-branch">
                                    Cabang
                                </label>
                                {hasBranchesOption ? (
                                    <div className="relative">
                                        <MapPin
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E4D3A]"
                                        />
                                        <select
                                            id="orders-filter-branch"
                                            className={`${inputClassName} appearance-none pl-10 pr-10`}
                                            value={filters.branch_id || ''}
                                            onChange={(e) => applyFilters({ branch_id: e.target.value || null })}
                                        >
                                            <option value="">Semua Cabang</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            aria-hidden="true"
                                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                        />
                                    </div>
                                ) : lockedBranchName ? (
                                    <div className="inline-flex h-[42px] w-full items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-3.5 font-body-sm text-sm font-bold text-[#1E4D3A]">
                                        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{lockedBranchName}</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex h-[42px] w-full items-center rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3.5 font-body-sm text-sm text-gray-400">
                                        Semua Cabang
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className={filterLabelClassName}>Periode</p>
                                <DateRangePicker
                                    startDate={filters.start_date || null}
                                    endDate={filters.end_date || null}
                                    onChange={({ start_date, end_date }) =>
                                        applyFilters({
                                            start_date: start_date || null,
                                            end_date: end_date || null,
                                        })
                                    }
                                />
                            </div>

                            <div className="w-full sm:w-auto sm:justify-self-start xl:w-[7.5rem]">
                                <label className={filterLabelClassName} htmlFor="orders-filter-per-page">
                                    Tampilkan
                                </label>
                                <div className="relative w-[7.5rem]">
                                    <select
                                        id="orders-filter-per-page"
                                        value={filters.per_page || 10}
                                        onChange={(e) => applyFilters({ per_page: e.target.value })}
                                        className={`${inputClassName} appearance-none px-3 pr-8`}
                                    >
                                        <option value={10}>10 data</option>
                                        <option value={15}>15 data</option>
                                        <option value={25}>25 data</option>
                                        <option value={50}>50 data</option>
                                        <option value={100}>100 data</option>
                                    </select>
                                    <ChevronDown
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F6F7F7]/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="font-body-sm text-sm font-bold text-[#333333]">
                            {selectedCount > 0
                                ? `${selectedCount} order dipilih untuk export data pengiriman`
                                : 'Pilih order untuk export data pengiriman, atau export sesuai filter aktif.'}
                        </p>
                        <a
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E4D3A] px-4 py-2 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            download
                            href={route('admin.orders.export.shipping', exportParams)}
                        >
                            <Download aria-hidden="true" className="h-4 w-4" />
                            Export Excel
                        </a>
                    </div>

                    {!orders.data || orders.data.length === 0 ? (
                        <div className="p-5 border-t border-[#E5E7EB]">
                            <EmptyState
                                description="Data order tidak ditemukan dengan filter yang diberikan."
                                title="Data kosong."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        <th className="px-4 py-3 text-left" scope="col">
                                            <input
                                                aria-label="Pilih semua order di halaman ini"
                                                checked={isAllCurrentPageSelected}
                                                className="rounded border-gray-300 text-[#1E4D3A] focus:ring-[#1E4D3A]"
                                                onChange={toggleCurrentPageSelection}
                                                type="checkbox"
                                            />
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                            scope="col"
                                        >
                                            Aksi
                                        </th>
                                        {[
                                            'Nomor Order',
                                            'Cabang',
                                            'Customer',
                                            'Barang',
                                            'Total',
                                            'Status Order',
                                            'Metode Pembayaran',
                                            'Voucher',
                                            'Tanggal Dibuat',
                                        ].map((heading) => (
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
                                    {orders.data.map((order) => (
                                        <tr
                                            className="transition hover:bg-[#A8C5B3]/10"
                                            key={order.id}
                                        >
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <input
                                                    aria-label={`Pilih ${order.order_number ?? `Order #${order.id}`}`}
                                                    checked={selectedOrderIds.includes(order.id)}
                                                    className="rounded border-gray-300 text-[#1E4D3A] focus:ring-[#1E4D3A]"
                                                    onChange={() => toggleOrderSelection(order.id)}
                                                    type="checkbox"
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <OrderActionButtons order={order} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {order.order_number ?? `Order #${order.id}`}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                {order.branch ? (
                                                    <span className="inline-flex rounded-full bg-[#1E4D3A]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E4D3A]">
                                                        {order.branch.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-xs font-medium text-[#333333]">
                                                {customerName(order)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <OrderItemsCell order={order} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {paymentMethodNama(order)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {order.voucher ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold uppercase text-[#1E4D3A]">{order.voucher.code}</span>
                                                        <span className="text-xs text-red-600">-{formatCurrency(order.voucher_discount_amount)}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {orders.links && <div className="p-5 border-t border-[#E5E7EB]"><Pagination links={orders.links} /></div>}
                </AdminCard>
            </div>
        </>
    );
}

AdminOrderIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOrderIndex;
