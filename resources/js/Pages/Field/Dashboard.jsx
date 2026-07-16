import { Head, Link } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import FieldLayout from '@/Layouts/FieldLayout';
import { formatDateTime, formatNumber, relationName } from '@/utils/format';

export default function FieldDashboard({ summary = {}, recentLeads = [] }) {
    return (
        <FieldLayout>
            <Head title="Dashboard Lapangan" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            href={route('field.leads.index')}
                        >
                            Lihat Lead
                        </Link>
                    )}
                    description="Ringkasan pekerjaan lapangan dan lead terbaru yang menjadi tanggung jawab Anda."
                    eyebrow="Field Staff"
                    title="Dashboard Lapangan"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard
                        helper="Lead yang ditugaskan ke Anda"
                        icon="L"
                        label="Lead Ditugaskan"
                        tone="forest"
                        value={formatNumber(summary.assignedLeadsCount)}
                    />
                    <MetricCard
                        helper="Belum beli / tidak tertarik"
                        icon="O"
                        label="Lead Terbuka"
                        tone="sage"
                        value={formatNumber(summary.openLeadsCount)}
                    />
                    <MetricCard
                        helper="Aktivitas lapangan tercatat"
                        icon="A"
                        label="Aktivitas"
                        tone="blue"
                        value={formatNumber(summary.activitiesCount)}
                    />
                </div>

                <AdminCard className="p-5">
                    <div className="mb-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Lead Terbaru
                        </p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                            Prospek yang perlu ditindaklanjuti
                        </h2>
                    </div>

                    {recentLeads.length === 0 ? (
                        <EmptyState
                            description="Lead yang ditugaskan ke Anda akan tampil di sini."
                            title="Belum ada lead."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {recentLeads.map((lead) => (
                                <div
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] p-4"
                                    key={lead.id}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h3 className="font-body-lg text-base font-extrabold text-[#333333]">
                                                {lead.name}
                                            </h3>
                                            <p className="mt-1 font-body-sm text-sm text-gray-500">
                                                {lead.whatsapp_number}
                                            </p>
                                        </div>
                                        <StatusBadge status={lead.follow_up_status} />
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-2 font-body-sm text-xs text-gray-500 sm:grid-cols-2">
                                        <span>
                                            Sumber:{' '}
                                            <strong className="text-[#333333]">
                                                {relationName(lead.lead_source)}
                                            </strong>
                                        </span>
                                        <span>
                                            Customer:{' '}
                                            <strong className="text-[#333333]">
                                                {relationName(lead.customer_profile)}
                                            </strong>
                                        </span>
                                        <span>
                                            Event:{' '}
                                            <strong className="text-[#333333]">
                                                {relationName(lead.event)}
                                            </strong>
                                        </span>
                                        <span>
                                            Dibuat:{' '}
                                            <strong className="text-[#333333]">
                                                {formatDateTime(lead.created_at)}
                                            </strong>
                                        </span>
                                    </div>

                                    <Link
                                        className="mt-4 inline-flex rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('field.leads.show', lead.id)}
                                    >
                                        Detail
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminCard>
            </div>
        </FieldLayout>
    );
}
