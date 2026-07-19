import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, Clock, MapPin, Star } from 'lucide-react';

import { formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink, visitTypeLabel } from '@/Components/Public/commerce.jsx';

function ServiceInfoSection({ children, eyebrow, title }) {
    if (!children) {
        return null;
    }

    return (
        <PublicCard className="relative isolate overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary-fixed/35 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-tertiary-fixed/25 blur-3xl" />
            <div className="relative">
                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">{eyebrow}</p>
                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">{title}</h2>
                <p className="mt-4 whitespace-pre-line font-body-md text-body-md leading-7 text-on-surface-variant">
                    {children}
                </p>
            </div>
        </PublicCard>
    );
}

function RelatedService({ service }) {
    return (
        <PublicCard className="overflow-hidden">
            <ProductImage alt={service.name} className="h-36 w-full" imagePath={service.image_path} />
            <div className="p-4">
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{visitTypeLabel(service.visit_type)}</p>
                <h3 className="mt-2 font-body-lg text-sm font-extrabold text-primary-container">{service.name}</h3>
                <p className="mt-2 font-body-sm text-xs text-on-surface-variant">{formatRupiah(service.price)}</p>
                <Link className="mt-3 inline-flex rounded-full border border-primary-fixed-dim px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container hover:bg-primary-fixed/30" href={route('services.show', service.slug)}>
                    Lihat detail
                </Link>
            </div>
        </PublicCard>
    );
}

export default function ServiceShow({ relatedServices = [], service, branchName, selectedBranchId }) {
    return (
        <>
            <Head title={service.name} />
            <div className="space-y-8">
                <SecondaryLink href={route('services.index')}>
                    <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                    Kembali ke Layanan
                </SecondaryLink>

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <PublicCard className="overflow-hidden h-fit">
                        <ProductImage alt={service.name} className="aspect-[4/3] w-full object-[center_20%]" imagePath={service.image_path} />
                    </PublicCard>

                    <PublicCard className="p-6 md:p-8">
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Layanan Phoenix</p>
                            {service.is_featured && (
                                <span className="flex items-center gap-1.5 rounded-full border border-transparent bg-[#F08A2B] pl-3 pr-4 py-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    Layanan Unggulan
                                </span>
                            )}
                        </div>
                        <h1 className="mt-3 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">{service.name}</h1>
                        <p className="mt-5 whitespace-pre-line font-body-lg text-body-lg text-on-surface-variant">
                            {service.description || 'Layanan terapi Phoenix dengan pendekatan botanical, hangat, dan profesional.'}
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl border border-outline-variant bg-surface-container-low p-4">
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Harga</p>
                                <p className="mt-2 font-body-lg text-xl font-extrabold text-primary-container">{formatRupiah(service.price)}</p>
                            </div>
                            <div className="rounded-3xl border border-outline-variant bg-primary-fixed/25 p-4">
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Tipe Kunjungan</p>
                                <p className="mt-2 inline-flex items-center gap-2 font-body-lg text-base font-extrabold text-primary-container">
                                    <MapPin aria-hidden="true" className="h-4 w-4" />
                                    {visitTypeLabel(service.visit_type)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-3xl border border-outline-variant bg-white p-4 flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed/30 text-primary-container">
                                <MapPin aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                                    Lokasi layanan
                                </p>
                                {selectedBranchId && branchName ? (
                                    <>
                                        <p className="mt-1 font-body-md text-sm font-extrabold text-primary-container">
                                            {branchName}
                                        </p>
                                        <p className="mt-1 font-body-sm text-xs leading-5 text-on-surface-variant">
                                            Cabang dapat diganti saat mengisi form booking.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="mt-1 font-body-md text-sm font-extrabold text-primary-container">
                                            Dipilih di form booking
                                        </p>
                                        <p className="mt-1 font-body-sm text-xs leading-5 text-on-surface-variant">
                                            Anda bisa langsung booking. Cabang dipilih di langkah berikutnya.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl border border-outline-variant bg-surface-container-low p-5">
                            <div className="flex gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-container shadow-sm shadow-primary-container/10">
                                    <Clock aria-hidden="true" className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="font-headline-md text-headline-md text-primary-container">Konfirmasi jadwal</h2>
                                    <p className="mt-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                                        Kirim preferensi waktu Anda. Admin Phoenix akan menghubungi via WhatsApp untuk memastikan jadwal final.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <PrimaryLink
                            className="mt-6 w-full"
                            href={route('bookings.create', { service_id: service.id })}
                        >
                            <CalendarCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                            Booking Layanan Ini
                        </PrimaryLink>
                    </PublicCard>
                </section>

                {(service.key_features || service.benefits) && (
                    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <ServiceInfoSection eyebrow="Nilai utama" title="Keunggulan & Fitur Utama">
                            {service.key_features}
                        </ServiceInfoSection>
                        <ServiceInfoSection eyebrow="Hasil yang dirasakan" title="Manfaat">
                            {service.benefits}
                        </ServiceInfoSection>
                    </section>
                )}

                {relatedServices.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Rekomendasi</p>
                                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Layanan terkait</h2>
                            </div>
                            <PrimaryLink href={route('services.index')}>Lihat semua</PrimaryLink>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedServices.map((item) => <RelatedService key={item.id} service={item} />)}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

ServiceShow.layout = (page) => <PublicShell>{page}</PublicShell>;
