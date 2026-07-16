import { usePage } from '@inertiajs/react';
import {
    Handshake,
    LayoutDashboard,
    Percent,
    Settings,
    UserRound,
} from 'lucide-react';

import PanelShell, { routeExists } from '@/Components/Panel/PanelShell';

function resolveAffiliateEntryRoute(affiliate) {
    if (affiliate?.is_active && routeExists('customer.affiliate.dashboard')) {
        return 'customer.affiliate.dashboard';
    }

    if (routeExists('customer.affiliate.apply')) {
        return 'customer.affiliate.apply';
    }

    if (routeExists('affiliate.landing')) {
        return 'affiliate.landing';
    }

    return null;
}

function buildNavigationGroups(affiliate) {
    const groups = [
        {
            label: 'Utama',
            items: [
                {
                    label: 'Dashboard',
                    routeName: 'customer.dashboard.index',
                    pattern: 'customer.dashboard.*',
                    icon: LayoutDashboard,
                },
                {
                    label: 'Profil',
                    routeName: 'customer.profile.show',
                    pattern: 'customer.profile.*',
                    icon: UserRound,
                },
            ],
        },
    ];

    const affiliateItems = [];

    if (affiliate?.is_active) {
        if (routeExists('customer.affiliate.dashboard')) {
            affiliateItems.push({
                label: 'Ringkasan Mitra',
                routeName: 'customer.affiliate.dashboard',
                pattern: 'customer.affiliate.dashboard',
                icon: Handshake,
            });
        }

        if (routeExists('customer.affiliate.commissions')) {
            affiliateItems.push({
                label: 'Riwayat Komisi',
                routeName: 'customer.affiliate.commissions',
                pattern: 'customer.affiliate.commissions',
                icon: Percent,
            });
        }

        if (routeExists('customer.affiliate.settings')) {
            affiliateItems.push({
                label: 'Pengaturan Mitra',
                routeName: 'customer.affiliate.settings',
                pattern: 'customer.affiliate.settings',
                icon: Settings,
            });
        }
    } else {
        const entryRoute = resolveAffiliateEntryRoute(affiliate);

        if (entryRoute) {
            affiliateItems.push({
                label: 'Program Affiliate',
                routeName: entryRoute,
                pattern: 'customer.affiliate.*',
                icon: Handshake,
            });
        }
    }

    if (affiliateItems.length > 0) {
        groups.push({
            label: 'Affiliate',
            items: affiliateItems,
        });
    }

    return groups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => routeExists(item.routeName)),
        }))
        .filter((group) => group.items.length > 0);
}

function customerBadge(user, affiliate) {
    if (affiliate?.is_active) {
        return {
            role: 'Mitra Affiliate',
            branch: affiliate.partner_code ?? null,
            short: affiliate.partner_code || 'Affiliate',
        };
    }

    return {
        role: 'Customer',
        branch: user?.email ?? null,
        short: 'Ruang Customer',
    };
}

export default function CustomerLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const affiliate = auth?.affiliate;

    return (
        <PanelShell
            badge={customerBadge(user, affiliate)}
            brandSubtitle="Ruang Customer"
            closeMenuLabel="Tutup menu customer"
            headerTitle="Ruang Customer"
            navigationGroups={buildNavigationGroups(affiliate)}
            profileLinkLabel="Profil Customer"
            profileRouteName={routeExists('customer.profile.show') ? 'customer.profile.show' : 'profile.edit'}
            userFallbackEmail="customer@phoenix.local"
            userFallbackName="Customer"
        >
            {children}
        </PanelShell>
    );
}
