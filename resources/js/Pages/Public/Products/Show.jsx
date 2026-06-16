import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Package, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useRef, useState } from 'react';

import { formatRupiah, PrimaryLink, ProductImage, productCategory, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function RelatedProduct({ product }) {
    const category = productCategory(product);

    return (
        <PublicCard className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary-fixed-dim hover:shadow-xl hover:shadow-primary-container/10">
            <div className="relative overflow-hidden bg-primary-fixed/20">
                <ProductImage alt={product.name} className="h-52 w-full transition duration-500 group-hover:scale-105" imagePath={product.image_path} />
                <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-primary-container shadow-sm shadow-primary-container/10 backdrop-blur">
                    {category?.name ?? 'Herbal'}
                </span>
            </div>
            <div className="p-5">
                <h3 className="font-headline-md text-headline-md text-primary-container">{product.name}</h3>
                <p className="mt-3 line-clamp-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                    {product.short_description || 'Produk botanical Phoenix untuk suplemen perawatan harian.'}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant/70 pt-4">
                    <p className="font-body-lg text-base font-extrabold text-primary-container">{formatRupiah(product.price)}</p>
                    <Link className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim px-3 py-2 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('products.show', product.slug)}>
                        Detail
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </PublicCard>
    );
}

function MetadataPill({ label, value }) {
    if (!value) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-outline-variant/80 bg-white/75 p-4 shadow-sm shadow-primary-container/5">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
            <p className="mt-2 font-body-sm text-sm font-extrabold text-primary-container">{value}</p>
        </div>
    );
}

function formatPackageAmount(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 2,
    }).format(Number(value));
}

