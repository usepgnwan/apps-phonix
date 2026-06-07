import { Head, useForm } from '@inertiajs/react';

import { PrimaryLink, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-error">{message}</p> : null;
}

function TextField({ error, label, name, onChange, placeholder, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
            <input className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name={name} onChange={onChange} placeholder={placeholder} type="text" value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

export default function OrderLookup() {
    const { data, errors, post, processing, setData } = useForm({
        order_number: '',
        customer_whatsapp_number: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('orders.lookup.store'));
    }

    return (
        <>
            <Head title="Cek Pesanan Phoenix" />
            <div className="mx-auto max-w-3xl space-y-8">
                <PublicCard className="p-6 md:p-8">
                    <form className="space-y-5" onSubmit={submit}>
                        <TextField error={errors.order_number} label="Nomor Order" name="order_number" onChange={(event) => setData('order_number', event.target.value)} placeholder="Contoh: ORD-20260607-ABC123" value={data.order_number} />
                        <TextField error={errors.customer_whatsapp_number} label="Nomor WhatsApp" name="customer_whatsapp_number" onChange={(event) => setData('customer_whatsapp_number', event.target.value)} placeholder="Contoh: 08123456789" value={data.customer_whatsapp_number} />
                        <button className="inline-flex w-full items-center justify-center rounded-full bg-primary-container px-5 py-3 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={processing} type="submit">
                            Cek Pesanan
                        </button>
                    </form>
                    <div className="mt-6 rounded-3xl bg-primary-fixed/25 p-5">
                        <p className="font-body-sm text-sm leading-6 text-on-surface-variant">Nomor order muncul setelah checkout berhasil. Jika Anda belum menyimpannya, hubungi admin Phoenix melalui WhatsApp dan sertakan nama serta nomor yang dipakai saat checkout.</p>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <SecondaryLink className="w-full" href={route('cart.index')}>Kembali ke Keranjang</SecondaryLink>
                        <PrimaryLink className="w-full" href={route('products.index')}>Lihat Produk</PrimaryLink>
                    </div>
                </PublicCard>
            </div>
        </>
    );
}

OrderLookup.layout = (page) => <PublicShell>{page}</PublicShell>;
