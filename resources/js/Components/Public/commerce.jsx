import { Link, usePage } from '@inertiajs/react';
import { ImageIcon, Leaf } from 'lucide-react';
import { forwardRef, useEffect } from 'react';

export function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(Number(value ?? 0));
}

export function productCategory(product) {
    return product?.product_category ?? product?.productCategory ?? null;
}

export function cartItems(cart) {
    return cart?.cart_items ?? cart?.cartItems ?? [];
}

export function cartSubtotal(cart) {
    return cartItems(cart).reduce((total, item) => {
        return total + (Number(item.product?.price ?? 0) * Number(item.quantity ?? 0));
    }, 0);
}

export function visitTypeLabel(visitType) {
    return {
        both: 'Home visit & klinik',
        home_visit: 'Home visit',
        office_visit: 'Kunjungan klinik',
    }[visitType] ?? 'Konsultasi Phoenix';
}

export function serviceVisitOptions(service) {
    if (service?.visit_type === 'both') {
        return [
            { label: visitTypeLabel('home_visit'), value: 'home_visit' },
            { label: visitTypeLabel('office_visit'), value: 'office_visit' },
        ];
    }

    if (service?.visit_type === 'home_visit' || service?.visit_type === 'office_visit') {
        return [{ label: visitTypeLabel(service.visit_type), value: service.visit_type }];
    }

    return [];
}

export function PublicShell({ children, fullWidth = false }) {
    const { auth, cartSummary, flash } = usePage().props;
    const cartCount = Number(cartSummary?.count ?? 0);
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
    const mainClassName = fullWidth
        ? 'relative w-full pb-8 pt-28 md:pb-12 md:pt-32'
        : 'relative mx-auto w-full max-w-container-max px-margin-mobile pb-8 pt-28 md:px-margin-desktop md:pb-12 md:pt-32';

    useEffect(() => {
        if (flash?.whatsappUrl) {
            window.location.href = flash.whatsappUrl;
        }
    }, [flash?.whatsappUrl]);

    return (
        <div className="min-h-screen bg-surface font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
            <header className="fixed left-0 top-0 z-50 w-full border-b border-white/70 bg-white/80 shadow-none backdrop-blur-xl transition-all duration-300">
                <div className="mx-auto flex h-20 w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
                    <Link className="rounded-2xl pr-3 transition-all duration-300 hover:opacity-80" href={`${route('home')}#beranda`} aria-label="Phoenix Terapi & Herbal">
                        <img src="/images/logo_blue_box.png" alt="Phoenix Terapi &amp; Herbal" className="h-12 w-auto rounded-xl object-contain shadow-sm shadow-black/10 md:h-14" />
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link className="font-body-md text-body-md font-semibold text-[#1E4D3A] transition-colors hover:text-[#6FA788]" href={`${route('home')}#beranda`}>
                            Beranda
                        </Link>
                        <Link className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href={`${route('home')}#produk`}>
                            Produk
                        </Link>
                        <Link className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href={`${route('home')}#layanan`}>
                            Layanan
                        </Link>
                        <Link className="font-body-md text-body-md font-medium text-[#333333] transition-colors hover:text-[#1E4D3A]" href={`${route('home')}#tentang-kami`}>
                            Tentang Kami
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href={route('cart.index')} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#1E4D3A]/30 bg-white text-[#1E4D3A] transition-all duration-150 hover:border-[#1E4D3A] hover:bg-[#A8C5B3]/20 active:scale-95" aria-label="Keranjang belanja" data-cart-link>
                            <span className="material-symbols-outlined text-xl" data-cart-icon>shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-tertiary px-1.5 font-body-sm text-[10px] font-black leading-none text-white shadow-sm shadow-[#1E4D3A]/20" data-cart-count>
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
                    </div>
                </div>
            </header>

            <main className={mainClassName}>
                <div className="pointer-events-none absolute right-8 top-8 h-48 w-48 rounded-full bg-primary-fixed/45 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 left-4 h-40 w-40 rounded-full bg-tertiary-fixed/35 blur-3xl" />
                <div className="relative">{children}</div>
            </main>
        </div>
    );
}

export const PublicCard = forwardRef(function PublicCard({ children, className = '' }, ref) {
    return (
        <section className={`rounded-3xl border border-outline-variant/80 bg-white shadow-sm shadow-primary-container/5 ${className}`} ref={ref}>
            {children}
        </section>
    );
});

export function BotanicalPlaceholder({ className = '' }) {
    return (
        <div className={`flex items-center justify-center bg-primary-fixed/25 ${className}`}>
            <div className="text-center text-primary-container">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm shadow-primary-container/10">
                    <ImageIcon aria-hidden="true" className="h-7 w-7 text-primary/50" />
                </span>
                <span className="mt-3 block font-label-sm text-xs font-bold uppercase tracking-[0.18em]">
                    Belum ada foto
                </span>
            </div>
        </div>
    );
}

export function ProductImage({ alt, className = '', imagePath }) {
    if (!imagePath) {
        return <BotanicalPlaceholder className={className} />;
    }

    // Jika path sudah absolut (dimulai dengan /), gunakan langsung
    // Jika tidak (path lama dari storage), prefix dengan /storage/
    const src = imagePath.startsWith('/') ? imagePath : `/storage/${imagePath}`;

    return <img alt={alt} className={`object-cover ${className}`} src={src} />;
}

export function EmptyState({ action, description, title }) {
    return (
        <PublicCard className="p-8 text-center">
            <BotanicalPlaceholder className="mx-auto h-32 w-32 rounded-full" />
            <h2 className="mt-6 font-headline-lg text-headline-lg text-primary-container">{title}</h2>
            <p className="mx-auto mt-3 max-w-lg font-body-md text-body-md text-on-surface-variant">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </PublicCard>
    );
}

export function PrimaryLink({ children, className = '', href }) {
    return (
        <Link className={`inline-flex items-center justify-center rounded-full bg-primary-container px-5 py-3 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary ${className}`} href={href}>
            {children}
        </Link>
    );
}

export function SecondaryLink({ children, className = '', href }) {
    return (
        <Link className={`inline-flex items-center justify-center rounded-full border border-primary-fixed-dim bg-white px-5 py-3 font-label-md text-sm font-bold text-primary-container transition hover:bg-primary-fixed/30 ${className}`} href={href}>
            {children}
        </Link>
    );
}
