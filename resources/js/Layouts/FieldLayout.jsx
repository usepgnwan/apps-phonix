import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

import Dropdown from '@/Components/Dropdown';

const navigationItems = [
    { label: 'Dashboard', routeName: 'field.dashboard.index', pattern: 'field.dashboard.*', icon: 'D' },
    { label: 'Leads', routeName: 'field.leads.index', pattern: 'field.leads.*', icon: 'L' },
];

function routeExists(routeName) { return typeof route === 'function' && route().has(routeName); }

function NavItem({ item, onNavigate }) {
    if (!routeExists(item.routeName)) return null;
    const active = route().current(item.pattern);
    return <Link className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 font-body-sm text-sm font-semibold transition ${active ? 'bg-[#1E4D3A] text-white shadow-sm shadow-[#1E4D3A]/20' : 'text-gray-600 hover:bg-[#A8C5B3]/20 hover:text-[#1E4D3A]'}`} href={route(item.routeName)} onClick={onNavigate}><span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${active ? 'bg-white/15 text-white' : 'bg-[#F6F7F7] text-[#1E4D3A] group-hover:bg-white'}`}>{item.icon}</span><span className="truncate">{item.label}</span></Link>;
}

function SidebarContent({ user, onNavigate }) {
    return <div className="flex h-full flex-col bg-white"><div className="flex h-24 items-center gap-3 border-b border-[#E5E7EB] px-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E4D3A] text-lg font-black text-white">P</div><div><p className="font-body-lg text-base font-extrabold leading-tight text-[#1E4D3A]">Phoenix Field</p><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Staff Lapangan</p></div></div><nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6"><div><p className="mb-2 px-3 font-label-sm text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Field Work</p><div className="space-y-1.5">{navigationItems.map((item) => <NavItem item={item} key={item.routeName} onNavigate={onNavigate} />)}</div></div></nav><div className="border-t border-[#E5E7EB] p-4"><div className="flex items-center gap-3 rounded-2xl bg-[#F6F7F7] p-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A8C5B3]/50 font-bold text-[#1E4D3A]">{user?.name?.charAt(0) ?? 'F'}</div><div className="min-w-0"><p className="truncate font-body-sm text-sm font-bold text-[#333333]">{user?.name ?? 'Field Staff'}</p><p className="truncate font-body-sm text-xs text-gray-500">{user?.email ?? 'field@phoenix.local'}</p></div></div></div></div>;
}

function MenuIcon({ open }) {
    return <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{open ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />}</svg>;
}

export default function FieldLayout({ children }) {
    const user = usePage().props.auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return <div className="min-h-screen bg-[#F6F7F7] font-body-md text-[#333333]"><aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[#E5E7EB] lg:block"><SidebarContent user={user} /></aside>{mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close field menu" className="absolute inset-0 bg-[#1E4D3A]/35" onClick={() => setMobileOpen(false)} type="button" /><aside className="relative h-full w-[300px] max-w-[85vw] border-r border-[#E5E7EB] shadow-2xl"><SidebarContent onNavigate={() => setMobileOpen(false)} user={user} /></aside></div>}<div className="lg:pl-[280px]"><header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#1E4D3A] lg:hidden" onClick={() => setMobileOpen(true)} type="button"><MenuIcon open={false} /></button><div><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Phoenix Terapi & Herbal</p><p className="font-body-sm text-sm font-bold text-[#1E4D3A]">Field Staff Panel</p></div></div><div className="flex items-center gap-3"><div className="hidden rounded-full border border-[#E5E7EB] px-3 py-1.5 font-body-sm text-xs font-semibold text-gray-500 sm:block">Field CRM</div><Dropdown><Dropdown.Trigger><button className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-2 py-2 text-sm font-semibold text-[#333333] transition hover:border-[#A8C5B3]" type="button"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A8C5B3]/45 text-xs font-black text-[#1E4D3A]">{user?.name?.charAt(0) ?? 'F'}</span><span className="hidden max-w-[140px] truncate sm:inline">{user?.name ?? 'Field Staff'}</span></button></Dropdown.Trigger><Dropdown.Content>{routeExists('profile.edit') && <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>}<Dropdown.Link as="button" href={route('logout')} method="post">Log Out</Dropdown.Link></Dropdown.Content></Dropdown></div></div></header><main className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">{children}</div></main></div></div>;
}
