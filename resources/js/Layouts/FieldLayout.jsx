import { usePage } from '@inertiajs/react';
import { LayoutDashboard, UsersRound } from 'lucide-react';

import PanelShell from '@/Components/Admin/PanelShell';

const navigationGroups = [
    {
        label: 'Kerja Lapangan',
        items: [
            {
                label: 'Dashboard',
                routeName: 'field.dashboard.index',
                pattern: 'field.dashboard.*',
                icon: LayoutDashboard,
            },
            {
                label: 'Leads',
                routeName: 'field.leads.index',
                pattern: 'field.leads.*',
                icon: UsersRound,
            },
        ],
    },
];

function fieldScopeBadge(user) {
    const branchName = user?.branch?.name ?? null;

    return {
        role: 'Field Staff',
        branch: branchName,
        short: branchName || 'Lapangan',
    };
}

export default function FieldLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <PanelShell
            badge={fieldScopeBadge(user)}
            brandSubtitle="Panel Field"
            closeMenuLabel="Tutup menu field"
            headerTitle="Panel Field Staff"
            navigationGroups={navigationGroups}
            userFallbackEmail="field@phoenix.local"
            userFallbackName="Field Staff"
        >
            {children}
        </PanelShell>
    );
}
