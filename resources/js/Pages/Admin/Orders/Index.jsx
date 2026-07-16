import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Clock3, CreditCard, Download, Eye, PackageCheck, ReceiptText, Truck, XCircle, FileText, Search } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatNumber, formatCurrency } from '@/utils/format';

const shippingStatusMap = {
    pending_shipping_confirmation: ['Menunggu Konfirmasi Ongkir', 'orange'],
    shipping_cost_confirmed: ['Ongkir Dikonfirmasi', 'blue'],
    ready_to_ship: ['Siap Dikirim', 'sage'],
    shipped: ['Dikirim', 'blue'],
    delivered: ['Terkirim', 'forest'],
    cancelled: ['Batal', 'red'],
};

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

function ShippingBadge({ status }) {
    const mapped = shippingStatusMap[status];

    if (!mapped) {
        return <StatusBadge status={status} />;
    }

    return <StatusBadge label={mapped[0]} tone={mapped[1]} />;
}

function LifecycleCard({ label, count, tone, icon: IconComponent, isActive, onClick }) {
    const toneStyles = {
        white: 'bg-white border-[#E5E7EB]',
        yellow: 'bg-[#FDF6E3] border-[#F08A2B]/20',
        sage: 'bg-[#EAF2ED] border-[#A8C5B3]/40',
        brown: 'bg-[#F5EFE6] border-[#B57A2E]/20',
        blue: 'bg-[#E8F0FE] border-[#1F3B63]/20',
        green: 'bg-[#E6F4EA] border-[#1E4D3A]/20',
        red: 'bg-[#FCE8E8] border-[#DC2626]/20 bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23dc2626\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")]',
    };

    const iconBgStyles = {
        white: 'bg-[#F6F7F7] text-[#333333]',
        yellow: 'bg-[#F08A2B]/10 text-[#F08A2B]',
        sage: 'bg-[#A8C5B3]/20 text-[#1E4D3A]',
        brown: 'bg-[#B57A2E]/10 text-[#B57A2E]',
        blue: 'bg-[#1F3B63]/10 text-[#1F3B63]',
        green: 'bg-[#1E4D3A]/10 text-[#1E4D3A]',
        red: 'bg-[#DC2626]/10 text-[#DC2626]',
    };

    const baseBorder = isActive ? 'border-[#1E4D3A] ring-2 ring-[#1E4D3A]/20' : 'border-transparent';
    const cursorClass = 'cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200';

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl border ${baseBorder} ${cursorClass} ${toneStyles[tone]} p-4 shadow-sm flex flex-col justify-between h-full min-h-[120px]`}
        >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgStyles[tone]} mb-4`}>
                <IconComponent aria-hidden="true" className="h-4 w-4" />
            </div>
            <div>
                <span className="block font-body-lg text-2xl font-extrabold text-[#333333]">
                    {count}
                </span>
                <span className="block mt-1 font-body-sm text-xs font-bold text-gray-600">
                    {label}
                </span>
            </div>
        </div>
    );
}

