import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Hash,
    Layers,
    Users,
} from 'lucide-react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatNumber } from '@/utils/format';
import { DetailRow } from '@/Components/Admin/FormFields';

function sourceHint(leadSource) {
    if (!leadSource.is_active) {
        return 'Sumber lead nonaktif. Sumber ini tidak akan muncul saat membuat lead baru sampai diaktifkan kembali.';
    }

    if ((leadSource.leads_count ?? 0) === 0) {
        return 'Sumber aktif tetapi belum memiliki lead. Pastikan tim memakai sumber ini saat input prospek.';
    }

    return 'Sumber aktif dan sudah dipakai di CRM. Hapus hanya jika tidak ada lead terkait.';
}

function SectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className={`mb-4 ${action ? 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between' : ''}`}>
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

function StatusPill({ label, children }) {
    return (
        <div className="inline-flex flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {label}
            </span>
            <div>{children}</div>
        </div>
    );
}

function AdminLeadSourcesShow({ leadSource }) {
    const stepHint = sourceHint(leadSource);

    return (
        <>
            <Head title={`Detail ${leadSource.name}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.lead-sources.index')}
                            >
                                Ke Daftar
                            </Link>
                            <AdminDeleteButton
                                className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                description="Sumber lead akan dihapus dari master CRM admin."
                                itemName={leadSource.name}
                                routeName="admin.lead-sources.destroy"
                                routeParams={leadSource.id}
                                title="Hapus sumber lead?"
                            >
                                Hapus
                            </AdminDeleteButton>
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-body-sm text-sm font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                href={route('admin.lead-sources.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Detail source CRM dan jumlah lead yang memakai source ini."
                    eyebrow="Lead & CRM / Sumber Lead"
                    title={leadSource.name}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Status">
                        <StatusBadge
                            label={leadSource.is_active ? 'Aktif' : 'Nonaktif'}
                            tone={leadSource.is_active ? 'forest' : 'gray'}
                        />
                    </StatusPill>
                    <StatusPill label="Slug">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <Layers aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {leadSource.slug || '-'}
                        </span>
                    </StatusPill>
                    <StatusPill label="Lead">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <Users aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(leadSource.leads_count)}
                        </span>
                    </StatusPill>
                    <StatusPill label="ID">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <Hash aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {leadSource.id}
                        </span>
                    </StatusPill>
                </div>

                <div className="rounded-2xl border border-[#A8C5B3]/50 bg-[#A8C5B3]/15 px-4 py-3">
                    <p className="font-body-sm text-sm font-medium text-[#1E4D3A]">
                        {stepHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <SectionHeader eyebrow="Sumber" title="Ringkasan Sumber Lead" />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{leadSource.name}</DetailRow>
                            <DetailRow label="Slug">{leadSource.slug || '-'}</DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge
                                    label={leadSource.is_active ? 'Aktif' : 'Nonaktif'}
                                    tone={leadSource.is_active ? 'forest' : 'gray'}
                                />
                            </DetailRow>
                            <DetailRow label="ID">#{leadSource.id}</DetailRow>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader
                            description="Jumlah lead yang terhubung ke sumber ini."
                            eyebrow="Performa"
                            title="Penggunaan di CRM"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Jumlah Lead">
                                <span className="font-extrabold text-[#1E4D3A]">
                                    {formatNumber(leadSource.leads_count)}
                                </span>
                            </DetailRow>
                            <DetailRow label="Dapat dihapus">
                                {(leadSource.leads_count ?? 0) > 0
                                    ? 'Tidak (masih ada lead terkait)'
                                    : 'Ya (belum ada lead terkait)'}
                            </DetailRow>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminLeadSourcesShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSourcesShow;
