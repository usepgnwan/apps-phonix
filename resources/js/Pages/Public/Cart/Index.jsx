import { Head, router, useForm } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { cartItems, cartSubtotal, EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function QuantityForm({ item }) {
    const { data, errors, patch, processing, setData } = useForm({ quantity: item.quantity });

    function submit(event) {
        event.preventDefault();
        patch(route('cart.items.update', item.id), { preserveScroll: true });
    }

    function adjust(delta) {
        setData('quantity', Math.max(1, Number(data.quantity || 1) + delta));
    }

    return (
        <form className="space-y-2" onSubmit={submit}>
            <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-primary-container hover:bg-primary-fixed/30" onClick={() => adjust(-1)} type="button">
                    <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
                <input className="w-20 rounded-2xl border-outline-variant bg-white text-center font-body-sm text-sm font-bold text-on-surface focus:border-primary-container focus:ring-primary-container" min="1" onChange={(event) => setData('quantity', event.target.value)} type="number" value={data.quantity} />
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-primary-container hover:bg-primary-fixed/30" onClick={() => adjust(1)} type="button">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
                <button className="rounded-full bg-primary-container px-4 py-2 font-body-sm text-xs font-bold text-white transition hover:bg-primary disabled:opacity-60" disabled={processing} type="submit">
                    Update
                </button>
            </div>
            {errors.quantity && <p className="font-body-sm text-xs text-error">{errors.quantity}</p>}
        </form>
    );
}

function CartItemRow({ item }) {
    const product = item.product ?? {};

    function removeItem() {
        router.delete(route('cart.items.destroy', item.id), { preserveScroll: true });
    }

    return (
        <PublicCard className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
                <ProductImage alt={product.name ?? 'Produk Phoenix'} className="h-32 w-full rounded-3xl" imagePath={product.image_path} />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Keranjang</p>
                        <h2 className="mt-1 font-headline-md text-headline-md text-primary-container">{product.name}</h2>
                        <p className="mt-2 font-body-sm text-sm text-on-surface-variant">{formatRupiah(product.price)} / item</p>
                        <p className="mt-1 font-body-lg text-base font-extrabold text-primary-container">Subtotal {formatRupiah(Number(product.price ?? 0) * Number(item.quantity ?? 0))}</p>
                    </div>
                    <div className="space-y-3">
                        <QuantityForm item={item} />
                        <button className="inline-flex items-center gap-2 rounded-full border border-error-container bg-white px-4 py-2 font-body-sm text-xs font-bold text-error transition hover:bg-error-container/45" onClick={removeItem} type="button">
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </PublicCard>
    );
}

export default function CartIndex({ cart }) {
    const items = cartItems(cart);
    const subtotal = cartSubtotal(cart);

    return (
        <>
            <Head title="Keranjang Phoenix" />
            <div className="space-y-8">
                <section className="rounded-[2rem] border border-outline-variant/70 bg-white p-8 shadow-sm shadow-primary-container/5">
                    <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Keranjang Belanja</p>
                    <h1 className="mt-3 font-headline-xl text-4xl font-bold text-primary-container md:text-5xl">Siapkan pesanan herbal Anda.</h1>
                    <p className="mt-4 font-body-md text-body-md text-on-surface-variant">Atur jumlah produk sebelum lanjut ke checkout dan konfirmasi alamat pengiriman.</p>
                </section>

                {items.length === 0 ? (
                    <EmptyState action={<PrimaryLink href={route('products.index')}>Lihat Produk</PrimaryLink>} description="Tambahkan produk herbal Phoenix terlebih dahulu untuk melanjutkan ke checkout." title="Keranjang masih kosong." />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            {items.map((item) => <CartItemRow item={item} key={item.id} />)}
                        </div>
                        <PublicCard className="h-fit p-6">
                            <h2 className="font-headline-lg text-headline-lg text-primary-container">Ringkasan</h2>
                            <div className="mt-5 space-y-3 border-y border-outline-variant py-4">
                                <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                    <span>Total item</span>
                                    <span>{items.reduce((total, item) => total + Number(item.quantity ?? 0), 0)}</span>
                                </div>
                                <div className="flex justify-between font-body-lg text-base font-extrabold text-primary-container">
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                            </div>
                            <PrimaryLink className="mt-5 w-full" href={route('checkout.show')}>Lanjut Checkout</PrimaryLink>
                            <SecondaryLink className="mt-3 w-full" href={route('products.index')}>Tambah Produk</SecondaryLink>
                        </PublicCard>
                    </div>
                )}
            </div>
        </>
    );
}

CartIndex.layout = (page) => <PublicShell>{page}</PublicShell>;
