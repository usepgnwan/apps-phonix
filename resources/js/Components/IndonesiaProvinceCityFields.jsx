import { useEffect, useMemo, useRef, useState } from 'react';

import { FieldError } from '@/Components/Admin/FormFields';

const WILAYAH_API = 'https://www.emsifa.com/api-wilayah-indonesia/api';

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
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                {label}
            </span>
            <button
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-white px-4 py-3 font-body-sm text-sm text-on-surface shadow-sm transition hover:border-primary-fixed-dim focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:opacity-70"
                disabled={disabled}
                name={name}
                onClick={() => setIsOpen((current) => !current)}
                type="button"
            >
                <span className={selectedOption ? 'text-on-surface' : 'text-on-surface-variant'}>
                    {selectedOption?.name ?? placeholder}
                </span>
                <span
                    aria-hidden="true"
                    className={`text-on-surface-variant transition ${isOpen ? 'rotate-180 text-primary-container' : ''}`}
                >
                    ⌄
                </span>
            </button>
            {isOpen ? (
                <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-outline-variant/80 bg-white p-2 shadow-xl">
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
                                        className={`block w-full rounded-xl px-3 py-2.5 text-left font-body-sm text-sm font-bold transition ${
                                            isSelected
                                                ? 'bg-primary-container text-white shadow-sm'
                                                : 'text-primary-container hover:bg-primary-fixed/35'
                                        }`}
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

function selectedRegionName(options, selectedId) {
    const selectedRegion = options.find((option) => String(option.id) === String(selectedId));

    return selectedRegion?.name ?? '';
}

/**
 * Cascading wilayah Indonesia (provinsi → kota/kab) untuk field domisili.
 * Pola API sama register/branch (emsifa).
 */
export default function IndonesiaProvinceCityFields({
    cityError,
    disabled = false,
    onChange,
    provinceError,
    valueCity = '',
    valueProvince = '',
}) {
    const [provinceId, setProvinceId] = useState('');
    const [regencyId, setRegencyId] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState({
        provinces: false,
        regencies: false,
    });
    const [regionError, setRegionError] = useState('');
    const hydratedRef = useRef(false);

    function emitChange(nextProvince, nextCity) {
        if (typeof onChange !== 'function') {
            return;
        }

        onChange({
            province: nextProvince,
            city: nextCity,
        });
    }

    useEffect(() => {
        let isActive = true;

        async function fetchProvinces() {
            setLoadingRegions((current) => ({ ...current, provinces: true }));
            setRegionError('');

            try {
                const response = await fetch(`${WILAYAH_API}/provinces.json`);

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
                const response = await fetch(`${WILAYAH_API}/regencies/${provinceId}.json`);

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

    // Prefill dari value existing (mis. settings) — cocokkan nama kota di seluruh provinsi.
    useEffect(() => {
        if (hydratedRef.current || provinces.length === 0 || !valueCity) {
            return;
        }

        let cancelled = false;

        async function hydrateFromValue() {
            const normalizedCity = valueCity.trim().toLowerCase();
            const preferredProvince = valueProvince.trim().toLowerCase();

            const provinceCandidates = preferredProvince
                ? provinces.filter((item) => item.name.toLowerCase() === preferredProvince)
                : provinces;

            const searchList = provinceCandidates.length > 0 ? provinceCandidates : provinces;

            for (const province of searchList) {
                if (cancelled) {
                    return;
                }

                try {
                    const response = await fetch(`${WILAYAH_API}/regencies/${province.id}.json`);

                    if (!response.ok) {
                        continue;
                    }

                    const regionData = await response.json();
                    const matchedCity = regionData.find(
                        (item) => item.name.toLowerCase() === normalizedCity
                            || normalizedCity.includes(item.name.toLowerCase())
                            || item.name.toLowerCase().includes(normalizedCity),
                    );

                    if (matchedCity) {
                        setProvinceId(String(province.id));
                        setRegencies(regionData);
                        setRegencyId(String(matchedCity.id));
                        hydratedRef.current = true;
                        return;
                    }
                } catch {
                    // lanjut coba provinsi berikutnya
                }
            }

            hydratedRef.current = true;
        }

        hydrateFromValue();

        return () => {
            cancelled = true;
        };
    }, [provinces, valueCity, valueProvince]);

    function changeProvince(selectedId) {
        setProvinceId(selectedId);
        setRegencyId('');
        setRegencies([]);
        emitChange(selectedRegionName(provinces, selectedId), '');
    }

    function changeRegency(selectedId) {
        setRegencyId(selectedId);
        emitChange(
            selectedRegionName(provinces, provinceId),
            selectedRegionName(regencies, selectedId),
        );
    }

    return (
        <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SearchableSelect
                    disabled={loadingRegions.provinces || disabled}
                    error={provinceError}
                    label="Provinsi"
                    loading={loadingRegions.provinces}
                    name="province"
                    onChange={changeProvince}
                    options={provinces}
                    placeholder={loadingRegions.provinces ? 'Memuat provinsi...' : 'Pilih provinsi'}
                    value={provinceId}
                />
                <SearchableSelect
                    disabled={!provinceId || loadingRegions.regencies || disabled}
                    error={cityError}
                    label="Kota / Kabupaten"
                    loading={loadingRegions.regencies}
                    name="city"
                    onChange={changeRegency}
                    options={regencies}
                    placeholder={
                        !provinceId
                            ? 'Pilih provinsi dulu'
                            : loadingRegions.regencies
                                ? 'Memuat kota/kabupaten...'
                                : 'Pilih kota/kabupaten'
                    }
                    value={regencyId}
                />
            </div>

            {regionError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-xs text-red-700">
                    {regionError}
                </p>
            ) : null}

            {valueCity && !regencyId ? (
                <p className="font-body-sm text-xs text-on-surface-variant">
                    Domisili tersimpan: <span className="font-semibold text-on-surface">{valueCity}</span>
                    {' '}— pilih ulang lewat selector di atas untuk memperbarui.
                </p>
            ) : null}
        </div>
    );
}
