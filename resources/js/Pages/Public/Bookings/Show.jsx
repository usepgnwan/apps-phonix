import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, ClipboardCheck, MessageCircle, Plus, Sprout } from 'lucide-react';

import { formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink, visitTypeLabel } from '@/Components/Public/commerce.jsx';
import { formatDateTime, statusMeta } from './Index';

function nextStepFor(status) {
    return {
        cancelled: 'Booking ini telah dibatalkan. Jika masih membutuhkan layanan, Anda dapat membuat booking baru dengan jadwal yang sesuai.',
        completed: 'Sesi layanan sudah selesai. Terima kasih sudah mempercayakan perawatan Anda kepada Phoenix.',
        confirmed: 'Booking sudah dikonfirmasi. Pastikan Anda siap pada jadwal yang disepakati dan tetap memantau WhatsApp untuk arahan lanjutan.',
        waiting_confirmation: 'Tim Phoenix sedang mengecek jadwal dan akan menghubungi Anda melalui WhatsApp untuk konfirmasi final.',
    }[status] ?? 'Tim Phoenix akan memperbarui status booking ini setelah proses administrasi selesai.';
}

function DetailItem({ label, value }) {
    return (
        <div className="rounded-3xl border border-outline-variant/80 bg-surface p-4">
            <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
            <p className="mt-2 font-body-md text-sm font-bold text-primary-container">{value ?? 'Belum tersedia'}</p>
        </div>
    );
}

function NotesCard({ children, icon: Icon, label, title }) {
    return (
        <PublicCard className="p-6">
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary-container">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                    <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
                    <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">{title}</h2>
                    <p className="mt-3 whitespace-pre-line font-body-sm text-sm leading-6 text-on-surface-variant">{children}</p>
                </div>
            </div>
        </PublicCard>
    );
}

export default function BookingShow({ booking }) {
    const meta = statusMeta(booking.status);
    const service = booking.service;

    return (
        <>
            <Head title={`Booking ${booking.booking_number}`} />
            <div className="space-y-8">
                <Link className="inline-flex items-center rounded-full border border-primary-fixed-dim bg-white px-4 py-2 font-body-sm text-sm font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('bookings.index')}>
                    <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                    Kembali ke daftar booking
                </Link>

                <section className="overflow-hidden rounded-[2rem] border border-outline-variant/70 bg-white shadow-sm shadow-primary-container/5">
                    <div className="grid gap-8 p-8 md:grid-cols-[1fr_300px] md:p-10">
                        <div>
                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Detail Booking</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1 font-body-sm text-xs font-bold text-primary-container">{booking.booking_number}</span>
                                <span className={`inline-flex rounded-full border px-3 py-1 font-body-sm text-xs font-bold ${meta.className}`}>{meta.label}</span>
                            </div>
                            <h1 className="mt-4 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">{service?.name ?? 'Layanan Phoenix'}</h1>
                            <p className="mt-4 max-w-3xl font-body-md text-body-md text-on-surface-variant">Ringkasan booking layanan Phoenix Anda. Halaman ini bersifat read-only; perubahan jadwal atau kebutuhan khusus dilakukan melalui konfirmasi admin.</p>
                        </div>
                        <div className="rounded-[2rem] bg-primary-fixed/25 p-6">
                            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary-container shadow-sm shadow-primary-container/10">
                                <CalendarCheck aria-hidden="true" className="h-7 w-7" />
                            </span>
                            <p className="mt-5 font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Langkah berikutnya</p>
                            <p className="mt-2 font-body-sm text-sm leading-6 text-on-surface-variant">{nextStepFor(booking.status)}</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                    <div className="space-y-6">
                        <PublicCard className="p-6 md:p-8">
                            <h2 className="font-headline-lg text-headline-lg text-primary-container">Ringkasan Booking</h2>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <DetailItem label="Nama Customer" value={booking.name} />
                                <DetailItem label="WhatsApp" value={booking.whatsapp_number} />
                                <DetailItem label="Tipe Kunjungan" value={visitTypeLabel(booking.visit_type)} />
                                <DetailItem label="Jadwal Diinginkan" value={formatDateTime(booking.desired_schedule_at)} />
                                <DetailItem label="Tanggal Booking" value={formatDateTime(booking.created_at)} />
                                <DetailItem label="Status" value={meta.label} />
                            </div>
                        </PublicCard>

                        <NotesCard icon={MessageCircle} label="Catatan Customer" title="Keluhan / permintaan layanan">
                            {booking.complaint_notes || 'Tidak ada catatan tambahan dari customer.'}
                        </NotesCard>

                        {booking.admin_notes && (
                            <NotesCard icon={ClipboardCheck} label="Catatan Admin" title="Arahan dari tim Phoenix">
                                {booking.admin_notes}
                            </NotesCard>
                        )}
                    </div>

                    <aside className="space-y-5">
                        <PublicCard className="overflow-hidden">
                            <ProductImage alt={service?.name ?? 'Layanan Phoenix'} className="h-48 w-full" imagePath={service?.image_path} />
                            <div className="p-6">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container">
                                    <Sprout aria-hidden="true" className="h-3.5 w-3.5" />
                                    {visitTypeLabel(service?.visit_type)}
                                </span>
                                <h2 className="mt-3 font-headline-md text-headline-md text-primary-container">{service?.name ?? 'Layanan Phoenix'}</h2>
                                <p className="mt-3 font-body-sm text-sm leading-6 text-on-surface-variant">{service?.description ?? 'Informasi layanan akan tersedia setelah data service diperbarui.'}</p>
                                {service?.price !== undefined && <p className="mt-5 font-body-lg text-lg font-extrabold text-primary-container">{formatRupiah(service.price)}</p>}
                                {service?.slug && (
                                    <Link className="mt-4 inline-flex rounded-full border border-primary-fixed-dim px-4 py-2 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('services.show', service.slug)}>
                                        Lihat detail layanan
                                    </Link>
                                )}
                            </div>
                        </PublicCard>

                        <PublicCard className="bg-primary-fixed/25 p-5">
                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Aksi Terkait</p>
                            <div className="mt-4 grid gap-3">
                                <SecondaryLink href={route('bookings.index')}>Lihat Semua Booking</SecondaryLink>
                                <SecondaryLink href={route('services.index')}>Jelajahi Layanan</SecondaryLink>
                                <PrimaryLink href={route('bookings.create')}>
                                    <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
                                    Buat Booking Lain
                                </PrimaryLink>
                            </div>
                        </PublicCard>
                    </aside>
                </div>
            </div>
        </>
    );
}

BookingShow.layout = (page) => <PublicShell>{page}</PublicShell>;
