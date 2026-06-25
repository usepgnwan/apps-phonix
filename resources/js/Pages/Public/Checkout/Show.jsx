import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cartItems, cartSubtotal, EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink } from '@/Components/Public/commerce.jsx';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-error">{message}</p> : null;
}

function TextField({ error, label, name, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
            <input className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name={name} onChange={onChange} type={type} value={value ?? ''} />
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

function SearchableSelect({ disabled = false, error, label, loading = false, name, onChange, options, placeholder, value }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const selectedOption = options.find((option) => String(option.id) === String(value));
    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return options;
        }

        return options.filter((option) => option.name.toLowerCase().includes(normalizedQuery));
    }, [options, query]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function handlePointerDown(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setQuery('');
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (disabled) {
            setIsOpen(false);
            setQuery('');
        }
    }, [disabled]);

    function chooseOption(optionId) {
        onChange(optionId);
        setIsOpen(false);
        setQuery('');
    }

    return (
        <div className="relative block" ref={containerRef}>
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</span>
            <button
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-white px-4 py-3 font-body-sm text-sm text-on-surface shadow-sm transition hover:border-primary-fixed-dim hover:bg-primary-fixed/15 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/25 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:opacity-70"
                disabled={disabled}
                name={name}
                onClick={() => setIsOpen((current) => !current)}
                type="button"
            >
                <span className={selectedOption ? 'text-on-surface' : 'text-on-surface-variant'}>{selectedOption?.name ?? placeholder}</span>
                <span aria-hidden="true" className={`text-on-surface-variant transition ${isOpen ? 'rotate-180 text-primary-container' : ''}`}>⌄</span>
            </button>
            {isOpen ? (
                <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-outline-variant/80 bg-white p-2 shadow-xl shadow-primary-container/15">
                    <input
                        className="block w-full rounded-xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={`Cari ${label.toLowerCase()}...`}
                        type="search"
                        value={query}
                    />
                    <div className="mt-2 max-h-56 overflow-y-auto" role="listbox">
                        {loading ? (
                            <p className="px-3 py-2 font-body-sm text-sm text-on-surface-variant">Memuat data...</p>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = String(option.id) === String(value);

                                return (
                                    <button
                                        aria-selected={isSelected}
                                        className={`block w-full rounded-xl px-3 py-2.5 text-left font-body-sm text-sm font-bold transition ${isSelected ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20' : 'text-primary-container hover:bg-primary-fixed/35'}`}
                                        key={option.id}
                                        onClick={() => chooseOption(option.id)}
                                        role="option"
                                        type="button"
                                    >
                                        {option.name}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="px-3 py-2 font-body-sm text-sm text-on-surface-variant">Tidak ada hasil.</p>
                        )}
                    </div>
                </div>
            ) : null}
            <FieldError message={error} />
        </div>
    );
}

function paymentMethodLabel(paymentMethod) {
    if (paymentMethod.type === 'bank_transfer') {
        return paymentMethod.bank_name;
    }

    return 'QRIS';
}

