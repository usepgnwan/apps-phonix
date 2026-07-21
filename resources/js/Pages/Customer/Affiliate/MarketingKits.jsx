import { Head, router } from '@inertiajs/react';
import {
    Clapperboard,
    Copy,
    Download,
    Eye,
    FileText,
    Image as ImageIcon,
    Play,
    Type,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import PanelCard from '@/Components/Panel/PanelCard';
import PanelEmptyState from '@/Components/Panel/PanelEmptyState';
import PanelPageHeader from '@/Components/Panel/PanelPageHeader';
import CustomerLayout from '@/Layouts/CustomerLayout';

const filterOptions = [
    { value: '', label: 'Semua Materi' },
    { value: 'image', label: 'Gambar' },
    { value: 'video', label: 'Video' },
    { value: 'text', label: 'Copywriting' },
    { value: 'pdf', label: 'Dokumen (PDF)' },
];

function copyText(value) {
    if (!value) {
        return false;
    }

    if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(value);
        return true;
    }

    window.prompt('Salin teks berikut:', value);
    return true;
}

function categoryTone(category) {
    return {
        image: {
            badge: 'bg-sky-100 text-sky-800',
            card: 'from-sky-50 to-white',
            iconWrap: 'bg-sky-100 text-sky-700',
            Icon: ImageIcon,
        },
        video: {
            badge: 'bg-rose-100 text-rose-800',
            card: 'from-rose-50 to-white',
            iconWrap: 'bg-rose-100 text-rose-700',
            Icon: Clapperboard,
        },
        text: {
            badge: 'bg-violet-100 text-violet-800',
            card: 'from-violet-50 to-white',
            iconWrap: 'bg-violet-100 text-violet-700',
            Icon: Type,
        },
        pdf: {
            badge: 'bg-amber-100 text-amber-800',
            card: 'from-amber-50 to-white',
            iconWrap: 'bg-amber-100 text-amber-700',
            Icon: FileText,
        },
    }[category] ?? {
        badge: 'bg-gray-100 text-gray-700',
        card: 'from-gray-50 to-white',
        iconWrap: 'bg-gray-100 text-gray-700',
        Icon: FileText,
    };
}

function primaryActionLabel(category) {
    if (category === 'text') {
        return 'Salin Teks';
    }
    if (category === 'pdf') {
        return 'Unduh PDF';
    }
    return 'Unduh';
}

export default function AffiliateMarketingKits({ affiliate, kits = [], filters = {} }) {
    const [copiedId, setCopiedId] = useState(null);
    const activeCategory = filters.category || '';

    const greeting = useMemo(
        () => (affiliate?.full_name ? `Halo, ${affiliate.full_name.split(' ')[0]}!` : 'Halo, Mitra Phoenix!'),
        [affiliate?.full_name],
    );

    const applyFilter = (category) => {
        router.get(
            route('customer.affiliate.marketing-kits'),
            category ? { category } : {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePrimaryAction = (kit) => {
        if (kit.category === 'text') {
            const ok = copyText(kit.body_text || '');
            if (ok) {
                setCopiedId(kit.id);
                window.setTimeout(() => setCopiedId((current) => (current === kit.id ? null : current)), 2000);
            }
            return;
        }

        if (!kit.file_url) {
            return;
        }

        const link = document.createElement('a');
        link.href = kit.file_url;
        link.download = kit.original_filename || kit.title;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreview = (kit) => {
        if (!kit.file_url) {
            return;
        }
        window.open(kit.file_url, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <Head title="Bahan Promosi Affiliate" />

            <div className="space-y-8">
                <PanelPageHeader
                    description="Akses semua materi grafis, video, dan naskah copywriting harian Anda di sini."
                    eyebrow="Portal Mitra"
                    title="Bahan Promosi Siap Pakai"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {filterOptions.map((option) => {
                            const active = activeCategory === option.value;
                            return (
                                <button
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                        active
                                            ? 'bg-[#1E4D3A] text-white'
                                            : 'border border-[#E5E7EB] bg-white text-[#333333] hover:border-[#1E4D3A] hover:text-[#1E4D3A]'
                                    }`}
                                    key={option.value || 'all'}
                                    onClick={() => applyFilter(option.value)}
                                    type="button"
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="rounded-full border border-[#1E4D3A]/15 bg-[#F6F7F7] px-4 py-2 text-xs font-bold text-[#1E4D3A]">
                        {greeting}
                    </div>
                </div>

                {kits.length === 0 ? (
                    <PanelCard className="p-6">
                        <PanelEmptyState
                            description="Admin belum mempublikasikan materi untuk filter ini."
                            title="Belum ada bahan promosi"
                        />
                    </PanelCard>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {kits.map((kit) => {
                            const tone = categoryTone(kit.category);
                            const Icon = tone.Icon;

                            return (
                                <PanelCard
                                    className={`flex h-full flex-col overflow-hidden bg-gradient-to-b ${tone.card} p-0`}
                                    key={kit.id}
                                >
                                    <div className="relative flex h-36 items-center justify-center">
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${tone.iconWrap}`}>
                                            <Icon aria-hidden="true" className="h-7 w-7" />
                                        </div>
                                        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tone.badge}`}>
                                            {kit.category_label}
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col px-5 pb-5">
                                        <h3 className="text-base font-extrabold text-[#1E4D3A]">{kit.title}</h3>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                                            {kit.description || (kit.category === 'text' ? kit.body_text : 'Materi siap pakai untuk afiliator.')}
                                        </p>
                                        <div className="mt-auto flex flex-wrap gap-2 pt-5">
                                            <button
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#163B2C]"
                                                onClick={() => handlePrimaryAction(kit)}
                                                type="button"
                                            >
                                                {kit.category === 'text' ? (
                                                    <Copy aria-hidden="true" className="h-4 w-4" />
                                                ) : (
                                                    <Download aria-hidden="true" className="h-4 w-4" />
                                                )}
                                                {copiedId === kit.id ? 'Tersalin!' : primaryActionLabel(kit.category)}
                                            </button>
                                            {kit.category !== 'text' && kit.file_url ? (
                                                <button
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1E4D3A]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A]/5"
                                                    onClick={() => handlePreview(kit)}
                                                    type="button"
                                                >
                                                    {kit.category === 'video' ? (
                                                        <Play aria-hidden="true" className="h-4 w-4" />
                                                    ) : (
                                                        <Eye aria-hidden="true" className="h-4 w-4" />
                                                    )}
                                                    {kit.category === 'video' ? 'Play' : 'Lihat'}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </PanelCard>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

AffiliateMarketingKits.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
