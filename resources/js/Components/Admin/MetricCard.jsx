import {
    BadgeCheck,
    Banknote,
    CalendarCheck,
    CheckCircle2,
    CircleSlash,
    ClipboardList,
    CreditCard,
    Gift,
    HandCoins,
    HeartPulse,
    Leaf,
    Package,
    PackageCheck,
    PackageSearch,
    QrCode,
    ReceiptText,
    Sparkles,
    Store,
    Tags,
    TrendingUp,
    UserCheck,
    UserRound,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { cloneElement, isValidElement } from 'react';

import AdminCard from './AdminCard';

const toneClasses = {
    forest: 'bg-[#1E4D3A]/10 text-[#1E4D3A]',
    sage: 'bg-[#A8C5B3]/25 text-[#1E4D3A]',
    blue: 'bg-[#1F3B63]/10 text-[#1F3B63]',
    orange: 'bg-[#F08A2B]/10 text-[#B57A2E]',
    brown: 'bg-[#B57A2E]/10 text-[#B57A2E]',
};

const iconKeywordMap = [
    ['revenue', Banknote],
    ['pembayaran', CreditCard],
    ['payment', CreditCard],
    ['qris', QrCode],
    ['bank', WalletCards],
    ['order', ReceiptText],
    ['penjualan offline', Store],
    ['penjualan', HandCoins],
    ['booking', CalendarCheck],
    ['customer', UsersRound],
    ['member', UserCheck],
    ['lead', UserRound],
    ['sumber', Tags],
    ['event', Sparkles],
    ['produk', Package],
    ['layanan', Leaf],
    ['voucher', Gift],
    ['redemption', Gift],
    ['pemeriksaan', HeartPulse],
    ['aktivitas', ClipboardList],
    ['stok', PackageSearch],
    ['selesai', CheckCircle2],
    ['aktif', BadgeCheck],
    ['nonaktif', CircleSlash],
    ['menunggu', TrendingUp],
    ['diproses', PackageCheck],
];

function resolveIcon(icon, label, helper) {
    if (!icon) {
        return null;
    }

    if (typeof icon !== 'string') {
        return icon;
    }

    const searchable = `${label ?? ''} ${helper ?? ''}`.toLowerCase();
    const match = iconKeywordMap.find(([keyword]) => searchable.includes(keyword));
    const IconComponent = match?.[1] ?? ClipboardList;

    return <IconComponent aria-hidden="true" className="h-16 w-16" />;
}

function decorateIcon(icon) {
    if (!isValidElement(icon)) {
        return icon;
    }

    return cloneElement(icon, {
        'aria-hidden': true,
        className: `${icon.props.className ?? ''} !h-16 !w-16 stroke-[1.6]`,
    });
}

export default function MetricCard({ label, value, helper, icon, tone = 'sage' }) {
    const resolvedIcon = resolveIcon(icon, label, helper);
    const decorativeIcon = decorateIcon(resolvedIcon);

    return (
        <AdminCard className="relative overflow-hidden p-5">
            {decorativeIcon && (
                <div
                    className={`pointer-events-none absolute -right-3 top-3 flex h-24 w-24 items-center justify-center rounded-full opacity-20 ${toneClasses[tone] ?? toneClasses.sage}`}
                >
                    {decorativeIcon}
                </div>
            )}
            <div className="relative z-10">
                <div className="max-w-[calc(100%-2rem)]">
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        {label}
                    </p>
                    <p className="mt-3 font-body-lg text-3xl font-extrabold text-[#333333]">
                        {value}
                    </p>
                    {helper && (
                        <p className="mt-2 font-body-sm text-xs text-gray-400">
                            {helper}
                        </p>
                    )}
                </div>
            </div>
        </AdminCard>
    );
}
