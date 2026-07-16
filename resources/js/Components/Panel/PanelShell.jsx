import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    LogOut,
    MapPin,
    Menu,
    Sprout,
    UserRound,
    X,
} from 'lucide-react';
import { useState } from 'react';

import Dropdown from '@/Components/Dropdown';

export function routeExists(routeName) {
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
            className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 font-body-sm text-sm font-semibold transition ${
                active
                    ? 'bg-[#1E4D3A] text-white shadow-sm shadow-[#1E4D3A]/20'
                    : 'text-gray-600 hover:bg-[#A8C5B3]/20 hover:text-[#1E4D3A]'
            }`}
            href={route(item.routeName)}
            onClick={onNavigate}
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

function SidebarContent({
    brandSubtitle,
    navigationGroups,
    onNavigate,
    user,
    userFallbackName,
    userFallbackEmail,
}) {
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
                        {brandSubtitle}
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
                            {user?.name ?? userFallbackName}
                        </p>
                        <p className="truncate font-body-sm text-xs text-gray-500">
                            {user?.email ?? userFallbackEmail}
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

/**
 * Shared panel chrome for Admin, Field, and Customer layouts.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string} props.brandSubtitle - e.g. "Panel Admin"
 * @param {string} props.headerTitle - e.g. "Panel Admin"
 * @param {string} props.closeMenuLabel
 * @param {Array<{label: string, items: Array}>} props.navigationGroups
 * @param {{role: string, branch?: string|null, short: string}} props.badge
 * @param {string} props.userFallbackName
 * @param {string} props.userFallbackEmail
 * @param {import('react').ReactNode} [props.headerActions] - optional extra header controls (e.g. PWA install)
 * @param {string} [props.profileRouteName] - optional profile dropdown route (default: profile.edit)
 * @param {string} [props.profileLinkLabel] - optional profile dropdown label
 */
export default function PanelShell({
    children,
    brandSubtitle,
    headerTitle,
    closeMenuLabel,
    navigationGroups,
    badge,
    userFallbackName,
    userFallbackEmail,
    headerActions = null,
    profileRouteName = 'profile.edit',
    profileLinkLabel = 'Profil',
}) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F6F7F7] font-body-md text-[#333333]">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#E5E7EB] lg:block">
                <SidebarContent
                    brandSubtitle={brandSubtitle}
                    navigationGroups={navigationGroups}
                    user={user}
                    userFallbackEmail={userFallbackEmail}
                    userFallbackName={userFallbackName}
                />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        aria-label={closeMenuLabel}
                        className="absolute inset-0 bg-[#1E4D3A]/35"
                        onClick={() => setMobileOpen(false)}
                        type="button"
                    />
                    <aside className="relative h-full w-[300px] max-w-[85vw] border-r border-[#E5E7EB] shadow-2xl">
                        <SidebarContent
                            brandSubtitle={brandSubtitle}
                            navigationGroups={navigationGroups}
                            onNavigate={() => setMobileOpen(false)}
                            user={user}
                            userFallbackEmail={userFallbackEmail}
                            userFallbackName={userFallbackName}
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
                                    {headerTitle}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {headerActions}
                            <div className="hidden rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-3 py-1.5 sm:block">
                                <span className="inline-flex items-center gap-2">
                                    <MapPin
                                        aria-hidden="true"
                                        className="h-4 w-4 shrink-0 text-[#1E4D3A]"
                                    />
                                    <span className="flex min-w-0 flex-col leading-tight">
                                        <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            {badge.role}
                                        </span>
                                        <span className="max-w-[180px] truncate font-body-sm text-xs font-bold text-[#1E4D3A]">
                                            {badge.branch || badge.short}
                                        </span>
                                    </span>
                                </span>
                            </div>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-2 py-2 text-sm font-semibold text-[#333333] transition hover:border-[#A8C5B3]"
                                        type="button"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A8C5B3]/45 text-xs font-black text-[#1E4D3A]">
                                            {user?.name?.charAt(0) ?? userFallbackName.charAt(0)}
                                        </span>
                                        <span className="hidden max-w-[140px] truncate sm:inline">
                                            {user?.name ?? userFallbackName}
                                        </span>
                                        <ChevronDown
                                            aria-hidden="true"
                                            className="hidden h-4 w-4 text-gray-400 sm:block"
                                        />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    {routeExists(profileRouteName) && (
                                        <Dropdown.Link href={route(profileRouteName)}>
                                            <span className="inline-flex items-center gap-2">
                                                <UserRound aria-hidden="true" className="h-4 w-4" />
                                                {profileLinkLabel}
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
