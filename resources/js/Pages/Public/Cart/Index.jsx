import { Head, router, useForm } from '@inertiajs/react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';

import { cartItems, cartSubtotal, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function QuantityForm({ item }) {
    const { data, errors, patch, processing, setData } = useForm({ quantity: item.quantity });
    const productName = item.product?.name ?? 'produk Phoenix';

    function submit(event) {
        event.preventDefault();
        patch(route('cart.items.update', item.id), { preserveScroll: true });
    }

    function adjust(delta) {
        setData('quantity', Math.max(1, Number(data.quantity || 1) + delta));
    }

    return (
        <form className="space-y-2" onSubmit={submit}>
            <div className="flex flex-nowrap items-center gap-2">
                <button aria-label={`Kurangi jumlah ${productName}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-primary-container transition hover:bg-primary-fixed/30 focus:outline-none focus:ring-2 focus:ring-primary-container/25" onClick={() => adjust(-1)} type="button">
                    <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
                <input aria-label={`Jumlah ${productName}`} className="h-10 min-w-0 flex-1 rounded-2xl border-outline-variant bg-white text-center font-body-sm text-sm font-bold text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" min="1" onChange={(event) => setData('quantity', event.target.value)} type="number" value={data.quantity} />
                <button aria-label={`Tambah jumlah ${productName}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-primary-container transition hover:bg-primary-fixed/30 focus:outline-none focus:ring-2 focus:ring-primary-container/25" onClick={() => adjust(1)} type="button">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
                <button aria-label={`Update jumlah ${productName}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={processing} type="submit">
                    <Check aria-hidden="true" className="h-4 w-4" />
                </button>
            </div>
            {errors.quantity && <p className="font-body-sm text-xs text-error">{errors.quantity}</p>}
        </form>
    );
}

function CartItemRow({ item }) {
    const product = item.product ?? {};
    const productName = product.name ?? 'Produk Phoenix';
    const unitPrice = Number(product.price ?? 0);
    const quantity = Number(item.quantity ?? 0);
    const lineSubtotal = unitPrice * quantity;

    function removeItem() {
        router.delete(route('cart.items.destroy', item.id), { preserveScroll: true });
    }

    return (
        <PublicCard className="overflow-hidden p-4 transition hover:border-primary-fixed-dim hover:shadow-md hover:shadow-primary-container/10 md:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[128px_1fr]">
                <ProductImage alt={productName} className="h-44 w-full rounded-3xl sm:h-full sm:min-h-36" imagePath={product.image_path} />
                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Produk Herbal</p>
                        <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">{productName}</h2>
                        <div className="mt-4 grid grid-cols-1 gap-3 rounded-3xl bg-surface-container-low p-4 sm:grid-cols-2">
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Harga Satuan</p>
                                <p className="mt-1 font-body-sm text-sm font-extrabold text-primary-container">{formatRupiah(unitPrice)}</p>
                            </div>
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Subtotal Item</p>
                                <p className="mt-1 font-body-lg text-base font-extrabold text-primary-container">{formatRupiah(lineSubtotal)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-outline-variant/80 bg-white p-4 lg:w-64">
                        <p className="mb-3 font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Jumlah</p>
                        <QuantityForm item={item} />
                        <button aria-label={`Hapus ${productName} dari keranjang`} className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-error-container bg-white px-4 py-2.5 font-body-sm text-xs font-bold text-error transition hover:bg-error-container/45 focus:outline-none focus:ring-2 focus:ring-error/20" onClick={removeItem} type="button">
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
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
    const totalQuantity = items.reduce((total, item) => total + Number(item.quantity ?? 0), 0);

    return (
        <>
            <Head title="Keranjang Phoenix" />
            <div className="mx-auto w-full max-w-[1600px] px-margin-mobile md:px-margin-desktop">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
                    <div className="space-y-4">
                        {items.length > 0 ? (
                            items.map((item) => <CartItemRow item={item} key={item.id} />)
                        ) : (
                            <PublicCard className="p-6 text-center md:p-8">
                                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Keranjang Anda masih menunggu produk.</h2>
                                <p className="mx-auto mt-3 max-w-xl font-body-md text-body-md text-on-surface-variant">Mulai dari katalog produk Phoenix untuk menambahkan herbal pilihan, atau cek status pesanan yang sudah pernah dibuat.</p>
                                <div className="mx-auto mt-6 flex max-w-md flex-col justify-center gap-3 sm:flex-row">
                                    <PrimaryLink className="w-full" href={route('products.index')}>Jelajahi Produk Herbal</PrimaryLink>
                                    <SecondaryLink className="w-full" href={route('orders.lookup.create')}>Cek Pesanan</SecondaryLink>
                                </div>
                            </PublicCard>
                        )}
                    </div>
                    <PublicCard className="h-fit p-6 lg:sticky lg:top-24">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Checkout</p>
                        <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Ringkasan Pesanan</h2>
                        <div className="mt-5 space-y-3 rounded-3xl border border-outline-variant bg-surface-container-low p-4">
                            <div className="flex justify-between font-body-sm text-sm text-on-surface-variant">
                                <span>Total item</span>
                                <span className="font-bold text-primary-container">{totalQuantity}</span>
                            </div>
                            <div className="flex justify-between font-body-lg text-base font-extrabold text-primary-container">
                                <span>Subtotal</span>
                                <span>{formatRupiah(subtotal)}</span>
                            </div>
                        </div>
                        <div className="mt-4 rounded-3xl bg-tertiary-fixed/45 p-4">
                            <p className="font-body-sm text-sm leading-6 text-on-tertiary-fixed">Belum termasuk ongkir. Admin akan mengonfirmasi biaya pengiriman setelah order dibuat.</p>
                        </div>
                        <PrimaryLink className="mt-5 w-full" href={route('checkout.show')}>{items.length === 0 ? 'Checkout setelah pilih produk' : 'Lanjut ke Checkout'}</PrimaryLink>
                        <SecondaryLink className="mt-3 w-full" href={route('products.index')}>Tambah Produk</SecondaryLink>
                        <SecondaryLink className="mt-3 w-full" href={route('orders.lookup.create')}>Cek Pesanan</SecondaryLink>
                    </PublicCard>
                </div>
            </div>
        </>
    );
}

CartIndex.layout = (page) => <PublicShell fullWidth>{page}</PublicShell>;
