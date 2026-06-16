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
import ReactECharts from 'echarts-for-react';

import AdminCard from './AdminCard';

const toneClasses = {
    forest: 'bg-[#1E4D3A]/10 text-[#1E4D3A]',
    sage: 'bg-[#A8C5B3]/25 text-[#1E4D3A]',
    blue: 'bg-[#1F3B63]/10 text-[#1F3B63]',
    orange: 'bg-[#F08A2B]/10 text-[#B57A2E]',
    brown: 'bg-[#B57A2E]/10 text-[#B57A2E]',
};

const toneIconBgClasses = {
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

function EChartSparkline({ data = [], tone = 'sage', type = 'line' }) {
    if (!data || data.length === 0) return null;
    
    const hexColors = {
        forest: '#1E4D3A',
        sage: '#1E4D3A', // use dark green for sage trend
        blue: '#1F3B63',
        orange: '#F08A2B',
        brown: '#B57A2E',
    };
    
    const color = hexColors[tone] ?? hexColors.sage;
        const xAxisData = data.map((d, i) => (typeof d === 'object' && d !== null ? d.date : i));
        const seriesData = data.map(d => (typeof d === 'object' && d !== null ? d.value : d));

        const option = {
        animation: false,
        tooltip: {
            show: true,
            trigger: 'axis',
            appendToBody: true,
            axisPointer: {
                type: 'line'
            },
            formatter: function (params) {
                const p = params[0];
                return `<div class="font-sans px-1">
                    <div class="text-[10px] text-gray-500 mb-0.5 leading-none">${p.name}</div>
                    <div class="text-xs font-bold text-[#333333] leading-none">${p.value}</div>
                </div>`;
            }
        },
        grid: {
            left: 0,
            right: 0,
            top: 5,
            bottom: 0,
        },
        xAxis: {
            type: 'category',
            show: false,
            data: xAxisData
        },
        yAxis: {
            type: 'value',
            show: false,
            min: 'dataMin' // to prevent flatlining completely if values are high
        },
        series: [
            {
                data: seriesData,
                type: type,
                smooth: type === 'line' ? 0.3 : undefined,
                showSymbol: false,
                lineStyle: {
                    color: color,
                    width: 2
                },
                itemStyle: {
                    color: color,
                    borderRadius: type === 'bar' ? [2, 2, 0, 0] : 0
                },
                barWidth: '60%',
                areaStyle: type === 'line' ? {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{
                            offset: 0, color: color + '40' // 25% opacity
                        }, {
                            offset: 1, color: color + '00' // 0% opacity
                        }]
                    }
                } : undefined
            }
        ]
    };

    return (
        <div className="mt-4 w-full h-12">
            <ReactECharts 
                option={option} 
                style={{ height: '100%', width: '100%' }} 
                opts={{ renderer: 'svg' }}
            />
        </div>
    );
}

export default function MetricCard({ label, value, helper, icon, tone = 'sage', trend = [], chartType = 'line' }) {
    const resolvedIcon = resolveIcon(icon, label, helper);
    
    // Ensure the icon is small
    const smallIcon = isValidElement(resolvedIcon) 
        ? cloneElement(resolvedIcon, { className: 'h-4 w-4 stroke-[2]' }) 
        : resolvedIcon;

    return (
        <AdminCard className="flex h-full flex-col justify-between overflow-hidden p-4 pb-2">
            <div>
                <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneIconBgClasses[tone] ?? toneIconBgClasses.sage}`}>
                        {smallIcon}
                    </div>
                    <h3 className="font-body-sm text-sm font-bold text-[#333333]">
                        {label}
                    </h3>
                </div>
                
                <div className="mt-3">
                    <p className="font-body-lg text-xl font-extrabold text-[#333333]">
                        {value}
                    </p>
                    {helper && (
                        <p className="font-body-sm text-xs text-gray-500">
                            {helper}
                        </p>
                    )}
                </div>
            </div>
            
            {trend && trend.length > 0 && (
                <EChartSparkline data={trend} tone={tone} type={chartType} />
            )}
        </AdminCard>
    );
}
