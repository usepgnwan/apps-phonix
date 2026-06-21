import { Head, Link, router, usePage } from '@inertiajs/react';
import { ShoppingBag, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BeforeAfterSlider from '@/Components/BeforeAfterSlider';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
}).format(Number(value ?? 0));

const storageImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Path absolut (dari upload baru) langsung dipakai, path lama prefix /storage/
    return path.startsWith('/') ? path : `/storage/${path}`;
};

function BotanicalFallback({ label = 'Phoenix Herbal' }) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-primary-fixed/25 text-primary">
            <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm shadow-primary-container/10">
                    <span className="material-symbols-outlined text-3xl">eco</span>
                </span>
                <span className="mt-3 block font-label-sm text-xs font-bold uppercase tracking-[0.18em]">
                    {label}
                </span>
            </div>
        </div>
    );
}

const productCategoryLabel = (product) => {
    return product?.productCategory?.name ?? product?.product_category?.name ?? 'Produk Herbal';
};

const visitTypeLabel = (visitType) => ({
    both: 'Home visit & klinik',
    home_visit: 'Home visit',
    office_visit: 'Kunjungan klinik',
}[visitType] ?? 'Layanan Phoenix');

const productHref = (product) => product?.slug ? route('products.show', product.slug) : route('products.index');
const serviceHref = (service) => service?.slug ? route('services.show', service.slug) : route('services.index');

function Reveal({ children, className = '', delay = 0, as: Component = 'div' }) {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return undefined;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            element.style.opacity = '1';
            element.style.transform = 'translate3d(0, 0, 0)';
            return undefined;
        }

        const markVisibleIfInViewport = () => {
            const rect = element.getBoundingClientRect();
            const preloadMargin = Math.max(96, window.innerHeight * 0.15);
            const isInViewport = rect.top <= window.innerHeight + preloadMargin && rect.bottom >= -preloadMargin;

            if (isInViewport) {
                element.classList.add('is-visible');
                return true;
            }

            return false;
        };

        if (markVisibleIfInViewport()) {
            return undefined;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                element.classList.add('is-visible');
                observer.unobserve(element);
            }
        }, {
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.18,
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <Component
            className={`reveal-on-scroll ${className}`}
            ref={ref}
            style={{ '--reveal-delay': `${delay}ms` }}
        >
            {children}
        </Component>
    );
}

