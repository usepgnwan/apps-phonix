import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { EmptyState, formatRupiah, PrimaryLink, ProductImage, productCategory, PublicCard, PublicShell } from '@/Components/Public/commerce.jsx';

function paginationLabel(label) {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

function ProductCard({ product }) {
    const category = productCategory(product);

    return (
        <PublicCard className="overflow-hidden">
            <ProductImage alt={product.name} className="h-56 w-full" imagePath={product.image_path} />
            <div className="p-5">
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                    {category?.name ?? 'Herbal Phoenix'}
                </p>
                <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">
                    {product.name}
                </h2>
                <p className="mt-3 line-clamp-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                    {product.short_description || 'Produk herbal Phoenix pilihan untuk mendukung rutinitas wellness Anda.'}
                </p>
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

export default function ProductIndex({ productCategories = [], products }) {
    const productList = products?.data ?? [];

    return (
        <>
            <Head title="Produk Herbal Phoenix" />
            <div className="space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-outline-variant/70 bg-white p-8 shadow-sm shadow-primary-container/5 md:p-10">
                    <div className="max-w-3xl">
                        <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Katalog Produk</p>
                        <h1 className="mt-3 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">
                            Pilihan herbal dan alat terapi untuk perawatan alami Anda.
                        </h1>
                        <p className="mt-5 font-body-lg text-body-lg text-on-surface-variant">
                            Jelajahi produk Phoenix dengan pendekatan botanical, profesional, dan mudah dipesan dari rumah.
                        </p>
                    </div>
                    {productCategories.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                            {productCategories.map((category) => (
                                <span className="rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-4 py-2 font-body-sm text-xs font-bold text-primary-container" key={category.id}>
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

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
                    <div className="flex flex-wrap justify-center gap-2">
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
            </div>
        </>
    );
}

ProductIndex.layout = (page) => <PublicShell>{page}</PublicShell>;
