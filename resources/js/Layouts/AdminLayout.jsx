import { Link, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    BarChart3,
    CalendarCheck,
    ChevronDown,
    ClipboardPlus,
    CreditCard,
    LayoutDashboard,
    Leaf,
    LogOut,
    Menu,
    MessageSquare,
    Package,
    Settings,
    Sprout,
    Store,
    Tags,
    UserRound,
    UsersRound,
    Video,
    WalletCards,
    X,
    Download,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import Dropdown from '@/Components/Dropdown';

const navigationGroups = [
    {
        label: 'Utama',
        items: [
            { label: 'Dashboard', routeName: 'admin.dashboard.index', pattern: 'admin.dashboard.*', icon: LayoutDashboard },
            { label: 'Laporan', routeName: 'admin.reports.index', pattern: 'admin.reports.*', icon: BarChart3 },
        ],
    },
    {
        label: 'Transaksi',
        items: [
            { label: 'Order', routeName: 'admin.orders.index', pattern: 'admin.orders.*', icon: WalletCards },
            { label: 'Penjualan Offline', routeName: 'admin.offline-sales.index', pattern: 'admin.offline-sales.*', icon: Store },
            { label: 'Booking', routeName: 'admin.bookings.index', pattern: 'admin.bookings.*', icon: CalendarCheck },
            { label: 'Pemeriksaan', routeName: 'admin.examinations.index', pattern: 'admin.examinations.*', icon: ClipboardPlus },
        ],
    },
    {
        label: 'CRM',
        items: [
            { label: 'Customer', routeName: 'admin.customers.index', pattern: 'admin.customers.*', icon: UsersRound },
            { label: 'Lead', routeName: 'admin.leads.index', pattern: 'admin.leads.*', icon: UserRound },
            { label: 'Event', routeName: 'admin.events.index', pattern: 'admin.events.*', icon: CalendarCheck },
        ],
    },
    {
        label: 'Master Data',
        items: [
            { label: 'Produk', routeName: 'admin.products.index', pattern: 'admin.products.*', icon: Package },
            { label: 'Kategori Produk', routeName: 'admin.product-categories.index', pattern: 'admin.product-categories.*', icon: Tags },
            { label: 'Layanan', routeName: 'admin.services.index', pattern: 'admin.services.*', icon: Leaf },
            { label: 'Voucher', routeName: 'admin.vouchers.index', pattern: 'admin.vouchers.*', icon: BadgePercent },
            { label: 'Metode Pembayaran', routeName: 'admin.payment-methods.index', pattern: 'admin.payment-methods.*', icon: CreditCard },
            { label: 'Sumber Lead', routeName: 'admin.lead-sources.index', pattern: 'admin.lead-sources.*', icon: Tags },
            { label: 'Video', routeName: 'admin.videos.index', pattern: 'admin.videos.*', icon: Video },
            { label: 'Testimoni', routeName: 'admin.testimonials.index', pattern: 'admin.testimonials.*', icon: MessageSquare },
        ],
    },
    {
        label: 'Sistem',
        items: [
            { label: 'Pengaturan', routeName: 'admin.settings.index', pattern: 'admin.settings.*', icon: Settings },
        ],
    },
];

function routeExists(routeName) {
    return typeof route === 'function' && route().has(routeName);
}

function NavItem({ item, onNavigate }) {
    if (!routeExists(item.routeName)) {
        return null;
    }

    const active = route().current(item.pattern);
    const IconComponent = item.icon;

    return (
        <Link
            href={route(item.routeName)}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 font-body-sm text-sm font-semibold transition ${
                active
                    ? 'bg-[#1E4D3A] text-white shadow-sm shadow-[#1E4D3A]/20'
                    : 'text-gray-600 hover:bg-[#A8C5B3]/20 hover:text-[#1E4D3A]'
            }`}
        >
            <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                    active
                        ? 'bg-white/15 text-white'
                        : 'bg-[#F6F7F7] text-[#1E4D3A] group-hover:bg-white'
                }`}
            >
                <IconComponent aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="truncate">{item.label}</span>
        </Link>
    );
}