function ProductInfoSections({ packageContent, product }) {
    const tabs = [
        product.full_description
            ? {
                content: <p className="whitespace-pre-line">{product.full_description}</p>,
                key: 'detail',
                label: 'Detail',
                title: 'Phoenix',
            }
            : null,
        product.composition
            ? {
                content: <p className="whitespace-pre-line">{product.composition}</p>,
                key: 'composition',
                label: 'Komposisi',
                title: 'Komposisi',
            }
            : null,
        product.packaging_type || packageContent || product.bpom_number
            ? {
                content: (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <MetadataPill label="Tipe kemasan" value={product.packaging_type} />
                        <MetadataPill label="Isi kemasan" value={packageContent} />
                        <MetadataPill label="No. BPOM" value={product.bpom_number} />
                    </div>
                ),
                key: 'package',
                label: 'Informasi',
                title: 'Informasi Produk',
            }
            : null,
        product.usage_rules
            ? {
                content: <p className="whitespace-pre-line">{product.usage_rules}</p>,
                key: 'usage',
                label: 'Cara penggunaan',
                title: 'Cara penggunaan',
            }
            : null,
    ].filter(Boolean);
    const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? null);
    const activeContent = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

    if (!activeContent) {
        return null;
    }

    return (
        <section className="overflow-hidden rounded-[2rem] border border-outline-variant/80 bg-white shadow-sm shadow-primary-container/5">
            <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/80 bg-surface-container-low px-4 pt-4">
                {tabs.map((tab) => {
                    const isActive = tab.key === activeContent.key;

                    return (
                        <button
                            className={`shrink-0 rounded-t-2xl px-5 py-3 font-label-sm text-xs font-bold uppercase tracking-[0.14em] transition ${isActive ? 'bg-white text-primary-container shadow-sm shadow-primary-container/5' : 'text-on-surface-variant hover:bg-white/60 hover:text-primary-container'}`}
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div className="p-6 md:p-8">
                <h2 className="font-headline-lg text-headline-lg text-primary-container">{activeContent.title}</h2>
                <div className="mt-5 font-body-md text-body-md leading-7 text-on-surface-variant">
                    {activeContent.content}
                </div>
            </div>
        </section>
    );
}

function QuantityControl({ data, errors, processing, product, setData, submit }) {
    return (
        <form className="mt-8 rounded-[2rem] border border-outline-variant bg-surface-container-low p-4 shadow-inner shadow-white/70" onSubmit={submit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                    <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Jumlah</span>
                    <input
                        className="mt-2 block w-full rounded-2xl border-outline-variant bg-white px-4 py-3 text-center font-body-sm text-sm font-extrabold text-primary-container shadow-sm focus:border-primary-container focus:ring-primary-container"
                        min="1"
                        max={product.stock_quantity ?? undefined}
                        onChange={(event) => setData('quantity', event.target.value)}
                        type="number"
                        value={data.quantity}
                    />
                </label>
                <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary-container px-6 py-3 font-label-md text-sm font-bold text-white shadow-lg shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-56" disabled={processing} type="submit">
                    <ShoppingBag aria-hidden="true" className="mr-2 h-4 w-4" />
                    Tambah ke Keranjang
                </button>
            </div>
            {errors.quantity && <p className="mt-2 font-body-sm text-xs text-error">{errors.quantity}</p>}
            {errors.product_id && <p className="mt-2 font-body-sm text-xs text-error">{errors.product_id}</p>}
        </form>
    );
}

export default function ProductShow({ product, relatedProducts = [] }) {
    const category = productCategory(product);
    const packageContent = [formatPackageAmount(product.content_amount), product.content_unit].filter(Boolean).join(' ');
    const stockLabel = `${product.stock_quantity ?? 0} tersedia`;
    const productImageRef = useRef(null);
    const [flyingProduct, setFlyingProduct] = useState(null);
    const { data, errors, post, processing, setData } = useForm({ product_id: product.id, quantity: 1 });

    function animateToCart() {
        const source = productImageRef.current;
        const target = document.querySelector('[data-cart-link]');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!source || !target || prefersReducedMotion) {
            return;
        }

        const sourceRect = source.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const startX = sourceRect.left + (sourceRect.width / 2) - 32;
        const startY = sourceRect.top + (sourceRect.height / 2) - 32;
        const endX = targetRect.left + (targetRect.width / 2) - 32;
        const endY = targetRect.top + (targetRect.height / 2) - 32;

        setFlyingProduct({
            endX,
            endY,
            imagePath: product.image_path,
            midX: (startX + endX) / 2,
            midY: startY - 90,
            name: product.name,
            startX,
            startY,
        });

        window.setTimeout(() => setFlyingProduct(null), 900);
    }

    function submit(event) {
        event.preventDefault();
        post(route('cart.items.store'), {
            onSuccess: animateToCart,
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={product.name} />
            <style>{`
                .fly-to-cart {
                    animation: fly-to-cart 820ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                @keyframes fly-to-cart {
                    0% {
                        opacity: 0;
                        transform: translate3d(var(--fly-start-x), var(--fly-start-y), 0) scale(0.86);
                    }

                    12% {
                        opacity: 1;
                    }

                    72% {
                        opacity: 1;
                        transform: translate3d(var(--fly-mid-x), var(--fly-mid-y), 0) scale(0.7) rotate(-8deg);
                    }

                    100% {
                        opacity: 0;
                        transform: translate3d(var(--fly-end-x), var(--fly-end-y), 0) scale(0.28) rotate(8deg);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .fly-to-cart {
                        animation: none;
                    }
                }
            `}</style>
            {flyingProduct && (
                <div
                    aria-hidden="true"
                    className="fly-to-cart pointer-events-none fixed left-0 top-0 z-[80] h-16 w-16 overflow-hidden rounded-2xl border-2 border-white bg-primary-fixed shadow-2xl shadow-primary-container/30"
                    style={{
                        '--fly-end-x': `${flyingProduct.endX}px`,
                        '--fly-end-y': `${flyingProduct.endY}px`,
                        '--fly-mid-x': `${flyingProduct.midX}px`,
                        '--fly-mid-y': `${flyingProduct.midY}px`,
                        '--fly-start-x': `${flyingProduct.startX}px`,
                        '--fly-start-y': `${flyingProduct.startY}px`,
                    }}
                >
                    {flyingProduct.imagePath ? (
                        <img alt="" className="h-full w-full object-cover" src={`/storage/${flyingProduct.imagePath}`} />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-fixed text-primary-container">
                            <ShoppingBag aria-hidden="true" className="h-6 w-6" />
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-8">
                <SecondaryLink href={route('products.index')}>
                    <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                    Kembali ke Produk
                </SecondaryLink>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-start">
                    <div className="space-y-4 lg:sticky lg:top-28">
                        <PublicCard className="relative isolate overflow-hidden bg-surface-container-low p-4 md:p-6" ref={productImageRef}>
                            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-primary-fixed/50 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-tertiary-fixed/40 blur-3xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-primary-container/10">
                                <ProductImage alt={product.name} className="h-[302px] w-full md:h-[418px]" imagePath={product.image_path} />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-container/55 to-transparent p-5 text-white">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.22em]">Phoenix botanical care</p>
                                </div>
                            </div>
                        </PublicCard>
                    </div>

                    <PublicCard className="p-6 md:p-8 lg:sticky lg:top-28">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary-fixed-dim bg-primary-fixed/30 px-4 py-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-primary-container">
                                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                                {category?.name ?? 'Herbal Phoenix'}
                            </span>
                            {product.is_featured && (
                                <span className="flex items-center gap-1.5 rounded-full border border-transparent bg-[#F08A2B] pl-3 pr-4 py-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    Produk Unggulan
                                </span>
                            )}
                            <span className="rounded-full border border-outline-variant bg-white px-4 py-2 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                Luxury botanical
                            </span>
                        </div>
                        <h1 className="mt-5 font-headline-xl text-xl font-bold leading-tight text-primary-container md:text-2xl">
                            {product.name}
                        </h1>
                        <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant">
                            {product.short_description || 'Produk pilihan Phoenix untuk perawatan alami dan wellness harian.'}
                        </p>

                        <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-y border-outline-variant/70 py-5">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Harga</p>
                                <p className="mt-2 font-body-lg text-3xl font-extrabold text-primary-container">{formatRupiah(product.price)}</p>
                            </div>
                            <div className="rounded-full bg-primary-container px-5 py-3 font-body-sm text-sm font-bold text-white shadow-sm shadow-primary-container/20">
                                Stok {stockLabel}
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <MetadataPill label="Kategori" value={category?.name ?? 'Herbal Phoenix'} />
                            <MetadataPill label="Paket" value={packageContent || product.packaging_type} />
                            <MetadataPill label="Stok" value={stockLabel} />
                        </div>

                        <div className="mt-6 rounded-[2rem] border border-primary-fixed-dim bg-primary-fixed/20 p-5">
                            <div className="flex gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-container shadow-sm shadow-primary-container/10">
                                    <Package aria-hidden="true" className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Amount / Method</p>
                                    <p className="mt-2 font-body-sm text-sm leading-6 text-primary-container">
                                        Pilih jumlah produk yang Anda inginkan. Admin Phoenix akan mengonfirmasi detail pengiriman setelah checkout.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <QuantityControl data={data} errors={errors} processing={processing} product={product} setData={setData} submit={submit} />
                    </PublicCard>
                </section>

                <ProductInfoSections packageContent={packageContent} product={product} />

                {relatedProducts.length > 0 && (
                    <section className="space-y-5 rounded-[2rem] bg-surface-container-low p-5 md:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Rekomendasi</p>
                                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Suplemen Phoenix lainnya</h2>
                            </div>
                            <PrimaryLink href={route('products.index')}>Lihat semua</PrimaryLink>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((item) => <RelatedProduct key={item.id} product={item} />)}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

ProductShow.layout = (page) => <PublicShell>{page}</PublicShell>;
