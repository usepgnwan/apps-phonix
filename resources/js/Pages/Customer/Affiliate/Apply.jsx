import { Head, useForm } from '@inertiajs/react';
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';

import PanelCard from '@/Components/Panel/PanelCard';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import { FieldError, SelectField, SubmitButton, TextField } from '@/Components/Panel/FormFields';
import IndonesiaProvinceCityFields from '@/Components/IndonesiaProvinceCityFields';
import CustomerLayout from '@/Layouts/CustomerLayout';

const platformOptions = [
    { value: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/62812... atau link group/channel' },
    { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
    { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username atau halaman' },
    { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
    { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
];

const payoutMethods = ['BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'OVO', 'GOPAY'];

export default function AffiliateApply({ defaults = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: defaults.full_name || '',
        email: defaults.email || '',
        whatsapp: defaults.whatsapp || '',
        city: defaults.city || '',
        age: defaults.age || '',
        platforms: [],
        platform_links: {
            whatsapp: '',
            instagram: '',
            facebook: '',
            tiktok: '',
            youtube: '',
        },
        photo: null,
        payout_method: '',
        payout_account_number: '',
        payout_account_name: '',
        agreement: false,
    });

    const [photoName, setPhotoName] = useState('');

    const togglePlatform = (value) => {
        const current = data.platforms || [];
        if (current.includes(value)) {
            setData({
                ...data,
                platforms: current.filter((item) => item !== value),
                platform_links: {
                    ...data.platform_links,
                    [value]: '',
                },
            });
            return;
        }
        setData('platforms', [...current, value]);
    };

    const setPlatformLink = (platform, url) => {
        setData('platform_links', {
            ...data.platform_links,
            [platform]: url,
        });
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('customer.affiliate.apply.store'), {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Daftar Affiliate" />

            <div className="space-y-8">
                <PanelPageHeader
                    description="Isi data kualifikasi di bawah. Pengajuan akan direview admin sebelum akun mitra aktif."
                    eyebrow="Program Affiliate"
                    title="Formulir Pendaftaran Mitra"
                />

                <PanelCard className="p-6 md:p-8">
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Data diri */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <TextField
                                error={errors.full_name}
                                label="Nama Lengkap"
                                name="full_name"
                                onChange={(e) => setData('full_name', e.target.value)}
                                value={data.full_name}
                            />
                            <TextField
                                error={errors.email}
                                label="Email"
                                name="email"
                                onChange={(e) => setData('email', e.target.value)}
                                type="email"
                                value={data.email}
                            />
                            <TextField
                                error={errors.whatsapp}
                                label="Nomor WhatsApp"
                                name="whatsapp"
                                onChange={(e) => setData('whatsapp', e.target.value)}
                                value={data.whatsapp}
                            />
                            <TextField
                                error={errors.age}
                                label="Umur"
                                name="age"
                                onChange={(e) => setData('age', e.target.value)}
                                type="number"
                                value={data.age}
                            />
                            <IndonesiaProvinceCityFields
                                cityError={errors.city}
                                onChange={({ city }) => setData('city', city)}
                                valueCity={data.city}
                            />
                        </div>

                        {/* Platform media sosial */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Platform & link akun media sosial
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Centang platform yang Anda pakai untuk promosi, lalu isi link akun di platform tersebut.
                            </p>
                            <div className="mt-4 space-y-3">
                                {platformOptions.map((option) => {
                                    const checked = data.platforms.includes(option.value);
                                    const linkError = errors[`platform_links.${option.value}`];

                                    return (
                                        <div
                                            className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] p-4 transition"
                                            key={option.value}
                                        >
                                            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#333333]">
                                                <input
                                                    checked={checked}
                                                    className="rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                                                    onChange={() => togglePlatform(option.value)}
                                                    type="checkbox"
                                                />
                                                {option.label}
                                            </label>
                                            {checked ? (
                                                <div className="mt-3">
                                                    <TextField
                                                        error={linkError}
                                                        label={`Link ${option.label}`}
                                                        name={`platform_links.${option.value}`}
                                                        onChange={(e) => setPlatformLink(option.value, e.target.value)}
                                                        placeholder={option.placeholder}
                                                        value={data.platform_links[option.value] || ''}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                            <FieldError message={errors.platforms || errors.platform_links} />
                        </div>

                        {/* Upload foto */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Foto Diri (maks 2 MB · JPG/PNG/WEBP)
                            </p>
                            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#A8C5B3] bg-[#F6F7F7] px-4 py-8 text-center transition hover:border-[#1E4D3A] hover:bg-[#A8C5B3]/10">
                                <UploadCloud aria-hidden="true" className="mb-2 h-8 w-8 text-[#1E4D3A]" />
                                <span className="text-sm font-bold text-[#1E4D3A]">
                                    {photoName || 'Pilih berkas foto profil digital Anda'}
                                </span>
                                <span className="mt-1 text-xs text-gray-400">
                                    Maksimal 2 MB. Format: JPG, PNG, atau WEBP.
                                </span>
                                <input
                                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        if (file && file.size > 2 * 1024 * 1024) {
                                            window.alert('Ukuran foto maksimal 2 MB. Kompres atau pilih foto yang lebih kecil.');
                                            e.target.value = '';
                                            setData('photo', null);
                                            setPhotoName('');
                                            return;
                                        }
                                        setData('photo', file);
                                        setPhotoName(file?.name ?? '');
                                    }}
                                    type="file"
                                />
                            </label>
                            <FieldError message={errors.photo} />
                        </div>

                        {/* Data pencairan */}
                        <div className="border-t border-[#E5E7EB] pt-6">
                            <h3 className="text-lg font-extrabold text-[#1E4D3A]">Data Pencairan Komisi</h3>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <SelectField
                                    error={errors.payout_method}
                                    label="Bank / E-Wallet"
                                    name="payout_method"
                                    onChange={(e) => setData('payout_method', e.target.value)}
                                    value={data.payout_method}
                                >
                                    <option value="">-- Pilih --</option>
                                    {payoutMethods.map((method) => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </SelectField>
                                <TextField
                                    error={errors.payout_account_number}
                                    label="Nomor Rekening / ID E-Wallet"
                                    name="payout_account_number"
                                    onChange={(e) => setData('payout_account_number', e.target.value)}
                                    value={data.payout_account_number}
                                />
                                <TextField
                                    error={errors.payout_account_name}
                                    label="Nama Pemilik Rekening"
                                    name="payout_account_name"
                                    onChange={(e) => setData('payout_account_name', e.target.value)}
                                    value={data.payout_account_name}
                                />
                            </div>
                        </div>

                        {/* Persetujuan */}
                        <label className="flex cursor-pointer items-start gap-3 text-sm text-[#333333]">
                            <input
                                checked={data.agreement}
                                className="mt-0.5 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                                onChange={(e) => setData('agreement', e.target.checked)}
                                type="checkbox"
                            />
                            <span>
                                Saya setuju mematuhi syarat, ketentuan, dan kode etik promosi Phoenix Sehat Indonesia.
                            </span>
                        </label>
                        <FieldError message={errors.agreement} />

                        <SubmitButton disabled={processing}>
                            {processing ? 'Mengirim...' : 'Kirim Formulir Pendaftaran'}
                        </SubmitButton>
                    </form>
                </PanelCard>
            </div>
        </>
    );
}

AffiliateApply.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
