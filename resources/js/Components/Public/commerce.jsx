import { Link, usePage } from '@inertiajs/react';
import { Leaf, ShoppingBag, Sprout } from 'lucide-react';
import { forwardRef } from 'react';

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

export function PublicShell({ children }) {
    const cartCount = Number(usePage().props.cartSummary?.count ?? 0);

    return (
        <div className="min-h-screen bg-surface font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
            <header className="sticky top-0 z-40 border-b border-outline-variant/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
                    <Link className="flex items-center gap-3 rounded-full pr-3" href={route('home')}>
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-white shadow-sm shadow-primary-container/20">
                            <Sprout aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="leading-none">
                            <span className="block font-headline-md text-lg font-bold tracking-[0.18em] text-primary-container">
                                PHOENIX
                            </span>
                            <span className="mt-1 block font-label-sm text-[9px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                                Terapi &amp; Herbal
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-2 md:flex">
                        <Link className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-on-surface-variant transition hover:bg-primary-fixed/35 hover:text-primary-container" href={route('products.index')}>
                            Produk
                        </Link>
                        <Link className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-on-surface-variant transition hover:bg-primary-fixed/35 hover:text-primary-container" href={route('services.index')}>
                            Layanan
                        </Link>
                    </nav>

                    <Link className="relative inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2.5 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary" data-cart-link href={route('cart.index')}>
                        <ShoppingBag aria-hidden="true" className="h-4 w-4" />
                        Keranjang
                        {cartCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-tertiary px-1.5 font-body-sm text-[11px] font-black leading-none text-white shadow-sm shadow-primary-container/20" data-cart-count>
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <main className="relative mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
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
                    <Leaf aria-hidden="true" className="h-7 w-7" />
                </span>
                <span className="mt-3 block font-label-sm text-xs font-bold uppercase tracking-[0.18em]">
                    Phoenix Herbal
                </span>
            </div>
        </div>
    );
}

export function ProductImage({ alt, className = '', imagePath }) {
    if (!imagePath) {
        return <BotanicalPlaceholder className={className} />;
    }

    return <img alt={alt} className={`object-cover ${className}`} src={`/storage/${imagePath}`} />;
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