function SidebarContent({ user, onNavigate }) {
    return (
        <div className="flex h-full flex-col bg-white">
            <div className="flex h-24 items-center gap-3 border-b border-[#E5E7EB] px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E4D3A] text-lg font-black text-white">
                    <Sprout aria-hidden="true" className="h-6 w-6" />
                </div>
                <div>
                    <p className="font-body-lg text-base font-extrabold leading-tight text-[#1E4D3A]">
                        Phoenix
                    </p>
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                        Panel Admin
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
                {navigationGroups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 font-label-sm text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                            {group.label}
                        </p>
                        <div className="space-y-1.5">
                            {group.items.map((item) => (
                                <NavItem
                                    item={item}
                                    key={item.routeName}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-[#E5E7EB] p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-[#F6F7F7] p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A8C5B3]/50 font-bold text-[#1E4D3A]">
                        <UserRound aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-body-sm text-sm font-bold text-[#333333]">
                            {user?.name ?? 'Admin'}
                        </p>
                        <p className="truncate font-body-sm text-xs text-gray-500">
                            {user?.email ?? 'admin@phoenix.local'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MenuIcon({ open }) {
    const IconComponent = open ? X : Menu;

    return <IconComponent aria-hidden="true" className="h-5 w-5" />;
}

export default function AdminLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F7F7] font-body-md text-[#333333]">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#E5E7EB] lg:block">
                <SidebarContent user={user} />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        aria-label="Tutup menu admin"
                        className="absolute inset-0 bg-[#1E4D3A]/35"
                        onClick={() => setMobileOpen(false)}
                        type="button"
                    />
                    <aside className="relative h-full w-[300px] max-w-[85vw] border-r border-[#E5E7EB] shadow-2xl">
                        <SidebarContent
                            user={user}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </aside>
                </div>
            )}

            <div className="lg:pl-[280px]">
                <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#1E4D3A] lg:hidden"
                                onClick={() => setMobileOpen(true)}
                                type="button"
                            >
                                <MenuIcon open={false} />
                            </button>
                            <div>
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Phoenix Terapi & Herbal
                                </p>
                                <p className="font-body-sm text-sm font-bold text-[#1E4D3A]">
                                    Panel Admin
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {deferredPrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#1E4D3A] px-4 py-1.5 font-body-sm text-xs font-bold text-white shadow-sm hover:bg-[#163B2C] transition-colors"
                                >
                                    <Download aria-hidden="true" className="h-4 w-4" />
                                    Install App
                                </button>
                            )}
                            <div className="hidden rounded-full border border-[#E5E7EB] px-3 py-1.5 font-body-sm text-xs font-semibold text-gray-500 sm:block">
                                <span className="inline-flex items-center gap-1.5">
                                    <Leaf aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                                    Commerce Botanical
                                </span>
                            </div>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-2 py-2 text-sm font-semibold text-[#333333] transition hover:border-[#A8C5B3]"
                                        type="button"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A8C5B3]/45 text-xs font-black text-[#1E4D3A]">
                                            {user?.name?.charAt(0) ?? 'A'}
                                        </span>
                                        <span className="hidden max-w-[140px] truncate sm:inline">
                                            {user?.name ?? 'Admin'}
                                        </span>
                                        <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-gray-400 sm:block" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    {routeExists('profile.edit') && (
                                        <Dropdown.Link href={route('profile.edit')}>
                                            <span className="inline-flex items-center gap-2">
                                                <UserRound aria-hidden="true" className="h-4 w-4" />
                                                Profil
                                            </span>
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link
                                        as="button"
                                        href={route('logout')}
                                        method="post"
                                    >
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

                <main className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl space-y-5">
                        {flash?.success && (
                            <div className="rounded-3xl border border-[#A8C5B3] bg-[#A8C5B3]/20 px-5 py-4 font-body-sm text-sm font-bold text-[#1E4D3A]">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 font-body-sm text-sm font-bold text-red-700">
                                {flash.error}
                            </div>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
