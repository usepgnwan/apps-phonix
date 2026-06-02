import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome({ auth }) {
    useEffect(() => {
        const handleScroll = () => {
            const nav = document.querySelector('nav');
            if (nav) {
                if (window.scrollY > 50) {
                    nav.classList.add('shadow-md');
                    nav.classList.remove('shadow-sm');
                } else {
                    nav.classList.add('shadow-sm');
                    nav.classList.remove('shadow-md');
                }
            }
        };

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

            const frames = Array.from({ length: 8 }, (_, i) => `/360-frames/genqi-row1/${i + 1}.png`);

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
            <nav className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
                    <div className="font-headline-md text-headline-md font-bold text-primary">
                        <img alt="Phoenix Terapi &amp; Herbal" className="h-10 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0ujPaqtXI-j2UcJPo7FMIYVaftg-h3f_u7kcbryg7t9lMg_D7MNBxUbIbbnM3B6tyhwBrc-cvH4a9oSzp7-VevRK5DX8pPJ6OR2b58Ez6TcBDqHzyTD_HHifZQkdwBHT-AX8QqITIhrpIg-Jn1nR_kWPcC9_KZisexKvhw8wf-yG_x3bBXtxAtHt8TRRZhu9226xMso5M6ZyPOf5Ea_MBT4XiuNdiHIQWisPeGUG0NFsrmJKGchUmcapEa_r" />
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" href="#">Beranda</a>
                        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Produk</a>
                        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Layanan</a>
                        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Tentang Kami</a>
                    </div>
                    <button className="bg-primary-container text-white px-6 py-2.5 rounded-lg font-label-md active:scale-95 duration-150 ease-in-out transition-all">
                        Mulai Sekarang
                    </button>
                </div>
            </nav>
            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative h-[85vh] flex items-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img alt="Wellness Environment" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa--7wl4XPKMvSst_1To3Dkbd1eAufO1X4-UXCR5Z41sf3OsyQ-6-oFVX1hqsMktSCcGSc-XuD2b7dRWbnL6OJ-L72o04oa-h1-hQakfGUoFvBuwXlHmndeWQwDkQw7BcDgewBEknfpbPoOc9J8itd2LlxhFHgbnzgXDhXvp5XQZg3ImIvk8odiReg8B3rJ5FJCJ6TUgoGQwICw-BFN3ov_XGdhHDC_mDr4yKwtJKVSnjkYjAvvXph7_6_erNag0_OWv9UqOr_x0l-" />
                        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent"></div>
                    </div>
                    <div className="relative z-10 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
                        <div className="max-w-2xl">
                            <span className="bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block">
                                Trusted Wellness Partner
                            </span>
                            <h1 className="font-headline-xl text-headline-xl text-primary mb-6">Phoenix Terapi &amp; Herbal</h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
                                Solusi Alami, Alat Tepat, Layanan Profesional untuk Hidup Lebih Sehat. Kami menggabungkan kearifan lokal dengan teknologi terapi modern.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-primary text-white px-8 py-4 rounded-lg font-label-md flex items-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg">
                                    Konsultasi Gratis
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                                <button className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-label-md hover:bg-primary/5 transition-all active:scale-95">
                                    Lihat Katalog
                                </button>
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
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Teknologi Modern</span>
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Aman</span>
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Efektif</span>
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Terbukti</span>
                            </div>

                            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Filosofi Keunggulan Kami</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-8">Membangun kepercayaan melalui pendekatan yang terintegrasi untuk kesehatan holistik Anda.</p>

                            <div className="relative space-y-8 ml-2">
                                {/* Vertical Line */}
                                <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-transparent z-0"></div>

                                {/* Item 1 — Salon Kecantikan */}
                                <div className="relative z-10 flex gap-6 group">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center text-blue-600 shadow-md group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">face</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg mb-1 uppercase tracking-wide">Salon Kecantikan</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Tingkatkan layanan kecantikan dengan teknologi modern untuk hasil maksimal.</p>
                                    </div>
                                </div>

                                {/* Item 2 — Pusat Wellness */}
                                <div className="relative z-10 flex gap-6 group">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center text-blue-600 shadow-md group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">spa</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg mb-1 uppercase tracking-wide">Pusat Wellness</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Dukungan terapi menyeluruh untuk kesehatan &amp; keseimbangan tubuh.</p>
                                    </div>
                                </div>

                                {/* Item 3 — Praktisi TCM */}
                                <div className="relative z-10 flex gap-6 group">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center text-blue-600 shadow-md group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">self_improvement</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg mb-1 uppercase tracking-wide">Praktisi TCM</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Terapi berbasis meridian TCM dengan teknologi modern yang lebih efektif.</p>
                                    </div>
                                </div>
                            </div>

                            {/* GenQi Duo Technology */}
                            <div className="mt-10 space-y-4">
                                <div className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="w-10 h-10 shrink-0 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                                        <span className="material-symbols-outlined text-white text-xl">bolt</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900 text-sm uppercase tracking-wide">GenQi Bio Elektrik</p>
                                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Menggabungkan teknologi <strong>bioelektrik</strong> dengan konsep jalur meridian saraf untuk membantu stimulasi tubuh secara alami.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="w-10 h-10 shrink-0 bg-green-500 rounded-full flex items-center justify-center shadow">
                                        <span className="font-black text-white text-sm">H₂</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-900 text-sm uppercase tracking-wide">GenQi Hidrogen</p>
                                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Menggunakan <strong>molekul hidrogen aktif</strong> yang membantu menetralkan stres oksidatif hingga ke tingkat sel.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Badges */}
                            <div className="mt-8 flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 shadow-sm">
                                    <span className="material-symbols-outlined text-red-500 text-lg">block</span>
                                    <span><strong>Tanpa</strong> Jarum</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 shadow-sm">
                                    <span className="material-symbols-outlined text-blue-500 text-lg">back_hand</span>
                                    <span><strong>Tanpa</strong> Luka</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 shadow-sm">
                                    <span className="material-symbols-outlined text-green-500 text-lg">shield_person</span>
                                    <span><strong>Non-Invasif</strong></span>
                                </div>
                            </div>
                        </div>


                        {/* Right Content (3D Layout & 360 Product View) */}
                        <div className="w-full lg:w-1/2 relative flex justify-center items-center min-h-[500px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-inner border border-blue-100/50">
                            {/* 3D Pedestal Background Effect */}
                            <div className="absolute bottom-12 w-3/4 h-32 bg-white/60 rounded-[100%] blur-2xl"></div>

                            {/* The 3D Layout Structure */}
                            <div className="relative w-full max-w-md aspect-square flex flex-col items-center justify-end z-10">

                                {/* The Pedestal (Podium) */}
                                <div className="absolute bottom-0 w-[90%] h-24 bg-gradient-to-b from-white to-gray-200 rounded-[50%] border-b-8 border-gray-300 shadow-2xl flex items-center justify-center">
                                    <div className="w-[85%] h-[70%] bg-gradient-to-b from-white to-gray-50 rounded-[50%] border-b-2 border-gray-200 shadow-inner"></div>
                                </div>

                                {/* Product Area / Image Placeholder */}
                                <div className="relative z-20 w-full h-full flex flex-col items-center justify-center pb-12 group">

                                    {/* Placeholder content mimicking GenQi and 360 View */}
                                    <div className="relative w-[90%] h-[90%] bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/60 flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105 hover:-translate-y-2">

                                        {/* SpriteSpin Container */}
                                        <div id="spritespin-container" className="w-full h-full flex items-center justify-center cursor-ew-resize"></div>

                                        {/* 360 Badge */}
                                        <div className="absolute bottom-5 bg-blue-50 border border-blue-200 text-blue-900 px-5 py-2 rounded-full font-label-md flex items-center gap-2 shadow-md hover:bg-blue-600 hover:text-white transition-colors cursor-ew-resize">
                                            <span className="material-symbols-outlined text-xl">360</span>
                                            Drag untuk memutar 360°
                                        </div>
                                    </div>

                                    {/* Floating Accessory 1 (Hydromi Bottle) */}
                                    <div className="absolute bottom-20 left-4 w-12 h-32 bg-white/95 rounded-full shadow-xl border border-gray-100 flex items-center justify-center backdrop-blur-sm animate-[bounce_3s_ease-in-out_infinite]">
                                        <span className="text-gray-400 font-bold text-[8px] rotate-[-90deg] tracking-widest">HYDROMI</span>
                                    </div>

                                    {/* Floating Accessory 2 (Attachments) */}
                                    <div className="absolute bottom-24 right-4 w-16 h-16 bg-gradient-to-b from-gray-800 to-black rounded-full shadow-2xl flex items-center justify-center text-white/90 animate-[bounce_4s_ease-in-out_infinite] border-2 border-gray-700">
                                        <span className="material-symbols-outlined text-2xl">settings_input_svideo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Badge (Top Right) */}
                            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-white/50 flex flex-col items-center text-center max-w-[130px] z-30 transform rotate-3 hover:rotate-0 transition-transform">
                                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white mb-2 shadow-inner">
                                    <span className="material-symbols-outlined text-lg font-bold">add</span>
                                </div>
                                <span className="text-[11px] font-bold text-blue-900 leading-tight">TEKNOLOGI MODERN</span>
                                <span className="text-[9px] text-blue-700 leading-tight mt-1">UNTUK PRAKTIK PROFESIONAL</span>
                            </div>
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
                            <a className="text-primary font-label-md flex items-center gap-2 group" href="#">
                                Lihat Semua Layanan
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                            </a>
                        </div>
                        <div className="space-y-24">
                            {/* Herbal Products Section */}
                            <div className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Produk Herbal</h3>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm bg-white" onClick={() => { document.getElementById('carousel-herbal').scrollBy({ left: -300, behavior: 'smooth' }) }}>
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm bg-white" onClick={() => { document.getElementById('carousel-herbal').scrollBy({ left: 300, behavior: 'smooth' }) }}>
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-herbal">
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" />
                                        <p className="font-bold text-primary font-body-md mb-1">Madu Hutan Murni</p>
                                        <p className="text-secondary font-label-md">Rp 125.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" />
                                        <p className="font-bold text-primary font-body-md mb-1">Teh Herbal Detoks</p>
                                        <p className="text-secondary font-label-md">Rp 85.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" />
                                        <p className="font-bold text-primary font-body-md mb-1">Kapsul Temulawak</p>
                                        <p className="text-secondary font-label-md">Rp 95.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbrTu4J4lorvc_opU5eeOotIJ68PL4Rw6iy5MXTICpUjyT8hYTTut1ciWQYxsL7ZdCiyEEfrDU-XADsA5joS6gBlpXgKRIIvwQ2UjVkCdcqktbQtVS5SmM_ORxn8TgxfBcbtEHy8XRKcras_W5bAACJ0KoC42i3hzzd6x4v9cUsKSZNy_IIR2_mwbdxW-IePgi6BjUN8gVlFOBDBwwRu3agUx2gaj6R3-44ATVsBnpVcSDXpkU6gq3HrQ_GsssUi9zIfB0rK3R0Gp" />
                                        <p className="font-bold text-primary font-body-md mb-1">Minyak Zaitun Organik</p>
                                        <p className="text-secondary font-label-md">Rp 110.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                </div>
                                <button className="w-full md:w-auto mt-8 px-12 py-3 rounded-lg border-2 border-primary text-primary font-label-md hover:bg-primary hover:text-white transition-all">Lihat Semua Produk</button>
                            </div>
                            {/* Therapy Tools Section */}
                            <div className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Alat Terapi</h3>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm bg-white" onClick={() => { document.getElementById('carousel-tools').scrollBy({ left: -300, behavior: 'smooth' }) }}>
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm bg-white" onClick={() => { document.getElementById('carousel-tools').scrollBy({ left: 300, behavior: 'smooth' }) }}>
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-tools">
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" />
                                        <p className="font-bold text-primary font-body-md mb-1">Alat Terapi Listrik</p>
                                        <p className="text-secondary font-label-md">Rp 450.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" />
                                        <p className="font-bold text-primary font-body-md mb-1">Bantal Pemanas Medis</p>
                                        <p className="text-secondary font-label-md">Rp 290.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" />
                                        <p className="font-bold text-primary font-body-md mb-1">Inframerah Portabel</p>
                                        <p className="text-secondary font-label-md">Rp 580.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_bWboIXjnQe4W2vvjbhW0DGThd33DkHzIf7VjRouYQTEAFQ_e4IdiQV55Kj4-njG7p-bofdUEWdtMPp6gRs6pugqaUkCmS3WfszCLdhcs73NLYq9PwgNocWcOtSIYem-aCtt8y2nzoWOAdDeWGX_54eMErRMwgnZb69IPOXyi7-0ARTUYrhE4zFW_hqjlkihGs5ZHwuoXPp2LH2O4qRHPyJ77CRVqwHLbtUwTPxhUb6kQM8kXTDESY0Bo8aDy-9_oFT9NXrxsaoVI" />
                                        <p className="font-bold text-primary font-body-md mb-1">Set Bekam Profesional</p>
                                        <p className="text-secondary font-label-md">Rp 320.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Beli Sekarang</button></div>
                                </div>
                                <button className="w-full md:w-auto mt-8 px-12 py-3 rounded-lg border-2 border-primary text-primary font-label-md hover:bg-primary hover:text-white transition-all">Lihat Semua Alat</button>
                            </div>
                            {/* Services Section */}
                            <div className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Layanan</h3>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm bg-white" onClick={() => { document.getElementById('carousel-services').scrollBy({ left: -300, behavior: 'smooth' }) }}>
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm bg-white" onClick={() => { document.getElementById('carousel-services').scrollBy({ left: 300, behavior: 'smooth' }) }}>
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-services">
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" />
                                        <p className="font-bold text-primary font-body-md mb-1">Konsultasi Holistik</p>
                                        <p className="text-secondary font-label-md">Rp 150.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Pesan Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" />
                                        <p className="font-bold text-primary font-body-md mb-1">Terapi Fisik Intensif</p>
                                        <p className="text-secondary font-label-md">Rp 300.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Pesan Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" />
                                        <p className="font-bold text-primary font-body-md mb-1">Terapi Bekam Medik</p>
                                        <p className="text-secondary font-label-md">Rp 200.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Pesan Sekarang</button></div>
                                    <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start bg-white p-4 rounded-xl shadow-sm border border-outline-variant group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
                                        <img className="w-full h-40 object-cover rounded-lg group-hover/card:scale-105 transition-transform mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA0IZ7J3kEkY_0TDnJOZRm60R6F0hJFxIgdL7f2cm6xyryTepsaSopZ6ht1dsQKxyYIi5zTnnXwOyGhPIQgfpyllStfaBCdq73Dh6k3LTD3cJjYXnm222-KHmfVySgmstAxkwvlDj0RB94YMGMFFIaUXHOtOpugUynkfmudgoOqn9ON-0hUCMR7y-cJqfEPun5ITy64FvgWTJSaJe-hbKJhZ6-7uwZtq0JP5t5cJ_gblPk5gh9QTatDqEWo0SxWjYdfvvUcNOorwvV" />
                                        <p className="font-bold text-primary font-body-md mb-1">Refleksologi Saraf</p>
                                        <p className="text-secondary font-label-md">Rp 175.000</p>
                                        <button className="w-full mt-4 bg-primary-container text-white py-2 rounded-lg font-label-md hover:bg-primary transition-all active:scale-95">Pesan Sekarang</button></div>
                                </div>
                                <button className="w-full md:w-auto mt-8 px-12 py-3 rounded-lg border-2 border-primary text-primary font-label-md hover:bg-primary hover:text-white transition-all">Lihat Semua Layanan</button>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Testimonials */}
                <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <div className="bg-surface-container-high rounded-[32px] p-8 md:p-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-primary/10">
                            <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: '"FILL" 1' }}>format_quote</span>
                        </div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="font-headline-lg text-headline-lg text-primary mb-8">Kisah Sukses Mereka</h2>
                                <div className="mb-8">
                                    <div className="flex gap-1 text-tertiary mb-4">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                                    </div>
                                    <blockquote className="font-headline-md text-headline-md italic text-on-surface mb-8 leading-relaxed">
                                        "Setelah rutin menggunakan alat terapi dan mengonsumsi herbal dari Phoenix, nyeri sendi yang saya alami selama 5 tahun akhirnya membaik secara signifikan. Pelayanannya sangat profesional dan informatif."
                                    </blockquote>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                                            <img alt="Andi's Portrait" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-ESFipY7daENUXujkQUG3TsZUfTe8ihYNTUpk6UrKEYNDy_FTGJu_mLhAU1I_5seiXifTxc5DVJ0cT1pyLRonPH6c2qj5ytsrjP9hNaNXyahaT8etnINT_YusnCK0sf280kMMl4s5mC9iY8p1XJguSCQ-fhriOSDUdm9LkHUo77zoaaQ9wqcu2akvsiQYHuEsCV5i8SCtLX6ksD4Kg394CkYhZTaE5sx9dHG0LlQv8SsdLoVMcmr-RGtmgCKJ1aqZ__ODAvMCdpDE" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary font-body-lg">Andi, 38 Tahun</h4>
                                            <p className="text-on-surface-variant font-body-sm">Wirausaha</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block relative">
                                <div className="aspect-square bg-primary-container rounded-3xl rotate-3 absolute inset-0 -z-10 opacity-10"></div>
                                <img alt="Healthy Lifestyle Image" className="rounded-3xl shadow-2xl w-full aspect-square object-cover -rotate-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnztmSll6Puk4hFZxZnQherEi-0cA_2SZzSQwDEUL9_YgZ1JZny43o8huaHu4rWG4f1dSuJeVITXZuFHuJonW8L0i5xDmdmvu3RO0KgqVezoarO_aRAgAJnrN3UJIGfAF-_rhth0GEE-pofxAlpk8xkH1yYHVmpty0sb13wsJ8CZY0DW32Ou2Eb41QDBcU1TzkHNwXtOALe0zt4Rii9KPdBSMvxYlEnOIbUgsRN7YnzoCRCQQ6EE-9kTHz8AdvbP3VAQd4K48dJWQ1" />
                            </div>
                        </div>
                    </div>
                </section>
                {/* Newsletter / CTA */}
                <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Siap Untuk Hidup Lebih Sehat?</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-10">Dapatkan tips kesehatan mingguan dan penawaran eksklusif langsung di email Anda.</p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(event) => { event.preventDefault(); alert('Terima kasih telah berlangganan!'); }}>
                            <input className="flex-1 px-6 py-4 rounded-lg bg-white border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body-md" placeholder="Alamat Email Anda" required="" type="email" />
                            <button className="bg-primary text-white px-8 py-4 rounded-lg font-label-md hover:bg-primary-container transition-all active:scale-95 shadow-md" type="submit">
                                Berlangganan
                            </button>
                        </form>
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
