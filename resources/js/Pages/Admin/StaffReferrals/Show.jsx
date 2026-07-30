import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, Copy, Link2, Receipt, Search, ShoppingBag, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import ReferralQrCode from '@/Components/ReferralQrCode';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format';

function copyText(value) {
    if (!value) {
        return;
    }

    if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(value);
        return;
    }

    window.prompt('Salin teks berikut:', value);
}

function statusLabel(value) {
    if (!value) {
        return '-';
    }

    return String(value).replaceAll('_', ' ');
}

function TableToolbar({ search, perPage, onSearchChange, onPerPageChange, placeholder }) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={placeholder}
                    type="text"
                    value={search}
                />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Tampilkan</span>
                <select
                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                    onChange={(event) => onPerPageChange(Number(event.target.value))}
                    value={perPage}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <span>data</span>
            </div>
        </div>
    );
}

function cleanFilters(filters) {
    const next = {};

    Object.entries(filters || {}).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
            return;
        }

        next[key] = value;
    });

    return next;
}

function useTableFilter({ searchKey, perPageKey, filters, href }) {
    const serverSearch = filters?.[searchKey] || '';
    const serverPerPage = Number(filters?.[perPageKey] || 10);
    const [search, setSearch] = useState(serverSearch);
    const [perPage, setPerPage] = useState(serverPerPage);
    const filtersRef = useRef(filters);

    filtersRef.current = filters;

    useEffect(() => {
        setSearch(serverSearch);
        setPerPage(serverPerPage);
    }, [serverSearch, serverPerPage]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const nextSearch = search.trim();
            const currentSearch = String(filtersRef.current?.[searchKey] || '').trim();
            const currentPerPage = Number(filtersRef.current?.[perPageKey] || 10);

            if (nextSearch === currentSearch && Number(perPage) === currentPerPage) {
                return;
            }

            router.get(
                href,
                cleanFilters({
                    ...filtersRef.current,
                    [searchKey]: nextSearch || undefined,
                    [perPageKey]: perPage,
                }),
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, perPage, searchKey, perPageKey, href]);

    return { search, setSearch, perPage, setPerPage };
}

