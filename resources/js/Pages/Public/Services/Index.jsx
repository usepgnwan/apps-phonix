import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, MapPin } from 'lucide-react';

import { EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink, visitTypeLabel } from '@/Components/Public/commerce.jsx';

function paginationLabel(label) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function ServiceCard({ service }) {
    return (
        <PublicCard className="overflow-hidden">
            <ProductImage alt={service.name} className="h-56 w-full" imagePath={service.image_path} />
            <div className="p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                    {visitTypeLabel(service.visit_type)}
                </span>
                <h2 className="mt-3 font-headline-md text-headline-md text-primary-container">{service.name}</h2>
                <p className="mt-3 line-clamp-3 font-body-sm text-sm leading-6 text-on-surface-variant">
                    {service.description || 'Layanan terapi Phoenix dengan pendekatan botanical dan pendampingan profesional.'}
                </p>
                <p className="mt-5 font-body-lg text-lg font-extrabold text-primary-container">{formatRupiah(service.price)}</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary-fixed-dim px-4 py-2.5 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('services.show', service.slug)}>
                        Detail
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                    <Link className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-container px-4 py-2.5 font-body-sm text-xs font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary" href={route('bookings.create', { service_id: service.id })}>
                        Booking
                        <CalendarCheck aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </PublicCard>
    );
}

export default function ServiceIndex({ services }) {
    const serviceList = services?.data ?? [];

    return (
        <>
            <Head title="Layanan Terapi Phoenix" />
            <div className="space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-outline-variant/70 bg-white p-8 shadow-sm shadow-primary-container/5 md:p-10">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
                        <div className="max-w-3xl">
                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Katalog Layanan</p>
                            <h1 className="mt-3 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">
                                Terapi botanical untuk jadwal perawatan yang lebih tenang.
                            </h1>
                            <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant">
                                Pilih layanan Phoenix untuk home visit atau kunjungan klinik, lalu ajukan jadwal agar admin dapat mengonfirmasi ketersediaan terapis.
                            </p>
                        </div>
                        <PublicCard className="bg-primary-fixed/25 p-5">
                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-primary-container">Alur Booking</p>
                            <p className="mt-3 font-body-sm text-sm leading-6 text-on-surface-variant">Pilih layanan, kirim jadwal, lalu tunggu konfirmasi Phoenix sebelum sesi terapi dimulai.</p>
                        </PublicCard>
                    </div>
                </section>

                {serviceList.length === 0 ? (
                    <EmptyState
                        action={<PrimaryLink href={route('home')}>Kembali ke Beranda</PrimaryLink>}
                        description="Layanan aktif akan tampil di sini setelah katalog Phoenix diperbarui. Silakan kembali lagi nanti."
                        title="Belum ada layanan tersedia."
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {serviceList.map((service) => <ServiceCard key={service.id} service={service} />)}
                    </div>
                )}

                {services?.links?.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {services.links.map((link) => (
                            <Link
                                className={`rounded-full px-4 py-2 font-body-sm text-sm font-bold transition ${link.active ? 'bg-primary-container text-white' : 'border border-outline-variant bg-white text-primary-container hover:bg-primary-fixed/30'} ${!link.url ? 'pointer-events-none opacity-45' : ''}`}
                                href={link.url ?? '#'}
                                key={link.label}
                            >
                                {paginationLabel(link.label)}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="flex justify-center">
                    <SecondaryLink href={route('products.index')}>Lihat Produk Herbal</SecondaryLink>
                </div>
            </div>
        </>
    );
}

ServiceIndex.layout = (page) => <PublicShell>{page}</PublicShell>;
