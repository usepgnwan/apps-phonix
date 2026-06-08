import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-error">{message}</p> : null;
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
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">{label}</span>
            <button
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition hover:border-primary-fixed-dim hover:bg-primary-fixed/15 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/25 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:opacity-70"
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

function composePrimaryAddress(detail, village, district, city, province) {
    return [detail, village, district, city, province].filter(Boolean).join(', ');
}

export default function Register() {
    const [provinceId, setProvinceId] = useState('');
    const [regencyId, setRegencyId] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [villageId, setVillageId] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState({
        provinces: false,
        regencies: false,
        districts: false,
        villages: false,
    });
    const [regionError, setRegionError] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        name: '',
        email: '',
        whatsapp_number: '',
        primary_address: '',
        password: '',
        password_confirmation: '',
    });

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
            return undefined;
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
            return undefined;
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
            return undefined;
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
        const selectedRegion = options.find((option) => String(option.id) === String(selectedId));

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
    }

    function changeRegency(selectedId) {
        setRegencyId(selectedId);
        resetRegionChildren('regency');
    }

    function changeDistrict(selectedId) {
        setDistrictId(selectedId);
        resetRegionChildren('district');
    }

    function submit(e) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            primary_address: composePrimaryAddress(
                addressDetail,
                selectedRegionName(villages, villageId),
                selectedRegionName(districts, districtId),
                selectedRegionName(regencies, regencyId),
                selectedRegionName(provinces, provinceId),
            ),
        }));

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <GuestLayout fullScreen>
            <Head title="Daftar" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-[#6FA788] px-margin-mobile py-10 font-body-md text-on-surface md:px-margin-desktop">
                <Link
                    href="/"
                    className="mb-6 flex flex-col items-center rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-[#6FA788]"
                    aria-label="Phoenix Terapi & Herbal"
                >
                    <img
                        src="/images/logo_blue_box.png"
                        alt="Logo Phoenix Terapi & Herbal"
                        className="h-auto w-40 rounded-xl object-contain shadow-sm shadow-black/10 sm:w-44"
                    />
                </Link>

                <section className="w-full max-w-lg rounded-lg border border-outline-variant bg-white px-6 py-6 shadow-sm sm:px-8">
                    <div className="mb-6 text-center">
                        <h1 className="font-headline-lg text-headline-lg text-primary-container">
                            Daftar Akun Customer
                        </h1>
                        <p className="mt-2 font-body-sm text-sm leading-relaxed text-on-surface-variant">
                            Buat akun untuk memantau pesanan, menyimpan data kontak, dan checkout lebih mudah.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="email" className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="whatsapp_number" className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">
                                Nomor WhatsApp
                            </label>
                            <input
                                id="whatsapp_number"
                                type="tel"
                                name="whatsapp_number"
                                value={data.whatsapp_number}
                                className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                autoComplete="tel"
                                placeholder="Contoh: 081234567890"
                                onChange={(e) => setData('whatsapp_number', e.target.value)}
                                required
                            />
                            <InputError message={errors.whatsapp_number} className="mt-2" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SearchableSelect disabled={loadingRegions.provinces || processing} label="Provinsi" loading={loadingRegions.provinces} name="province" onChange={changeProvince} options={provinces} placeholder={loadingRegions.provinces ? 'Memuat provinsi...' : 'Pilih provinsi'} value={provinceId} />
                                <SearchableSelect disabled={!provinceId || loadingRegions.regencies || processing} label="Kota/Kabupaten" loading={loadingRegions.regencies} name="regency" onChange={changeRegency} options={regencies} placeholder={loadingRegions.regencies ? 'Memuat kota/kabupaten...' : 'Pilih kota/kabupaten'} value={regencyId} />
                                <SearchableSelect disabled={!regencyId || loadingRegions.districts || processing} label="Kecamatan" loading={loadingRegions.districts} name="district" onChange={changeDistrict} options={districts} placeholder={loadingRegions.districts ? 'Memuat kecamatan...' : 'Pilih kecamatan'} value={districtId} />
                                <SearchableSelect disabled={!districtId || loadingRegions.villages || processing} label="Desa" loading={loadingRegions.villages} name="village" onChange={setVillageId} options={villages} placeholder={loadingRegions.villages ? 'Memuat desa...' : 'Pilih desa'} value={villageId} />
                            </div>

                            {regionError && (
                                <p className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 font-body-sm text-xs text-error">
                                    {regionError}
                                </p>
                            )}

                            <div>
                                <label htmlFor="address_detail" className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">
                                    Detail Alamat
                                </label>
                                <textarea
                                    id="address_detail"
                                    name="address_detail"
                                    value={addressDetail}
                                    className="mt-2 block min-h-24 w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                    autoComplete="street-address"
                                    placeholder="Tulis nama jalan, nomor rumah, RT/RW, patokan, atau detail pengiriman."
                                    onChange={(e) => setAddressDetail(e.target.value)}
                                    required
                                />
                                <InputError message={errors.primary_address} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="password" className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block font-label-sm text-xs font-semibold uppercase tracking-wide text-on-surface">
                                    Konfirmasi Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-2 block w-full rounded-lg border-outline-variant bg-white px-3 py-2.5 font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Daftar'}
                        </button>
                    </form>

                    <p className="mt-5 text-center font-body-sm text-sm text-on-surface-variant">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-primary-container underline-offset-4 transition hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2"
                        >
                            Masuk
                        </Link>
                    </p>
                </section>
            </div>
        </GuestLayout>
    );
}
