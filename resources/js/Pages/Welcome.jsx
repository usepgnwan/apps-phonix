import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({ auth }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);

        const elements = document.querySelectorAll('.hover\\:shadow-xl, .group\\/card');
        elements.forEach((el, index) => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'all 0.6s ease-out';
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 50 * index);
            }
        });

        // Load jQuery first, expose globally, then load SpriteSpin
        const initSpriteSpin = async () => {
            const { default: jQuery } = await import('jquery');
            window.jQuery = jQuery;
            window.$ = jQuery;

            await import('spritespin');

            const frames = Array.from({ length: 7 }, (_, i) => `/360-frames/genqi/${i + 1}.png`);

            jQuery('#spritespin-container').spritespin({
                source: frames,
                width: 400,
                height: 400,
                sense: -1,
                animate: false,
                responsive: true,
                mods: ['drag', '360'],
            });
        };

        initSpriteSpin();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (window.$ && window.$('#spritespin-container').data('spritespin')) {
                window.$('#spritespin-container').spritespin('destroy');
            }
        };
    }, []);


    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
            <Head title="Phoenix Terapi & Herbal" />

            {/* TopNavBar */}
            <nav className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-xl transition-all duration-300 ${isScrolled ? 'bg-white/95 border-[#E5E7EB] shadow-sm' : 'bg-white/80 border-white/70 shadow-none'}`}>
                <div className="flex h-20 w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop mx-auto">
                    <a className="rounded-full pr-3 transition-all duration-300 hover:bg-[#F6F7F7]" href="#beranda" aria-label="Phoenix Terapi & Herbal">
                        <span className="leading-none">
                            <span className="block font-headline-md text-xl font-bold tracking-[0.16em] text-[#1E4D3A]">PHOENIX</span>
                            <span className="mt-1 block font-label-sm text-[9px] font-bold uppercase tracking-[0.22em] text-[#333333]">Terapi &amp; Herbal</span>
                        </span>
                    </a>
                    <div className="hidden items-center gap-8 md:flex">
                        <a className="font-body-md text-body-md font-semibold text-[#1E4D3A] transition-colors hover:text-[#6FA788]" href="#beranda">Beranda</a>
                        <a className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href="#produk">Produk</a>
                        <a className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href="#layanan">Layanan</a>
                        <a className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href="#tentang-kami">Tentang Kami</a>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1E4D3A]/30 bg-white text-[#1E4D3A] transition-all duration-150 hover:border-[#1E4D3A] hover:bg-[#A8C5B3]/20 active:scale-95" aria-label="Keranjang belanja">
                            <span className="material-symbols-outlined text-xl">shopping_bag</span>
                        </button>
                        <button type="button" className="inline-flex rounded-full bg-[#1E4D3A] px-5 py-2.5 font-label-md font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#163B2C] active:scale-95">
                            Login
                        </button>
                    </div>
                </div>
            </nav>
            <main className="pt-20">
                {/* Hero Section */}
                <section id="beranda" className="relative isolate overflow-hidden bg-[#F6F7F7]">
                    <img alt="Ruang terapi herbal dan wellness Phoenix" className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-[74%_center] lg:object-[78%_center]" src="/images/banner-welcome.png" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/90 to-[#FFFDF7]/30 md:from-[#FFFDF7] md:via-[#FFFDF7]/82 md:to-transparent lg:via-[#FFFDF7]/72 lg:to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-[#F6F7F7]/35"></div>
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#A8C5B3]/30 blur-3xl"></div>
                    <div className="relative z-10 mx-auto flex w-full max-w-container-max items-center px-margin-mobile py-16 md:px-margin-desktop md:py-24 lg:min-h-[calc(100vh-5rem)]">
                        <div className="max-w-2xl py-10 md:py-16">
                            <h1 className="font-headline-xl text-5xl font-bold leading-tight text-[#1E4D3A] md:text-6xl lg:text-7xl">
                                Hidup Seimbang Secara Alami
                            </h1>
                            <p className="mt-6 max-w-xl font-body-lg text-body-lg leading-relaxed text-[#333333]/80">
                                Phoenix Terapi &amp; Herbal menghadirkan produk herbal, alat terapi, dan konsultasi profesional dalam pendekatan yang alami, bersih, dan terpercaya.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-8 py-4 font-label-md font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#163B2C] active:scale-95">
                                    Konsultasi Sekarang
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </button>
                                <button type="button" className="inline-flex items-center justify-center rounded-full border border-[#1E4D3A] bg-white/80 px-8 py-4 font-label-md font-semibold text-[#1E4D3A] backdrop-blur-md transition-all duration-150 hover:bg-[#A8C5B3]/20 active:scale-95">
                                    Lihat Produk Herbal
                                </button>
                            </div>
                            <div className="mt-10 flex flex-wrap gap-3">
                                {['100% Natural', 'Konsultasi Profesional', 'Terapi Holistik'].map((benefit) => (
                                    <div key={benefit} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 shadow-sm backdrop-blur-md">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A8C5B3]/35 text-[#1E4D3A]">
                                            <span className="material-symbols-outlined text-base">check</span>
                                        </span>
                                        <span className="font-label-sm text-sm font-semibold text-[#333333]">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Brand Essence (Timeline & 3D Showcase) */}
                <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
                    <div className="absolute inset-0 bg-botanical-pattern -z-10"></div>

                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Left Content (Text & Timeline) */}
                        <div className="w-full lg:w-1/2">
                            {/* Tag line */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Teknologi Modern</span>
                                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Aman</span>
                                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Efektif</span>
                                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Terbukti</span>
                            </div>

                            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Filosofi Keunggulan Kami</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-8">Membangun kepercayaan melalui pendekatan yang terintegrasi untuk kesehatan holistik Anda.</p>

                            <div className="relative space-y-8 ml-2">
                                {/* Vertical Line */}
                                <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 via-primary/15 to-transparent z-0"></div>

                                {/* Item 1 — Salon Kecantikan */}
                                <div className="relative z-10 flex gap-6 group">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center text-primary shadow-md group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">face</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary text-lg mb-1 uppercase tracking-wide">Salon Kecantikan</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Tingkatkan layanan kecantikan dengan teknologi modern untuk hasil maksimal.</p>
                                    </div>
                                </div>

                                {/* Item 2 — Pusat Wellness */}
                                <div className="relative z-10 flex gap-6 group">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center text-primary shadow-md group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">spa</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary text-lg mb-1 uppercase tracking-wide">Pusat Wellness</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Dukungan terapi menyeluruh untuk kesehatan &amp; keseimbangan tubuh.</p>
                                    </div>
                                </div>

                                {/* Item 3 — Praktisi TCM */}
                                <div className="relative z-10 flex gap-6 group">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center text-primary shadow-md group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">self_improvement</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary text-lg mb-1 uppercase tracking-wide">Praktisi TCM</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Terapi berbasis meridian TCM dengan teknologi modern yang lebih efektif.</p>
                                    </div>
                                </div>
                            </div>

                            {/* GenQi Duo Technology */}
                            <div className="mt-10 space-y-4">
                                <div className="flex items-start gap-4 rounded-xl p-4" style={{ background: 'rgba(168,197,179,0.18)', border: '1px solid rgba(168,197,179,0.45)' }}>
                                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm" style={{ background: '#F08A2B' }}>
                                        <span className="material-symbols-outlined text-white text-xl">bolt</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary text-sm uppercase tracking-wide">GenQi Bio Elektrik</p>
                                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Menggabungkan teknologi <strong>bioelektrik</strong> dengan konsep jalur meridian saraf untuk membantu stimulasi tubuh secara alami.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl p-4" style={{ background: 'rgba(168,197,179,0.18)', border: '1px solid rgba(168,197,179,0.45)' }}>
                                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm" style={{ background: '#1E4D3A' }}>
                                        <span className="font-black text-white text-sm">H₂</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary text-sm uppercase tracking-wide">GenQi Hidrogen</p>
                                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Menggunakan <strong>molekul hidrogen aktif</strong> yang membantu menetralkan stres oksidatif hingga ke tingkat sel.</p>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* Right Content (3D Product Showcase) */}
                        <div className="w-full lg:w-1/2 relative flex justify-center items-center min-h-[580px] p-4">

                            {/* === MAIN PRODUCT AREA === */}
                            <div className="relative w-full max-w-lg z-20 flex flex-col items-center gap-6">

                                {/* Product Image Frame — Besar, tanpa card */}
                                <div
                                    className="relative w-full aspect-square group cursor-pointer"
                                    style={{ perspective: '1000px' }}
                                >
                                    {/* Soft shadow bawah produk */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl" style={{ background: 'rgba(30,77,58,0.12)' }}></div>

                                    {/* Product image — langsung besar */}
                                    <img
                                        src='/360-frames/1.png'
                                        alt="GenQi Product"
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 group-hover:-translate-y-3"
                                        style={{ filter: 'drop-shadow(0 24px 48px rgba(30,77,58,0.18))' }}
                                    />

                                    {/* 360° label
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(1,54,37,0.08)', border: '1px solid rgba(1,54,37,0.2)', backdropFilter: 'blur(8px)' }}>
                                        <span className="material-symbols-outlined text-sm" style={{ color: '#013625' }}>360</span>
                                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#013625' }}>360° View</span>
                                    </div> */}

                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 rounded-2xl flex items-center gap-1.5 z-30"
                                        style={{
                                            background: '#ffffff',
                                             boxShadow: '0 8px 24px rgba(30,77,58,0.12)',
                                             border: '1px solid rgba(168,197,179,0.45)',
                                            animation: 'float 4s ease-in-out infinite 0.8s'
                                        }}>
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1', color: '#F08A2B' }}>star</span>
                                        <div>
                                            <p className="text-[11px] font-black leading-none" style={{ color: '#333333' }}>4.9</p>
                                            <p className="text-[8px] leading-none mt-0.5" style={{ color: '#333333' }}>2,400+ ulasan</p>
                                        </div>
                                    </div>

                                    {/* === FLOATING BADGE: Sertifikasi BPOM === */}
                                    <div className="absolute -top-3 -left-2 text-white px-3 py-2 rounded-2xl flex items-center gap-1.5 z-30"
                                        style={{
                                             background: 'linear-gradient(135deg, #6FA788, #1E4D3A)',
                                             boxShadow: '0 4px 20px rgba(30,77,58,0.22)',
                                            animation: 'float 3s ease-in-out infinite'
                                        }}>
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1', color: '#A8C5B3' }}>verified</span>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: '#FFFFFF' }}>Bersertifikat</p>
                                            <p className="text-[8px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.82)' }}>BPOM & ISO</p>
                                        </div>
                                    </div>



                                    {/* === FLOATING BADGE: Bio-Elektrik === */}
                                    <div className="absolute bottom-16 -left-4 text-white px-3 py-2 rounded-2xl flex items-center gap-1.5 z-30"
                                        style={{
                                             background: 'linear-gradient(135deg, #1F3B63, #1E4D3A)',
                                             boxShadow: '0 4px 20px rgba(31,59,99,0.22)',
                                             border: '1px solid rgba(168,197,179,0.25)',
                                            animation: 'float 3.5s ease-in-out infinite 1.2s'
                                        }}>
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1', color: '#F08A2B' }}>bolt</span>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: '#FFFFFF' }}>Bio-Elektrik</p>
                                            <p className="text-[8px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.82)' }}>Teknologi GenQi</p>
                                        </div>
                                    </div>

                                    {/* === FLOATING BADGE: Hidrogen === */}
                                    <div className="absolute bottom-16 -right-4 text-white px-3 py-2 rounded-2xl flex items-center gap-1.5 z-30"
                                        style={{
                                             background: 'linear-gradient(135deg, #6FA788, #1E4D3A)',
                                             boxShadow: '0 4px 20px rgba(30,77,58,0.22)',
                                            animation: 'float 4.5s ease-in-out infinite 0.4s'
                                        }}>
                                        <span className="text-lg font-black leading-none" style={{ color: '#A8C5B3' }}>H₂</span>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: '#FFFFFF' }}>Hidrogen</p>
                                            <p className="text-[8px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.82)' }}>Aktif Molekuler</p>
                                        </div>
                                    </div>
                                </div>

                                {/* === BOTTOM INFO STRIP === */}
                                <div className="w-full rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4"
                                    style={{
                                         background: 'rgba(168,197,179,0.18)',
                                         border: '1px solid rgba(168,197,179,0.45)',
                                    }}>
                                    {/* Tanpa Jarum */}
                                    <div className="flex-1 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-xl" style={{ color: '#B57A2E' }}>block</span>
                                        <span className="text-sm" style={{ color: '#333333' }}><strong style={{ color: '#1E4D3A' }}>Tanpa</strong> Jarum</span>
                                    </div>
                                    <div className="w-px h-8 shrink-0" style={{ background: 'rgba(168,197,179,0.65)' }}></div>
                                    {/* Tanpa Luka */}
                                    <div className="flex-1 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-xl" style={{ color: '#6FA788' }}>back_hand</span>
                                        <span className="text-sm" style={{ color: '#333333' }}><strong style={{ color: '#1E4D3A' }}>Tanpa</strong> Luka</span>
                                    </div>
                                    <div className="w-px h-8 shrink-0" style={{ background: 'rgba(168,197,179,0.65)' }}></div>
                                    {/* Non-Invasif */}
                                    <div className="flex-1 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-xl" style={{ color: '#1E4D3A' }}>shield_person</span>
                                        <span className="text-sm font-bold" style={{ color: '#1E4D3A' }}>Non-Invasif</span>
                                    </div>
                                </div>
                            </div>

                            {/* === TOP-RIGHT TECH BADGE === */}
                            <div className="absolute top-4 right-4 px-3.5 py-2.5 rounded-xl flex items-center gap-2 z-30"
                                style={{
                                    background: '#ffffff',
                                     boxShadow: '0 4px 16px rgba(30,77,58,0.1)',
                                     border: '1px solid rgba(168,197,179,0.45)',
                                }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1E4D3A' }}>
                                    <span className="material-symbols-outlined text-base" style={{ color: '#A8C5B3' }}>eco</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{ color: '#1E4D3A' }}>Herbal Tech</p>
                                    <p className="text-[8px] leading-none mt-0.5" style={{ color: '#6FA788' }}>100% Alami</p>
                                </div>
                            </div>

                            {/* CSS Keyframe for float animation */}
                            <style>{`
                                @keyframes float {
                                    0%, 100% { transform: translateY(0px); }
                                    50% { transform: translateY(-8px); }
                                }
                            `}</style>
                        </div>
                    </div>
                </section>
                {/* Kategori Produk & Layanan (Carousel Section) */}
                <section className="py-24 bg-surface-container-low px-margin-mobile md:px-margin-desktop overflow-hidden">
                    <div className="max-w-container-max mx-auto">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Eksplorasi Solusi Kesehatan</h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">Temukan kategori produk dan layanan yang kami desain khusus untuk menunjang gaya hidup sehat Anda setiap hari.</p>
                            </div>
                            <a className="text-primary font-label-md flex items-center gap-2 group" href="#layanan">
                                Lihat Semua Layanan
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                            </a>
                        </div>
                        <div className="space-y-24">
                            {/* Herbal Products Section */}
                            <div className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Produk Herbal</h3>
                                    <button type="button" className="rounded-full border border-primary px-5 py-2 font-label-md text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95">
                                        Lihat Semua Produk
                                    </button>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-herbal">
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" alt="Madu Hutan Murni" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1E4D3A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">100% Herbal</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Madu Hutan Murni</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 125.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Madu Hutan Murni ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" alt="Teh Herbal Detoks" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1E4D3A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">100% Herbal</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Teh Herbal Detoks</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 85.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Teh Herbal Detoks ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" alt="Kapsul Temulawak" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1E4D3A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">100% Herbal</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Kapsul Temulawak</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 95.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Kapsul Temulawak ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" alt="Minyak Zaitun Organik" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1E4D3A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">100% Herbal</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Minyak Zaitun Organik</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 110.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Minyak Zaitun Organik ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Therapy Tools Section */}
                            <div id="layanan" className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-[#1F3B63]">Alat Terapi</h3>
                                    <button type="button" className="rounded-full border border-[#1F3B63] px-5 py-2 font-label-md text-sm font-semibold text-[#1F3B63] transition-all hover:bg-[#1F3B63] hover:text-white active:scale-95">
                                        Lihat Semua Alat
                                    </button>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-tools">
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" alt="Alat Terapi Listrik" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1F3B63] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Alat Terapi</span>
                                            <p className="font-bold text-[#1F3B63] font-body-md mb-2">Alat Terapi Listrik</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 450.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Alat Terapi Listrik ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" alt="Bantal Pemanas Medis" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1F3B63] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Alat Terapi</span>
                                            <p className="font-bold text-[#1F3B63] font-body-md mb-2">Bantal Pemanas Medis</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 290.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Bantal Pemanas Medis ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" alt="Inframerah Portabel" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1F3B63] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Alat Terapi</span>
                                            <p className="font-bold text-[#1F3B63] font-body-md mb-2">Inframerah Portabel</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 580.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Inframerah Portabel ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" alt="Set Bekam Profesional" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#1F3B63] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Alat Terapi</span>
                                            <p className="font-bold text-[#1F3B63] font-body-md mb-2">Set Bekam Profesional</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 320.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Set Bekam Profesional ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Services Section */}
                            <div className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Layanan</h3>
                                    <button type="button" className="rounded-full border border-primary px-5 py-2 font-label-md text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95">
                                        Lihat Semua Layanan
                                    </button>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-services">
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" alt="Konsultasi Holistik" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#6FA788] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Service</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Konsultasi Holistik</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 150.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Konsultasi Holistik ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" alt="Terapi Fisik Intensif" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#6FA788] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Service</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Terapi Fisik Intensif</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 300.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Terapi Fisik Intensif ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" alt="Terapi Bekam Medik" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#6FA788] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Service</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Terapi Bekam Medik</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 200.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Terapi Bekam Medik ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <div className="h-48 overflow-hidden bg-[#F6F7F7]">
                                            <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" alt="Refleksologi Saraf" />
                                        </div>
                                        <div className="p-5">
                                            <span className="inline-flex mb-3 rounded-full bg-[#6FA788] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Service</span>
                                            <p className="font-bold text-primary font-body-md mb-2">Refleksologi Saraf</p>
                                            <p className="text-[#1E4D3A] font-label-md">Rp 175.000</p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <button type="button" className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95">Beli</button>
                                                <button type="button" aria-label="Tambahkan Refleksologi Saraf ke keranjang" className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Testimonials */}
                <section className="py-24 px-margin-mobile md:px-margin-desktop">
                    <div className="max-w-container-max mx-auto">
                        <div className="mb-12">
                            <p className="font-label-md text-secondary uppercase tracking-widest mb-2">Testimoni Pengguna</p>
                            <h2 className="font-headline-lg text-headline-lg text-primary">Kisah Sukses Mereka</h2>
                        </div>
                        {/* Row 1 — slide on mobile */}
                        <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                            {[
                                { name: 'Andi, 38 Thn', role: 'Wirausaha', stars: 5, quote: '"Nyeri sendi saya yang sudah 5 tahun akhirnya membaik setelah rutin menggunakan alat terapi GenQi. Luar biasa!"', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-ESFipY7daENUXujkQUG3TsZUfTe8ihYNTUpk6UrKEYNDy_FTGJu_mLhAU1I_5seiXifTxc5DVJ0cT1pyLRonPH6c2qj5ytsrjP9hNaNXyahaT8etnINT_YusnCK0sf280kMMl4s5mC9iY8p1XJguSCQ-fhriOSDUdm9LkHUo77zoaaQ9wqcu2akvsiQYHuEsCV5i8SCtLX6ksD4Kg394CkYhZTaE5sx9dHG0LlQv8SsdLoVMcmr-RGtmgCKJ1aqZ__ODAvMCdpDE' },
                                { name: 'Sari, 45 Thn', role: 'Ibu Rumah Tangga', stars: 5, quote: '"Produk herbal dari Phonix membantu tidur saya jauh lebih nyenyak. Tubuh terasa lebih ringan dan segar setiap pagi."', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnztmSll6Puk4hFZxZnQherEi-0cA_2SZzSQwDEUL9_YgZ1JZny43o8huaHu4rWG4f1dSuJeVITXZuFHuJonW8L0i5xDmdmvu3RO0KgqVezoarO_aRAgAJnrN3UJIGfAF-_rhth0GEE-pofxAlpk8xkH1yYHVmpty0sb13wsJ8CZY0DW32Ou2Eb41QDBcU1TzkHNwXtOALe0zt4Rii9KPdBSMvxYlEnOIbUgsRN7YnzoCRCQQ6EE-9kTHz8AdvbP3VAQd4K48dJWQ1' },
                                { name: 'Budi, 52 Thn', role: 'Pegawai Negeri', stars: 5, quote: '"Konsultasi holistik di Phonix membuka mata saya soal pola hidup sehat. Tensi darah saya turun drastis dalam 3 bulan."', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-ESFipY7daENUXujkQUG3TsZUfTe8ihYNTUpk6UrKEYNDy_FTGJu_mLhAU1I_5seiXifTxc5DVJ0cT1pyLRonPH6c2qj5ytsrjP9hNaNXyahaT8etnINT_YusnCK0sf280kMMl4s5mC9iY8p1XJguSCQ-fhriOSDUdm9LkHUo77zoaaQ9wqcu2akvsiQYHuEsCV5i8SCtLX6ksD4Kg394CkYhZTaE5sx9dHG0LlQv8SsdLoVMcmr-RGtmgCKJ1aqZ__ODAvMCdpDE' },
                            ].map((t, i) => (
                                <div key={i} className="min-w-[280px] snap-start md:min-w-0 bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-4 shrink-0">
                                    <span className="font-headline-lg text-3xl leading-none text-[#6FA788]">“</span>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: t.stars }).map((_, s) => (
                                            <span key={s} className="material-symbols-outlined text-base text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-on-surface font-body-md leading-relaxed flex-1 italic">{t.quote}</p>
                                    <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
                                        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shrink-0" />
                                        <div>
                                            <p className="font-bold text-primary text-sm">{t.name}</p>
                                            <p className="text-on-surface-variant text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Row 2 */}
                        <div className="mt-5 flex gap-5 overflow-x-auto no-scrollbar snap-x pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                            {[
                                { name: 'Rina, 33 Thn', role: 'Dokter Umum', stars: 5, quote: '"Sebagai tenaga medis saya terkesan dengan pendekatan bio-elektrik GenQi. Pasien yang saya rekomendasikan merasakan manfaat nyata."', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnztmSll6Puk4hFZxZnQherEi-0cA_2SZzSQwDEUL9_YgZ1JZny43o8huaHu4rWG4f1dSuJeVITXZuFHuJonW8L0i5xDmdmvu3RO0KgqVezoarO_aRAgAJnrN3UJIGfAF-_rhth0GEE-pofxAlpk8xkH1yYHVmpty0sb13wsJ8CZY0DW32Ou2Eb41QDBcU1TzkHNwXtOALe0zt4Rii9KPdBSMvxYlEnOIbUgsRN7YnzoCRCQQ6EE-9kTHz8AdvbP3VAQd4K48dJWQ1' },
                                { name: 'Hendra, 41 Thn', role: 'Atlet', stars: 5, quote: '"Recovery otot setelah latihan berat jadi jauh lebih cepat. GenQi sudah jadi bagian rutinitas harian saya sekarang."', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-ESFipY7daENUXujkQUG3TsZUfTe8ihYNTUpk6UrKEYNDy_FTGJu_mLhAU1I_5seiXifTxc5DVJ0cT1pyLRonPH6c2qj5ytsrjP9hNaNXyahaT8etnINT_YusnCK0sf280kMMl4s5mC9iY8p1XJguSCQ-fhriOSDUdm9LkHUo77zoaaQ9wqcu2akvsiQYHuEsCV5i8SCtLX6ksD4Kg394CkYhZTaE5sx9dHG0LlQv8SsdLoVMcmr-RGtmgCKJ1aqZ__ODAvMCdpDE' },
                                { name: 'Dewi, 29 Thn', role: 'Content Creator', stars: 5, quote: '"Herbal Phonix cocok banget untuk yang aktif seperti saya. Stamina meningkat, kulit lebih cerah, dan pikiran lebih fokus."', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnztmSll6Puk4hFZxZnQherEi-0cA_2SZzSQwDEUL9_YgZ1JZny43o8huaHu4rWG4f1dSuJeVITXZuFHuJonW8L0i5xDmdmvu3RO0KgqVezoarO_aRAgAJnrN3UJIGfAF-_rhth0GEE-pofxAlpk8xkH1yYHVmpty0sb13wsJ8CZY0DW32Ou2Eb41QDBcU1TzkHNwXtOALe0zt4Rii9KPdBSMvxYlEnOIbUgsRN7YnzoCRCQQ6EE-9kTHz8AdvbP3VAQd4K48dJWQ1' },
                            ].map((t, i) => (
                                <div key={i} className="min-w-[280px] snap-start md:min-w-0 bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-4 shrink-0">
                                    <span className="font-headline-lg text-3xl leading-none text-[#6FA788]">“</span>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: t.stars }).map((_, s) => (
                                            <span key={s} className="material-symbols-outlined text-base text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-on-surface font-body-md leading-relaxed flex-1 italic">{t.quote}</p>
                                    <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
                                        <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shrink-0" />
                                        <div>
                                            <p className="font-bold text-primary text-sm">{t.name}</p>
                                            <p className="text-on-surface-variant text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Newsletter / CTA */}
                <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row items-center bg-[#F6F7F7] border border-[#E5E7EB]">
                        {/* Kiri: Teks + Form */}
                        <div className="flex-1 px-10 py-12 md:py-14">
                            <p className="font-label-md text-secondary uppercase tracking-widest mb-3">Newsletter</p>
                            <h2 className="font-headline-lg text-headline-lg text-primary mb-3">Siap Untuk Hidup Lebih Sehat?</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-8">Dapatkan tips kesehatan mingguan dan penawaran eksklusif langsung di email Anda.</p>
                            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); alert('Terima kasih telah berlangganan!'); }}>
                                <input
                                    className="flex-1 px-5 py-3.5 rounded-xl bg-white border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body-md text-on-surface"
                                    placeholder="Alamat Email Anda"
                                    required
                                    type="email"
                                />
                                <button
                                    className="flex items-center gap-2 bg-[#1E4D3A] text-white px-7 py-3.5 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95 shadow-sm whitespace-nowrap"
                                    type="submit"
                                >
                                    <span className="material-symbols-outlined text-lg">send</span>
                                    Berlangganan
                                </button>
                            </form>
                        </div>
                        {/* Kanan: Gambar */}
                        <div className="w-full md:w-[42%] h-56 md:h-auto md:self-stretch shrink-0">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV"
                                alt="Hidup Sehat"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="w-full py-16 px-margin-mobile md:px-margin-desktop flex flex-col items-center gap-8 text-center bg-primary text-on-primary">
                <div className="font-headline-md text-headline-md font-bold text-on-primary">
                    <img alt="Phoenix Terapi &amp; Herbal" className="h-12 w-auto object-contain brightness-0 invert" src="https://lh3.googleusercontent.com/aida/ADBb0ujPaqtXI-j2UcJPo7FMIYVaftg-h3f_u7kcbryg7t9lMg_D7MNBxUbIbbnM3B6tyhwBrc-cvH4a9oSzp7-VevRK5DX8pPJ6OR2b58Ez6TcBDqHzyTD_HHifZQkdwBHT-AX8QqITIhrpIg-Jn1nR_kWPcC9_KZisexKvhw8wf-yG_x3bBXtxAtHt8TRRZhu9226xMso5M6ZyPOf5Ea_MBT4XiuNdiHIQWisPeGUG0NFsrmJKGchUmcapEa_r" />
                </div>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                    <a className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#">Hubungi Kami</a>
                    <a className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#">Kebijakan Privasi</a>
                    <a className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#">Syarat &amp; Ketentuan</a>
                    <a className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#">FAQ</a>
                </div>
                <div className="flex gap-6 mt-4">
                    <a className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-white/10 transition-colors" href="#">
                        <span className="material-symbols-outlined text-xl">share</span>
                    </a>
                    <a className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-white/10 transition-colors" href="#">
                        <span className="material-symbols-outlined text-xl">camera</span>
                    </a>
                    <a className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-white/10 transition-colors" href="#">
                        <span className="material-symbols-outlined text-xl">mail</span>
                    </a>
                </div>
                <p className="font-body-sm text-body-sm text-on-primary/60 mt-8">
                    © 2024 Phoenix Terapi &amp; Herbal. Solusi Alami, Alat Tepat, Layanan Profesional untuk Hidup Lebih Sehat.
                </p>
            </footer>
        </div>
    );
}