function AdminOrderIndex({ orders = {}, filters = {}, metrics = {} }) {
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const currentPageOrderIds = useMemo(() => (orders.data ?? []).map((order) => order.id), [orders.data]);
    const selectedCount = selectedOrderIds.length;
    const isAllCurrentPageSelected = currentPageOrderIds.length > 0 && currentPageOrderIds.every((orderId) => selectedOrderIds.includes(orderId));
    const exportParams = selectedCount > 0 ? { order_ids: selectedOrderIds } : filters;

    const lifecycleCards = [
        { id: 'all', label: 'Total Order', count: metrics.totalOrder, tone: 'white', icon: ReceiptText },
        { id: 'pending', label: 'Waiting Confirmation', count: metrics.waitingConfirmation, tone: 'yellow', icon: Clock3 },
        { id: 'received', label: 'Received', count: metrics.received, tone: 'sage', icon: CreditCard },
        { id: 'processing', label: 'Processing', count: metrics.processing, tone: 'brown', icon: PackageCheck },
        { id: 'shipped', label: 'Shipped', count: metrics.shipped, tone: 'blue', icon: Truck },
        { id: 'completed', label: 'Selesai', count: metrics.completed, tone: 'green', icon: CheckCircle2 },
        { id: 'cancelled', label: 'Cancelled', count: metrics.cancelled, tone: 'red', icon: XCircle },
    ];

    const currentStatus = filters.status || 'all';

    const handleStatusClick = (status) => {
        router.get(
            route('admin.orders.index'),
            { ...filters, status: status === 'all' ? null : status, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleLimitChange = (e) => {
        router.get(
            route('admin.orders.index'),
            { ...filters, per_page: e.target.value, page: 1 },
            { preserveState: true, preserveScroll: true }
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
                    // description="Konfirmasi biaya pengiriman, verifikasi pembayaran, dan pantau fulfillment order website Phoenix dari satu halaman."
                    eyebrow="Commerce / Order"
                    title="Order"
                />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
                    {lifecycleCards.map((card, idx) => (
                        <LifecycleCard
                            key={idx}
                            label={card.label}
                            count={formatNumber(card.count)}
                            tone={card.tone}
                            icon={card.icon}
                            isActive={currentStatus === card.id}
                            onClick={() => handleStatusClick(card.id)}
                        />
                    ))}
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Commerce
                        </p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                            Daftar Order
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari no. order atau nama customer..."
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                defaultValue={filters.search}
                                onBlur={(e) => {
                                    router.get(route('admin.orders.index'), { ...filters, search: e.target.value }, { preserveState: true, preserveScroll: true });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.get(route('admin.orders.index'), { ...filters, search: e.target.value }, { preserveState: true, preserveScroll: true });
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                defaultValue={filters.start_date}
                                onChange={(e) => {
                                    router.get(route('admin.orders.index'), { ...filters, start_date: e.target.value }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="date"
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                defaultValue={filters.end_date}
                                onChange={(e) => {
                                    router.get(route('admin.orders.index'), { ...filters, end_date: e.target.value }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
                            <span>Tampilkan</span>
                            <select
                                value={filters.per_page || 10}
                                onChange={handleLimitChange}
                                className="rounded-xl border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>data</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F6F7F7]/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="font-body-sm text-sm font-bold text-[#333333]">
                            {selectedCount} order dipilih untuk export data pengiriman
                        </p>
                        <a
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E4D3A] px-4 py-2 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            download
                            href={route('admin.orders.export.shipping', exportParams)}
                        >
                            <Download aria-hidden="true" className="h-4 w-4" />
                            Export Shipping XLSX
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
                                        {[
                                            'Nomor Order',
                                            'Cabang',
                                            'Customer',
                                            'Status Order',
                                            'Status Pengiriman',
                                            'Status Pembayaran',
                                            'Metode Pembayaran',
                                            'Voucher',
                                            'Total',
                                            'Tanggal Dibuat',
                                            'Aksi',
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
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {order.order_number ?? `Order #${order.id}`}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                {order.branch ? (
                                                    <span className="inline-flex rounded-full bg-[#1E4D3A]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E4D3A]">
                                                        {order.branch.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {customerName(order)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <ShippingBadge status={order.shipping_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={order.payment_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {paymentMethodNama(order)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {order.voucher ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[#1E4D3A] uppercase">{order.voucher.code}</span>
                                                        <span className="text-xs text-red-600">-{formatCurrency(order.voucher_discount_amount)}</span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 flex gap-2">
                                                <Link
                                                    className="group inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                    href={route('admin.orders.show', order.id)}
                                                >
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A8C5B3]/25 transition group-hover:bg-white/15">
                                                        <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                                                    </span>
                                                    Detail
                                                </Link>
                                                <a
                                                    className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 font-body-sm text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                                                    href={route('admin.orders.invoice', order.id)}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                    title="Download Invoice PDF"
                                                >
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 transition group-hover:bg-gray-300">
                                                        <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                                                    </span>
                                                    PDF
                                                </a>
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
