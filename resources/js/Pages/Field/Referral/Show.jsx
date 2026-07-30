import { Head, router } from '@inertiajs/react';
import { CalendarCheck, Copy, Link2, Receipt, Search, ShoppingBag, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import ReferralQrCode from '@/Components/ReferralQrCode';
import FieldLayout from '@/Layouts/FieldLayout';
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
    staffCode,
    trackingUrl,
    referralEnabled = true,
    metrics = {},
    registrations = { data: [], links: [] },
    orders = { data: [], links: [] },
    bookings = { data: [], links: [] },
    offlineSales = { data: [], links: [] },
    filters = {},
}) {
    const href = route('field.referral.show');

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
        <FieldLayout>
            <Head title="Referral Staff" />

            <div className="space-y-8">
                <AdminPageHeader
                    description="Bagikan link referral Anda agar customer mendaftar lewat tautan ini. Transaksi yang memakai kode Anda juga tercatat di sini."
                    eyebrow="Field Staff"
                    title="Link Referral"
                />

                {!referralEnabled && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Program referral Anda sedang dinonaktifkan oleh admin. Link tidak akan mencatat
                        pendaftaran baru.
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard helper="Klik tracking tercatat" icon="K" label="Total Klik" tone="sage" value={formatNumber(metrics.click_count)} />
                    <MetricCard helper="Customer yang mendaftar lewat link Anda" icon="D" label="Total Daftar" tone="forest" value={formatNumber(metrics.registration_count)} />
                    <MetricCard helper="Order online dengan staf referal transaksi = Anda" icon="O" label="Order" tone="orange" value={formatNumber(metrics.order_count)} />
                    <MetricCard helper="Booking dengan staf referal transaksi = Anda" icon="B" label="Booking" tone="blue" value={formatNumber(metrics.booking_count)} />
                    <MetricCard helper="Penjualan offline dengan staf referal transaksi = Anda" icon="S" label="Offline" tone="brown" value={formatNumber(metrics.offline_sale_count)} />
                </div>

                <AdminCard className="space-y-5 p-5">
                    <div>
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Kode Referral</p>
                        <p className="mt-1 font-body-lg text-xl font-extrabold tracking-wider text-[#1E4D3A]">{staffCode || '-'}</p>
                    </div>
                    <div>
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Tautan Referral</p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-sm text-[#333333]">
                                <Link2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1E4D3A]" />
                                <span className="truncate">{trackingUrl || '-'}</span>
                            </div>
                            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#163B2C]" onClick={() => copyText(trackingUrl)} type="button">
                                <Copy aria-hidden="true" className="h-4 w-4" />
                                Salin Link
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Link mengarah ke halaman daftar. Cookie referral berlaku 30 hari.</p>
                    </div>
                    <ReferralQrCode fileName={`referral-${staffCode || 'staff'}`} helper="Scan QR ini untuk membuka link referral Anda. Cocok untuk event, brosur, atau dibagikan ke customer." label="QR Code Referral" value={trackingUrl} />
                </AdminCard>

                <AdminCard className="p-0">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <UserPlus aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                            <h2 className="font-body-lg text-lg font-extrabold text-[#1E4D3A]">Pendaftaran</h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Customer dengan staf referal profil = Anda.</p>
                    </div>
                    <TableToolbar search={registrationsFilter.search} perPage={registrationsFilter.perPage} onSearchChange={registrationsFilter.setSearch} onPerPageChange={registrationsFilter.setPerPage} placeholder="Cari nama atau email..." />
                    {(registrations.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Customer yang mendaftar lewat link Anda akan tampil di sini." title="Belum ada pendaftaran" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Email</th>
                                            <th className="px-5 py-3">Waktu Daftar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB]">
                                        {registrations.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-3 font-semibold text-[#333333]">{row.name}</td>
                                                <td className="px-5 py-3 text-gray-600">{row.email}</td>
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
                        <p className="mt-1 text-xs text-gray-500">Order dengan staf referal transaksi = Anda.</p>
                    </div>
                    <TableToolbar search={ordersFilter.search} perPage={ordersFilter.perPage} onSearchChange={ordersFilter.setSearch} onPerPageChange={ordersFilter.setPerPage} placeholder="Cari no order, nama, email, WhatsApp..." />
                    {(orders.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Order online yang memakai kode referral Anda akan tampil di sini." title="Belum ada order" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">No. Order</th>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Total</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Waktu</th>
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
                        <p className="mt-1 text-xs text-gray-500">Booking dengan staf referal transaksi = Anda.</p>
                    </div>
                    <TableToolbar search={bookingsFilter.search} perPage={bookingsFilter.perPage} onSearchChange={bookingsFilter.setSearch} onPerPageChange={bookingsFilter.setPerPage} placeholder="Cari no booking, nama, WhatsApp, layanan..." />
                    {(bookings.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Booking yang memakai kode referral Anda akan tampil di sini." title="Belum ada booking" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">No. Booking</th>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Layanan</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Waktu</th>
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
                        <p className="mt-1 text-xs text-gray-500">Offline sale dengan staf referal transaksi = Anda.</p>
                    </div>
                    <TableToolbar search={offlineFilter.search} perPage={offlineFilter.perPage} onSearchChange={offlineFilter.setSearch} onPerPageChange={offlineFilter.setPerPage} placeholder="Cari no sale, nama, WhatsApp, sumber..." />
                    {(offlineSales.data?.length ?? 0) === 0 ? (
                        <div className="p-6"><EmptyState description="Penjualan offline yang memakai kode referral Anda akan tampil di sini." title="Belum ada penjualan offline" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3">No. Sale</th>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Total</th>
                                            <th className="px-5 py-3">Sumber</th>
                                            <th className="px-5 py-3">Waktu</th>
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
            </div>
        </FieldLayout>
    );
}
