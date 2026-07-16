import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, MapPin, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Modal from '@/Components/Modal';
import {
    cartItems,
    cartSubtotal,
    formatRupiah,
    PrimaryLink,
    ProductImage,
    PublicCard,
    PublicShell,
    SecondaryLink,
} from '@/Components/Public/commerce.jsx';

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

function applyBranchChange(branchId) {
    router.post(route('branches.set'), { branch_id: branchId }, { preserveScroll: true });
}

function CartBranchPanel({ branches, cartBranch, cartCount, selectedBranchId }) {
    const currentBranchId = cartBranch?.id ?? selectedBranchId ?? '';
    const currentBranchName =
        cartBranch?.name
        ?? branches.find((branch) => String(branch.id) === String(currentBranchId ?? ''))?.name
        ?? null;
    const [pendingBranchId, setPendingBranchId] = useState(null);
    const isConfirmOpen = pendingBranchId !== null;
    const pendingBranchName =
        branches.find((branch) => String(branch.id) === String(pendingBranchId ?? ''))?.name
        ?? 'cabang lain';

    function handleBranchChange(event) {
        const newBranchId = event.target.value;

        if (!newBranchId || String(newBranchId) === String(currentBranchId ?? '')) {
            return;
        }

        if (cartCount > 0) {
            setPendingBranchId(newBranchId);
            return;
        }

        applyBranchChange(newBranchId);
    }

    function closeConfirmModal() {
        setPendingBranchId(null);
    }

    function confirmBranchChange() {
        if (!pendingBranchId) {
            return;
        }

        applyBranchChange(pendingBranchId);
        setPendingBranchId(null);
    }

    if (!branches.length) {
        return null;
    }

    return (
        <>
            <div className="mt-5 rounded-3xl border border-outline-variant bg-surface-container-low p-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed/35 text-primary-container">
                        <MapPin aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                            Cabang keranjang
                        </p>
                        <p className="mt-1 font-body-md text-sm font-extrabold text-primary-container">
                            {currentBranchName || 'Belum dipilih'}
                        </p>
                        <p className="mt-1 font-body-sm text-xs leading-5 text-on-surface-variant">
                            Satu keranjang hanya dari satu cabang. Semua item di bawah ini mengikuti cabang ini.
                        </p>
                    </div>
                </div>

                <label className="mt-4 block">
                    <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        Ganti cabang
                    </span>
                    <select
                        className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm font-semibold text-primary-container shadow-sm focus:border-primary-container focus:ring-primary-container"
                        onChange={handleBranchChange}
                        value={currentBranchId || ''}
                    >
                        <option value="" disabled>
                            Pilih cabang
                        </option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </label>

                {cartCount > 0 && (
                    <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">
                        Mengganti cabang akan mengosongkan keranjang. Selesaikan checkout dulu jika ingin belanja di cabang lain tanpa menghapus item.
                    </p>
                )}
            </div>

            <Modal show={isConfirmOpen} onClose={closeConfirmModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed/40 text-primary-container">
                            <MapPin aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-headline-md text-lg font-bold text-primary-container">
                                Ganti cabang keranjang?
                            </h2>
                            <p className="mt-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                                Anda memiliki barang di keranjang
                                {currentBranchName ? (
                                    <>
                                        {' '}dari <span className="font-semibold text-primary-container">{currentBranchName}</span>
                                    </>
                                ) : null}
                                . Mengubah ke{' '}
                                <span className="font-semibold text-primary-container">{pendingBranchName}</span>{' '}
                                akan mengosongkan keranjang Anda.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            className="inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-white px-4 py-2.5 font-body-sm text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                            onClick={closeConfirmModal}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-2xl bg-primary-container px-4 py-2.5 font-body-sm text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-container/25"
                            onClick={confirmBranchChange}
                            type="button"
                        >
                            Ya, ganti cabang
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default function CartIndex({ cart }) {
    const { branches = [], selectedBranchId } = usePage().props;
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
                            <>
                                <div className="rounded-3xl border border-primary-fixed-dim bg-primary-fixed/20 px-4 py-3 lg:hidden">
                                    <p className="font-body-sm text-xs font-bold text-primary-container">
                                        Cabang keranjang: {cart?.branch?.name || 'Belum dipilih'}
                                    </p>
                                    <p className="mt-1 font-body-sm text-[11px] leading-5 text-on-surface-variant">
                                        Semua item dari satu cabang yang sama.
                                    </p>
                                </div>
                                {items.map((item) => <CartItemRow item={item} key={item.id} />)}
                            </>
                        ) : (
                            <PublicCard className="p-6 text-center md:p-8">
                                <h2 className="mt-2 font-headline-lg text-headline-lg text-primary-container">Keranjang Anda masih menunggu produk.</h2>
                                <p className="mx-auto mt-3 max-w-xl font-body-md text-body-md text-on-surface-variant">
                                    Pilih cabang di detail produk, lalu tambahkan herbal pilihan. Satu keranjang hanya bisa dari satu cabang.
                                </p>
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

                        <CartBranchPanel
                            branches={branches}
                            cartBranch={cart?.branch}
                            cartCount={totalQuantity}
                            selectedBranchId={selectedBranchId}
                        />

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
                            <p className="font-body-sm text-sm leading-6 text-on-tertiary-fixed">
                                Belum termasuk ongkir. Admin akan mengonfirmasi biaya pengiriman setelah order dibuat.
                            </p>
                        </div>
                        <PrimaryLink className="mt-5 w-full" href={route('checkout.show')}>
                            {items.length === 0 ? 'Checkout setelah pilih produk' : 'Lanjut ke Checkout'}
                        </PrimaryLink>
                        <SecondaryLink className="mt-3 w-full" href={route('products.index')}>Tambah Produk</SecondaryLink>
                        <SecondaryLink className="mt-3 w-full" href={route('orders.lookup.create')}>Cek Pesanan</SecondaryLink>
                    </PublicCard>
                </div>
            </div>
        </>
    );
}

CartIndex.layout = (page) => <PublicShell fullWidth>{page}</PublicShell>;
