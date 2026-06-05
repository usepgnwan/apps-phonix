import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';

import { formatRupiah, PrimaryLink, ProductImage, productCategory, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function RelatedProduct({ product }) {
    return (
        <PublicCard className="overflow-hidden">
            <ProductImage alt={product.name} className="h-36 w-full" imagePath={product.image_path} />
            <div className="p-4">
                <h3 className="font-body-lg text-sm font-extrabold text-primary-container">{product.name}</h3>
                <p className="mt-2 font-body-sm text-xs text-on-surface-variant">{formatRupiah(product.price)}</p>
                <Link className="mt-3 inline-flex rounded-full border border-primary-fixed-dim px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container hover:bg-primary-fixed/30" href={route('products.show', product.slug)}>
                    Lihat detail
                </Link>
            </div>
        </PublicCard>
    );
}

export default function ProductShow({ product, relatedProducts = [] }) {
    const category = productCategory(product);
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

                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <PublicCard className="overflow-hidden" ref={productImageRef}>
                        <ProductImage alt={product.name} className="h-full min-h-[360px] w-full" imagePath={product.image_path} />
                    </PublicCard>

                    <PublicCard className="p-6 md:p-8">
                        <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                            {category?.name ?? 'Herbal Phoenix'}
                        </p>
                        <h1 className="mt-3 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">
                            {product.name}
                        </h1>
                        <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant">
                            {product.short_description || 'Produk pilihan Phoenix untuk perawatan alami dan wellness harian.'}
                        </p>
                        <p className="mt-6 font-body-lg text-2xl font-extrabold text-primary-container">
                            {formatRupiah(product.price)}
                        </p>
                        <p className="mt-2 font-body-sm text-sm text-on-surface-variant">
                            Stok tersedia: <span className="font-bold text-primary-container">{product.stock_quantity ?? 0}</span>
                        </p>

                        <form className="mt-8 rounded-3xl border border-outline-variant bg-surface-container-low p-4" onSubmit={submit}>
                            <label className="block">
                                <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Jumlah</span>
                                <input
                                    className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                    min="1"
                                    max={product.stock_quantity ?? undefined}
                                    onChange={(event) => setData('quantity', event.target.value)}
                                    type="number"
                                    value={data.quantity}
                                />
                            </label>
                            {errors.quantity && <p className="mt-2 font-body-sm text-xs text-error">{errors.quantity}</p>}
                            {errors.product_id && <p className="mt-2 font-body-sm text-xs text-error">{errors.product_id}</p>}
                            <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary-container px-5 py-3 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={processing} type="submit">
                                <ShoppingBag aria-hidden="true" className="mr-2 h-4 w-4" />
                                Tambah ke Keranjang
                            </button>
                        </form>
                    </PublicCard>
                </section>

                {product.full_description && (
                    <PublicCard className="p-6 md:p-8">
                        <h2 className="font-headline-lg text-headline-lg text-primary-container">Detail Produk</h2>
                        <p className="mt-4 whitespace-pre-line font-body-md text-body-md leading-7 text-on-surface-variant">{product.full_description}</p>
                    </PublicCard>
                )}

                {relatedProducts.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Rekomendasi</p>
                                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Produk terkait</h2>
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
