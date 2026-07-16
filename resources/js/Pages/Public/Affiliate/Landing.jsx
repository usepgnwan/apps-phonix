import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Handshake, ShieldCheck, Sparkles } from 'lucide-react';

import { formatRupiah, PrimaryLink, PublicCard, PublicShell } from '@/Components/Public/commerce.jsx';

function commissionLabel(rule) {
    if (rule.commission_type === 'percent') {
        return `${rule.commission_value}% dari total harga`;
    }

    return `${formatRupiah(rule.commission_value)} / transaksi`;
}

function statusBanner(affiliateStatus) {
    if (affiliateStatus === 'pending') {
        return 'Pengajuan affiliate Anda sedang ditinjau admin.';
    }

    if (affiliateStatus === 'active') {
        return 'Akun affiliate Anda sudah aktif. Buka portal mitra untuk mulai berbagi link.';
    }

    if (affiliateStatus === 'rejected') {
        return 'Pengajuan sebelumnya ditolak. Anda dapat mendaftar ulang.';
    }

    if (affiliateStatus === 'suspended') {
        return 'Akun affiliate Anda sedang disuspend. Hubungi admin untuk informasi lebih lanjut.';
    }

    return null;
}

export default function AffiliateLanding({
    commissionRules = [],
    affiliateStatus = null,
    canApply = false,
    isAuthenticatedCustomer = false,
}) {
    const { auth, flash } = usePage().props;
    const banner = statusBanner(affiliateStatus);
    const flashSuccess = flash?.success;
    const flashError = flash?.error;

    const ctaHref = (() => {
        if (affiliateStatus === 'active') {
            return route('customer.affiliate.dashboard');
        }

        if (canApply) {
            return route('customer.affiliate.apply');
        }

        if (!auth?.user) {
            return route('login');
        }

        return route('affiliate.landing');
    })();

    const ctaLabel = (() => {
        if (affiliateStatus === 'active') {
            return 'Buka Portal Mitra';
        }

        if (canApply) {
            return 'Mulai Daftar Kemitraan';
        }

        if (!auth?.user) {
            return 'Login untuk Daftar';
        }

        return 'Program Affiliate';
    })();

    return (
        <PublicShell>
            <Head title="Program Affiliate" />

            <div className="space-y-10">
                {(flashSuccess || flashError) && (
                    <div className="space-y-3">
                        {flashSuccess && (
                            <div className="rounded-2xl border border-primary-container/15 bg-primary-fixed/40 px-4 py-3 font-body-sm text-sm font-semibold text-primary-container">
                                {flashSuccess}
                            </div>
                        )}
                        {flashError && (
                            <div className="rounded-2xl border border-error/20 bg-error-container/40 px-4 py-3 font-body-sm text-sm font-semibold text-on-error-container">
                                {flashError}
                            </div>
                        )}
                    </div>
                )}

                <section className="overflow-hidden rounded-[2rem] border border-outline-variant/80 bg-gradient-to-br from-primary-fixed/40 via-white to-tertiary-fixed/30 p-8 shadow-sm md:p-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/15 bg-white/80 px-4 py-1.5 font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-primary-container">
                        <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                        Slot rekrutmen mitra
                    </div>
                    <h1 className="mt-5 max-w-3xl font-headline-lg text-3xl font-bold tracking-tight text-primary-container md:text-5xl">
                        Program Afiliasi Kemitraan Phoenix Sehat
                    </h1>
                    <p className="mt-4 max-w-2xl font-body-md text-sm leading-7 text-on-surface-variant md:text-base">
                        Hasilkan pendapatan tambahan tanpa modal dengan membagikan edukasi kesehatan holistik.
                        Customer tetap belanja seperti biasa; mitra butuh pendaftaran affiliate terpisah.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <PrimaryLink href={ctaHref}>{ctaLabel}</PrimaryLink>
                        <a
                            className="inline-flex items-center justify-center rounded-full border border-primary-container px-5 py-2.5 font-label-md text-sm font-bold text-primary-container transition hover:bg-primary-fixed/40"
                            href="#skema-komisi"
                        >
                            Lihat Skema Komisi
                        </a>
                    </div>
                    {banner && (
                        <div className="mt-6 rounded-2xl border border-primary-container/15 bg-white/90 px-4 py-3 font-body-sm text-sm text-primary-container">
                            {banner}
                        </div>
                    )}
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: 'WhatsApp',
                            body: 'Bagikan rekomendasi ke jaringan kerabat yang butuh solusi kesehatan nyata.',
                        },
                        {
                            title: 'Media Sosial',
                            body: 'Sebar edukasi di Instagram, TikTok, atau Facebook dengan link tracking Anda.',
                        },
                        {
                            title: 'Komunitas',
                            body: 'Manfaatkan relasi terpercaya di komunitas kebugaran dan keluarga.',
                        },
                    ].map((item) => (
                        <PublicCard className="p-6" key={item.title}>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed/50 text-primary-container">
                                <Handshake aria-hidden="true" className="h-5 w-5" />
                            </div>
                            <h2 className="mt-4 font-body-lg text-lg font-extrabold text-on-surface">{item.title}</h2>
                            <p className="mt-2 font-body-sm text-sm leading-6 text-on-surface-variant">{item.body}</p>
                        </PublicCard>
                    ))}
                </section>

                <section className="space-y-4">
                    <h2 className="font-headline-md text-2xl font-bold text-primary-container">Alur Sederhana Kemitraan</h2>
                    <ol className="grid gap-3 md:grid-cols-2">
                        {[
                            'Login sebagai customer, lalu isi formulir pendaftaran affiliate.',
                            'Admin meninjau dan menyetujui pengajuan Anda.',
                            'Dapatkan link afiliasi unik dan kode kupon personal.',
                            'Bagikan edukasi kesehatan beserta link/kupon Anda.',
                            'Sistem mencatat order & booking rujukan, komisi hold 7 hari.',
                            'Saldo approved dicairkan sesuai jadwal admin (target tgl 28).',
                        ].map((step, index) => (
                            <li className="flex gap-3 rounded-2xl border border-outline-variant bg-white p-4" key={step}>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-sm text-xs font-bold text-white">
                                    {index + 1}
                                </span>
                                <p className="font-body-sm text-sm leading-6 text-on-surface">{step}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="space-y-4" id="skema-komisi">
                    <h2 className="font-headline-md text-2xl font-bold text-primary-container">Skema Komisi</h2>
                    <PublicCard className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-[#F6F7F7]">
                                    <tr className="font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                        <th className="px-5 py-3">Kategori</th>
                                        <th className="px-5 py-3">Layanan / Produk</th>
                                        <th className="px-5 py-3">Komisi Affiliate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissionRules.length === 0 && (
                                        <tr>
                                            <td className="px-5 py-6 font-body-sm text-sm text-on-surface-variant" colSpan="3">
                                                Skema komisi akan ditampilkan setelah admin mengatur aturan.
                                            </td>
                                        </tr>
                                    )}
                                    {commissionRules.map((rule) => (
                                        <tr className="border-t border-outline-variant/70" key={rule.id}>
                                            <td className="px-5 py-4 font-body-sm text-sm font-bold text-primary-container">{rule.category}</td>
                                            <td className="px-5 py-4 font-body-sm text-sm text-on-surface">{rule.item_name}</td>
                                            <td className="px-5 py-4 font-body-sm text-sm font-extrabold text-primary-container">
                                                {commissionLabel(rule)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </PublicCard>
                    <p className="font-body-sm text-xs leading-5 text-on-surface-variant">
                        Catatan: komisi masuk masa hold 7 hari (garansi kepuasan) sebelum status siap cair.
                        Minimum pencairan Rp 100.000.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    <PublicCard className="p-6">
                        <div className="flex items-center gap-2 text-primary-container">
                            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                            <h3 className="font-body-lg text-lg font-extrabold">Metode yang disarankan</h3>
                        </div>
                        <ul className="mt-4 space-y-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                            <li>Bagikan testimoni edukatif dan gaya hidup sehat alami.</li>
                            <li>Rekomendasikan layanan di komunitas kebugaran atau keluarga.</li>
                        </ul>
                    </PublicCard>
                    <PublicCard className="p-6">
                        <div className="flex items-center gap-2 text-[#B57A2E]">
                            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                            <h3 className="font-body-lg text-lg font-extrabold">Praktik yang dilarang</h3>
                        </div>
                        <ul className="mt-4 space-y-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                            <li>Self-referral / manipulasi harga untuk diri sendiri.</li>
                            <li>Spam massal di grup WhatsApp/forum tanpa izin.</li>
                            <li>Klaim medis berlebihan di luar panduan resmi Phoenix.</li>
                        </ul>
                    </PublicCard>
                </section>

                <section className="rounded-[2rem] border border-outline-variant bg-white p-8 text-center shadow-sm">
                    <h2 className="font-headline-md text-2xl font-bold text-primary-container">Siap menjadi mitra?</h2>
                    <p className="mx-auto mt-3 max-w-xl font-body-sm text-sm leading-6 text-on-surface-variant">
                        Pendaftaran affiliate hanya untuk akun customer. Register biasa tidak otomatis menjadi mitra.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <PrimaryLink href={ctaHref}>{ctaLabel}</PrimaryLink>
                    </div>
                    {isAuthenticatedCustomer && !canApply && affiliateStatus !== 'active' && (
                        <p className="mt-4 font-body-sm text-xs text-on-surface-variant">
                            Status pengajuan Anda: <strong>{affiliateStatus ?? 'belum ada'}</strong>
                        </p>
                    )}
                    {!auth?.user && (
                        <p className="mt-4 font-body-sm text-xs text-on-surface-variant">
                            Belum punya akun?{' '}
                            <Link className="font-bold text-primary-container underline" href={route('register')}>
                                Daftar customer dulu
                            </Link>
                        </p>
                    )}
                </section>
            </div>
        </PublicShell>
    );
}
