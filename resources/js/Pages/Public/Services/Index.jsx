import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, ChevronDown, MapPin, Search, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, visitTypeLabel } from '@/Components/Public/commerce.jsx';

function paginationLabel(label) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function serviceShowingLabel(services) {
    if (!services?.total) {
        return 'Menampilkan 0 layanan';
    }

    return `Menampilkan ${services.from ?? 0}-${services.to ?? 0} dari ${services.total} layanan`;
}

const showOptions = [
    { label: '12', value: '12' },
    { label: '24', value: '24' },
    { label: '36', value: '36' },
];

const sortOptions = [
    { label: 'Terbaru', value: 'latest' },
    { label: 'Nama layanan', value: 'name' },
    { label: 'Harga terendah', value: 'price_low' },
    { label: 'Harga tertinggi', value: 'price_high' },
];

function ToolbarDropdown({ label, name, onChange, openDropdown, options, selectedValue, setOpenDropdown }) {
    const isOpen = openDropdown === name;
    const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function handlePointerDown(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [isOpen, setOpenDropdown]);

    function chooseOption(value) {
        onChange(value);
        setOpenDropdown(null);
    }

    return (
        <div className="relative block" ref={dropdownRef}>
            <span className="mb-2 block font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</span>
            <button
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-white px-4 py-3 font-body-sm text-sm font-bold text-primary-container shadow-sm shadow-primary-container/5 transition hover:border-primary-fixed-dim hover:bg-primary-fixed/15 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/25"
                onClick={() => setOpenDropdown(isOpen ? null : name)}
                type="button"
            >
                <span>{selectedOption.label}</span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 text-on-surface-variant transition ${isOpen ? 'rotate-180 text-primary-container' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-30 mt-2 w-full min-w-max overflow-hidden rounded-2xl border border-outline-variant/80 bg-white p-1.5 shadow-xl shadow-primary-container/15" role="listbox">
                    {options.map((option) => {
                        const isSelected = option.value === selectedValue;

                        return (
                            <button
                                aria-selected={isSelected}
                                className={`block w-full rounded-xl px-3.5 py-2.5 text-left font-body-sm text-sm font-bold transition ${isSelected ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20' : 'text-primary-container hover:bg-primary-fixed/35 hover:text-primary-container'}`}
                                key={option.value}
                                onClick={() => chooseOption(option.value)}
                                role="option"
                                type="button"
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ServiceCard({ service }) {
    return (
        <PublicCard className="overflow-hidden">
            <div className="relative">
                <ProductImage alt={service.name} className="h-56 w-full" imagePath={service.image_path} />
                {service.is_featured && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#F08A2B] pl-2 pr-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        Unggulan
                    </span>
                )}
            </div>
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
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const [toolbarValues, setToolbarValues] = useState({
        perPage: String(services?.per_page ?? 12),
        search: searchParams?.get('search') ?? '',
        sort: searchParams?.get('sort') ?? 'latest',
    });
    const [openDropdown, setOpenDropdown] = useState(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            router.get(
                route('services.index'),
                {
                    search: toolbarValues.search || undefined,
                    sort: toolbarValues.sort !== 'latest' ? toolbarValues.sort : undefined,
                    perPage: toolbarValues.perPage !== '12' ? toolbarValues.perPage : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [toolbarValues]);

    function updateToolbarValue(key, value) {
        setToolbarValues((currentValues) => ({
            ...currentValues,
            [key]: value,
        }));
    }

    return (
        <>
            <Head title="Layanan Terapi Phoenix" />
            <div className="relative z-10 min-h-screen w-full max-w-none bg-white">
                <div className="fixed inset-0 z-0 bg-white" />
                <section className="relative isolate z-10 -mt-8 w-full max-w-none overflow-hidden md:-mt-12">
                    <img alt="Banner katalog layanan Phoenix" className="h-72 w-full object-cover md:h-96" src="/images/banner_product.png" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E4D3A]/80 via-[#1E4D3A]/55 to-[#1E4D3A]/25" />
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute inset-0 flex items-center justify-center px-margin-mobile text-center md:px-margin-desktop">
                        <h1 className="font-headline-xl text-5xl font-bold leading-tight text-white drop-shadow-lg md:text-7xl">
                            Katalog Layanan
                        </h1>
                    </div>
                </section>

                <section aria-label="Toolbar katalog layanan" className="relative z-20 w-full max-w-none border-b border-outline-variant/70 bg-[#F3F4F6] px-margin-mobile py-4 shadow-sm shadow-primary-container/5 md:px-margin-desktop md:py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <label className="block sm:w-80 lg:w-90">
                                <span className="sr-only">Cari layanan</span>
                                <span className="relative block">
                                    <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        className="block w-full rounded-2xl border-outline-variant bg-surface-container-low py-3 pl-11 pr-4 font-body-sm text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/70 focus:border-primary-container focus:ring-primary-container"
                                        onChange={(event) => updateToolbarValue('search', event.target.value)}
                                        placeholder="Cari layanan terapi..."
                                        type="search"
                                        value={toolbarValues.search}
                                    />
                                </span>
                            </label>

                            <p className="px-1 py-3 text-center font-body-sm text-sm font-bold text-primary-container sm:text-left">
                                {serviceShowingLabel(services)}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:justify-end">
                            <div className="sm:w-28">
                                <ToolbarDropdown
                                    label="Show"
                                    name="perPage"
                                    onChange={(value) => updateToolbarValue('perPage', value)}
                                    openDropdown={openDropdown}
                                    options={showOptions}
                                    selectedValue={toolbarValues.perPage}
                                    setOpenDropdown={setOpenDropdown}
                                />
                            </div>

                            <div className="sm:w-44">
                                <ToolbarDropdown
                                    label="Sort by"
                                    name="sort"
                                    onChange={(value) => updateToolbarValue('sort', value)}
                                    openDropdown={openDropdown}
                                    options={sortOptions}
                                    selectedValue={toolbarValues.sort}
                                    setOpenDropdown={setOpenDropdown}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 mx-auto mt-8 w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
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
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
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
                </section>
            </div>
        </>
    );
}

ServiceIndex.layout = (page) => <PublicShell fullWidth>{page}</PublicShell>;
