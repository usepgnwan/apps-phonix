import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Home, Leaf, LogOut, Menu, Sprout, UserRound, X } from 'lucide-react';
import { useState } from 'react';

import Dropdown from '@/Components/Dropdown';

const navigation = [
    { label: 'Dashboard', routeName: 'customer.dashboard.index', pattern: 'customer.dashboard.index', icon: Home },
    { label: 'Profil', routeName: 'customer.profile.show', pattern: 'customer.profile.*', icon: UserRound },
];

function routeExists(routeName) {
    return typeof route === 'function' && route().has(routeName);
}

function CustomerNavLink({ item, onNavigate }) {
    if (!routeExists(item.routeName)) {
        return null;
    }

    const active = route().current(item.pattern);
    const IconComponent = item.icon;

    return (
        <Link
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-body-sm text-sm font-bold transition ${
                active
                    ? 'bg-primary-container text-white shadow-sm shadow-primary-container/20'
                    : 'text-primary-container hover:bg-primary-fixed/45'
            }`}
            href={route(item.routeName)}
            onClick={onNavigate}
        >
            <IconComponent aria-hidden="true" className="h-4 w-4" />
            {item.label}
        </Link>
    );
}

function Brand() {
    return (
        <Link className="flex items-center gap-3 rounded-full pr-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-white shadow-sm shadow-primary-container/20">
                <Sprout aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="leading-none">
                <span className="block font-headline-md text-lg font-bold tracking-[0.18em] text-primary-container">
                    PHOENIX
                </span>
                <span className="mt-1 block font-label-sm text-[9px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    Ruang Customer
                </span>
            </span>
        </Link>
    );
}

function MobileMenu({ onClose, open }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                aria-label="Tutup menu customer"
                className="absolute inset-0 bg-primary-container/35"
                onClick={onClose}
                type="button"
            />
            <aside className="relative h-full w-[300px] max-w-[85vw] border-r border-outline-variant bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <Brand />
                    <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant text-primary-container"
                        onClick={onClose}
                        type="button"
                    >
                        <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>
                <nav className="mt-8 flex flex-col gap-2">
                    {navigation.map((item) => (
                        <CustomerNavLink item={item} key={item.routeName} onNavigate={onClose} />
                    ))}
                </nav>
            </aside>
        </div>
    );
}

export default function CustomerLayout({ children }) {
    const user = usePage().props.auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface font-body-md text-on-surface">
            <MobileMenu onClose={() => setMobileOpen(false)} open={mobileOpen} />

            <header className="sticky top-0 z-40 border-b border-outline-variant/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
                    <div className="flex items-center gap-3">
                        <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant bg-white text-primary-container lg:hidden"
                            onClick={() => setMobileOpen(true)}
                            type="button"
                        >
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        </button>
                        <Brand />
                    </div>

                    <nav className="hidden items-center gap-2 lg:flex">
                        {navigation.map((item) => (
                            <CustomerNavLink item={item} key={item.routeName} />
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-full border border-outline-variant bg-white px-3 py-1.5 font-body-sm text-xs font-semibold text-on-surface-variant sm:inline-flex sm:items-center sm:gap-1.5">
                            <Leaf aria-hidden="true" className="h-4 w-4 text-primary-container" />
                            Botanical Care
                        </div>
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-white px-2 py-2 font-body-sm text-sm font-semibold text-on-surface transition hover:border-primary-fixed-dim"
                                    type="button"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-xs font-black text-primary-container">
                                        {user?.name?.charAt(0) ?? 'C'}
                                    </span>
                                    <span className="hidden max-w-[140px] truncate sm:inline">
                                        {user?.name ?? 'Customer'}
                                    </span>
                                    <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-on-surface-variant sm:block" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                {routeExists('customer.profile.show') && (
                                    <Dropdown.Link href={route('customer.profile.show')}>
                                        <span className="inline-flex items-center gap-2">
                                            <UserRound aria-hidden="true" className="h-4 w-4" />
                                            Profil Customer
                                        </span>
                                    </Dropdown.Link>
                                )}
                                <Dropdown.Link as="button" href={route('logout')} method="post">
                                    <span className="inline-flex items-center gap-2">
                                        <LogOut aria-hidden="true" className="h-4 w-4" />
                                        Keluar
                                    </span>
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </header>

            <main className="relative mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-10">
                <div className="pointer-events-none absolute right-8 top-8 h-48 w-48 rounded-full bg-primary-fixed/45 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 left-4 h-40 w-40 rounded-full bg-tertiary-fixed/35 blur-3xl" />
                <div className="relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
