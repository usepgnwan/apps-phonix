import { Head, useForm } from '@inertiajs/react';

import PanelCard from '@/Components/Panel/PanelCard';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import { FieldError, SelectField, SubmitButton, TextField } from '@/Components/Panel/FormFields';
import IndonesiaProvinceCityFields from '@/Components/IndonesiaProvinceCityFields';
import CustomerLayout from '@/Layouts/CustomerLayout';

const payoutMethods = ['BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'OVO', 'GOPAY'];

const platformOptions = [
    { value: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/62812... atau link group/channel' },
    { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
    { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username atau halaman' },
    { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
    { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
];

function normalizePlatformLinks(platforms, mediaUrl = '') {
    const empty = { whatsapp: '', instagram: '', facebook: '', tiktok: '', youtube: '' };

    if (platforms && typeof platforms === 'object' && !Array.isArray(platforms)) {
        return {
            ...empty,
            ...Object.fromEntries(
                Object.entries(platforms).map(([key, value]) => [key, value ?? '']),
            ),
        };
    }

    if (Array.isArray(platforms) && platforms.length > 0) {
        const first = platforms[0];
        if (first && empty[first] !== undefined) {
            return { ...empty, [first]: mediaUrl || '' };
        }
    }

    if (mediaUrl) {
        return { ...empty, instagram: mediaUrl };
    }

    return empty;
}

function selectedPlatformsFrom(platforms) {
    if (platforms && typeof platforms === 'object' && !Array.isArray(platforms)) {
        return Object.keys(platforms);
    }

    if (Array.isArray(platforms)) {
        return platforms;
    }

    return [];
}

export default function AffiliateSettings({ affiliate }) {
    const initialLinks = normalizePlatformLinks(affiliate.platforms, affiliate.media_url || '');
    const initialSelected = selectedPlatformsFrom(affiliate.platforms);

    const { data, setData, patch, processing, errors } = useForm({
        whatsapp: affiliate.whatsapp || '',
        city: affiliate.city || '',
        platforms: initialSelected.length > 0 ? initialSelected : Object.keys(initialLinks).filter((key) => initialLinks[key]),
        platform_links: initialLinks,
        payout_method: affiliate.payout_method || '',
        payout_account_number: affiliate.payout_account_number || '',
        payout_account_name: affiliate.payout_account_name || '',
    });

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
        patch(route('customer.affiliate.settings.update'));
    };

    return (
        <>
            <Head title="Pengaturan Affiliate" />

            <div className="space-y-8">
                <PanelPageHeader
                    description={`Mitra ${affiliate.partner_code} · Kupon ${affiliate.coupon_code}`}
                    eyebrow="Portal Mitra"
                    title="Pengaturan Akun Affiliate"
                />

                <PanelCard className="p-6 md:p-8">
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <TextField
                                error={errors.whatsapp}
                                label="WhatsApp"
                                name="whatsapp"
                                onChange={(e) => setData('whatsapp', e.target.value)}
                                value={data.whatsapp}
                            />
                            <IndonesiaProvinceCityFields
                                cityError={errors.city}
                                onChange={({ city }) => setData('city', city)}
                                valueCity={data.city}
                            />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Platform & link akun media sosial
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

                        <div className="grid gap-4 md:grid-cols-2">
                            <SelectField
                                error={errors.payout_method}
                                label="Bank / E-Wallet"
                                name="payout_method"
                                onChange={(e) => setData('payout_method', e.target.value)}
                                value={data.payout_method}
                            >
                                {payoutMethods.map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </SelectField>
                            <TextField
                                error={errors.payout_account_number}
                                label="No. Rekening / ID"
                                name="payout_account_number"
                                onChange={(e) => setData('payout_account_number', e.target.value)}
                                value={data.payout_account_number}
                            />
                            <TextField
                                error={errors.payout_account_name}
                                label="Nama Pemilik"
                                name="payout_account_name"
                                onChange={(e) => setData('payout_account_name', e.target.value)}
                                value={data.payout_account_name}
                            />
                        </div>

                        <SubmitButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </SubmitButton>
                    </form>
                </PanelCard>
            </div>
        </>
    );
}

AffiliateSettings.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
