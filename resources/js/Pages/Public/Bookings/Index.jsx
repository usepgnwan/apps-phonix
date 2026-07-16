import { Head, Link } from '@inertiajs/react';
import { CalendarClock, ChevronRight, ClipboardList, Plus } from 'lucide-react';

import { EmptyState, PrimaryLink, PublicCard, PublicShell, SecondaryLink, visitTypeLabel } from '@/Components/Public/commerce.jsx';

export function formatDateTime(value) {
    if (!value) {
        return 'Belum tersedia';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function statusMeta(status) {
    return {
        cancelled: {
            className: 'border-error/20 bg-error/10 text-error',
            label: 'Dibatalkan',
        },
        completed: {
            className: 'border-primary-fixed-dim bg-primary-fixed/35 text-primary-container',
            label: 'Selesai',
        },
        confirmed: {
            className: 'border-tertiary-fixed-dim bg-tertiary-fixed/35 text-primary-container',
            label: 'Terkonfirmasi',
        },
        waiting_confirmation: {
            className: 'border-primary-fixed-dim bg-primary-fixed/25 text-primary-container',
            label: 'Menunggu konfirmasi',
        },
    }[status] ?? {
        className: 'border-outline-variant bg-surface text-on-surface-variant',
        label: status ?? 'Status belum tersedia',
    };
}

export function paginationLabel(bookings) {
    if (!bookings?.total) {
        return 'Belum ada booking.';
    }

    return `Menampilkan ${bookings.from ?? 0}-${bookings.to ?? 0} dari ${bookings.total} booking`;
}

function pageLinkLabel(label) {
    return label
        .replace('&laquo; Previous', 'Sebelumnya')
        .replace('Next &raquo;', 'Berikutnya');
}

export default function BookingIndex({ bookings }) {
    const items = bookings?.data ?? [];

    return (
        <>
            <Head title="Daftar Booking Phoenix" />
            <div className="space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-outline-variant/70 bg-white shadow-sm shadow-primary-container/5">
                    <div className="grid gap-8 p-8 md:grid-cols-[1fr_280px] md:p-10">
                        <div>
                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Booking Saya</p>
                            <h1 className="mt-3 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">Pantau jadwal terapi Phoenix Anda.</h1>
                            <p className="mt-4 max-w-3xl font-body-md text-body-md text-on-surface-variant">Lihat status booking, layanan yang dipilih, dan jadwal yang sedang menunggu konfirmasi atau sudah disiapkan oleh tim Phoenix.</p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <PrimaryLink href={route('bookings.create')}>
                                    <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
                                    Buat Booking Baru
                                </PrimaryLink>
                                <SecondaryLink href={route('services.index')}>Lihat Layanan</SecondaryLink>
                            </div>
                        </div>
                        <div className="flex min-h-52 items-center justify-center rounded-[2rem] bg-primary-fixed/25 p-6 text-primary-container">
                            <div className="text-center">
                                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm shadow-primary-container/10">
                                    <ClipboardList aria-hidden="true" className="h-8 w-8" />
                                </span>
                                <p className="mt-4 font-label-sm text-xs font-bold uppercase tracking-[0.2em]">Riwayat konsultasi</p>
                                <p className="mt-2 font-body-sm text-sm text-on-surface-variant">{paginationLabel(bookings)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {items.length === 0 ? (
                    <EmptyState action={<PrimaryLink href={route('bookings.create')}>Mulai Booking Layanan</PrimaryLink>} description="Anda belum memiliki booking layanan. Pilih layanan Phoenix dan tim kami akan mengonfirmasi jadwal melalui WhatsApp." title="Belum ada booking aktif." />
                ) : (
                    <section className="space-y-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Daftar Booking</p>
                                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Booking terbaru</h2>
                            </div>
                            <p className="font-body-sm text-sm text-on-surface-variant">{paginationLabel(bookings)}</p>
                        </div>

                        <div className="grid gap-4">
                            {items.map((booking) => {
                                const meta = statusMeta(booking.status);

                                return (
                                    <PublicCard className="p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary-container/10 md:p-6" key={booking.id}>
                                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1 font-body-sm text-xs font-bold text-primary-container">{booking.booking_number}</span>
                                                    <span className={`inline-flex rounded-full border px-3 py-1 font-body-sm text-xs font-bold ${meta.className}`}>{meta.label}</span>
                                                    {booking.branch && (
                                                        <span className="inline-flex rounded-full border border-primary-fixed-dim bg-[#1E4D3A]/10 px-3 py-1 font-body-sm text-xs font-bold uppercase tracking-wider text-[#1E4D3A]">
                                                            {booking.branch.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mt-4 font-headline-md text-2xl font-bold text-primary-container">{booking.service?.name ?? 'Layanan Phoenix'}</h3>
                                                <div className="mt-4 grid gap-3 font-body-sm text-sm text-on-surface-variant sm:grid-cols-2 lg:grid-cols-3">
                                                    <p>
                                                        <span className="block font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-primary-container">Tipe kunjungan</span>
                                                        {visitTypeLabel(booking.visit_type)}
                                                    </p>
                                                    <p>
                                                        <span className="block font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-primary-container">Jadwal diinginkan</span>
                                                        {formatDateTime(booking.desired_schedule_at)}
                                                    </p>
                                                    <p>
                                                        <span className="block font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-primary-container">Dibuat</span>
                                                        {formatDateTime(booking.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link className="inline-flex items-center justify-center rounded-full border border-primary-fixed-dim bg-white px-5 py-3 font-label-md text-sm font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('bookings.show', booking.id)}>
                                                Detail
                                                <ChevronRight aria-hidden="true" className="ml-2 h-4 w-4" />
                                            </Link>
                                        </div>
                                    </PublicCard>
                                );
                            })}
                        </div>

                        {bookings?.links?.length > 0 && (
                            <PublicCard className="flex flex-wrap items-center justify-center gap-2 p-4">
                                {bookings.links.map((link) => (
                                    <Link className={`rounded-full px-4 py-2 font-body-sm text-sm font-bold transition ${link.active ? 'bg-primary-container text-white' : link.url ? 'border border-primary-fixed-dim bg-white text-primary-container hover:bg-primary-fixed/30' : 'cursor-not-allowed border border-outline-variant bg-surface text-on-surface-variant/60'}`} href={link.url ?? '#'} key={link.label} preserveScroll>
                                        {pageLinkLabel(link.label)}
                                    </Link>
                                ))}
                            </PublicCard>
                        )}
                    </section>
                )}

                <PublicCard className="bg-primary-fixed/25 p-5">
                    <div className="flex gap-3">
                        <CalendarClock aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary-container" />
                        <p className="font-body-sm text-sm leading-6 text-on-surface-variant">Status booking diperbarui oleh admin Phoenix setelah pengecekan jadwal. Simpan nomor booking untuk memudahkan konfirmasi melalui WhatsApp.</p>
                    </div>
                </PublicCard>
            </div>
        </>
    );
}

BookingIndex.layout = (page) => <PublicShell>{page}</PublicShell>;
