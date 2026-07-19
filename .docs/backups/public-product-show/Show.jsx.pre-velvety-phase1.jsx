import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ChevronDown, MapPin, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
    changeSelectedBranch,
    formatRupiah,
    PrimaryLink,
    ProductImage,
    productCategory,
    PublicCard,
    PublicShell,
    SecondaryLink,
} from '@/Components/Public/commerce.jsx';

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
        <div className="space-y-4">
            {lines.map((line, index) => (
                <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>
            ))}
        </div>
    );
}

function CompositionContent({ text }) {
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

function UsageContent({ text }) {
    const lines = splitContentLines(text);

    if (lines.length === 0) {
        return null;
    }

    if (lines.length === 1) {
        return <p className="whitespace-pre-line">{lines[0]}</p>;
    }

    const looksNumbered = lines.every((line) => /^\d+[\.\)]\s+/.test(line));

    if (looksNumbered) {
        return (
            <ol className="list-decimal space-y-2 pl-5">
                {lines.map((line, index) => (
                    <li key={`${index}-${line.slice(0, 24)}`}>{line.replace(/^\d+[\.\)]\s+/, '')}</li>
                ))}
            </ol>
        );
    }

    return (
        <ol className="list-decimal space-y-2 pl-5">
            {lines.map((line, index) => (
                <li key={`${index}-${line.slice(0, 24)}`}>{line}</li>
            ))}
        </ol>
    );
}

function SpecRow({ label, value }) {
    if (!value) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 gap-1 border-b border-outline-variant/60 py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                {label}
            </dt>
            <dd className="font-body-sm text-sm font-semibold text-primary-container">{value}</dd>
        </div>
    );
}