export default function Show({
    staff,
    trackingUrl,
    metrics = {},
    registrations = { data: [], links: [] },
    orders = { data: [], links: [] },
    bookings = { data: [], links: [] },
    offlineSales = { data: [], links: [] },
    recentClicks = [],
    filters = {},
}) {
    const href = route('admin.staff-referrals.show', staff.id);

    const registrationsFilter = useTableFilter({
        searchKey: 'registrations_search',
        perPageKey: 'registrations_per_page',
        filters,
        href,
    });
    const ordersFilter = useTableFilter({
        searchKey: 'orders_search',
        perPageKey: 'orders_per_page',
        filters,
        href,
    });
    const bookingsFilter = useTableFilter({
        searchKey: 'bookings_search',
        perPageKey: 'bookings_per_page',
        filters,
        href,
    });
    const offlineFilter = useTableFilter({
        searchKey: 'offline_search',
        perPageKey: 'offline_per_page',
        filters,
        href,
    });

    return (
        <AdminLayout>
            <Head title={`Referral — ${staff.name}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#F6F7F7]"
                            href={route('admin.staff-referrals.index')}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Kembali
                        </Link>
                    )}
                    description={[
                        staff.branch?.name ? `Cabang ${staff.branch.name}` : null,
                        staff.position?.name,
                        staff.team?.name ? `Tim ${staff.team.name}` : null,
                    ]
                        .filter(Boolean)
                        .join(' · ') || 'Detail performa referral staff'}
                    eyebrow="Organisasi / Referral Staff"
                    title={staff.name}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard helper="Klik tracking tercatat" icon="K" label="Total Klik" tone="sage" value={formatNumber(metrics.click_count)} />
                    <MetricCard helper="Customer dengan staf referal profil = staff ini" icon="D" label="Total Daftar" tone="forest" value={formatNumber(metrics.registration_count)} />
                    <MetricCard helper="Order online dengan staf referal transaksi = staff ini" icon="O" label="Order" tone="orange" value={formatNumber(metrics.order_count)} />
                    <MetricCard helper="Booking dengan staf referal transaksi = staff ini" icon="B" label="Booking" tone="blue" value={formatNumber(metrics.booking_count)} />
                    <MetricCard helper="Penjualan offline dengan staf referal transaksi = staff ini" icon="S" label="Offline" tone="brown" value={formatNumber(metrics.offline_sale_count)} />
                </div>

                <AdminCard className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Kode & Link Referral</p>
                            <p className="mt-1 text-xl font-extrabold tracking-wider text-[#1E4D3A]">{staff.staff_code || '-'}</p>
                            <p className="mt-1 text-xs text-gray-500">
                                Status program:{' '}
                                <span className="font-semibold text-[#333333]">{staff.staff_referral_enabled ? 'Aktif' : 'Nonaktif'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-sm text-[#333333]">
                            <Link2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1E4D3A]" />
                            <span className="truncate">{trackingUrl || '-'}</span>
                        </div>
                        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#163B2C]" onClick={() => copyText(trackingUrl)} type="button">
                            <Copy aria-hidden="true" className="h-4 w-4" />
                            Salin Link
                        </button>
                    </div>
                    <ReferralQrCode fileName={`referral-${staff.staff_code || staff.id}`} helper="QR per staff untuk cetak materi cabang atau dibagikan ke field staff." label="QR Code Referral" value={trackingUrl} />
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <UserPlus aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                            <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">Pendaftaran</h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Customer dengan staf referal profil = staff ini (first-touch saat daftar).</p>
                    </div>
                    <TableToolbar search={registrationsFilter.search} perPage={registrationsFilter.perPage} onSearchChange={registrationsFilter.setSearch} onPerPageChange={registrationsFilter.setPerPage} placeholder="Cari nama, email, WhatsApp..." />
                    {(registrations.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Belum ada customer yang mendaftar lewat link staff ini." title="Belum ada pendaftaran" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['Nama', 'Email', 'WhatsApp', 'Waktu Daftar'].map((heading) => (
                                                <th className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading}>{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {registrations.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-[#333333]">{row.customer_profile?.name || row.name}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.email}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.customer_profile?.whatsapp_number || '-'}</td>
                                                <td className="px-5 py-3 text-gray-600">{formatDateTime(row.referred_at || row.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-[#E5E7EB] p-5"><Pagination links={registrations.links} preserveScroll preserveState /></div>
                        </>
                    )}
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <ShoppingBag aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                            <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">Order Online</h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Order dengan staf referal transaksi = staff ini.</p>
                    </div>
                    <TableToolbar search={ordersFilter.search} perPage={ordersFilter.perPage} onSearchChange={ordersFilter.setSearch} onPerPageChange={ordersFilter.setPerPage} placeholder="Cari no order, nama, email, WhatsApp..." />
                    {(orders.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Order online yang memakai kode referral staff ini akan tampil di sini." title="Belum ada order" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['No. Order', 'Customer', 'Total', 'Status', 'Waktu'].map((heading) => (
                                                <th className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading}>{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {orders.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-[#333333]">{row.order_number}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.customer_name || '-'}</td>
                                                <td className="px-5 py-3 font-semibold text-[#1E4D3A]">{formatCurrency(row.total)}</td>
                                                <td className="px-5 py-3 text-gray-600 capitalize">{statusLabel(row.status)}{row.payment_status ? ` · ${statusLabel(row.payment_status)}` : ''}</td>
                                                <td className="px-5 py-3 text-gray-600">{formatDateTime(row.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-[#E5E7EB] p-5"><Pagination links={orders.links} preserveScroll preserveState /></div>
                        </>
                    )}
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <CalendarCheck aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                            <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">Booking</h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Booking dengan staf referal transaksi = staff ini.</p>
                    </div>
                    <TableToolbar search={bookingsFilter.search} perPage={bookingsFilter.perPage} onSearchChange={bookingsFilter.setSearch} onPerPageChange={bookingsFilter.setPerPage} placeholder="Cari no booking, nama, WhatsApp, layanan..." />
                    {(bookings.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Booking yang memakai kode referral staff ini akan tampil di sini." title="Belum ada booking" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['No. Booking', 'Customer', 'Layanan', 'Status', 'Waktu'].map((heading) => (
                                                <th className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading}>{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {bookings.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-[#333333]">{row.booking_number}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.name || '-'}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.service?.name || '-'}</td>
                                                <td className="px-5 py-3 text-gray-600 capitalize">{statusLabel(row.status)}</td>
                                                <td className="px-5 py-3 text-gray-600">{formatDateTime(row.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-[#E5E7EB] p-5"><Pagination links={bookings.links} preserveScroll preserveState /></div>
                        </>
                    )}
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <Receipt aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                            <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">Penjualan Offline</h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Offline sale dengan staf referal transaksi = staff ini.</p>
                    </div>
                    <TableToolbar search={offlineFilter.search} perPage={offlineFilter.perPage} onSearchChange={offlineFilter.setSearch} onPerPageChange={offlineFilter.setPerPage} placeholder="Cari no sale, nama, WhatsApp, sumber..." />
                    {(offlineSales.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Penjualan offline yang memakai kode referral staff ini akan tampil di sini." title="Belum ada penjualan offline" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                    <thead className="bg-[#F6F7F7]">
                                        <tr>
                                            {['No. Sale', 'Customer', 'Total', 'Sumber', 'Waktu'].map((heading) => (
                                                <th className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading}>{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {offlineSales.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-[#333333]">{row.sale_number}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.customer_name || '-'}</td>
                                                <td className="px-5 py-3 font-semibold text-[#1E4D3A]">{formatCurrency(row.total)}</td>
                                                <td className="px-5 py-3 text-gray-600 capitalize">{statusLabel(row.source)}</td>
                                                <td className="px-5 py-3 text-gray-600">{formatDateTime(row.sold_at || row.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-[#E5E7EB] p-5"><Pagination links={offlineSales.links} preserveScroll preserveState /></div>
                        </>
                    )}
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">Klik Terbaru</h2>
                        <p className="mt-1 text-xs text-gray-500">20 klik tracking terakhir untuk kode staff ini.</p>
                    </div>
                    {recentClicks.length === 0 ? (
                        <div className="p-6"><EmptyState description="Belum ada klik tracking untuk kode staff ini." title="Belum ada klik" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Waktu', 'Landing URL', 'IP', 'Jadi Daftar'].map((heading) => (
                                            <th className="px-5 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading}>{heading}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {recentClicks.map((click) => (
                                        <tr key={click.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-3 text-gray-600">{formatDateTime(click.clicked_at)}</td>
                                            <td className="max-w-xs truncate px-5 py-3 text-gray-600">{click.landing_url || '-'}</td>
                                            <td className="whitespace-nowrap px-5 py-3 text-gray-600">{click.ip_address || '-'}</td>
                                            <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#333333]">{click.registered_user_id ? 'Ya' : 'Belum'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>
        </AdminLayout>
    );
}
