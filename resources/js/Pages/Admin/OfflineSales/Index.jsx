import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, ClipboardList, Minus, Package, Plus, Receipt, Search, ShoppingCart, Trash2, X, Printer, FileText } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { currency: 'IDR', maximumFractionDigits: 0, style: 'currency' }).format(Number(value ?? 0));
}

function formatDateTime(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
}

function formatDateTimeInput(value = new Date()) {
    return new Date(value).toISOString().slice(0, 16);
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function readableLabel(value) {
    return String(value ?? '-').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

function TextField({ error, label, name, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <input className="mt-1.5 block w-full rounded-xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} type={type} value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

function SelectField({ children, error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <select className="mt-1.5 block w-full rounded-xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''}>
                {children}
            </select>
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <textarea className="mt-1.5 block w-full rounded-xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} rows="3" value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

// ─── POS Form ───────────────────────────────────────────────────────────────

function OfflineSalePosForm({ products, services, customerProfiles, leads, fieldStaff, events, sources, paymentMethods }) {
    const [search, setSearch] = useState('');
    const [itemTab, setItemTab] = useState('products');
    const [successModalData, setSuccessModalData] = useState(null);

    const form = useForm({
        customer_profile_id: '',
        lead_id: '',
        field_staff_id: '',
        event_id: '',
        source: 'offline',
        payment_method_id: '',
        customer_name: '',
        customer_whatsapp_number: '',
        notes: '',
        sold_at: formatDateTimeInput(),
        items: [],
    });

    // cart: [{ product_id, quantity }]
    const cart = form.data.items;

    const estimatedItems = cart.map((item) => {
        const isProduct = item.product_id != null;
        const model = isProduct
            ? products.find((p) => String(p.id) === String(item.product_id))
            : services.find((s) => String(s.id) === String(item.service_id));
        const qty = Number(item.quantity ?? 0);
        const unitPrice = Number(model?.price ?? 0);
        return { ...item, lineTotal: unitPrice * qty, model, isProduct, qty, unitPrice };
    });

    const estimatedTotal = estimatedItems.reduce((t, i) => t + i.lineTotal, 0);
    const estimatedQty = estimatedItems.reduce((t, i) => t + Number(i.qty || 0), 0);

    const currentItems = itemTab === 'products' ? products : services;
    const filteredItems = currentItems.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    function addItemToCart(item, type) {
        const key = type === 'product' ? 'product_id' : 'service_id';
        const existing = cart.findIndex((i) => String(i[key]) === String(item.id));
        if (existing >= 0) {
            const updated = [...cart];
            updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
            form.setData('items', updated);
        } else {
            form.setData('items', [...cart, { row_id: crypto.randomUUID(), [key]: item.id, quantity: 1 }]);
        }
    }

    function setQty(index, value) {
        const updated = [...cart];
        updated[index] = { ...updated[index], quantity: Math.max(1, Number(value)) };
        form.setData('items', updated);
    }

    function removeFromCart(index) {
        form.setData('items', cart.filter((_, i) => i !== index));
    }

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.offline-sales.store'), {
            onSuccess: (page) => {
                if (page.props.recentSale) {
                    setSuccessModalData(page.props.recentSale);
                    // Explicitly clear form immediately so background cart is empty
                    form.reset();
                    form.setData({
                        customer_profile_id: '',
                        lead_id: '',
                        field_staff_id: '',
                        event_id: '',
                        source: 'offline',
                        payment_method_id: '',
                        customer_name: '',
                        customer_whatsapp_number: '',
                        notes: '',
                        sold_at: formatDateTimeInput(),
                        items: [],
                    });
                    form.clearErrors();
                    setSearch('');
                }
            }
        });
    }

    function closeSuccessModal() {
        setSuccessModalData(null);
    }

    return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
            {/* ── LEFT: Products List ── */}
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="search"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Type Toggle */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setItemTab('products')}
                        className={`flex-1 rounded-xl py-2 font-body-sm text-sm font-bold transition-all ${itemTab === 'products' ? 'bg-[#1E4D3A] text-white shadow-sm' : 'bg-[#F6F7F7] text-gray-500 hover:bg-[#E5E7EB]'}`}
                    >
                        Produk ({products.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setItemTab('services')}
                        className={`flex-1 rounded-xl py-2 font-body-sm text-sm font-bold transition-all ${itemTab === 'services' ? 'bg-[#1E4D3A] text-white shadow-sm' : 'bg-[#F6F7F7] text-gray-500 hover:bg-[#E5E7EB]'}`}
                    >
                        Layanan ({services.length})
                    </button>
                </div>

                {/* Item Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-sm text-gray-400">
                            Tidak ada item ditemukan.
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const isProduct = itemTab === 'products';
                            const key = isProduct ? 'product_id' : 'service_id';
                            const inCart = cart.find((i) => String(i[key]) === String(item.id));
                            const outOfStock = isProduct && Number(item.stock_quantity ?? 0) <= 0;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={outOfStock}
                                    onClick={() => addItemToCart(item, isProduct ? 'product' : 'service')}
                                    className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-150 active:scale-95 ${outOfStock ? 'cursor-not-allowed border-[#E5E7EB] bg-gray-50 opacity-50' : 'cursor-pointer border-[#E5E7EB] bg-white hover:border-[#1E4D3A] hover:shadow-md'} ${inCart ? 'ring-2 ring-[#1E4D3A]' : ''}`}
                                >
                                    <div className="relative h-24 w-full overflow-hidden bg-[#F6F7F7]">
                                        {item.image_path ? (
                                            <img src={item.image_path} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-8 w-8 text-gray-300 transition-transform duration-300 group-hover:scale-110" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative p-3">
                                        <div className="pr-6">
                                            <p className="line-clamp-2 text-xs font-bold leading-snug text-[#333333]">{item.name}</p>
                                        </div>
                                        <p className="mt-1 text-xs font-extrabold text-[#1E4D3A]">{formatCurrency(item.price)}</p>
                                        <p className={`mt-0.5 text-[10px] ${outOfStock ? 'text-red-500' : 'text-gray-400'}`}>
                                            {isProduct ? (outOfStock ? 'Stok habis' : `Stok: ${item.stock_quantity}`) : 'Layanan'}
                                        </p>
                                        {!outOfStock && (
                                            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4D3A] text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    {inCart && (
                                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E4D3A] text-[10px] font-black text-white">
                                            {inCart.quantity}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── RIGHT: Cart + Transaction Info ── */}
            <div className="xl:sticky xl:top-24 xl:self-start space-y-4">
                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] bg-[#F6F7F7] px-5 py-4 flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-[#1E4D3A]" />
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E4D3A]">Keranjang POS</p>
                            <p className="text-xs text-gray-500">{cart.length === 0 ? 'Belum ada item dipilih' : `${cart.length} jenis item`}</p>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-[#E5E7EB]">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
                                <ShoppingCart className="h-10 w-10 text-gray-200 mb-3" />
                                <p className="text-sm font-bold text-gray-400">Keranjang kosong</p>
                                <p className="text-xs text-gray-400 mt-1">Klik item di kiri untuk menambahkan</p>
                            </div>
                        ) : (
                            estimatedItems.map((item, index) => (
                                <div key={item.row_id} className="flex items-start gap-3 px-4 py-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-bold leading-snug text-[#333333] line-clamp-2">{item.model?.name ?? 'Item tidak ditemukan'}</p>
                                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${item.isProduct ? 'bg-[#F1F5F9] text-gray-500' : 'bg-[#E0F2FE] text-[#0284C7]'}`}>{item.isProduct ? 'Produk' : 'Layanan'}</span>
                                        </div>
                                        <p className="text-xs text-[#1E4D3A] font-semibold mt-0.5">{formatCurrency(item.unitPrice)}</p>
                                        {/* Qty Control */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <button type="button" onClick={() => item.qty > 1 ? setQty(index, item.qty - 1) : removeFromCart(index)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] text-gray-500 hover:border-[#1E4D3A] hover:text-[#1E4D3A] transition">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => setQty(index, e.target.value)}
                                                className="w-12 px-1 py-1 rounded-lg border-[#E5E7EB] text-center text-xs font-bold focus:border-[#1E4D3A] focus:ring-[#1E4D3A] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button type="button" onClick={() => setQty(index, item.qty + 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] text-gray-500 hover:border-[#1E4D3A] hover:text-[#1E4D3A] transition">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                            <span className="ml-auto text-xs font-bold text-[#333333]">{formatCurrency(item.lineTotal)}</span>
                                            <button type="button" onClick={() => removeFromCart(index)} className="text-gray-300 hover:text-red-500 transition">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary & Submit */}
                    <div className="border-t border-[#E5E7EB] bg-[#F6F7F7] p-4 space-y-3">
                        <div className="rounded-2xl bg-white p-4 space-y-2.5">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Jumlah Item</span>
                                <span className="font-bold text-[#333333]">{cart.length} jenis</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Total Qty</span>
                                <span className="font-bold text-[#333333]">{estimatedQty} pcs</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-2.5">
                                <span className="text-sm font-bold text-[#333333]">Total</span>
                                <span className="text-lg font-extrabold text-[#1E4D3A]">{formatCurrency(estimatedTotal)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-4">Final price mengikuti perhitungan server saat submit.</p>
                        </div>
                    </div>
                </AdminCard>

                {/* Transaction Info */}
                <AdminCard className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Receipt className="h-4 w-4 text-[#1E4D3A]" />
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E4D3A]">Data Transaksi</p>
                            <p className="text-xs font-extrabold text-[#333333]">Input Offline Sale</p>
                        </div>
                    </div>
                    <p className="mb-4 font-body-sm text-xs leading-5 text-gray-500">Lengkapi sumber transaksi, waktu jual, data customer, dan relasi CRM bila tersedia.</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SelectField error={form.errors.source} label="Sumber" name="source" onChange={(e) => form.setData('source', e.target.value)} value={form.data.source}>
                            {sources.map((source) => <option key={source} value={source}>{readableLabel(source)}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.payment_method_id} label="Metode Pembayaran" name="payment_method_id" onChange={(e) => form.setData('payment_method_id', e.target.value)} value={form.data.payment_method_id}>
                            <option value="">Pilih Pembayaran</option>
                            {paymentMethods.map((pm) => (
                                <option key={pm.id} value={pm.id}>
                                    {pm.bank_name ? `${pm.bank_name} - ${pm.account_number}` : readableLabel(pm.type)}
                                </option>
                            ))}
                        </SelectField>
                        <TextField error={form.errors.sold_at} label="Tanggal Terjual" name="sold_at" onChange={(e) => form.setData('sold_at', e.target.value)} type="datetime-local" value={form.data.sold_at} />
                        <TextField error={form.errors.customer_name} label="Nama Customer" name="customer_name" onChange={(e) => form.setData('customer_name', e.target.value)} value={form.data.customer_name} />
                        <TextField error={form.errors.customer_whatsapp_number} label="WhatsApp Customer" name="customer_whatsapp_number" onChange={(e) => form.setData('customer_whatsapp_number', e.target.value)} value={form.data.customer_whatsapp_number} />
                        <SelectField error={form.errors.customer_profile_id} label="Profil Customer (CRM)" name="customer_profile_id" onChange={(e) => form.setData('customer_profile_id', e.target.value)} value={form.data.customer_profile_id}>
                            <option value="">Tidak terhubung</option>
                            {customerProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.lead_id} label="Lead (CRM)" name="lead_id" onChange={(e) => form.setData('lead_id', e.target.value)} value={form.data.lead_id}>
                            <option value="">Tidak terhubung</option>
                            {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.field_staff_id} label="Staff Lapangan" name="field_staff_id" onChange={(e) => form.setData('field_staff_id', e.target.value)} value={form.data.field_staff_id}>
                            <option value="">Belum ditugaskan</option>
                            {fieldStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.event_id} label="Event" name="event_id" onChange={(e) => form.setData('event_id', e.target.value)} value={form.data.event_id}>
                            <option value="">Tidak dari event</option>
                            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                        </SelectField>
                        <div className="sm:col-span-2">
                            <TextAreaField error={form.errors.notes} label="Catatan" name="notes" onChange={(e) => form.setData('notes', e.target.value)} value={form.data.notes} />
                        </div>
                    </div>
                    <button
                        className="mt-4 w-full rounded-2xl bg-[#1E4D3A] px-5 py-3.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                        disabled={form.processing || cart.length === 0}
                        type="submit"
                    >
                        <Receipt className="h-4 w-4" />
                        Simpan Offline Sale
                    </button>
                </AdminCard>
            </div>

            {/* Success Modal */}
            <Modal show={!!successModalData} onClose={closeSuccessModal} maxWidth="md">
                {successModalData && (
                    <div className="p-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Transaksi Berhasil!</h2>
                        <p className="text-sm text-gray-500 mb-6">Penjualan <span className="font-bold text-gray-700">{successModalData.sale_number}</span> telah disimpan.</p>

                        <div className="bg-gray-50 rounded-2xl p-5 text-left mb-6 space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.16em] mb-1">Customer</p>
                                <p className="text-sm font-bold text-gray-900">{successModalData.customer_name}</p>
                                {successModalData.customer_whatsapp_number && (
                                    <p className="text-xs text-gray-500 mt-0.5">{successModalData.customer_whatsapp_number}</p>
                                )}
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.16em] mb-2">Resume Item</p>
                                <div className="space-y-2">
                                    {(successModalData.offline_sale_items || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs items-start gap-3">
                                            <span className="text-gray-600 flex-1">{item.quantity}x {item.item_name || item.product?.name || item.service?.name}</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(item.line_total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.16em]">Total</p>
                                <p className="text-lg font-extrabold text-[#1E4D3A]">{formatCurrency(successModalData.total)}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeSuccessModal}
                            className="w-full rounded-2xl bg-[#1E4D3A] px-5 py-3.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                        >
                            Tutup & Transaksi Baru
                        </button>
                        <a
                            href={route('admin.offline-sales.print', successModalData.id)}
                            target="_blank"
                            className="mt-3 flex w-full justify-center items-center rounded-2xl border border-[#1E4D3A] px-5 py-3.5 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                        >
                            Print Struk (Thermal)
                        </a>
                    </div>
                )}
            </Modal>
        </form>
    );
}

// ─── Sale History ────────────────────────────────────────────────────────────

function OfflineSaleList({ offlineSales, filters }) {
    const items = offlineSales.data ?? [];
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        setSearch(e.target.value);
        router.get(route('admin.offline-sales.index'), { search: e.target.value }, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    }

    if (items.length === 0 && !filters?.search) {
        return (
            <AdminCard className="p-5">
                <EmptyState description="Penjualan offline akan tampil di sini setelah dicatat." title="Belum ada offline sale." />
            </AdminCard>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari customer atau invoice..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full rounded-2xl border border-[#E5E7EB] py-2 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                    />
                </div>
            </div>

            <AdminCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-sm">
                        <thead className="bg-[#F6F7F7] font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                            <tr>
                                <th className="px-5 py-4 whitespace-nowrap">Invoice & Tanggal</th>
                                <th className="px-5 py-4">Customer</th>
                                <th className="px-5 py-4">Sumber & Pembayaran</th>
                                <th className="px-5 py-4 text-right">Total</th>
                                <th className="px-5 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB] bg-white text-[#333333]">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-gray-400">
                                        Tidak ada data yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            ) : (
                                items.map((sale) => (
                            <tr key={sale.id} className="transition-colors hover:bg-gray-50">
                                <td className="px-5 py-4">
                                    <div className="font-bold text-[#1E4D3A]">{sale.sale_number}</div>
                                    <div className="mt-1 text-xs text-gray-500">{formatDateTime(sale.sold_at)}</div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="font-bold">{sale.customer_name || '-'}</div>
                                    <div className="mt-1 text-xs text-gray-500">{sale.customer_whatsapp_number || '-'}</div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="mb-1">
                                        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                            {readableLabel(sale.source)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {sale.payment_method ? (sale.payment_method.bank_name ? `${sale.payment_method.bank_name} - ${sale.payment_method.account_number}` : readableLabel(sale.payment_method.type)) : '-'}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right font-extrabold text-[#1E4D3A]">
                                    {formatCurrency(sale.total)}
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <Link
                                            className="group inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                            href={route('admin.offline-sales.show', sale.id)}
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A8C5B3]/25 transition group-hover:bg-white/15">
                                                <ClipboardList aria-hidden="true" className="h-3.5 w-3.5" />
                                            </span>
                                            Detail
                                        </Link>
                                        <a
                                            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 font-body-sm text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                                            href={route('admin.offline-sales.invoice', sale.id)}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                            title="Download Invoice PDF"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 transition group-hover:bg-gray-300">
                                                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                                            </span>
                                            PDF
                                        </a>
                                        <a
                                            className="group inline-flex items-center gap-2 rounded-full border border-blue-200 px-3 py-1.5 font-body-sm text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                                            href={route('admin.offline-sales.print', sale.id)}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                            title="Print Struk Thermal"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 transition group-hover:bg-blue-200">
                                                <Printer aria-hidden="true" className="h-3.5 w-3.5" />
                                            </span>
                                            Struk
                                        </a>
                                    </div>
                                </td>
                            </tr>
                                ))
                            )}
                    </tbody>
                </table>
            </div>
        </AdminCard>

        {offlineSales.links?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
                {offlineSales.links.map((link, i) => (
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            preserveScroll
                            preserveState
                            className={`rounded-full px-3 py-1.5 font-body-sm text-xs font-bold ${
                                link.active
                                    ? 'bg-[#1E4D3A] text-white'
                                    : 'border border-[#E5E7EB] text-[#1E4D3A] hover:bg-[#A8C5B3]/20'
                            }`}
                        />
                    ) : (
                        <span
                            key={i}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className="rounded-full border border-[#E5E7EB] px-3 py-1.5 font-body-sm text-xs font-bold text-gray-400"
                        />
                    )
                ))}
            </div>
        )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function AdminOfflineSalesIndex({ offlineSales, filters, metrics, products = [], services = [], customerProfiles = [], leads = [], fieldStaff = [], events = [], sources = [], paymentMethods = [] }) {
    const [activeTab, setActiveTab] = useState(filters?.search ? 'history' : 'pos');

    const tabs = [
        { id: 'pos', label: 'POS Penjualan', icon: ShoppingCart },
        { id: 'history', label: 'Riwayat Penjualan', icon: ClipboardList, badge: metrics?.total ?? 0 },
    ];

    return (
        <>
            <Head title="Admin Penjualan Offline" />
            <div className="space-y-6">
                <AdminPageHeader
                    description="Catat penjualan offline langsung, lalu pantau transaksi event, door to door, dan penjualan langsung."
                    eyebrow="Commerce / Penjualan Offline"
                    title="Penjualan Offline"
                />

                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MetricCard helper="Seluruh transaksi offline" icon="O" label="Total Penjualan" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Akumulasi total transaksi" icon="R" label="Revenue" tone="sage" value={formatCurrency(metrics.revenue)} />
                    <MetricCard helper="Transaksi dari event" icon="E" label="Penjualan Event" tone="blue" value={formatNumber(metrics.events)} />
                    <MetricCard helper="Transaksi door to door" icon="D" label="Door to Door" tone="brown" value={formatNumber(metrics.doorToDoor)} />
                </div>

                {/* Tabs */}
                <div className="border-b border-[#E5E7EB]">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 font-body-sm text-sm font-bold transition-all border-b-2 -mb-px ${
                                    activeTab === tab.id
                                        ? 'border-[#1E4D3A] text-[#1E4D3A]'
                                        : 'border-transparent text-gray-400 hover:text-[#1E4D3A]'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === tab.id ? 'bg-[#1E4D3A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'pos' && (
                        <OfflineSalePosForm
                            customerProfiles={customerProfiles}
                            events={events}
                            fieldStaff={fieldStaff}
                            leads={leads}
                            products={products}
                            services={services}
                            sources={sources}
                            paymentMethods={paymentMethods}
                        />
                    )}
                    {activeTab === 'history' && (
                        <OfflineSaleList offlineSales={offlineSales} filters={filters} />
                    )}
                </div>
            </div>
        </>
    );
}

AdminOfflineSalesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOfflineSalesIndex;
