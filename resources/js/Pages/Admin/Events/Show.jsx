import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    Pencil,
    Users,
    Wallet,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { formatNumber } from '@/utils/format';
import { DetailRow } from '@/Components/Admin/FormFields';

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}

function eventPeriodHint(event) {
    const now = new Date();
    const start = event.start_date ? new Date(event.start_date) : null;
    const end = event.end_date ? new Date(event.end_date) : null;

    if (start && start > now) {
        return 'Event belum dimulai. Siapkan assignment staff dan channel lead sebelum tanggal mulai.';
    }

    if (end && end < now) {
        return 'Event sudah selesai. Tinjau lead dan penjualan offline yang terkumpul dari event ini.';
    }

    if (event.is_active) {
        return 'Event sedang berjalan. Pantau lead masuk dan penjualan offline di lapangan.';
    }

    return 'Event nonaktif. Aktifkan kembali dari halaman edit jika masih relevan.';
}

function ActiveBadge({ isActive }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] ${
                isActive ? 'bg-[#1E4D3A] text-white' : 'bg-gray-200 text-gray-600'
            }`}
        >
            {isActive ? 'Aktif' : 'Nonaktif'}
        </span>
    );
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

function TextBlock({ label, children }) {
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <p className="mt-2 whitespace-pre-line font-body-sm text-sm leading-6 text-[#333333]">
                {children || '-'}
            </p>
        </div>
    );
}

function AdminEventShow({ event }) {
    const stepHint = eventPeriodHint(event);

    return (
        <>
            <Head title={`Detail ${event.name}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href={route('admin.events.edit', event.id)}
                            >
                                <Pencil aria-hidden="true" className="h-4 w-4" />
                                Edit
                            </Link>
                            <AdminDeleteButton
                                className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50"
                                description="Event akan dihapus dari data CRM dan field activity admin."
                                itemName={event.name}
                                routeName="admin.events.destroy"
                                routeParams={event.id}
                                title="Hapus event?"
                            >
                                Hapus
                            </AdminDeleteButton>
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-body-sm text-sm font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                href={route('admin.events.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Detail event dan relasi lead serta penjualan offline yang terkait."
                    eyebrow="CRM & Field / Event"
                    title={event.name}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Status">
                        <ActiveBadge isActive={event.is_active} />
                    </StatusPill>
                    <StatusPill label="Cabang">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                            {event.branch?.name || 'Tanpa cabang'}
                        </span>
                    </StatusPill>
                    <StatusPill label="Periode">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {formatDate(event.start_date)} – {formatDate(event.end_date)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Lead">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <Users aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(event.leads_count)}
                        </span>
                    </StatusPill>
                    <StatusPill label="Penjualan Offline">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <Wallet aria-hidden="true" className="h-3.5 w-3.5" />
                            {formatNumber(event.offline_sales_count)}
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
                        <SectionHeader eyebrow="Event" title="Ringkasan Event" />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{event.name}</DetailRow>
                            <DetailRow label="Status">
                                <ActiveBadge isActive={event.is_active} />
                            </DetailRow>
                            <DetailRow label="Cabang">{event.branch?.name || '-'}</DetailRow>
                            <DetailRow label="Tanggal Mulai">{formatDate(event.start_date)}</DetailRow>
                            <DetailRow label="Tanggal Selesai">{formatDate(event.end_date)}</DetailRow>
                            <DetailRow label="Lokasi">{event.location || '-'}</DetailRow>
                            <DetailRow label="Organizer">{event.organizer || '-'}</DetailRow>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <SectionHeader
                            description="Ringkasan performa event di CRM dan field sales."
                            eyebrow="Performa"
                            title="Metrik Terkait"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Jumlah Lead">
                                <span className="font-extrabold text-[#1E4D3A]">
                                    {formatNumber(event.leads_count)}
                                </span>
                            </DetailRow>
                            <DetailRow label="Penjualan Offline">
                                <span className="font-extrabold text-[#1E4D3A]">
                                    {formatNumber(event.offline_sales_count)}
                                </span>
                            </DetailRow>
                            <div className="mt-1">
                                <TextBlock label="Catatan">{event.notes}</TextBlock>
                            </div>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </>
    );
}

AdminEventShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminEventShow;
