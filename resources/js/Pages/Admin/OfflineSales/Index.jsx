import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, ClipboardList, AlertCircle, Minus, Package, Plus, Receipt, Search, ShoppingCart, Trash2, X, Printer, FileText, DollarSign, Award, Calculator, TrendingUp, Users } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { formatCurrency, formatDateTime, formatDateTimeInput, formatNumber, readableLabel, relationName } from '@/utils/format';
import { FieldError, TextField, SelectField, TextAreaField } from '@/Components/Admin/FormFields';

// ─── POS Form ───────────────────────────────────────────────────────────────

function OfflineSalePosForm({ products, services, customerProfiles, leads, fieldStaff, events, sources, paymentMethods, branches, auth }) {
    const [search, setSearch] = useState('');
    const [itemTab, setItemTab] = useState('products');
    const [successModalData, setSuccessModalData] = useState(null);
    const [voucherCheck, setVoucherCheck] = useState({ status: 'idle', data: null, message: '' });

    const defaultBranchId = auth.user?.admin_scope === 'branch'
        ? auth.user.branch_id
        : (branches && branches.length > 0 ? branches[0].id : '');

    const form = useForm({
        branch_id: defaultBranchId || '',
        customer_profile_id: '',
        lead_id: '',
        is_guest: false,
        field_staff_id: '',
        event_id: '',
        source: 'offline',
        payment_method_id: '',
        voucher_code: '',
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

    const estimatedSubtotal = estimatedItems.reduce((t, i) => t + i.lineTotal, 0);
    const voucherDiscount = voucherCheck.status === 'valid' ? Number(voucherCheck.data?.discount_amount ?? 0) : 0;
    const estimatedTotal = Math.max(estimatedSubtotal - voucherDiscount, 0);
    const estimatedQty = estimatedItems.reduce((t, i) => t + Number(i.qty || 0), 0);
    const isWalkInGuest = form.data.is_guest;

    const currentItems = itemTab === 'products' ? products : services;
    const filteredItems = currentItems.filter((p) => {
        const matchName = p.name.toLowerCase().includes(search.toLowerCase());
        return matchName;
    });

    function resetVoucherCheck() {
        setVoucherCheck({ status: 'idle', data: null, message: '' });
    }

    function updateField(name, value) {
        form.setData(name, value);

        if (['voucher_code', 'customer_profile_id'].includes(name)) {
            resetVoucherCheck();
        }
    }

    function toggleWalkInGuest(enabled) {
        form.setData((data) => ({
            ...data,
            is_guest: enabled,
            customer_profile_id: enabled ? '' : data.customer_profile_id,
            lead_id: enabled ? '' : data.lead_id,
            voucher_code: enabled ? '' : data.voucher_code,
            customer_name: enabled ? '' : data.customer_name,
            customer_whatsapp_number: enabled ? '' : data.customer_whatsapp_number,
        }));
        resetVoucherCheck();
    }

    function addItemToCart(item, type) {
        const key = type === 'product' ? 'product_id' : 'service_id';
        const existing = cart.findIndex((i) => String(i[key]) === String(item.id));
        if (existing >= 0) {
            const updated = [...cart];
            updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
            form.setData('items', updated);
            resetVoucherCheck();
        } else {
            form.setData('items', [...cart, { row_id: crypto.randomUUID(), [key]: item.id, quantity: 1 }]);
            resetVoucherCheck();
        }
    }

    function setQty(index, value) {
        const updated = [...cart];
        updated[index] = { ...updated[index], quantity: Math.max(1, Number(value)) };
        form.setData('items', updated);
        resetVoucherCheck();
    }

    function removeFromCart(index) {
        form.setData('items', cart.filter((_, i) => i !== index));
        resetVoucherCheck();
    }

    async function checkVoucher() {
        if (!form.data.voucher_code) {
            setVoucherCheck({ status: 'invalid', data: null, message: 'Masukkan kode voucher terlebih dahulu.' });
            return;
        }

        if (cart.length === 0) {
            setVoucherCheck({ status: 'invalid', data: null, message: 'Keranjang harus berisi item sebelum cek voucher.' });
            return;
        }

        setVoucherCheck({ status: 'checking', data: null, message: 'Memeriksa voucher...' });

        try {
            const response = await fetch(route('admin.offline-sales.validate-voucher'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=\"csrf-token\"]')?.content ?? '',
                },
                body: JSON.stringify({
                    voucher_code: form.data.voucher_code,
                    customer_profile_id: form.data.customer_profile_id || null,
                    items: cart,
                }),
            });

            const contentType = response.headers.get('content-type') || '';
            const payload = contentType.includes('application/json') ? await response.json() : { message: await response.text() };

            if (!response.ok) {
                const message = payload.message || Object.values(payload.errors || {})[0]?.[0] || 'Voucher tidak valid.';
                setVoucherCheck({ status: 'invalid', data: null, message });
                return;
            }

            setVoucherCheck({ status: 'valid', data: payload, message: payload.message || 'Voucher valid dan dapat digunakan.' });
        } catch (error) {
            setVoucherCheck({ status: 'invalid', data: null, message: error?.message || 'Gagal memeriksa voucher. Coba lagi.' });
        }
    }

    function submit(event) {
        event.preventDefault();

        const submitData = form.data.is_guest
            ? {
                ...form.data,
                customer_profile_id: '',
                lead_id: '',
                voucher_code: '',
                customer_name: '',
                customer_whatsapp_number: '',
            }
            : form.data;

        if (submitData.voucher_code && voucherCheck.status !== 'valid') {
            setVoucherCheck({ status: 'invalid', data: null, message: 'Cek voucher terlebih dahulu sebelum menyimpan transaksi.' });
            return;
        }

        form.transform(() => submitData);
        form.post(route('admin.offline-sales.store'), {
            onSuccess: (page) => {
                if (page.props.recentSale) {
                    setSuccessModalData(page.props.recentSale);
                    // Explicitly clear form immediately so background cart is empty
                    form.reset();
                    form.setData({
                        customer_profile_id: '',
                        lead_id: '',
                        is_guest: false,
                        field_staff_id: '',
                        event_id: '',
                        source: 'offline',
                        payment_method_id: '',
                        voucher_code: '',
                        customer_name: '',
                        customer_whatsapp_number: '',
                        notes: '',
                        sold_at: formatDateTimeInput(),
                        items: [],
                    });
                    form.clearErrors();
                    setVoucherCheck({ status: 'idle', data: null, message: '' });
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
            {Object.keys(form.errors).length > 0 && (
                <div className="col-span-1 xl:col-span-2 mb-2 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-red-100 p-1.5 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-body-sm text-sm font-bold text-red-800">Mohon perbaiki kesalahan berikut:</h3>
                            <ul className="mt-1 list-inside list-disc font-body-sm text-sm text-red-700">
                                {Object.entries(form.errors).map(([field, msg]) => (
                                    <li key={field}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
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

                            let availableStock = 0;
                            if (isProduct) {
                                if (auth.user?.admin_scope === 'branch' && auth.user?.branch_id) {
                                    const branchStock = item.branch_stocks?.find(bs => String(bs.branch_id) === String(auth.user.branch_id));
                                    availableStock = branchStock ? Number(branchStock.stock_quantity ?? 0) : 0;
                                } else {
                                    const branchStock = item.branch_stocks?.find(bs => String(bs.branch_id) === String(form.data.branch_id));
                                    availableStock = branchStock ? Number(branchStock.stock_quantity ?? 0) : 0;
                                }
                            }
                            const outOfStock = isProduct && availableStock <= 0;

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
                                            {isProduct ? (outOfStock ? 'Stok habis' : `Stok: ${availableStock}`) : 'Layanan'}
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
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-bold text-[#333333]">{formatCurrency(estimatedSubtotal)}</span>
                            </div>
                            {form.data.voucher_code && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-[#1E4D3A]">
                                        <span>Kode Voucher</span>
                                        <span className="font-bold uppercase">{form.data.voucher_code}</span>
                                    </div>
                                    {voucherCheck.status === 'valid' && (
                                        <div className="flex justify-between text-xs text-[#1E4D3A]">
                                            <span>Diskon Voucher</span>
                                            <span className="font-bold">-{formatCurrency(voucherDiscount)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-2.5">
                                <span className="text-sm font-bold text-[#333333]">Estimasi Total</span>
                                <span className="text-lg font-extrabold text-[#1E4D3A]">{formatCurrency(estimatedTotal)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-4">Diskon voucher dan final price dihitung ulang oleh server saat submit.</p>
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
                        <div className="sm:col-span-2">
                            {auth.user?.admin_scope === 'branch' ? (
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Cabang</p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-gray-700">
                                        {branches?.find(b => b.id === auth.user.branch_id)?.name || 'Cabang Aktif'}
                                    </p>
                                </div>
                            ) : (
                                <SelectField error={form.errors.branch_id} label="Cabang Transaksi" name="branch_id" onChange={(e) => updateField('branch_id', e.target.value)} value={form.data.branch_id}>
                                    <option value="" disabled>Pilih Cabang (Wajib untuk Produk)</option>
                                    {branches?.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                                </SelectField>
                            )}
                        </div>
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
                        <div>
                            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Kode Voucher</span>
                            <div className="mt-1.5 flex gap-2">
                                <input
                                    className="block min-w-0 flex-1 rounded-xl border-[#E5E7EB] font-body-sm text-sm uppercase text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                    name="voucher_code"
                                    onChange={(e) => updateField('voucher_code', e.target.value.toUpperCase())}
                                    type="text"
                                    value={form.data.voucher_code ?? ''}
                                />
                                <button
                                    className="shrink-0 rounded-xl border border-[#1E4D3A] px-3 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={voucherCheck.status === 'checking' || !form.data.voucher_code || cart.length === 0}
                                    onClick={checkVoucher}
                                    type="button"
                                >
                                    {voucherCheck.status === 'checking' ? 'Cek...' : 'Cek'}
                                </button>
                            </div>
                            <FieldError message={form.errors.voucher_code} />
                            {voucherCheck.message && (
                                <p className={`mt-1 font-body-sm text-xs ${voucherCheck.status === 'valid' ? 'text-[#1E4D3A]' : 'text-red-700'}`}>{voucherCheck.message}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => toggleWalkInGuest(!isWalkInGuest)}
                            className={`sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${isWalkInGuest ? 'border-[#1E4D3A] bg-[#A8C5B3]/15 shadow-sm' : 'border-dashed border-[#A8C5B3] bg-[#F6F7F7] hover:border-[#1E4D3A]'}`}
                            aria-pressed={isWalkInGuest}
                        >
                            <span>
                                <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Pembeli Tanpa Data / Guest</span>
                                <span className="mt-1 block text-xs text-gray-500">Aktifkan untuk walk-in cepat tanpa nama, WhatsApp, relasi CRM, atau voucher.</span>
                            </span>
                            <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${isWalkInGuest ? 'bg-[#1E4D3A]' : 'bg-gray-300'}`}>
                                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${isWalkInGuest ? 'left-6' : 'left-1'}`} />
                            </span>
                        </button>
                        {!isWalkInGuest && (
                            <>
                                <TextField error={form.errors.customer_name} label="Nama Customer" name="customer_name" onChange={(e) => form.setData('customer_name', e.target.value)} value={form.data.customer_name} />
                                <TextField error={form.errors.customer_whatsapp_number} label="WhatsApp Customer" name="customer_whatsapp_number" onChange={(e) => form.setData('customer_whatsapp_number', e.target.value)} value={form.data.customer_whatsapp_number} />
                            </>
                        )}
                        <SelectField error={form.errors.customer_profile_id} label="Profil Customer (CRM)" name="customer_profile_id" onChange={(e) => updateField('customer_profile_id', e.target.value)} value={form.data.customer_profile_id}>
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
                        <div className="sm:col-span-2 rounded-2xl border border-dashed border-[#A8C5B3] bg-[#A8C5B3]/10 px-4 py-3">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">{isWalkInGuest ? 'Walk-in Guest' : 'Customer CRM Terhubung'}</p>
                            <p className="mt-1 text-xs text-gray-500">{isWalkInGuest ? 'Transaksi akan dicatat sebagai walk-in karena tidak terhubung ke profil customer atau lead.' : 'Transaksi terhubung ke data CRM/lead yang dipilih.'}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <TextAreaField error={form.errors.notes} label="Catatan" name="notes" onChange={(e) => form.setData('notes', e.target.value)} value={form.data.notes} />
                        </div>
                    </div>
                    <button
                        className="mt-4 w-full rounded-2xl bg-[#1E4D3A] px-5 py-3.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                        disabled={form.processing || cart.length === 0 || (form.data.voucher_code && voucherCheck.status !== 'valid')}
                        type="submit"
                    >
                        <Receipt className="h-4 w-4" />
                        {form.data.voucher_code && voucherCheck.status !== 'valid' ? 'Cek Voucher Dulu' : 'Simpan Offline Sale'}
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
                            {Number(successModalData.voucher_discount_amount ?? 0) > 0 && (
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(successModalData.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-[#1E4D3A]">
                                        <span>Diskon Voucher</span>
                                        <span className="font-bold">-{formatCurrency(successModalData.voucher_discount_amount)}</span>
                                    </div>
                                </div>
                            )}
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

function OfflineSalesFilter({ filters, branches, auth, handleFilter }) {
    const hasBranchesOption = auth?.user?.role === 'admin'
        && auth?.user?.admin_scope !== 'branch'
        && branches
        && branches.length > 0;

    return (
        <AdminCard className="p-5 mb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Filter Data</p>
                    <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">Riwayat Penjualan Offline</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full sm:w-48 rounded-xl border-[#E5E7EB] bg-white py-1.5 pl-9 pr-3 font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                            placeholder="Cari transaksi..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilter('search', e.target.value)}
                            type="search"
                        />
                    </div>
                    {hasBranchesOption && (
                        <select
                            className="rounded-xl border-[#E5E7EB] font-body-sm text-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A] shadow-sm"
                            value={filters.branch_id || ''}
                            onChange={(e) => handleFilter('branch_id', e.target.value)}
                        >
                            <option value="">Semua Cabang</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    )}
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#1E4D3A]">
                        <input
                            type="date"
                            value={filters.start_date || ''}
                            onChange={(e) => handleFilter('start_date', e.target.value)}
                            className="border-none bg-transparent p-0 font-body-sm text-sm text-[#333333] focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={filters.end_date || ''}
                            onChange={(e) => handleFilter('end_date', e.target.value)}
                            className="border-none bg-transparent p-0 font-body-sm text-sm text-[#333333] focus:ring-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </AdminCard>
    );
}

function OfflineSaleList({ offlineSales, filters, historyMetrics, branches, auth }) {
    const items = offlineSales.data ?? [];
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    function handleFilterValue(key, value) {
        if (key === 'search') setSearch(value);
        if (key === 'per_page') setPerPage(value);

        const newFilters = { 
            search: key === 'search' ? value : search, 
            start_date: filters?.start_date, 
            end_date: filters?.end_date,
            branch_id: filters?.branch_id,
            per_page: key === 'per_page' ? value : perPage,
            [key]: value
        };
        
        router.get(route('admin.offline-sales.index'), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    }

    function handleSearchChange(e) {
        handleFilterValue('search', e.target.value);
    }

    function handleLimitChange(e) {
        handleFilterValue('per_page', e.target.value);
    }

    const sourceChartOption = {
        tooltip: { trigger: 'item', valueFormatter: (value) => formatCurrency(value) },
        legend: { top: 'bottom', icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: '#666' } },
        series: [
            {
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold' }
                },
                labelLine: { show: false },
                data: historyMetrics?.revenue_per_source?.map(s => ({
                    name: readableLabel(s.source),
                    value: s.revenue
                })) || []
            }
        ]
    };

    const revenueTrendData = historyMetrics?.revenue_trend || [];
    const revenueTrendOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line', lineStyle: { color: '#A8C5B3' } },
            valueFormatter: (value) => formatCurrency(value)
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: revenueTrendData.map((item) => item.sale_date),
            axisLabel: { color: '#9CA3AF', fontSize: 10 },
            axisLine: { lineStyle: { color: '#E5E7EB' } },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (value) => {
                    if (value >= 1000000) return (value / 1000000) + 'jt';
                    if (value >= 1000) return (value / 1000) + 'k';
                    return value;
                },
                color: '#9CA3AF',
                fontSize: 10
            },
            splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } }
        },
        series: [
            {
                name: 'Revenue',
                type: 'line',
                smooth: true,
                data: revenueTrendData.map((item) => item.revenue),
                lineStyle: { color: '#1E4D3A', width: 3 },
                itemStyle: { color: '#1E4D3A' },
                areaStyle: { color: 'rgba(168, 197, 179, 0.25)' },
                symbol: 'circle',
                symbolSize: 7
            }
        ]
    };

    const staffNames = [...(historyMetrics?.staff_ranking || [])].reverse().map(s => s.field_staff?.name || 'Unknown');
    const staffRevenues = [...(historyMetrics?.staff_ranking || [])].reverse().map(s => s.revenue);
    const staffTransactions = [...(historyMetrics?.staff_ranking || [])].reverse().map(s => s.transactions);

    const staffChartOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { top: 'top', right: '0', icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10, color: '#666' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: (value) => {
                        if (value >= 1000000) return (value / 1000000) + 'jt';
                        if (value >= 1000) return (value / 1000) + 'k';
                        return value;
                    },
                    color: '#9CA3AF',
                    fontSize: 10
                },
                splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } }
            },
            {
                type: 'value',
                axisLabel: { color: '#9CA3AF', fontSize: 10 },
                splitLine: { show: false }
            }
        ],
        yAxis: {
            type: 'category',
            data: staffNames,
            axisLabel: { color: '#4B5563', fontSize: 11, width: 90, overflow: 'truncate' },
            axisLine: { show: false },
            axisTick: { show: false }
        },
        series: [
            {
                name: 'Revenue',
                type: 'bar',
                xAxisIndex: 0,
                data: staffRevenues,
                itemStyle: { color: '#1E4D3A', borderRadius: [0, 4, 4, 0] },
                barWidth: '50%',
                valueFormatter: (value) => formatCurrency(value)
            },
            {
                name: 'Total Transaksi',
                type: 'line',
                xAxisIndex: 1,
                data: staffTransactions,
                itemStyle: { color: '#D97706' },
                lineStyle: { width: 2 },
                symbol: 'circle',
                symbolSize: 6,
                valueFormatter: (value) => value + ' trx'
            }
        ]
    };

    return (
        <div className="space-y-4 mt-8">
            <OfflineSalesFilter filters={filters || {}} branches={branches || []} auth={auth} handleFilter={handleFilterValue} />

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm h-80 flex flex-col">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="font-bold text-[#333333] text-sm">Tren Revenue Offline</p>
                        <p className="mt-1 text-[10px] text-gray-400">Pergerakan revenue harian dari transaksi offline.</p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-[#A8C5B3]/20 px-3 py-1 font-body-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">
                        Botanical trend
                    </span>
                </div>
                <div className="flex-1 w-full h-full">
                    {revenueTrendData.length > 0 ? (
                        <ReactECharts option={revenueTrendOption} style={{ height: '100%', width: '100%' }} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <p className="text-xs text-gray-500">Belum ada data tren revenue.</p>
                            <p className="text-[10px] text-gray-400 mt-1">Revenue harian akan tampil setelah transaksi offline tercatat.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2 Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue per Sumber */}
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm h-72 flex flex-col">
                    <p className="font-bold text-[#333333] mb-2 text-sm">Revenue per Sumber / Event</p>
                    <div className="flex-1 w-full h-full">
                        {historyMetrics?.revenue_per_source?.length > 0 ? (
                            <ReactECharts option={sourceChartOption} style={{ height: '100%', width: '100%' }} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <p className="text-xs text-gray-500">Belum ada data sumber penjualan offline.</p>
                                <p className="text-[10px] text-gray-400 mt-1">Data event atau door-to-door akan tampil di sini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Peringkat Staff Lapangan */}
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm h-72 flex flex-col relative">
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-[#333333] text-sm">Peringkat Staff Lapangan</p>
                        <div className="bg-gray-100 rounded-lg p-2 text-[9px] text-gray-500 text-right leading-tight">
                            Integrasi CRM:<br/>
                            <span className="font-medium text-gray-700">Lead ke Konversi Offline</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-full">
                        {historyMetrics?.staff_ranking?.length > 0 ? (
                            <ReactECharts option={staffChartOption} style={{ height: '100%', width: '100%' }} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <p className="text-xs text-gray-500">Belum ada data staff lapangan.</p>
                                <p className="text-[10px] text-gray-400 mt-1">Peringkat performa staff akan tampil di sini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AdminCard className="overflow-hidden mt-2">
                <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="font-bold text-[#333333] text-sm shrink-0">Daftar Penjualan Offline Terbaru</p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                            <span>Tampilkan</span>
                            <select
                                value={perPage}
                                onChange={handleLimitChange}
                                className="rounded-xl border border-[#E5E7EB] py-1.5 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full text-left font-body-sm text-sm">
                        <thead className="bg-[#F6F7F7] font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                            <tr>
                                <th className="w-[190px] whitespace-nowrap px-5 py-4">Invoice & Tanggal</th>
                                <th className="w-[210px] whitespace-nowrap px-5 py-4">Customer</th>
                                <th className="w-[260px] whitespace-nowrap px-5 py-4">Staff / Lead / Event</th>
                                <th className="w-[210px] whitespace-nowrap px-5 py-4">Sumber & Pembayaran</th>
                                <th className="w-[140px] whitespace-nowrap px-5 py-4 text-right">Total</th>
                                <th className="w-[190px] whitespace-nowrap px-5 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB] bg-white text-[#333333]">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
                                        Tidak ada data yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            ) : (
                                items.map((sale) => (
                            <tr key={sale.id} className="transition-colors hover:bg-gray-50">
                                <td className="whitespace-nowrap px-5 py-4">
                                    <div className="font-bold text-[#1E4D3A]">{sale.sale_number}</div>
                                    <div className="mt-1 text-xs text-gray-500">{formatDateTime(sale.sold_at)}</div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                    <div className="font-bold">{sale.customer_name || '-'}</div>
                                    <div className="mt-1 text-xs text-gray-500">{sale.customer_whatsapp_number || '-'}</div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-body-sm text-sm text-gray-600">
                                    <div><span className="font-bold text-[#1E4D3A]">Staff:</span> {relationName(sale.field_staff, 'Belum ditugaskan')}</div>
                                    <div className="mt-1 text-xs"><span className="font-bold text-[#1E4D3A]">Lead:</span> {relationName(sale.lead)}</div>
                                    <div className="mt-0.5 text-xs"><span className="font-bold text-[#1E4D3A]">Event:</span> {relationName(sale.event)}</div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                    <div className="mb-1.5">
                                        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                            {readableLabel(sale.source)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {sale.payment_method ? (sale.payment_method.bank_name ? `${sale.payment_method.bank_name} - ${sale.payment_method.account_number}` : readableLabel(sale.payment_method.type)) : '-'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-right font-extrabold text-[#1E4D3A]">
                                    {formatCurrency(sale.total)}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
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
            <div className="flex justify-center mt-4">
                <Pagination links={offlineSales.links} preserveState={true} preserveScroll={true} />
            </div>
        )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function AdminOfflineSalesIndex({ offlineSales, filters, metrics, historyMetrics, products = [], services = [], customerProfiles = [], leads = [], fieldStaff = [], events = [], sources = [], paymentMethods = [], branches = [], auth }) {
    const isHistoryActive = filters?.search || filters?.start_date || filters?.end_date || (typeof window !== 'undefined' && window.location.search.includes('page='));
    const [activeTab, setActiveTab] = useState(isHistoryActive ? 'history' : 'pos');

    const tabs = [
        { id: 'pos', label: 'POS Penjualan', icon: ShoppingCart },
        { id: 'history', label: 'Riwayat Penjualan', icon: ClipboardList, badge: metrics?.total ?? 0 },
    ];

    return (
        <>
            <Head title="Admin Penjualan Offline" />
            <div className="space-y-6">
                <AdminPageHeader
                    // description="Catat penjualan offline langsung, lalu pantau transaksi event, door to door, dan penjualan langsung."
                    eyebrow="Commerce / Penjualan Offline"
                    title="Penjualan Offline"
                />

                {/* Global Metric Cards (Shown in both tabs) */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    <MetricCard helper="Seluruh transaksi offline" icon="O" label="Total Penjualan" tone="forest" value={formatNumber(historyMetrics?.total_transactions)} />
                    <MetricCard helper="Akumulasi total transaksi" icon="R" label="Revenue" tone="sage" value={formatCurrency(historyMetrics?.total_revenue)} />
                    <MetricCard helper="Transaksi dari event" icon="E" label="Penjualan Event" tone="blue" value={formatNumber(historyMetrics?.events)} />
                    <MetricCard helper="Transaksi door to door" icon="D" label="Door to Door" tone="brown" value={formatNumber(historyMetrics?.door_to_door)} />
                    <MetricCard helper={`${formatNumber(historyMetrics?.converted_lead_transactions)} dari ${formatNumber(historyMetrics?.total_leads)} lead`} icon="L" label="Konversi Lead" tone="forest" value={`${formatNumber(historyMetrics?.lead_conversion_rate)}%`} />
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
                            branches={branches}
                            auth={auth}
                        />
                    )}
                    {activeTab === 'history' && (
                        <OfflineSaleList offlineSales={offlineSales} filters={filters} historyMetrics={historyMetrics} branches={branches} auth={auth} />
                    )}
                </div>
            </div>
        </>
    );
}

AdminOfflineSalesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOfflineSalesIndex;
