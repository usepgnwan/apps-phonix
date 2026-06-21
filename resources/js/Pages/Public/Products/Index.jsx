import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, ChevronDown, Search, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, productCategory } from '@/Components/Public/commerce.jsx';

function paginationLabel(label) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function productShowingLabel(products) {
    if (!products?.total) {
        return 'Menampilkan 0 produk';
    }

    return `Menampilkan ${products.from ?? 0}-${products.to ?? 0} dari ${products.total} produk`;
}

const showOptions = [
    { label: '12', value: '12' },
    { label: '24', value: '24' },
    { label: '36', value: '36' },
];

const sortOptions = [
    { label: 'Terbaru', value: 'latest' },
    { label: 'Nama produk', value: 'name' },
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

function ProductCard({ product }) {
    const category = productCategory(product);

    return (
        <PublicCard className="overflow-hidden">
            <div className="relative">
                <ProductImage alt={product.name} className="h-56 w-full" imagePath={product.image_path} />
                {product.is_featured && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#F08A2B] pl-2 pr-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        Unggulan
                    </span>
                )}
            </div>
            <div className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        {category?.name ?? 'Herbal Phoenix'}
                    </p>
                </div>
                <h2 className="mt-1 font-headline-md text-headline-md text-primary-container">
                    {product.name}
                </h2>
                <p className="mt-3 line-clamp-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                    {product.short_description || 'Produk herbal Phoenix pilihan untuk mendukung rutinitas wellness Anda.'}
                </p>
                {product.bpom_number && (
                    <p className="mt-3 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-primary-container/75">
                        No. BPOM {product.bpom_number}
                    </p>
                )}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="font-body-lg text-lg font-extrabold text-primary-container">
                        {formatRupiah(product.price)}
                    </p>
                    <Link className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim px-3 py-2 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('products.show', product.slug)}>
                        Detail
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </PublicCard>
    );
}

function ProductResults({ productList, products }) {
    return (
        <>
            {productList.length === 0 ? (
                <EmptyState
                    action={<PrimaryLink href={route('home')}>Kembali ke Beranda</PrimaryLink>}
                    description="Produk aktif akan tampil di sini setelah katalog Phoenix diperbarui. Silakan kembali lagi nanti."
                    title="Belum ada produk tersedia."
                />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {productList.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            )}

            {products?.links?.length > 3 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {products.links.map((link) => (
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
        </>
    );
}

export default function ProductIndex({ productCategories = [], products }) {
    const productList = products?.data ?? [];
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const [toolbarValues, setToolbarValues] = useState({
        perPage: String(products?.per_page ?? 12),
        search: searchParams?.get('search') ?? '',
        sort: searchParams?.get('sort') ?? 'latest',
        category: searchParams?.get('category') ?? '',
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
                route('products.index'),
                {
                    search: toolbarValues.search || undefined,
                    sort: toolbarValues.sort !== 'latest' ? toolbarValues.sort : undefined,
                    perPage: toolbarValues.perPage !== '12' ? toolbarValues.perPage : undefined,
                    category: toolbarValues.category || undefined,
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
            <Head title="Produk Herbal Phoenix" />
            <div className="relative z-10 min-h-screen bg-white">
                <div className="fixed inset-0 z-0 bg-white" />
                <section className="relative isolate z-10 -mt-8 w-full overflow-hidden md:-mt-12">
                    <img alt="Banner katalog produk Phoenix" className="h-72 w-full object-cover md:h-96" src="/images/banner_product.png" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E4D3A]/80 via-[#1E4D3A]/55 to-[#1E4D3A]/25" />
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute inset-0 flex items-center justify-center px-margin-mobile text-center md:px-margin-desktop">
                        <h1 className="font-headline-xl text-5xl font-bold leading-tight text-white drop-shadow-lg md:text-7xl">
                            Katalog Produk
                        </h1>
                    </div>
                </section>

                <section aria-label="Toolbar katalog produk" className="relative z-20 w-full border-b border-outline-variant/70 bg-[#F3F4F6] px-margin-mobile py-4 shadow-sm shadow-primary-container/5 md:px-margin-desktop md:py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <label className="block sm:w-80 lg:w-90">
                                <span className="sr-only">Cari produk</span>
                                <span className="relative block">
                                    <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        className="block w-full rounded-2xl border-outline-variant bg-surface-container-low py-3 pl-11 pr-4 font-body-sm text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/70 focus:border-primary-container focus:ring-primary-container"
                                        onChange={(event) => updateToolbarValue('search', event.target.value)}
                                        placeholder="Cari produk herbal..."
                                        type="search"
                                        value={toolbarValues.search}
                                    />
                                </span>
                            </label>

                            <p className="px-1 py-3 text-center font-body-sm text-sm font-bold text-primary-container sm:text-left">
                                {productShowingLabel(products)}
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
                    {productCategories.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)]">
                            <aside className="h-fit">
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Kategori</p>
                                <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">Filter produk</h2>
                                <div className="mt-5 flex flex-wrap gap-2 lg:flex-col">
                                    <button
                                        onClick={() => updateToolbarValue('category', '')}
                                        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2 font-body-sm text-xs font-bold transition ${!toolbarValues.category ? 'border-primary-fixed-dim bg-primary-fixed/25 text-primary-container' : 'border-outline-variant bg-white text-on-surface hover:bg-surface-container-low'}`}
                                    >
                                        <span>Semua Kategori</span>
                                    </button>
                                    {productCategories.map((category) => {
                                        const isActive = toolbarValues.category === category.slug;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => updateToolbarValue('category', isActive ? '' : category.slug)}
                                                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2 font-body-sm text-xs font-bold transition ${isActive ? 'border-primary-fixed-dim bg-primary-fixed/25 text-primary-container' : 'border-outline-variant bg-white text-on-surface hover:bg-surface-container-low'}`}
                                            >
                                                <span>{category.name}</span>
                                                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${isActive ? 'bg-white/80 text-primary-container' : 'bg-surface-container-high text-on-surface'}`}>
                                                    {category.products_count ?? 0}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </aside>

                            <div className="min-w-0">
                                <ProductResults productList={productList} products={products} />
                            </div>
                        </div>
                    ) : (
                        <ProductResults productList={productList} products={products} />
                    )}
                </section>
            </div>
        </>
    );
}

ProductIndex.layout = (page) => <PublicShell fullWidth>{page}</PublicShell>;