export default function CheckoutShow({ authUser, cart, customerProfile, paymentMethods = [], savedShippingAddresses = [], availableVouchers = [] }) {
    const items = cartItems(cart);
    const subtotal = cartSubtotal(cart);
    const [provinceId, setProvinceId] = useState('');
    const [regencyId, setRegencyId] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [villageId, setVillageId] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [voucherCheck, setVoucherCheck] = useState({ status: 'idle', data: null, message: '' });
    const [loadingRegions, setLoadingRegions] = useState({
        provinces: false,
        regencies: false,
        districts: false,
        villages: false,
    });
    const [regionError, setRegionError] = useState('');
    const [showSavedAddresses, setShowSavedAddresses] = useState(false);
    const { data, errors, post, processing, setData, transform } = useForm({
        customer_name: customerProfile?.name ?? authUser?.name ?? '',
        customer_whatsapp_number: customerProfile?.whatsapp_number ?? '',
        customer_email: customerProfile?.user?.email ?? authUser?.email ?? '',
        shipping_province: '',
        shipping_city: '',
        shipping_district: '',
        shipping_village: '',
        shipping_address_detail: customerProfile?.primary_address ?? '',
        payment_method_id: '',
        voucher_code: '',
    });
    const voucherCodeRef = useRef(data.voucher_code);
    const voucherDiscount = voucherCheck.status === 'valid' ? Number(voucherCheck.data?.discount_amount ?? 0) : 0;
    const previewTotal = Math.max(subtotal - voucherDiscount, 0);

    useEffect(() => {
        voucherCodeRef.current = data.voucher_code;
    }, [data.voucher_code]);

    useEffect(() => {
        let isActive = true;

        async function fetchProvinces() {
            setLoadingRegions((current) => ({ ...current, provinces: true }));
            setRegionError('');

            try {
                const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');

                if (!response.ok) {
                    throw new Error('Gagal memuat provinsi.');
                }

                const regionData = await response.json();

                if (isActive) {
                    setProvinces(regionData);
                }
            } catch {
                if (isActive) {
                    setRegionError('Wilayah belum dapat dimuat. Silakan coba lagi.');
                }
            } finally {
                if (isActive) {
                    setLoadingRegions((current) => ({ ...current, provinces: false }));
                }
            }
        }

        fetchProvinces();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!provinceId) {
            setRegencies([]);
            return;
        }

        let isActive = true;

        async function fetchRegencies() {
            setLoadingRegions((current) => ({ ...current, regencies: true }));
            setRegionError('');

            try {
                const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);

                if (!response.ok) {
                    throw new Error('Gagal memuat kota/kabupaten.');
                }

                const regionData = await response.json();

                if (isActive) {
                    setRegencies(regionData);
                }
            } catch {
                if (isActive) {
                    setRegionError('Wilayah belum dapat dimuat. Silakan coba lagi.');
                }
            } finally {
                if (isActive) {
                    setLoadingRegions((current) => ({ ...current, regencies: false }));
                }
            }
        }

        fetchRegencies();

        return () => {
            isActive = false;
        };
    }, [provinceId]);

    useEffect(() => {
        if (!regencyId) {
            setDistricts([]);
            return;
        }

        let isActive = true;

        async function fetchDistricts() {
            setLoadingRegions((current) => ({ ...current, districts: true }));
            setRegionError('');

            try {
                const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);

                if (!response.ok) {
                    throw new Error('Gagal memuat kecamatan.');
                }

                const regionData = await response.json();

                if (isActive) {
                    setDistricts(regionData);
                }
            } catch {
                if (isActive) {
                    setRegionError('Wilayah belum dapat dimuat. Silakan coba lagi.');
                }
            } finally {
                if (isActive) {
                    setLoadingRegions((current) => ({ ...current, districts: false }));
                }
            }
        }

        fetchDistricts();

        return () => {
            isActive = false;
        };
    }, [regencyId]);

    useEffect(() => {
        if (!districtId) {
            setVillages([]);
            return;
        }

        let isActive = true;

        async function fetchVillages() {
            setLoadingRegions((current) => ({ ...current, villages: true }));
            setRegionError('');

            try {
                const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);

                if (!response.ok) {
                    throw new Error('Gagal memuat desa.');
                }

                const regionData = await response.json();

                if (isActive) {
                    setVillages(regionData);
                }
            } catch {
                if (isActive) {
                    setRegionError('Wilayah belum dapat dimuat. Silakan coba lagi.');
                }
            } finally {
                if (isActive) {
                    setLoadingRegions((current) => ({ ...current, villages: false }));
                }
            }
        }

        fetchVillages();

        return () => {
            isActive = false;
        };
    }, [districtId]);

    function selectedRegionName(options, selectedId) {
        const selectedRegion = options.find((option) => option.id === selectedId);

        return selectedRegion?.name ?? '';
    }

    function resetRegionChildren(level) {
        if (level === 'province') {
            setRegencyId('');
            setDistrictId('');
            setVillageId('');
            setRegencies([]);
            setDistricts([]);
            setVillages([]);
        }

        if (level === 'regency') {
            setDistrictId('');
            setVillageId('');
            setDistricts([]);
            setVillages([]);
        }

        if (level === 'district') {
            setVillageId('');
            setVillages([]);
        }
    }

    function changeProvince(selectedId) {
        setProvinceId(selectedId);
        resetRegionChildren('province');
        setData((currentData) => ({
            ...currentData,
            shipping_province: selectedRegionName(provinces, selectedId),
            shipping_city: '',
            shipping_district: '',
            shipping_village: '',
        }));
    }

    function changeRegency(selectedId) {
        setRegencyId(selectedId);
        resetRegionChildren('regency');
        setData((currentData) => ({
            ...currentData,
            shipping_city: selectedRegionName(regencies, selectedId),
            shipping_district: '',
            shipping_village: '',
        }));
    }

    function changeDistrict(selectedId) {
        setDistrictId(selectedId);
        resetRegionChildren('district');
        setData((currentData) => ({
            ...currentData,
            shipping_district: selectedRegionName(districts, selectedId),
            shipping_village: '',
        }));
    }

    function changeVillage(selectedId) {
        setVillageId(selectedId);
        setData('shipping_village', selectedRegionName(villages, selectedId));
    }

    function changeVoucherCode(value) {
        setData('voucher_code', value.toUpperCase());
        setVoucherCheck({ status: 'idle', data: null, message: '' });
    }

    async function checkVoucher() {
        const checkedCode = data.voucher_code;

        if (!checkedCode) {
            setVoucherCheck({ status: 'invalid', data: null, message: 'Masukkan kode voucher terlebih dahulu.' });
            return;
        }

        if (!customerProfile && !data.customer_whatsapp_number) {
            setVoucherCheck({ status: 'invalid', data: null, message: 'Isi Nomor WhatsApp terlebih dahulu.' });
            return;
        }

        setVoucherCheck({ status: 'checking', data: null, message: 'Memeriksa voucher...' });

        try {
            const response = await fetch(route('checkout.validate-voucher'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({
                    voucher_code: checkedCode,
                    customer_whatsapp_number: data.customer_whatsapp_number,
                }),
            });

            const contentType = response.headers.get('content-type') || '';
            const payload = contentType.includes('application/json') ? await response.json() : { message: await response.text() };

            if (checkedCode !== voucherCodeRef.current) {
                return;
            }

            if (!response.ok) {
                const message = payload.message || Object.values(payload.errors || {})[0]?.[0] || 'Voucher tidak valid.';
                setVoucherCheck({ status: 'invalid', data: null, message });
                return;
            }

            setVoucherCheck({ status: 'valid', data: payload, message: payload.message || 'Voucher valid dan dapat digunakan.' });
        } catch (error) {
            if (checkedCode !== voucherCodeRef.current) {
                return;
            }

            setVoucherCheck({ status: 'invalid', data: null, message: error?.message || 'Gagal memeriksa voucher. Coba lagi.' });
        }
    }

    function chooseSavedAddress(address) {
        setProvinceId('');
        setRegencyId('');
        setDistrictId('');
        setVillageId('');
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setShowSavedAddresses(false);
        setData((currentData) => ({
            ...currentData,
            shipping_province: '',
            shipping_city: '',
            shipping_district: '',
            shipping_village: '',
            shipping_address_detail: address,
        }));
    }

    function submit(event) {
        event.preventDefault();

        if (data.voucher_code && voucherCheck.status !== 'valid') {
            setVoucherCheck({ status: 'invalid', data: null, message: 'Cek voucher terlebih dahulu sebelum membuat order.' });
            return;
        }

        transform((formData) => ({
            ...formData,
            shipping_address: [
                formData.shipping_address_detail,
                formData.shipping_village,
                formData.shipping_district,
                formData.shipping_city,
                formData.shipping_province,
            ].filter(Boolean).join(', '),
        }));
        post(route('checkout.store'));
    }

    return (
        <>
            <Head title="Checkout Phoenix" />
            <div className="space-y-8">
                {items.length === 0 ? (
                    <EmptyState action={<PrimaryLink href={route('products.index')}>Lihat Produk</PrimaryLink>} description="Checkout membutuhkan minimal satu produk di keranjang." title="Belum ada produk untuk checkout." />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">
                        <PublicCard className="p-6 md:p-8">
                            <form className="space-y-6" id="checkout-form" onSubmit={submit}>
                                <section>
                                    <h2 className="font-headline-md text-headline-md text-primary-container">Data Penerima</h2>
                                    <div className="mt-6 space-y-5">
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <TextField error={errors.customer_name} label="Fullname" name="customer_name" onChange={(event) => setData('customer_name', event.target.value)} value={data.customer_name} />
                                            <TextField error={errors.customer_whatsapp_number} label="Nomor WhatsApp" name="customer_whatsapp_number" onChange={(event) => setData('customer_whatsapp_number', event.target.value)} value={data.customer_whatsapp_number} />
                                        </div>
                                        <TextField error={errors.customer_email} label="Email" name="customer_email" onChange={(event) => setData('customer_email', event.target.value)} type="email" value={data.customer_email} />
                                    </div>
                                </section>

                                <section>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <h2 className="font-headline-md text-headline-md text-primary-container">Data Pengiriman</h2>
                                        {authUser && savedShippingAddresses.length > 0 ? (
                                            <button className="inline-flex w-fit items-center justify-center rounded-full border border-primary-container px-4 py-2 font-label-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/40" onClick={() => setShowSavedAddresses((current) => !current)} type="button">
                                                Pilih Alamat
                                            </button>
                                        ) : null}
                                    </div>
                                    {showSavedAddresses ? (
                                        <div className="mt-4 space-y-2 rounded-3xl border border-outline-variant bg-surface-container-low p-3">
                                            {savedShippingAddresses.map((address) => (
                                                <button className="block w-full rounded-2xl bg-white px-4 py-3 text-left font-body-sm text-sm leading-6 text-on-surface shadow-sm transition hover:bg-primary-fixed/30" key={address} onClick={() => chooseSavedAddress(address)} type="button">
                                                    {address}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <SearchableSelect disabled={loadingRegions.provinces || processing} label="Provinsi" loading={loadingRegions.provinces} name="shipping_province" onChange={changeProvince} options={provinces} placeholder={loadingRegions.provinces ? 'Memuat provinsi...' : 'Pilih provinsi'} value={provinceId} />
                                        <SearchableSelect disabled={!provinceId || loadingRegions.regencies || processing} label="Kota/Kabupaten" loading={loadingRegions.regencies} name="shipping_city" onChange={changeRegency} options={regencies} placeholder={loadingRegions.regencies ? 'Memuat kota/kabupaten...' : 'Pilih kota/kabupaten'} value={regencyId} />
                                        <SearchableSelect disabled={!regencyId || loadingRegions.districts || processing} label="Kecamatan" loading={loadingRegions.districts} name="shipping_district" onChange={changeDistrict} options={districts} placeholder={loadingRegions.districts ? 'Memuat kecamatan...' : 'Pilih kecamatan'} value={districtId} />
                                        <SearchableSelect disabled={!districtId || loadingRegions.villages || processing} label="Desa" loading={loadingRegions.villages} name="shipping_village" onChange={changeVillage} options={villages} placeholder={loadingRegions.villages ? 'Memuat desa...' : 'Pilih desa'} value={villageId} />
                                    </div>
                                    {regionError ? <p className="mt-3 font-body-sm text-xs text-error">{regionError}</p> : null}
                                    <div className="mt-5">
                                        <TextAreaField error={errors.shipping_address} label="Alamat" name="shipping_address_detail" onChange={(event) => setData('shipping_address_detail', event.target.value)} value={data.shipping_address_detail} />
                                    </div>
                                </section>

                                <section>
                                    <h2 className="font-headline-md text-headline-md text-primary-container">Metode Pembayaran</h2>
                                    <div className="mt-6">
                                        <p className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Pilih Metode Pembayaran</p>
                                        {paymentMethods.length > 0 ? (
                                            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {paymentMethods.map((paymentMethod) => (
                                                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm transition hover:border-primary-container hover:bg-primary-fixed/20 has-[:checked]:border-primary-container has-[:checked]:bg-primary-fixed/30 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-surface-container-low has-[:disabled]:opacity-70" key={paymentMethod.id}>
                                                        <input checked={String(data.payment_method_id) === String(paymentMethod.id)} className="mt-1 border-outline-variant text-primary-container focus:ring-primary-container disabled:cursor-not-allowed" disabled={processing} name="payment_method_id" onChange={(event) => setData('payment_method_id', event.target.value)} type="radio" value={paymentMethod.id} />
                                                        <span className="font-body-sm text-sm font-bold text-primary-container">{paymentMethodLabel(paymentMethod)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mt-2 rounded-2xl border border-outline-variant bg-surface-container-low p-4 font-body-sm text-sm text-on-surface-variant">Belum ada metode pembayaran yang tersedia.</p>
                                        )}
                                        <FieldError message={errors.payment_method_id} />
                                    </div>
                                </section>


                                <FieldError message={errors.cart} />
                            </form>
                        </PublicCard>

                        <PublicCard className="h-fit p-6">
                            <h2 className="font-headline-md text-headline-md text-primary-container">Ringkasan Pesanan</h2>
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
                                {data.voucher_code ? (
                                    <div className="mt-3 space-y-2 rounded-2xl bg-primary-fixed/25 p-3">
                                        <div className="flex justify-between font-body-sm text-xs text-primary-container">
                                            <span>Kode Voucher</span>
                                            <span className="font-bold uppercase">{data.voucher_code}</span>
                                        </div>
                                        {voucherCheck.status === 'valid' ? (
                                            <div className="flex justify-between font-body-sm text-xs text-primary-container">
                                                <span>Diskon Voucher</span>
                                                <span className="font-bold">-{formatRupiah(voucherDiscount)}</span>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between border-t border-primary-fixed-dim pt-2 font-body-sm text-sm font-extrabold text-primary-container">
                                            <span>Estimasi Total</span>
                                            <span>{formatRupiah(previewTotal)}</span>
                                        </div>
                                    </div>
                                ) : null}
                                <p className="mt-2 font-body-sm text-xs leading-5 text-on-surface-variant">Belum termasuk ongkir. Admin akan mengonfirmasi biaya pengiriman setelah order dibuat.</p>
                                
                                <div className="mt-5 rounded-3xl border border-primary-fixed-dim bg-primary-fixed/25 p-4">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-primary-fixed">Voucher Belanja</p>
                                    <div className="mt-3">
                                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Kode Voucher</span>
                                        <div className="mt-2 flex gap-2">
                                            <input className="block min-w-0 flex-1 rounded-2xl border-outline-variant bg-white font-body-sm text-sm uppercase text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name="voucher_code" onChange={(event) => changeVoucherCode(event.target.value)} type="text" value={data.voucher_code ?? ''} placeholder="Masukkan kode voucher" />
                                            <button className="shrink-0 rounded-2xl border border-primary-container px-4 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-container hover:text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={voucherCheck.status === 'checking' || !data.voucher_code} onClick={checkVoucher} type="button">
                                                {voucherCheck.status === 'checking' ? 'Cek...' : 'Cek'}
                                            </button>
                                        </div>
                                        <FieldError message={errors.voucher_code} />
                                        {voucherCheck.message ? <p className={`mt-2 font-body-sm text-xs ${voucherCheck.status === 'valid' ? 'text-primary-container' : 'text-error'}`}>{voucherCheck.message}</p> : null}
                                        {(!customerProfile && !data.customer_whatsapp_number) && <p className="mt-2 font-body-sm text-xs text-error">Isi Nomor WhatsApp terlebih dahulu untuk mengecek voucher.</p>}
                                    </div>
                                </div>
                            </div>
                            <button className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-container px-5 py-3 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={processing || (data.voucher_code && voucherCheck.status !== 'valid')} form="checkout-form" type="submit">
                                {data.voucher_code && voucherCheck.status !== 'valid' ? 'Cek Voucher Dulu' : 'Buat Order'}
                            </button>
                            <SecondaryLink className="mt-5 w-full" href={route('orders.lookup.create')}>Sudah Checkout? Cek Pesanan</SecondaryLink>
                            <SecondaryLink className="mt-5 w-full" href={route('cart.index')}>Kembali ke Keranjang</SecondaryLink>
                        </PublicCard>
                    </div>
                )}
            </div>
        </>
    );
}

CheckoutShow.layout = (page) => <PublicShell>{page}</PublicShell>;
