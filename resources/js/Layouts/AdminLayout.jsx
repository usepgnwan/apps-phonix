import { usePage } from '@inertiajs/react';
import {
    BadgePercent,
    BarChart3,
    CalendarCheck,
    ClipboardPlus,
    CreditCard,
    Download,
    Handshake,
    LayoutDashboard,
    Leaf,
    MapPin,
    MessageSquare,
    Package,
    Percent,
    Settings,
    Store,
    Tags,
    UserRound,
    UsersRound,
    Video,
    WalletCards,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import PanelShell from '@/Components/Admin/PanelShell';
import { isCentralAdmin, scopeBadgeLabel } from '@/utils/adminScope';

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
        label: 'Affiliate',
        items: [
            { label: 'Daftar Affiliate', routeName: 'admin.affiliates.index', pattern: 'admin.affiliates.*', icon: Handshake },
            { label: 'Pencairan Komisi', routeName: 'admin.affiliate-payouts.index', pattern: 'admin.affiliate-payouts.*', icon: WalletCards },
            { label: 'Atur Komisi', routeName: 'admin.affiliate-commission-rules.index', pattern: 'admin.affiliate-commission-rules.*', icon: Percent },
        ],
    },
    {
        label: 'Master Data',
        items: [
            { label: 'Cabang', routeName: 'admin.branches.index', pattern: 'admin.branches.*', icon: MapPin, centralOnly: true },
            { label: 'Admin', routeName: 'admin.admins.index', pattern: 'admin.admins.*', icon: UserRound, centralOnly: true },
            { label: 'Staff', routeName: 'admin.staff.index', pattern: 'admin.staff.*', icon: UsersRound },
            { label: 'Tim', routeName: 'admin.teams.index', pattern: 'admin.teams.*', icon: UsersRound, centralOnly: true },
            { label: 'Jabatan', routeName: 'admin.positions.index', pattern: 'admin.positions.*', icon: UserRound, centralOnly: true },
            { label: 'Produk', routeName: 'admin.products.index', pattern: 'admin.products.*', icon: Package },
            { label: 'Kategori Produk', routeName: 'admin.product-categories.index', pattern: 'admin.product-categories.*', icon: Tags },
            { label: 'Layanan', routeName: 'admin.services.index', pattern: 'admin.services.*', icon: Leaf },
            { label: 'Voucher', routeName: 'admin.vouchers.index', pattern: 'admin.vouchers.*', icon: BadgePercent, centralOnly: true },
            { label: 'Metode Pembayaran', routeName: 'admin.payment-methods.index', pattern: 'admin.payment-methods.*', icon: CreditCard, centralOnly: true },
            { label: 'Sumber Lead', routeName: 'admin.lead-sources.index', pattern: 'admin.lead-sources.*', icon: Tags, centralOnly: true },
            { label: 'Video', routeName: 'admin.videos.index', pattern: 'admin.videos.*', icon: Video, centralOnly: true },
            { label: 'Testimoni', routeName: 'admin.testimonials.index', pattern: 'admin.testimonials.*', icon: MessageSquare, centralOnly: true },
        ],
    },
    {
        label: 'Sistem',
        items: [
            { label: 'Pengaturan', routeName: 'admin.settings.index', pattern: 'admin.settings.*', icon: Settings, centralOnly: true },
        ],
    },
];

function canSeeNavItem(item, user) {
    if (!item.centralOnly) {
        return true;
    }

    return isCentralAdmin(user);
}

function visibleNavigationGroups(user) {
    return navigationGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => canSeeNavItem(item, user)),
        }))
        .filter((group) => group.items.length > 0);
}

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const headerActions = deferredPrompt ? (
        <button
            className="hidden items-center gap-1.5 rounded-full bg-[#1E4D3A] px-4 py-1.5 font-body-sm text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#163B2C] sm:inline-flex"
            onClick={handleInstallClick}
            type="button"
        >
            <Download aria-hidden="true" className="h-4 w-4" />
            Install App
        </button>
    ) : null;

    return (
        <PanelShell
            badge={scopeBadgeLabel(user)}
            brandSubtitle="Panel Admin"
            closeMenuLabel="Tutup menu admin"
            headerActions={headerActions}
            headerTitle="Panel Admin"
            navigationGroups={visibleNavigationGroups(user)}
            userFallbackEmail="admin@phoenix.local"
            userFallbackName="Admin"
        >
            {children}
        </PanelShell>
    );
}