function ProductInfoSections({ packageContent, product }) {
    const sections = [
        product.full_description
            ? {
                content: <MultilineTextContent text={product.full_description} />,
                key: 'detail',
                title: 'Detail produk',
            }
            : null,
        product.composition
            ? {
                content: <CompositionContent text={product.composition} />,
                key: 'composition',
                title: 'Komposisi',
            }
            : null,
        product.usage_rules
            ? {
                content: <UsageContent text={product.usage_rules} />,
                key: 'usage',
                title: 'Cara pakai',
            }
            : null,
        product.packaging_type || packageContent || product.bpom_number
            ? {
                content: (
                    <dl>
                        <SpecRow label="Tipe kemasan" value={product.packaging_type} />
                        <SpecRow label="Isi kemasan" value={packageContent} />
                        <SpecRow label="No. BPOM" value={product.bpom_number} />
                    </dl>
                ),
                key: 'specs',
                title: 'Spesifikasi',
            }
            : null,
    ].filter(Boolean);

    const [openSections, setOpenSections] = useState(() => {
        if (sections.some((section) => section.key === 'detail')) {
            return { detail: true };
        }

        return sections[0] ? { [sections[0].key]: true } : {};
    });

    if (sections.length === 0) {
        return null;
    }

    function toggleSection(key) {
        setOpenSections((current) => ({
            ...current,
            [key]: !current[key],
        }));
    }

    return (
        <section className="overflow-hidden rounded-[2rem] border border-outline-variant/80 bg-white shadow-sm shadow-primary-container/5">
            <div className="border-b border-outline-variant/70 px-5 py-5 md:px-8 md:py-6">
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Informasi produk
                </p>
                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">
                    Detail, komposisi, dan cara pakai
                </h2>
            </div>

            <div className="divide-y divide-outline-variant/70">
                {sections.map((section) => {
                    const isOpen = Boolean(openSections[section.key]);

                    return (
                        <div key={section.key}>
                            <button
                                aria-controls={`product-section-${section.key}`}
                                aria-expanded={isOpen}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-container-low/70 md:px-8"
                                onClick={() => toggleSection(section.key)}
                                type="button"
                            >
                                <span className="font-body-md text-base font-bold text-primary-container">
                                    {section.title}
                                </span>
                                <ChevronDown
                                    aria-hidden="true"
                                    className={`h-5 w-5 shrink-0 text-primary-container transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isOpen && (
                                <div
                                    className="px-5 pb-5 font-body-md text-body-md leading-7 text-on-surface-variant md:px-8 md:pb-6"
                                    id={`product-section-${section.key}`}
                                >
                                    <div className="max-w-3xl">{section.content}</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function BuyPanel({
    availableStock,
    cartCount,
    data,
    errors,
    onBranchChange,
    processing,
    selectedBranch,
    setData,
    submit,
    branches,
}) {
    const hasBranch = Boolean(data.branch_id);
    const isOutOfStock = hasBranch && availableStock === 0;
    const isQuantityInvalid = hasBranch && availableStock > 0 && Number(data.quantity) > availableStock;
    const canSubmit = hasBranch && availableStock > 0 && !isQuantityInvalid && !processing;

    let ctaLabel = 'Tambah ke Keranjang';
    if (!hasBranch) {
        ctaLabel = 'Pilih cabang dulu';
    } else if (isOutOfStock) {
        ctaLabel = 'Stok habis di cabang ini';
    }

    let stockMessage = 'Pilih cabang untuk melihat stok.';
    let stockTone = 'text-on-surface-variant';
    if (hasBranch && availableStock > 0) {
        stockMessage = `Tersedia ${availableStock} unit di cabang ini`;
        stockTone = 'text-[#1E4D3A]';
    } else if (isOutOfStock) {
        stockMessage = 'Stok habis di cabang ini';
        stockTone = 'text-red-600';
    }

    return (
        <form
            className="mt-7 rounded-[2rem] border border-outline-variant bg-surface-container-low p-5 shadow-inner shadow-white/70 md:p-6"
            onSubmit={submit}
        >
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                Beli
            </p>

            <div className="mt-5 space-y-5">
                {branches.length > 0 && (
                    <div>
                        <label className="block" htmlFor="product-branch-select">
                            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                Cek stok di cabang
                            </span>
                            <div className="relative mt-2">
                                <select
                                    id="product-branch-select"
                                    className="block w-full appearance-none rounded-2xl border-outline-variant bg-white py-3 pl-11 pr-10 font-body-sm text-sm font-extrabold text-primary-container shadow-sm focus:border-primary-container focus:ring-primary-container"
                                    onChange={(event) => onBranchChange(event.target.value)}
                                    value={data.branch_id || ''}
                                >
                                    <option value="" disabled>
                                        Pilih cabang
                                    </option>
                                    {branches.map((branch) => {
                                        const stock = branch.product_stocks?.[0]?.stock_quantity ?? 0;

                                        return (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                                {stock > 0 ? ` · ${stock} tersedia` : ' · Habis'}
                                            </option>
                                        );
                                    })}
                                </select>
                                <MapPin
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-container"
                                />
                            </div>
                        </label>

                        {selectedBranch?.address && (
                            <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                                {selectedBranch.address}
                            </p>
                        )}

                        <p className={`mt-3 font-body-sm text-sm font-semibold ${stockTone}`}>
                            {stockMessage}
                        </p>

                        {cartCount > 0 && (
                            <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                                Mengganti cabang akan mengosongkan keranjang Anda.
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr] sm:items-end">
                    <label className="block">
                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                            Jumlah
                        </span>
                        <input
                            className="mt-2 block w-full rounded-2xl border-outline-variant bg-white px-4 py-3 text-center font-body-sm text-sm font-extrabold text-primary-container shadow-sm focus:border-primary-container focus:ring-primary-container disabled:cursor-not-allowed disabled:bg-white/70 disabled:text-on-surface-variant"
                            min="1"
                            max={availableStock > 0 ? availableStock : 1}
                            onChange={(event) => setData('quantity', event.target.value)}
                            type="number"
                            value={data.quantity}
                            disabled={!hasBranch || isOutOfStock}
                        />
                    </label>

                    <button
                        className="inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-primary-container px-6 font-label-md text-sm font-bold text-white shadow-md shadow-primary-container/20 transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-outline-variant disabled:shadow-none"
                        disabled={!canSubmit}
                        type="submit"
                    >
                        {canSubmit && <ShoppingBag aria-hidden="true" className="mr-2 h-5 w-5" />}
                        {ctaLabel}
                    </button>
                </div>
            </div>

            {errors.branch_id && <p className="mt-3 font-body-sm text-xs text-error">{errors.branch_id}</p>}
            {errors.quantity && <p className="mt-3 font-body-sm text-xs text-error">{errors.quantity}</p>}
            {errors.product_id && <p className="mt-3 font-body-sm text-xs text-error">{errors.product_id}</p>}
        </form>
    );
}

export default function ProductShow({ product, relatedProducts = [], branches = [] }) {
    const { cartSummary, selectedBranchId } = usePage().props;
    const cartCount = Number(cartSummary?.count ?? 0);
    const category = productCategory(product);
    const packageContent = [formatPackageAmount(product.content_amount), product.content_unit].filter(Boolean).join(' ');
    const productImageRef = useRef(null);
    const [flyingProduct, setFlyingProduct] = useState(null);

    const defaultBranchId = selectedBranchId || (branches.length > 0 ? branches[0].id : '');
    const { data, errors, post, processing, setData } = useForm({
        product_id: product.id,
        quantity: 1,
        branch_id: defaultBranchId,
    });

    useEffect(() => {
        if (selectedBranchId && String(selectedBranchId) !== String(data.branch_id ?? '')) {
            setData((prev) => ({ ...prev, branch_id: selectedBranchId, quantity: 1 }));
        }
    }, [selectedBranchId]);

    const selectedBranch = branches.find((b) => String(b.id) === String(data.branch_id ?? ''));
    const availableStock = selectedBranch?.product_stocks?.[0]?.stock_quantity ?? 0;

    function handleBranchChange(newBranchId) {
        if (!newBranchId || String(newBranchId) === String(data.branch_id ?? '')) {
            return;
        }

        const changed = changeSelectedBranch(newBranchId, {
            cartCount,
            currentBranchId: selectedBranchId ?? data.branch_id,
        });

        if (!changed) {
            return;
        }

        setData((prev) => ({ ...prev, branch_id: newBranchId, quantity: 1 }));
    }

    function animateToCart() {
        const source = productImageRef.current;
        const target = document.querySelector('[data-cart-link]');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!source || !target || prefersReducedMotion) {
            return;
        }

        const sourceRect = source.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const startX = sourceRect.left + sourceRect.width / 2 - 32;
        const startY = sourceRect.top + sourceRect.height / 2 - 32;
        const endX = targetRect.left + targetRect.width / 2 - 32;
        const endY = targetRect.top + targetRect.height / 2 - 32;

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
                        </div>

                        <h1 className="mt-5 font-headline-xl text-xl font-bold leading-tight text-primary-container md:text-2xl">
                            {product.name}
                        </h1>
                        <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant">
                            {product.short_description || 'Produk pilihan Phoenix untuk perawatan alami dan wellness harian.'}
                        </p>

                        <div className="mt-6 border-y border-outline-variant/70 py-5">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                Harga
                            </p>
                            <p className="mt-2 font-body-lg text-3xl font-extrabold text-primary-container">
                                {formatRupiah(product.price)}
                            </p>
                        </div>

                        <BuyPanel
                            availableStock={availableStock}
                            branches={branches}
                            cartCount={cartCount}
                            data={data}
                            errors={errors}
                            onBranchChange={handleBranchChange}
                            processing={processing}
                            selectedBranch={selectedBranch}
                            setData={setData}
                            submit={submit}
                        />

                        {(category?.name || packageContent || product.packaging_type) && (
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <MetadataPill label="Kategori" value={category?.name ?? 'Herbal Phoenix'} />
                                <MetadataPill label="Paket" value={packageContent || product.packaging_type} />
                            </div>
                        )}
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