function ProductCard({ onAddedToCart, product }) {
    const imageSrc = storageImage(product.image_path);
    const detailHref = productHref(product);
    const imageRef = useRef(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const addToCart = () => {
        if (isAddingToCart) {
            return;
        }

        setIsAddingToCart(true);

        router.post(route('cart.items.store'), {
            product_id: product.id,
            quantity: 1,
        }, {
            onSuccess: () => onAddedToCart?.({
                imagePath: product.image_path,
                name: product.name,
                sourceRect: imageRef.current?.getBoundingClientRect(),
            }),
            onFinish: () => setIsAddingToCart(false),
            preserveScroll: true,
        });
    };

    return (
        <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
            <div className="relative h-48 overflow-hidden bg-[#F6F7F7]" ref={imageRef}>
                {imageSrc ? (
                    <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src={imageSrc} alt={product.name} />
                ) : (
                    <BotanicalFallback label={productCategoryLabel(product)} />
                )}
                {product.is_featured && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#F08A2B] pl-2 pr-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        Unggulan
                    </span>
                )}
            </div>
            <div className="p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-[#1E4D3A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                        {productCategoryLabel(product)}
                    </span>
                </div>
                <p className="font-bold text-primary font-body-md mb-2">{product.name}</p>
                <p className="text-[#1E4D3A] font-label-md">{formatRupiah(product.price)}</p>
                {product.short_description && <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">{product.short_description}</p>}
                <div className="mt-4 flex items-center gap-3">
                    <Link href={detailHref} className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95 text-center">Lihat Produk</Link>
                    <button type="button" onClick={addToCart} disabled={isAddingToCart} aria-label={`Tambahkan ${product.name} ke keranjang`} className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-60">
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ServiceCard({ service, consultationHref }) {
    const imageSrc = storageImage(service.image_path);
    const detailHref = serviceHref(service);

    return (
        <div className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm group/card cursor-pointer" style={{ opacity: '1', transform: 'translateY(0px)', transition: '0.6s ease-out' }}>
            <div className="relative h-48 overflow-hidden bg-[#F6F7F7]">
                {imageSrc ? (
                    <img className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105" src={imageSrc} alt={service.name} />
                ) : (
                    <BotanicalFallback label="Layanan Phoenix" />
                )}
                {service.is_featured && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#F08A2B] pl-2 pr-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        Unggulan
                    </span>
                )}
            </div>
            <div className="p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-[#6FA788] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                        {visitTypeLabel(service.visit_type)}
                    </span>
                </div>
                <p className="font-bold text-primary font-body-md mb-2">{service.name}</p>
                <p className="text-[#1E4D3A] font-label-md">{formatRupiah(service.price)}</p>
                {service.description && <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">{service.description}</p>}
                <div className="mt-4 flex items-center gap-3">
                    <Link href={consultationHref} className="flex-1 bg-[#1E4D3A] text-white py-2 rounded-full font-label-md hover:bg-[#163B2C] transition-all active:scale-95 text-center">Booking</Link>
                    <Link href={detailHref} aria-label={`Lihat layanan ${service.name}`} className="h-10 w-10 rounded-full border border-[#1E4D3A]/20 text-[#1E4D3A] flex items-center justify-center hover:bg-[#1E4D3A] hover:text-white transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function EmptyCarouselState({ children }) {
    return (
        <div className="min-w-[280px] rounded-2xl border border-dashed border-outline-variant bg-white/70 p-8 text-center text-on-surface-variant">
            <BotanicalFallback />
            <p className="mt-5 font-body-md text-sm leading-relaxed">{children}</p>
        </div>
    );
}

function SmoothAnchor({ children, className, href, onClick, ...props }) {
    return (
        <a className={className} href={href} onClick={onClick} {...props}>
            {children}
        </a>
    );
}

function TestimonialCard({ testimonial }) {
    const avatarSrc = storageImage(testimonial.photo_path);

    return (
        <div className="min-w-[280px] snap-start md:min-w-0 bg-white rounded-2xl p-6 border border-outline-variant shadow-sm flex flex-col gap-4 shrink-0">
            <span className="font-headline-lg text-3xl leading-none text-[#6FA788]">“</span>
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, star) => star + 1).map((star) => (
                    <span key={star} className="material-symbols-outlined text-base text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
            </div>
            <p className="text-on-surface font-body-md leading-relaxed flex-1 italic">“{testimonial.content}”</p>
            <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
                {avatarSrc ? (
                    <img src={avatarSrc} alt={testimonial.customer_name} className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shrink-0" />
                ) : (
                    <div className="flex w-10 h-10 rounded-full border-2 border-primary-container bg-primary-fixed/35 text-primary shrink-0 items-center justify-center font-bold">
                        {(testimonial.customer_name ?? 'P').charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="font-bold text-primary text-sm">{testimonial.customer_name ?? 'Pelanggan Phoenix'}</p>
                    <p className="text-on-surface-variant text-xs">Pelanggan Phoenix</p>
                </div>
            </div>
        </div>
    );
}

function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function DynamicVideoPlayer({ url, title, className = "w-full h-full object-contain absolute inset-0" }) {
    const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');

    if (isYouTube) {
        const videoId = getYouTubeId(url);
        if (videoId) {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                    title={title || "Video Testimoni"}
                    className={className}
                    allowFullScreen
                    style={{ border: 0 }}
                ></iframe>
            );
        }
    }

    const videoSrc = storageImage(url);

    return (
        <video className={className} controls playsInline preload="metadata">
            <source src={`${videoSrc}#t=0.001`} />
            Browser Anda tidak mendukung video HTML5.
        </video>
    );
}

export default function Welcome({ auth, featuredProducts = [], featuredServices = [], testimonials = [], videos = [], pinnedVideo = null }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [flyingProduct, setFlyingProduct] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const cartCount = Number(usePage().props.cartSummary?.count ?? 0);
    const isAuthenticated = Boolean(auth?.user);
    const accountHref = (() => {
        if (!isAuthenticated) {
            return route('login');
        }

        if (auth.user.role === 'admin') {
            return route('admin.dashboard.index');
        }

        if (auth.user.role === 'field_staff') {
            return route('field.dashboard.index');
        }

        return route('customer.dashboard.index');
    })();
    const consultationHref = isAuthenticated ? route('bookings.create') : route('login');

    const handleAnchorClick = (event) => {
        const href = event.currentTarget.getAttribute('href');

        if (!href?.startsWith('#') || href.length === 1) {
            return;
        }

        const target = document.querySelector(href);

        if (!target) {
            return;
        }

        event.preventDefault();

        const nav = document.querySelector('nav');
        const navOffset = nav?.offsetHeight ?? 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    };

    useEffect(() => {
        const hash = window.location.hash;

        if (!hash) {
            return undefined;
        }

        let animationFrameId = 0;
        const timeoutIds = [];

        const revealTargetSection = () => {
            const target = document.querySelector(hash);

            if (!target) {
                return;
            }

            const nav = document.querySelector('nav');
            const navOffset = nav?.offsetHeight ?? 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
            window.scrollTo({
                top: Math.max(targetTop, 0),
                behavior: 'auto',
            });

            if (target.classList.contains('reveal-on-scroll')) {
                target.classList.add('is-visible');
            }

            target.closest('.reveal-on-scroll')?.classList.add('is-visible');
            target.querySelectorAll('.reveal-on-scroll').forEach((element) => {
                element.classList.add('is-visible');
            });
        };

        const scheduleRevealAttempt = (delay) => {
            const timeoutId = window.setTimeout(revealTargetSection, delay);
            timeoutIds.push(timeoutId);
        };

        animationFrameId = window.requestAnimationFrame(() => {
            revealTargetSection();
            scheduleRevealAttempt(50);
            scheduleRevealAttempt(150);
            scheduleRevealAttempt(300);
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            timeoutIds.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
        };
    }, []);

    const animateProductToCart = ({ imagePath, name, sourceRect }) => {
        const target = document.querySelector('[data-cart-link]');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const flySize = 64;
        const flyOffset = flySize / 2;

        if (!sourceRect || !target || prefersReducedMotion) {
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const startX = sourceRect.left + (sourceRect.width / 2) - flyOffset;
        const startY = sourceRect.top + (sourceRect.height / 2) - flyOffset;
        const endX = targetRect.left + (targetRect.width / 2) - flyOffset;
        const endY = targetRect.top + (targetRect.height / 2) - flyOffset;

        setFlyingProduct({
            endX,
            endY,
            imagePath,
            midX: (startX + endX) / 2,
            midY: startY - 90,
            name,
            startX,
            startY,
        });

        window.setTimeout(() => setFlyingProduct(null), 900);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);

        // Load jQuery first, expose globally, then load SpriteSpin
        const initSpriteSpin = async () => {
            const spriteSpinContainer = document.getElementById('spritespin-container');

            if (!spriteSpinContainer) {
                return;
            }

            const { default: jQuery } = await import('jquery');
            window.jQuery = jQuery;
            window.$ = jQuery;

            await import('spritespin');

            const frames = Array.from({ length: 7 }, (_, i) => `/360-frames/genqi/${i + 1}.png`);

            jQuery(spriteSpinContainer).spritespin({
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
            const spriteSpinContainer = document.getElementById('spritespin-container');

            if (spriteSpinContainer && window.$?.(spriteSpinContainer).data('spritespin')) {
                window.$(spriteSpinContainer).spritespin('destroy');
            }
        };
    }, []);


    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
            <Head>
                <title>Phoenix Terapi & Herbal | Layanan Bio Elektrik & Obat Herbal Bandung</title>
                <meta name="description" content="Phoenix Terapi & Herbal memberikan layanan bio elektrik dan obat herbal murah di Bandung. Deteksi akurat, terapi tepat sasaran menggunakan terapi GenQi." />
                <meta name="keywords" content="phoenix layanan bio electrik, obat herbal, Deteksi Akurat, Terapi Tepat Sasaran terapi genqi, obat herbal bandung, obat herbal murah dibandung" />
            </Head>

            <style>{`
                .reveal-on-scroll {
                    opacity: 0;
                    transform: translate3d(0, 28px, 0) scale(0.985);
                    transition: opacity 780ms ease, transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
                    transition-delay: var(--reveal-delay, 0ms);
                    will-change: opacity, transform;
                }

                .reveal-on-scroll.is-visible {
                    opacity: 1;
                    transform: translate3d(0, 0, 0) scale(1);
                    will-change: auto;
                }

                @media (prefers-reduced-motion: reduce) {
                    .reveal-on-scroll {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }

                }

                .fly-to-cart {
                    animation: fly-to-cart 820ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                @keyframes fly-to-cart {
                    0% {
                        opacity: 0;
                        transform: translate3d(var(--fly-start-x), var(--fly-start-y), 0) scale(0.86);
                    }

                    12% {
                        opacity: 1;
                    }

                    72% {
                        opacity: 1;
                        transform: translate3d(var(--fly-mid-x), var(--fly-mid-y), 0) scale(0.7) rotate(-8deg);
                    }

                    100% {
                        opacity: 0;
                        transform: translate3d(var(--fly-end-x), var(--fly-end-y), 0) scale(0.28) rotate(8deg);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .fly-to-cart {
                        animation: none;
                    }
                }
            `}</style>

            {flyingProduct && (
                <div
                    aria-hidden="true"
                    className="fly-to-cart pointer-events-none fixed left-0 top-0 z-[80] h-16 w-16 overflow-hidden rounded-2xl border-2 border-white bg-primary-fixed shadow-2xl shadow-primary-container/30"
                    style={{
                        '--fly-end-x': `${flyingProduct.endX}px`,
                        '--fly-end-y': `${flyingProduct.endY}px`,
                        '--fly-mid-x': `${flyingProduct.midX}px`,
                        '--fly-mid-y': `${flyingProduct.midY}px`,
                        '--fly-start-x': `${flyingProduct.startX}px`,
                        '--fly-start-y': `${flyingProduct.startY}px`,
                    }}
                >
                    {flyingProduct.imagePath ? (
                        <img alt="" className="h-full w-full object-cover" src={storageImage(flyingProduct.imagePath)} />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-fixed text-primary-container">
                            <ShoppingBag aria-hidden="true" className="h-6 w-6" />
                        </div>
                    )}
                </div>
            )}

            {/* TopNavBar */}
            <nav className={`fixed top-0 left-0 w-full z-50 border-b backdrop-blur-xl transition-all duration-300 ${isScrolled ? 'bg-white/95 border-[#E5E7EB] shadow-sm' : 'bg-white/80 border-white/70 shadow-none'}`}>
                <div className="flex h-20 w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop mx-auto">
                    <SmoothAnchor className="rounded-2xl pr-3 transition-all duration-300 hover:opacity-80" href="#beranda" onClick={handleAnchorClick} aria-label="Phoenix Terapi & Herbal">
                        <img src="/images/logo_blue_box.png" alt="Phoenix Terapi &amp; Herbal" className="h-12 w-auto rounded-xl object-contain shadow-sm shadow-black/10 md:h-14" />
                    </SmoothAnchor>
                    <div className="hidden items-center gap-8 md:flex">
                        <SmoothAnchor className="font-body-md text-body-md font-semibold text-[#1E4D3A] transition-colors hover:text-[#6FA788]" href="#beranda" onClick={handleAnchorClick}>Beranda</SmoothAnchor>
                        <SmoothAnchor className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href="#produk" onClick={handleAnchorClick}>Produk</SmoothAnchor>
                        <SmoothAnchor className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href="#layanan" onClick={handleAnchorClick}>Layanan</SmoothAnchor>
                        <SmoothAnchor className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href="#tentang-kami" onClick={handleAnchorClick}>Tentang Kami</SmoothAnchor>
                        <Link className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href={route('orders.lookup.create')}>Cek Pesanan</Link>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href={route('cart.index')} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#1E4D3A]/30 bg-white text-[#1E4D3A] transition-all duration-150 hover:border-[#1E4D3A] hover:bg-[#A8C5B3]/20 active:scale-95" aria-label="Keranjang belanja" data-cart-link>
                            <span className="material-symbols-outlined text-xl" data-cart-icon>shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-tertiary px-1.5 font-body-sm text-[10px] font-black leading-none text-white shadow-sm shadow-[#1E4D3A]/20">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                        {!isAuthenticated && (
                            <Link href={route('register')} className="hidden rounded-full border border-[#1E4D3A]/30 bg-white px-4 py-2.5 font-label-md font-semibold text-[#1E4D3A] shadow-sm transition-all duration-150 hover:border-[#1E4D3A] hover:bg-[#A8C5B3]/20 active:scale-95 sm:inline-flex">
                                Daftar
                            </Link>
                        )}
                        <Link href={accountHref} className="inline-flex rounded-full bg-[#1E4D3A] px-5 py-2.5 font-label-md font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#163B2C] active:scale-95">
                            {isAuthenticated ? 'Dashboard' : 'Login'}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#1E4D3A]/30 bg-white text-[#1E4D3A] transition-all duration-150 hover:bg-[#A8C5B3]/20 active:scale-95"
                            aria-label="Menu navigasi"
                        >
                            <span className="material-symbols-outlined text-xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-[#E5E7EB] shadow-lg flex flex-col px-margin-mobile py-4 gap-4 transition-all duration-300">
                        <SmoothAnchor className="font-body-md text-body-md font-semibold text-[#1E4D3A]" href="#beranda" onClick={(e) => { setIsMobileMenuOpen(false); handleAnchorClick(e); }}>Beranda</SmoothAnchor>
                        <SmoothAnchor className="font-body-md text-body-md font-medium text-[#333333]" href="#produk" onClick={(e) => { setIsMobileMenuOpen(false); handleAnchorClick(e); }}>Produk</SmoothAnchor>
                        <SmoothAnchor className="font-body-md text-body-md font-medium text-[#333333]" href="#layanan" onClick={(e) => { setIsMobileMenuOpen(false); handleAnchorClick(e); }}>Layanan</SmoothAnchor>
                        <SmoothAnchor className="font-body-md text-body-md font-medium text-[#333333]" href="#tentang-kami" onClick={(e) => { setIsMobileMenuOpen(false); handleAnchorClick(e); }}>Tentang Kami</SmoothAnchor>
                        <Link className="font-body-md text-body-md font-medium text-[#333333]" href={route('orders.lookup.create')}>Cek Pesanan</Link>
                        {!isAuthenticated && (
                            <Link href={route('register')} className="w-full text-center rounded-full border border-[#1E4D3A] py-2.5 font-label-md font-semibold text-[#1E4D3A] mt-2 transition-all hover:bg-[#1E4D3A]/5">Daftar Akun</Link>
                        )}
                    </div>
                )}
            </nav>
            <main className="pt-20">
                {/* Hero Section */}
                <section id="beranda" className="relative isolate overflow-hidden bg-[#F6F7F7]">
                    <img alt="Ruang terapi herbal dan wellness Phoenix" className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-[74%_center] lg:object-[78%_center]" src="/images/banner-welcome.png" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF7]/90 to-[#FFFDF7]/30 md:from-[#FFFDF7] md:via-[#FFFDF7]/82 md:to-transparent lg:via-[#FFFDF7]/72 lg:to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-[#F6F7F7]/35"></div>
                    <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#A8C5B3]/30 blur-3xl"></div>
                    <div className="relative z-10 mx-auto flex w-full max-w-container-max items-center px-margin-mobile py-16 md:px-margin-desktop md:py-24 lg:min-h-[calc(100vh-5rem)]">
                        <Reveal className="max-w-2xl py-10 md:py-16">
                            <h1 className="font-headline-xl text-5xl font-bold leading-tight text-[#1E4D3A] md:text-6xl lg:text-7xl">
                                Hidup Seimbang Secara Alami
                            </h1>
                            <p className="mt-6 max-w-xl font-body-lg text-body-lg leading-relaxed text-[#333333]/80">
                                Phoenix Terapi &amp; Herbal menghadirkan produk herbal, alat terapi, dan konsultasi profesional dalam pendekatan yang alami, bersih, dan terpercaya.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Link href={consultationHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-8 py-4 font-label-md font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#163B2C] active:scale-95">
                                    Konsultasi Sekarang
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </Link>
                                <Link href={route('products.index')} className="inline-flex items-center justify-center rounded-full border border-[#1E4D3A] bg-white/80 px-8 py-4 font-label-md font-semibold text-[#1E4D3A] backdrop-blur-md transition-all duration-150 hover:bg-[#A8C5B3]/20 active:scale-95">
                                    Lihat Produk Herbal
                                </Link>
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
                        </Reveal>
                    </div>
                </section>
                {/* Brand Essence (Timeline & 3D Showcase) */}
                <section id="tentang-kami" className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
                    <div className="absolute inset-0 bg-botanical-pattern -z-10"></div>

                    <Reveal className="flex flex-col lg:flex-row gap-16 items-center" delay={80}>
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
                    </Reveal>
                </section>

                {/* GenQi Narrative Section */}
                <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
                    <Reveal delay={80}>
                        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                            {/* Left Content (Image) */}
                            <div className="w-full lg:w-1/2">
                                <div className="rounded-3xl overflow-hidden shadow-lg border border-outline-variant bg-white aspect-[4/3] relative">
                                    <img
                                        src="/images/genqi_bioscan.jpeg"
                                        alt="Terapi GenQi Bio Elektrik"
                                        className="w-full h-full object-cover object-[center_15%]"
                                    />
                                </div>
                            </div>

                            {/* Right Content (Narrative) */}
                            <div className="w-full lg:w-1/2 space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                                    <span className="material-symbols-outlined text-primary text-sm">monitor_heart</span>
                                    <span className="font-label-sm text-sm font-bold text-primary tracking-wider uppercase">Metode Bio Elektrik</span>
                                </div>
                                <h2 className="font-headline-lg text-headline-lg text-primary leading-tight">
                                    Deteksi Akurat, Terapi Tepat Sasaran
                                </h2>
                                <div className="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                                    <p>
                                        GenQi Bio Elektrik Stimulasi (BES) adalah perangkat teknologi bioelektrik modern yang dirancang khusus untuk meniru metode terapi tradisional secara aman, efektif, dan tanpa obat. GenQi adalah terapi pengobatan timur dengan menggunakan metode bio elektrik. Alat ini menggabungkan teknologi bioelektrik dengan konsep jalur meridian saraf untuk membantu stimulasi tubuh secara alami. Praktik GenQi secara efektif menyatukan Akupuntur, Bekam (Cupping), dan Pijat menjadi satu kesatuan terapi yang komprehensif.
                                    </p>
                                    <p>
                                        Alat ini mengusung konsep 4 Terapi dalam 1 Mesin (Akupuntur, Tuina, Moxa, dan Cupping) untuk mengatasi berbagai masalah nyeri dan kebugaran, menjadikannya solusi modern untuk keseimbangan tubuh dan kualitas hidup yang lebih baik.
                                    </p>
                                </div>


                            </div>

                        </div>
                        <div className="bg-[#F6F7F7] border border-[#E5E7EB] rounded-2xl p-6 mt-6">
                            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#F08A2B]">health_and_safety</span>
                                Manfaat Terapi GenQi
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    'Menyeimbangkan energi Yin dan Yang',
                                    'Melancarkan sirkulasi darah dan energi (Qi)',
                                    'Membuka sumbatan jalur meridian tubuh',
                                    'Mendetoksifikasi racun di dalam tubuh',
                                    'Merilekskan otot-otot yang tegang',
                                    'Meningkatkan mobilitas dan kelenturan sendi',
                                    'Meredakan berbagai nyeri sendi dan tulang',
                                    'Mengatasi masalah saraf kejepit dan frozen shoulder',
                                    'Meringankan keluhan migrain, nyeri haid, dan insomnia',
                                    'Mempercepat pemulihan pasca-stroke, cedera, dan operasi',
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[#6FA788] text-lg shrink-0">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                </section>

                {/* Transformasi (Video & Slider) */}
                <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
                    <Reveal delay={80}>
                        <div className="mb-10 text-center max-w-2xl mx-auto">
                            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Bukti Nyata Terapi Kami</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant">Lihat langsung proses dan hasil terapi di klinik Phoenix. Kami menggunakan metode yang aman dan efektif.</p>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center mb-16">
                            {/* Left Content (Video) */}
                            <div className="w-full lg:w-1/2">
                                <div className="rounded-3xl overflow-hidden shadow-lg border border-outline-variant bg-white aspect-[4/3] relative">
                                    {pinnedVideo ? (
                                        <DynamicVideoPlayer
                                            url={pinnedVideo.video_link}
                                            title={pinnedVideo.title}
                                            className="w-full h-full object-cover absolute inset-0"
                                        />
                                    ) : (
                                        <video
                                            className="w-full h-full object-cover absolute inset-0"
                                            controls
                                            preload="metadata"
                                            playsInline
                                        >
                                            <source src="/images/video1.mp4#t=0.001" type="video/mp4" />
                                            Browser Anda tidak mendukung video HTML5.
                                        </video>
                                    )}
                                </div>
                            </div>

                            {/* Right Content (Before/After Slider) */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-3xl overflow-hidden shadow-lg border border-outline-variant bg-white aspect-[4/5] relative">
                                        <BeforeAfterSlider
                                            beforeImage="/images/before/a1.jpeg"
                                            afterImage="/images/before/b1.jpeg"
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <div className="rounded-3xl overflow-hidden shadow-lg border border-outline-variant bg-white aspect-[4/5] relative">
                                        <BeforeAfterSlider
                                            beforeImage="/images/before/a2.jpeg"
                                            afterImage="/images/before/b2.jpeg"
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                                <p className="text-center mt-2 text-sm text-on-surface-variant italic">Geser slider untuk melihat perbandingan sebelum dan sesudah terapi.</p>
                            </div>
                        </div>

                        {/* Testimonial Videos Slider/Grid */}
                        {videos.length > 0 ? (
                            <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-6 pb-4 snap-x snap-mandatory no-scrollbar">
                                {videos.map((video) => (
                                    <div key={video.id} className="w-[260px] sm:w-[320px] lg:w-full snap-start rounded-3xl overflow-hidden shadow-sm border border-outline-variant bg-black aspect-[9/16] relative flex-shrink-0">
                                        <DynamicVideoPlayer url={video.video_link} title={video.title} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-6 pb-4 snap-x snap-mandatory no-scrollbar">
                                {[1, 2, 3, 4].map((num) => (
                                    <div key={num} className="w-[260px] sm:w-[320px] lg:w-full snap-start rounded-3xl overflow-hidden shadow-sm border border-outline-variant bg-black aspect-[9/16] relative flex-shrink-0">
                                        <video
                                            className="w-full h-full object-contain absolute inset-0"
                                            controls
                                            preload="metadata"
                                            playsInline
                                        >
                                            <source src={`/videos/${num}.mp4#t=0.001`} type="video/mp4" />
                                            Browser Anda tidak mendukung video HTML5.
                                        </video>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Reveal>
                </section>
                {/* 4 Jenis Kekuatan GenQi BES */}
                <section className=" py-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <Reveal delay={80}>
                        <div className="mb-12 text-center max-w-2xl mx-auto">
                            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">4 Jenis Kekuatan</h2>
                            <h3 className="font-headline-md text-headline-md text-primary mb-0">GenQi Bio Elektrik Stimulasi (BES)</h3>
                        </div>
                        {/* Scroll horizontal di mobile, grid 4 col di desktop */}
                        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-4 md:overflow-visible pb-4 md:pb-0">
                            {[
                                {
                                    img: '/images/front/1.jpg',
                                    number: '1',
                                    title: 'Kekuatan Penetrasi',
                                    desc: 'Memberikan pijatan dalam yang menenangkan otot-otot hingga ke akarnya.',
                                },
                                {
                                    img: '/images/front/3.jpg',
                                    number: '2',
                                    title: 'Kekuatan Penyebar',
                                    desc: 'Meningkatkan keselarasan antara sel yang memberikan efek relaksasi.',
                                },
                                {
                                    img: '/images/front/4.jpg',
                                    number: '3',
                                    title: 'Kekuatan Extract',
                                    desc: 'Meningkatkan metabolisme dan mengeluarkan racun dari tubuh melalui berbagai cara, seperti: keringat, bersendawa, kentut, kaki/tangan dingin, dan lain-lain.',
                                },
                                {
                                    img: '/images/front/5.jpg',
                                    number: '4',
                                    title: 'Kekuatan Gerak',
                                    desc: 'Berfungsi untuk menjaga keselarasan sendi, otot, ligamen, dan tulang.',
                                },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-[75vw] sm:w-[55vw] md:w-full snap-start rounded-3xl overflow-hidden shadow-md bg-white flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={card.img}
                                            alt={card.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    {/* Content */}
                                    <div className="p-5 flex flex-col gap-2 flex-1">
                                        <span className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-full w-fit">
                                            {card.number}. {card.title}
                                        </span>
                                        <div className="w-8 h-0.5 bg-primary/40 rounded-full mt-1"></div>
                                        <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed mt-1">
                                            {card.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* Metode Inhaler Hidrogen */}
                <section className=" py-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <Reveal delay={80}>
                        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                            {/* Image */}
                            <div className="w-full lg:w-5/12 flex-shrink-0">
                                <div className="rounded-3xl overflow-hidden shadow-xl">
                                    <img
                                        src="/images/front/pinned.jpg"
                                        alt="Inhaler Hidrogen GenQi"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                            {/* Text */}
                            <div className="w-full lg:w-7/12 flex flex-col gap-5">
                                <span className="inline-flex items-center gap-2 border border-primary text-primary text-sm font-semibold px-4 py-1.5 rounded-full w-fit">
                                    ⚛ Metode Inhaler Hidrogen
                                </span>
                                <h2 className="font-headline-lg text-headline-lg text-primary leading-tight">
                                    Pulihkan Vitalitas Seluler Secara Alami
                                </h2>
                                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                    Inhaler Hidrogen Molekuler adalah perangkat kesehatan inovatif yang memanfaatkan teknologi elektrolisis air tingkat lanjut untuk menghasilkan gas hidrogen (H₂) murni dengan konsentrasi tinggi. Alat ini dirancang khusus sebagai solusi terapi pendukung kesehatan di rumah yang aman, efektif, dan non-invasif. Dengan output gas yang stabil, perangkat ini bekerja dengan memisahkan molekul air menjadi gas hidrogen dan oksigen, memberikan metode alami untuk melawan stres oksidatif langsung dari sumbernya serta mendukung proses regenerasi sel secara optimal bagi vitalitas jangka panjang.
                                </p>
                                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                    Keunggulan utama alat ini terletak pada performa teknisnya yang mendukung kesehatan tubuh secara menyeluruh. Dengan kemampuan menghasilkan output gas mencapai <strong>1200ml/min</strong> untuk hidrogen dan <strong>600ml/min</strong> untuk oksigen, alat ini memastikan tubuh mendapatkan asupan antioksidan yang kuat sekaligus meningkatkan suplai oksigen ke seluruh jaringan organ. Desainnya yang ergonomis dan antarmuka yang intuitif menjadikan perangkat ini investasi kesehatan keluarga yang sangat praktis, memungkinkan siapa saja untuk menikmati manfaat terapi tingkat profesional dengan kenyamanan penggunaan yang maksimal di mana pun Anda berada.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* Kondisi yang Kami Tangani */}
                <section className=" py-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <Reveal delay={80}>
                        <div className="mb-5    text-center max-w-2xl mx-auto">
                            <h4 className="font-body-md text-body-md text-on-surface-variant">Perawatan Inhaler Hidrogen (GenQi Inhalasi Hidrogen)</h4>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 md:gap-8">
                            {[
                                { img: '/images/front/6.png', label: 'Antioksidan Kuat' },
                                { img: '/images/front/7.png', label: 'Anti Inflamasi' },
                                { img: '/images/front/9.png', label: 'Anti Aging' },
                                { img: '/images/front/10.png', label: 'Anti Nyeri (Arthritis)' },
                                { img: '/images/front/11.png', label: 'Anti Apoptosis Lindungi Neuron Dari Kematian (Stroke)' },
                                { img: '/images/front/12.png', label: 'Lindungi Fungsi Kognitif (Alzheimer)' },
                                { img: '/images/front/13.png', label: 'Sensitivitas Insulin (Diabetes)' },
                                { img: '/images/front/14.png', label: 'Kurangi Efek Samping Kemoterapi' },
                                { img: '/images/front/15.png', label: 'Lindungi Daya Memori' },
                                { img: '/images/front/16.png', label: 'Lindungi Fungsi Mata' },
                                { img: '/images/front/Your paragraph text (2).png', label: 'Kurangi Gejala Sinus' },
                                { img: '/images/front/Your paragraph text (1).png', label: 'Perbaiki Kualitas Tidur' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center gap-3 group cursor-default"
                                >
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-surface flex items-center justify-center p-3 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                                        <img
                                            src={item.img}
                                            alt={item.label}
                                            className="w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                    <span className="text-center font-label-sm text-xs text-on-surface-variant group-hover:text-primary transition-colors duration-200 leading-tight">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* Kategori Produk & Layanan (Carousel Section) */}
                <section className="py-24 bg-surface-container-low px-margin-mobile md:px-margin-desktop overflow-hidden">
                    <Reveal className="max-w-container-max mx-auto" delay={80}>
                        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Eksplorasi Solusi Kesehatan</h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">Temukan kategori produk dan layanan yang kami desain khusus untuk menunjang gaya hidup sehat Anda setiap hari.</p>
                            </div>
                            <Link className="text-primary font-label-md flex items-center gap-2 group" href={route('services.index')}>
                                Lihat Semua Layanan
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                            </Link>
                        </div>
                        <div className="space-y-24">
                            {/* Herbal Products Section */}
                            <div id="produk" className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Produk Herbal</h3>
                                    <Link href={route('products.index')} className="rounded-full border border-primary px-5 py-2 font-label-md text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95">
                                        Lihat Semua Produk
                                    </Link>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-herbal">
                                    {featuredProducts.length > 0 ? featuredProducts.map((product) => (
                                        <ProductCard key={product.id ?? product.slug ?? product.name} onAddedToCart={animateProductToCart} product={product} />
                                    )) : (
                                        <EmptyCarouselState>Produk pilihan sedang disiapkan. Silakan cek katalog lengkap untuk melihat koleksi herbal Phoenix.</EmptyCarouselState>
                                    )}
                                </div>
                            </div>
                            {/* Services Section */}
                            <div id="layanan" className="relative group">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-headline-md text-primary">Layanan</h3>
                                    <Link href={route('services.index')} className="rounded-full border border-primary px-5 py-2 font-label-md text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-95">
                                        Lihat Semua Layanan
                                    </Link>
                                </div>
                                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4" id="carousel-services">
                                    {featuredServices.length > 0 ? featuredServices.map((service) => (
                                        <ServiceCard key={service.id ?? service.slug ?? service.name} service={service} consultationHref={consultationHref} />
                                    )) : (
                                        <EmptyCarouselState>Layanan unggulan sedang diperbarui. Tim Phoenix tetap siap membantu melalui halaman layanan.</EmptyCarouselState>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>
                {/* Testimonials */}
                <section className="py-24 px-margin-mobile md:px-margin-desktop">
                    <Reveal className="max-w-container-max mx-auto" delay={80}>
                        <div className="mb-12">
                            <p className="font-label-md text-secondary uppercase tracking-widest mb-2">Testimoni Pengguna</p>
                            <h2 className="font-headline-lg text-headline-lg text-primary">Kisah Sukses Mereka</h2>
                        </div>
                        {testimonials.length > 0 ? (
                            <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                                {testimonials.map((testimonial) => (
                                    <TestimonialCard key={testimonial.id ?? testimonial.customer_name} testimonial={testimonial} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-outline-variant bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto h-28 w-28 overflow-hidden rounded-full">
                                    <BotanicalFallback />
                                </div>
                                <p className="mx-auto mt-5 max-w-xl font-body-md text-body-md text-on-surface-variant">
                                    Testimoni pelanggan sedang dikurasi. Kami akan segera menampilkan kisah nyata dari pengguna Phoenix di sini.
                                </p>
                            </div>
                        )}
                    </Reveal>
                </section>
                {/* Newsletter / CTA */}
                <Reveal as="section" className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" delay={80}>
                    <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row items-center bg-[#F6F7F7] border border-[#E5E7EB]">
                        {/* Kiri: Teks + Form */}
                        <div className="flex-1 px-10 py-12 md:py-14">
                            <p className="font-label-md text-secondary uppercase tracking-widest mb-3">Konsultasi Gratis</p>
                            <h2 className="font-headline-lg text-headline-lg text-primary mb-3">Siap Untuk Hidup Lebih Sehat?</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Tim ahli kami siap membantu Anda menentukan terapi dan produk herbal yang tepat sesuai kebutuhan Anda. Hubungi kami sekarang untuk konsultasi gratis!</p>

                            {usePage().props.siteSettings?.alamat && (
                                <div className="mb-8 flex items-start gap-3 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">location_on</span>
                                    <p className="font-body-sm text-sm whitespace-pre-line">{usePage().props.siteSettings.alamat}</p>
                                </div>
                            )}

                            <a
                                href={`https://wa.me/${usePage().props.siteSettings?.whatsappNumber || '6281234567890'}?text=${encodeURIComponent('Halo Phoenix, saya tertarik untuk konsultasi.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full font-label-md hover:bg-[#20bd5a] transition-all active:scale-95 shadow-md hover:shadow-lg whitespace-nowrap w-fit"
                            >
                                <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Hubungi Kami Sekarang
                            </a>
                        </div>
                        {/* Kanan: Gambar */}
                        <div className="w-full md:w-[42%] h-64 md:h-auto md:self-stretch shrink-0 flex items-center justify-center p-4">
                            <img
                                src="/images/capture_web.png"
                                alt="Capture Website Phoenix"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </Reveal>
            </main>
            {/* Footer */}
            <footer className="w-full py-16 px-margin-mobile md:px-margin-desktop flex flex-col items-center gap-8 text-center bg-primary text-on-primary">
                <div className="font-headline-md text-headline-md font-bold text-on-primary">
                    <img alt="Phoenix Terapi &amp; Herbal" className="h-24 w-auto rounded-2xl object-contain shadow-lg shadow-black/10 md:h-28" src="/images/logo_blue_box.png" />
                </div>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                    <a className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="mailto:info@phoenixherbal.test">Hubungi Kami</a>
                    <SmoothAnchor className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#tentang-kami" onClick={handleAnchorClick}>Kebijakan Privasi</SmoothAnchor>
                    <SmoothAnchor className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#tentang-kami" onClick={handleAnchorClick}>Syarat &amp; Ketentuan</SmoothAnchor>
                    <SmoothAnchor className="font-body-sm text-body-sm text-on-primary/80 hover:text-on-primary transition-opacity" href="#beranda" onClick={handleAnchorClick}>FAQ</SmoothAnchor>
                </div>
                <div className="flex gap-6 mt-4">
                    <SmoothAnchor className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-white/10 transition-colors" href="#beranda" onClick={handleAnchorClick}>
                        <span className="material-symbols-outlined text-xl">share</span>
                    </SmoothAnchor>
                    <SmoothAnchor className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-white/10 transition-colors" href="#produk" onClick={handleAnchorClick}>
                        <span className="material-symbols-outlined text-xl">camera</span>
                    </SmoothAnchor>
                    <a className="w-10 h-10 rounded-full border border-on-primary/30 flex items-center justify-center hover:bg-white/10 transition-colors" href="mailto:info@phoenixherbal.test">
                        <span className="material-symbols-outlined text-xl">mail</span>
                    </a>
                </div>
                <p className="font-body-sm text-body-sm text-on-primary/60 mt-8">
                    © 2024 Phoenix Terapi &amp; Herbal. Solusi Alami, Alat Tepat, Layanan Profesional untuk Hidup Lebih Sehat.
                </p>
            </footer>

            <FloatingWhatsApp phoneNumber={usePage().props.siteSettings?.whatsappNumber || '6281234567890'} />
        </div>
    );
}
