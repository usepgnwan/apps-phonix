import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronRight, MapPin, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
    changeSelectedBranch,
    formatRupiah,
    ProductImage,
    productCategory,
    PublicShell,
} from '@/Components/Public/commerce.jsx';

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
        <div className="space-y-3">
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
        <div className="grid grid-cols-1 gap-1 border-b border-outline-variant/50 py-3 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
            <dt className="font-label-sm text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                {label}
            </dt>
            <dd className="font-body-sm text-sm font-semibold text-primary-container">{value}</dd>
        </div>
    );
}

function buildInfoTabs({ packageContent, product }) {
    return [
        product.usage_rules
            ? {
                content: <UsageContent text={product.usage_rules} />,
                key: 'usage',
                title: 'Cara pakai',
            }
            : null,
        product.full_description
            ? {
                content: <MultilineTextContent text={product.full_description} />,
                key: 'detail',
                title: 'Detail',
            }
            : null,
        product.composition
            ? {
                content: <CompositionContent text={product.composition} />,
                key: 'composition',
                title: 'Komposisi',
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
}

function ProductInfoTabs({ packageContent, product }) {
    const tabs = buildInfoTabs({ packageContent, product });
    const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? null);
    const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0] ?? null;

    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 border-t border-outline-variant/60 pt-6">
            <div className="-mx-1 flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Informasi produk">
                {tabs.map((tab) => {
                    const isActive = tab.key === activeTab?.key;

                    return (
                        <button
                            aria-controls={`product-tab-${tab.key}`}
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
                id={`product-tab-${activeTab.key}`}
                role="tabpanel"
            >
                <div className="max-w-2xl">{activeTab.content}</div>
            </div>
        </div>
    );
}

function QuantityStepper({ availableStock, disabled, quantity, setData }) {
    const maxQty = availableStock > 0 ? availableStock : 1;
    const current = Math.max(1, Number(quantity || 1));

    function adjust(delta) {
        if (disabled) {
            return;
        }

        const next = Math.min(maxQty, Math.max(1, current + delta));
        setData('quantity', next);
    }

    return (
        <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-outline-variant bg-white p-1 shadow-sm">
                <button
                    aria-label="Kurangi jumlah"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-primary-container transition hover:bg-primary-fixed/30 focus:outline-none focus:ring-2 focus:ring-primary-container/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={disabled || current <= 1}
                    onClick={() => adjust(-1)}
                    type="button"
                >
                    <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
                <input
                    aria-label="Jumlah produk"
                    className="h-10 w-12 border-0 bg-transparent text-center font-body-sm text-sm font-extrabold text-primary-container focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-on-surface-variant"
                    disabled={disabled}
                    max={maxQty}
                    min="1"
                    onChange={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isNaN(next)) {
                            setData('quantity', 1);
                            return;
                        }
                        setData('quantity', Math.min(maxQty, Math.max(1, next)));
                    }}
                    type="number"
                    value={current}
                />
                <button
                    aria-label="Tambah jumlah"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-primary-container transition hover:bg-primary-fixed/30 focus:outline-none focus:ring-2 focus:ring-primary-container/20 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={disabled || current >= maxQty}
                    onClick={() => adjust(1)}
                    type="button"
                >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function BuyPanel({
    availableStock,
    buyNow,
    buyNowProcessing = false,
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
    const isBusy = processing || buyNowProcessing;
    const canSubmit = hasBranch && availableStock > 0 && !isQuantityInvalid && !isBusy;

    let ctaLabel = 'Tambah ke Keranjang';
    if (!hasBranch) {
        ctaLabel = 'Pilih cabang dulu';
    } else if (isOutOfStock) {
        ctaLabel = 'Stok habis di cabang ini';
    } else if (processing) {
        ctaLabel = 'Menambahkan...';
    }

    let buyNowLabel = 'Beli sekarang';
    if (!hasBranch) {
        buyNowLabel = 'Pilih cabang dulu';
    } else if (isOutOfStock) {
        buyNowLabel = 'Stok habis di cabang ini';
    } else if (buyNowProcessing) {
        buyNowLabel = 'Mengalihkan...';
    }

    let stockMessage = 'Pilih cabang untuk melihat stok';
    let stockTone = 'text-on-surface-variant';
    if (hasBranch && availableStock > 0) {
        stockMessage = `Stok tersedia: ${availableStock}`;
        stockTone = 'text-primary-container';
    } else if (isOutOfStock) {
        stockMessage = 'Stok habis di cabang ini';
        stockTone = 'text-error';
    }

    return (
        <form className="mt-7 space-y-5" onSubmit={submit}>
            {branches.length > 0 && (
                <div>
                    <label className="block" htmlFor="product-branch-select">
                        <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
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

                    {cartCount > 0 && (
                        <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                            Mengganti cabang akan mengosongkan keranjang Anda.
                        </p>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
                <div>
                    <p className="mb-2 font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        Jumlah
                    </p>
                    <QuantityStepper
                        availableStock={availableStock}
                        disabled={!hasBranch || isOutOfStock}
                        quantity={data.quantity}
                        setData={setData}
                    />
                </div>
                <p className={`pt-6 font-body-sm text-sm font-semibold ${stockTone}`}>{stockMessage}</p>
            </div>

            <button
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-primary-container px-6 font-label-md text-sm font-bold tracking-wide text-white shadow-md shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-outline-variant disabled:shadow-none"
                disabled={!canSubmit}
                type="submit"
            >
                {canSubmit && <ShoppingBag aria-hidden="true" className="mr-2 h-5 w-5" />}
                {ctaLabel}
            </button>

            <button
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-primary-fixed-dim bg-white px-6 font-label-md text-sm font-bold tracking-wide text-primary-container transition hover:bg-primary-fixed/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canSubmit}
                onClick={buyNow}
                type="button"
            >
                {buyNowLabel}
            </button>

            {errors.branch_id && <p className="font-body-sm text-xs text-error">{errors.branch_id}</p>}
            {errors.quantity && <p className="font-body-sm text-xs text-error">{errors.quantity}</p>}
            {errors.product_id && <p className="font-body-sm text-xs text-error">{errors.product_id}</p>}
        </form>
    );
}

function RelatedProduct({ product }) {
    return (
        <Link
            className="group block overflow-hidden rounded-[1.5rem] border border-outline-variant/70 bg-white transition duration-300 hover:-translate-y-1 hover:border-primary-fixed-dim hover:shadow-xl hover:shadow-primary-container/10"
            href={route('products.show', product.slug)}
        >
            <div className="relative overflow-hidden bg-[#E8F0E9]">
                <ProductImage
                    alt={product.name}
                    className="h-56 w-full !object-contain p-4 transition duration-500 group-hover:scale-105"
                    imagePath={product.image_path}
                />
            </div>
            <div className="space-y-2 p-4">
                <h3 className="font-headline-md text-base font-bold uppercase tracking-wide text-primary-container">
                    {product.name}
                </h3>
                <p className="font-body-lg text-base font-extrabold text-primary-container">
                    {formatRupiah(product.price)}
                </p>
            </div>
        </Link>
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
    const metaLine = [category?.name, packageContent || product.packaging_type].filter(Boolean).join(' · ');

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

    function buyNow(event) {
        event.preventDefault();

        if (!data.branch_id || processing) {
            return;
        }

        router.post(route('checkout.buy-now'), {
            product_id: data.product_id,
            quantity: data.quantity,
            branch_id: data.branch_id,
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
                        <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={
                                flyingProduct.imagePath.startsWith('/') || flyingProduct.imagePath.startsWith('http')
                                    ? flyingProduct.imagePath
                                    : `/storage/${flyingProduct.imagePath}`
                            }
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-fixed text-primary-container">
                            <ShoppingBag aria-hidden="true" className="h-6 w-6" />
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-10 md:space-y-14">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-body-sm text-sm text-on-surface-variant">
                    <Link className="transition hover:text-primary-container" href={route('home')}>
                        Beranda
                    </Link>
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <Link className="transition hover:text-primary-container" href={route('products.index')}>
                        Produk
                    </Link>
                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="font-semibold text-primary-container">{product.name}</span>
                </nav>

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
                    <div className="lg:sticky lg:top-28" ref={productImageRef}>
                        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/50 bg-[#E8F0E9]">
                            <ProductImage
                                alt={product.name}
                                className="!h-[360px] w-full !object-contain p-8 md:!h-[520px] md:p-12"
                                imagePath={product.image_path}
                            />
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-28">
                        <div className="flex flex-wrap items-center gap-2">
                            {product.is_featured && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F08A2B] px-3 py-1.5 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                                    <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                                    Unggulan
                                </span>
                            )}
                            {category?.name && (
                                <span className="inline-flex rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1.5 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-primary-container">
                                    {category.name}
                                </span>
                            )}
                        </div>

                        <h1 className="mt-4 font-headline-xl text-3xl font-bold uppercase tracking-wide text-primary-container md:text-4xl">
                            {product.name}
                        </h1>

                        {metaLine && (
                            <p className="mt-3 font-body-sm text-sm text-on-surface-variant">
                                {metaLine}
                            </p>
                        )}

                        <p className="mt-4 max-w-xl font-body-md text-base leading-7 text-on-surface-variant">
                            {product.short_description || 'Produk pilihan Phoenix untuk perawatan alami dan wellness harian.'}
                        </p>

                        <div className="mt-6">
                            <p className="font-body-lg text-3xl font-extrabold tracking-tight text-primary-container md:text-4xl">
                                {formatRupiah(product.price)}
                            </p>
                        </div>

                        <BuyPanel
                            availableStock={availableStock}
                            branches={branches}
                            buyNow={buyNow}
                            buyNowProcessing={processing}
                            cartCount={cartCount}
                            data={data}
                            errors={errors}
                            onBranchChange={handleBranchChange}
                            processing={processing}
                            selectedBranch={selectedBranch}
                            setData={setData}
                            submit={submit}
                        />

                        <ProductInfoTabs packageContent={packageContent} product={product} />
                    </div>
                </section>

                {relatedProducts.length > 0 && (
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
                                href={route('products.index')}
                            >
                                Lihat semua produk
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((item) => (
                                <RelatedProduct key={item.id} product={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

ProductShow.layout = (page) => <PublicShell>{page}</PublicShell>;
