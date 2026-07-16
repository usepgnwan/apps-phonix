import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, ChevronRight, Clock, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

import {
    formatRupiah,
    ProductImage,
    PublicShell,
    SecondaryLink,
    visitTypeLabel,
} from '@/Components/Public/commerce.jsx';

function splitContentLines(value) {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function MultilineTextContent({ text }) {
    const lines = splitContentLines(text);

    if (lines.length === 0) {
        return null;
    }

    if (lines.length === 1) {
        return <p className="whitespace-pre-line">{lines[0]}</p>;
    }

    return (
        <div className="space-y-3">
            {lines.map((line, index) => (
                <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>
            ))}
        </div>
    );
}

function ListContent({ text }) {
    const lines = splitContentLines(text);

    if (lines.length === 0) {
        return null;
    }

    if (lines.length === 1) {
        return <p className="whitespace-pre-line">{lines[0]}</p>;
    }

    return (
        <ul className="list-disc space-y-2 pl-5">
            {lines.map((line, index) => (
                <li key={`${index}-${line.slice(0, 24)}`}>{line}</li>
            ))}
        </ul>
    );
}

function buildInfoTabs(service) {
    return [
        service.key_features
            ? {
                content: <ListContent text={service.key_features} />,
                key: 'features',
                title: 'Keunggulan',
            }
            : null,
        service.benefits
            ? {
                content: <ListContent text={service.benefits} />,
                key: 'benefits',
                title: 'Manfaat',
            }
            : null,
        service.description
            ? {
                content: <MultilineTextContent text={service.description} />,
                key: 'detail',
                title: 'Detail',
            }
            : null,
    ].filter(Boolean);
}

function ServiceInfoTabs({ service }) {
    const tabs = buildInfoTabs(service);
    const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? null);
    const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0] ?? null;

    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 border-t border-outline-variant/60 pt-6">
            <div className="-mx-1 flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Informasi layanan">
                {tabs.map((tab) => {
                    const isActive = tab.key === activeTab?.key;

                    return (
                        <button
                            aria-controls={`service-tab-${tab.key}`}
                            aria-selected={isActive}
                            className={`shrink-0 rounded-full px-4 py-2 font-body-sm text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-container/20 ${
                                isActive
                                    ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20'
                                    : 'text-on-surface-variant hover:bg-primary-fixed/25 hover:text-primary-container'
                            }`}
                            key={tab.key}
                            onClick={() => setActiveKey(tab.key)}
                            role="tab"
                            type="button"
                        >
                            {tab.title}
                        </button>
                    );
                })}
            </div>

            <div
                className="mt-5 font-body-md text-sm leading-7 text-on-surface-variant md:text-base"
                id={`service-tab-${activeTab.key}`}
                role="tabpanel"
            >
                <div className="max-w-2xl">{activeTab.content}</div>
            </div>
        </div>
    );
}

function RelatedService({ service }) {
    return (
        <Link
            className="group block overflow-hidden rounded-[1.5rem] border border-outline-variant/70 bg-white transition duration-300 hover:-translate-y-1 hover:border-primary-fixed-dim hover:shadow-xl hover:shadow-primary-container/10"
            href={route('services.show', service.slug)}
        >
            <div className="relative overflow-hidden bg-[#E8F0E9]">
                <ProductImage
                    alt={service.name}
                    className="h-56 w-full !object-cover object-[center_20%] transition duration-500 group-hover:scale-105"
                    imagePath={service.image_path}
                />
            </div>
            <div className="space-y-2 p-4">
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    {visitTypeLabel(service.visit_type)}
                </p>
                <h3 className="font-headline-md text-base font-bold uppercase tracking-wide text-primary-container">
                    {service.name}
                </h3>
                <p className="font-body-lg text-base font-extrabold text-primary-container">
                    {formatRupiah(service.price)}
                </p>
            </div>
        </Link>
    );
}

export default function ServiceShow({ relatedServices = [], service, branchName, selectedBranchId }) {
    const visitLabel = visitTypeLabel(service.visit_type);

    return (
        <>
            <Head title={service.name} />

            <div className="space-y-10 md:space-y-14">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-body-sm text-sm text-on-surface-variant">
                    <Link className="transition hover:text-primary-container" href={route('home')}>
                        Beranda
                    </Link>
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <Link className="transition hover:text-primary-container" href={route('services.index')}>
                        Layanan
                    </Link>
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="font-semibold text-primary-container">{service.name}</span>
                </nav>

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
                    <div className="lg:sticky lg:top-28">
                        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/50 bg-[#E8F0E9]">
                            <ProductImage
                                alt={service.name}
                                className="!h-[360px] w-full !object-cover object-[center_20%] md:!h-[520px]"
                                imagePath={service.image_path}
                            />
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-28">
                        <div className="flex flex-wrap items-center gap-2">
                            {service.is_featured && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F08A2B] px-3 py-1.5 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                                    <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                                    Unggulan
                                </span>
                            )}
                            <span className="inline-flex rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1.5 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-primary-container">
                                Layanan Phoenix
                            </span>
                        </div>

                        <h1 className="mt-4 font-headline-xl text-3xl font-bold uppercase tracking-wide text-primary-container md:text-4xl">
                            {service.name}
                        </h1>

                        <p className="mt-3 font-body-sm text-sm text-on-surface-variant">
                            {visitLabel}
                        </p>

                        <p className="mt-4 max-w-xl font-body-md text-base leading-7 text-on-surface-variant">
                            {service.description
                                ? String(service.description).split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0]
                                : 'Layanan terapi Phoenix dengan pendekatan botanical, hangat, dan profesional.'}
                        </p>

                        <div className="mt-6">
                            <p className="font-body-lg text-3xl font-extrabold tracking-tight text-primary-container md:text-4xl">
                                {formatRupiah(service.price)}
                            </p>
                        </div>

                        <div className="mt-7 space-y-4">
                            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed/35 text-primary-container">
                                        <MapPin aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
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
                            </div>

                            <div className="rounded-2xl border border-outline-variant bg-white p-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed/30 text-primary-container">
                                        <Clock aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                                            Konfirmasi jadwal
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm leading-6 text-on-surface-variant">
                                            Kirim preferensi waktu Anda. Admin Phoenix akan menghubungi via WhatsApp untuk memastikan jadwal final.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary-container px-6 font-label-md text-sm font-bold tracking-wide text-white shadow-md shadow-primary-container/20 transition hover:bg-primary"
                                href={route('bookings.create', { service_id: service.id })}
                            >
                                <CalendarCheck aria-hidden="true" className="mr-2 h-5 w-5" />
                                Booking Layanan Ini
                            </Link>

                            <SecondaryLink className="w-full" href={route('services.index')}>
                                Lanjut lihat layanan
                            </SecondaryLink>
                        </div>

                        <ServiceInfoTabs service={service} />
                    </div>
                </section>

                {relatedServices.length > 0 && (
                    <section className="space-y-6 border-t border-outline-variant/50 pt-10 md:pt-14">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                                    Rekomendasi
                                </p>
                                <h2 className="mt-2 font-headline-lg text-2xl font-bold italic text-primary-container md:text-3xl">
                                    Anda mungkin juga suka
                                </h2>
                            </div>
                            <Link
                                className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-white px-5 py-2.5 font-body-sm text-sm font-semibold text-primary-container transition hover:border-primary-fixed-dim hover:bg-primary-fixed/20"
                                href={route('services.index')}
                            >
                                Lihat semua layanan
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedServices.map((item) => (
                                <RelatedService key={item.id} service={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

ServiceShow.layout = (page) => <PublicShell>{page}</PublicShell>;
