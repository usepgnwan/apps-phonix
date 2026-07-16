import { useEffect, useMemo, useRef, useState } from 'react';

import { FieldError, TextAreaField } from '@/Components/Admin/FormFields';

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
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <button
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="mt-2 inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 font-body-sm text-sm text-[#333333] shadow-sm transition hover:border-[#1E4D3A]/40 focus:border-[#1E4D3A] focus:outline-none focus:ring-2 focus:ring-[#1E4D3A]/20 disabled:cursor-not-allowed disabled:bg-[#F6F7F7] disabled:text-gray-400 disabled:opacity-70"
                disabled={disabled}
                name={name}
                onClick={() => setIsOpen((current) => !current)}
                type="button"
            >
                <span className={selectedOption ? 'text-[#333333]' : 'text-gray-400'}>
                    {selectedOption?.name ?? placeholder}
                </span>
                <span
                    aria-hidden="true"
                    className={`text-gray-400 transition ${isOpen ? 'rotate-180 text-[#1E4D3A]' : ''}`}
                >
                    ⌄
                </span>
            </button>
            {isOpen ? (
                <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl">
                    <input
                        className="block w-full rounded-xl border-[#E5E7EB] bg-white font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={`Cari ${label.toLowerCase()}...`}
                        type="search"
                        value={query}
                    />
                    <div className="mt-2 max-h-56 overflow-y-auto" role="listbox">
                        {loading ? (
                            <p className="px-3 py-2 font-body-sm text-sm text-gray-500">Memuat data...</p>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = String(option.id) === String(value);

                                return (
                                    <button
                                        aria-selected={isSelected}
                                        className={`block w-full rounded-xl px-3 py-2.5 text-left font-body-sm text-sm font-bold transition ${
                                            isSelected
                                                ? 'bg-[#1E4D3A] text-white shadow-sm'
                                                : 'text-[#1E4D3A] hover:bg-[#F1F5F9]'
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
                            <p className="px-3 py-2 font-body-sm text-sm text-gray-500">Tidak ada hasil.</p>
                        )}
                    </div>
                </div>
            ) : null}
            <FieldError message={error} />
        </div>
    );
}

export function composeIndonesiaAddress({ detail, village, district, city, province }) {
    if (!province && !city && !district && !village) {
        return (detail ?? '').trim();
    }

    return [detail, village, district, city, province].filter(Boolean).join(', ');
}

function selectedRegionName(options, selectedId) {
    const selectedRegion = options.find((option) => String(option.id) === String(selectedId));

    return selectedRegion?.name ?? '';
}

/**
 * Cascading wilayah Indonesia (provinsi → kota/kab → kecamatan → desa) + detail alamat.
 * Pola sama dengan checkout/register (API emsifa).
 */
export default function IndonesiaAddressFields({
    detail = '',
    disabled = false,
    error,
    onChange,
}) {
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

    const regionNames = useMemo(
        () => ({
            province: selectedRegionName(provinces, provinceId),
            city: selectedRegionName(regencies, regencyId),
            district: selectedRegionName(districts, districtId),
            village: selectedRegionName(villages, villageId),
        }),
        [provinces, provinceId, regencies, regencyId, districts, districtId, villages, villageId],
    );

    function emitChange(nextDetail, nextRegions = regionNames) {
        if (typeof onChange !== 'function') {
            return;
        }

        onChange({
            detail: nextDetail,
            province: nextRegions.province,
            city: nextRegions.city,
            district: nextRegions.district,
            village: nextRegions.village,
            composed: composeIndonesiaAddress({
                detail: nextDetail,
                village: nextRegions.village,
                district: nextRegions.district,
                city: nextRegions.city,
                province: nextRegions.province,
            }),
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
                const response = await fetch(`${WILAYAH_API}/districts/${regencyId}.json`);

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
                const response = await fetch(`${WILAYAH_API}/villages/${districtId}.json`);

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
        emitChange(detail, {
            province: selectedRegionName(provinces, selectedId),
            city: '',
            district: '',
            village: '',
        });
    }

    function changeRegency(selectedId) {
        setRegencyId(selectedId);
        resetRegionChildren('regency');
        emitChange(detail, {
            province: regionNames.province,
            city: selectedRegionName(regencies, selectedId),
            district: '',
            village: '',
        });
    }

    function changeDistrict(selectedId) {
        setDistrictId(selectedId);
        resetRegionChildren('district');
        emitChange(detail, {
            province: regionNames.province,
            city: regionNames.city,
            district: selectedRegionName(districts, selectedId),
            village: '',
        });
    }

    function changeVillage(selectedId) {
        setVillageId(selectedId);
        emitChange(detail, {
            province: regionNames.province,
            city: regionNames.city,
            district: regionNames.district,
            village: selectedRegionName(villages, selectedId),
        });
    }

    function changeDetail(value) {
        emitChange(value, regionNames);
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <SearchableSelect
                    disabled={loadingRegions.provinces || disabled}
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
                    label="Kota/Kabupaten"
                    loading={loadingRegions.regencies}
                    name="city"
                    onChange={changeRegency}
                    options={regencies}
                    placeholder={
                        loadingRegions.regencies ? 'Memuat kota/kabupaten...' : 'Pilih kota/kabupaten'
                    }
                    value={regencyId}
                />
                <SearchableSelect
                    disabled={!regencyId || loadingRegions.districts || disabled}
                    label="Kecamatan"
                    loading={loadingRegions.districts}
                    name="district"
                    onChange={changeDistrict}
                    options={districts}
                    placeholder={loadingRegions.districts ? 'Memuat kecamatan...' : 'Pilih kecamatan'}
                    value={districtId}
                />
                <SearchableSelect
                    disabled={!districtId || loadingRegions.villages || disabled}
                    label="Desa"
                    loading={loadingRegions.villages}
                    name="village"
                    onChange={changeVillage}
                    options={villages}
                    placeholder={loadingRegions.villages ? 'Memuat desa...' : 'Pilih desa'}
                    value={villageId}
                />
            </div>

            {regionError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-xs text-red-700">
                    {regionError}
                </p>
            ) : null}

            <TextAreaField
                error={error}
                label="Detail Alamat"
                name="address_detail"
                onChange={(event) => changeDetail(event.target.value)}
                rows={4}
                value={detail}
            />
            <p className="font-body-sm text-xs text-gray-500">
                Tulis nama jalan, nomor, RT/RW, atau patokan. Alamat lengkap akan disimpan bersama
                provinsi, kota/kabupaten, kecamatan, dan desa yang dipilih.
            </p>
        </div>
    );
}
