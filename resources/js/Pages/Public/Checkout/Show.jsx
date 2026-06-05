import { Head, useForm } from '@inertiajs/react';

import { cartItems, cartSubtotal, EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-error">{message}</p> : null;
}

function TextField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
            <input className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name={name} onChange={onChange} type="text" value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
            <textarea className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name={name} onChange={onChange} rows="5" value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

export default function CheckoutShow({ cart, customerProfile }) {
    const items = cartItems(cart);
    const subtotal = cartSubtotal(cart);
    const { data, errors, post, processing, setData } = useForm({
        customer_name: customerProfile?.name ?? '',
        customer_whatsapp_number: customerProfile?.whatsapp_number ?? '',
        shipping_address: customerProfile?.primary_address ?? '',
        voucher_code: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('checkout.store'));
    }

    return (
        <>
            <Head title="Checkout Phoenix" />
            <div className="space-y-8">
                <section className="rounded-[2rem] border border-outline-variant/70 bg-white p-8 shadow-sm shadow-primary-container/5">
                    <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Checkout</p>
                    <h1 className="mt-3 font-headline-xl text-4xl font-bold text-primary-container md:text-5xl">Konfirmasi pesanan dan alamat pengiriman.</h1>
                    <p className="mt-4 font-body-md text-body-md text-on-surface-variant">Admin Phoenix akan mengonfirmasi ongkir sebelum pesanan diproses lebih lanjut.</p>
                </section>

                {items.length === 0 ? (
                    <EmptyState action={<PrimaryLink href={route('products.index')}>Lihat Produk</PrimaryLink>} description="Checkout membutuhkan minimal satu produk di keranjang." title="Belum ada produk untuk checkout." />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                        <PublicCard className="p-6 md:p-8">
                            <h2 className="font-headline-lg text-headline-lg text-primary-container">Data Penerima</h2>
                            <form className="mt-6 space-y-5" onSubmit={submit}>
                                <TextField error={errors.customer_name} label="Nama Customer" name="customer_name" onChange={(event) => setData('customer_name', event.target.value)} value={data.customer_name} />
                                <TextField error={errors.customer_whatsapp_number} label="Nomor WhatsApp" name="customer_whatsapp_number" onChange={(event) => setData('customer_whatsapp_number', event.target.value)} value={data.customer_whatsapp_number} />
                                <TextAreaField error={errors.shipping_address} label="Alamat Pengiriman" name="shipping_address" onChange={(event) => setData('shipping_address', event.target.value)} value={data.shipping_address} />
                                <TextField error={errors.voucher_code} label="Kode Voucher" name="voucher_code" onChange={(event) => setData('voucher_code', event.target.value)} value={data.voucher_code} />
                                <FieldError message={errors.cart} />
                                <button className="inline-flex w-full items-center justify-center rounded-full bg-primary-container px-5 py-3 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={processing} type="submit">
                                    Buat Order
                                </button>
                            </form>
                        </PublicCard>

                        <PublicCard className="h-fit p-6">
                            <h2 className="font-headline-lg text-headline-lg text-primary-container">Ringkasan Pesanan</h2>
                            <div className="mt-5 space-y-4">
                                {items.map((item) => (
                                    <div className="flex gap-3" key={item.id}>
                                        <ProductImage alt={item.product?.name ?? 'Produk Phoenix'} className="h-16 w-16 rounded-2xl" imagePath={item.product?.image_path} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-body-sm text-sm font-bold text-primary-container">{item.product?.name}</p>
                                            <p className="mt-1 font-body-sm text-xs text-on-surface-variant">{item.quantity} x {formatRupiah(item.product?.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 border-t border-outline-variant pt-4">
                                <div className="flex justify-between font-body-lg text-base font-extrabold text-primary-container">
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                                <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">Belum termasuk ongkir. Admin akan mengonfirmasi biaya pengiriman setelah order dibuat.</p>
                            </div>
                            <SecondaryLink className="mt-5 w-full" href={route('cart.index')}>Kembali ke Keranjang</SecondaryLink>
                        </PublicCard>
                    </div>
                )}
            </div>
        </>
    );
}

CheckoutShow.layout = (page) => <PublicShell>{page}</PublicShell>;
