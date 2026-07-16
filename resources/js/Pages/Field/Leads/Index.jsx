import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Pagination from '@/Components/Admin/Pagination';
import StatusBadge from '@/Components/Admin/StatusBadge';
import FieldLayout from '@/Layouts/FieldLayout';
import { formatDateTime, formatNumber, relationName } from '@/utils/format';

export default function FieldLeadsIndex({ leads = {}, leadStatuses = [], filters = {} }) {
    const items = leads.data ?? [];
    const [search, setSearch] = useState(filters?.search || '');
    const openCount = items.filter(
        (lead) => !['purchased', 'not_interested'].includes(lead.follow_up_status),
    ).length;
    const totalCount = leads.total ?? items.length;

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearch(value);
        router.get(
            route('field.leads.index'),
            { search: value || undefined },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <FieldLayout>
            <Head title="Lead Lapangan" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('field.dashboard.index')}
                        >
                            Dashboard
                        </Link>
                    )}
                    description="Daftar lead yang ditugaskan ke akun field staff Anda."
                    eyebrow="Field Staff / Lead"
                    title="Lead Lapangan"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard
                        helper="Total hasil filter / penugasan"
                        icon="L"
                        label="Total Lead"
                        tone="forest"
                        value={formatNumber(totalCount)}
                    />
                    <MetricCard
                        helper="Status masih terbuka di halaman ini"
                        icon="O"
                        label="Terbuka"
                        tone="sage"
                        value={formatNumber(openCount)}
                    />
                    <MetricCard
                        helper="Pilihan status follow-up"
                        icon="S"
                        label="Status"
                        tone="blue"
                        value={formatNumber(leadStatuses.length)}
                    />
                </div>

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                onChange={handleSearch}
                                placeholder="Cari nama atau WhatsApp..."
                                type="text"
                                value={search}
                            />
                        </div>
                        <p className="font-body-sm text-xs text-gray-500">
                            {formatNumber(totalCount)} lead ditemukan
                        </p>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description={
                                    search
                                        ? 'Coba ubah kata kunci pencarian.'
                                        : 'Lead yang ditugaskan akan tampil di sini.'
                                }
                                title="Belum ada lead."
                            />
                        </div>
                    ) : (
                        <div className="space-y-5 p-5">
                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                {items.map((lead) => (
                                    <div
                                        className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
                                        key={lead.id}
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                    {relationName(lead.lead_source)}
                                                </p>
                                                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                                    {lead.name}
                                                </h2>
                                                <p className="mt-1 font-body-sm text-sm text-gray-500">
                                                    {lead.whatsapp_number}
                                                </p>
                                            </div>
                                            <StatusBadge status={lead.follow_up_status} />
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                                    Customer
                                                </p>
                                                <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                                    {relationName(lead.customer_profile)}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                                    Event
                                                </p>
                                                <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                                    {relationName(lead.event)}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 sm:col-span-2">
                                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                                    Dibuat
                                                </p>
                                                <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                                    {formatDateTime(lead.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <Link
                                                className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                href={route('field.leads.show', lead.id)}
                                            >
                                                Detail
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination links={leads.links} preserveScroll preserveState />
                        </div>
                    )}
                </AdminCard>
            </div>
        </FieldLayout>
    );
}
