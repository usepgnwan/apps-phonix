const toneClasses = {
    forest: 'border-primary-container/15 bg-primary-container/10 text-primary-container',
    sage: 'border-secondary/20 bg-secondary-fixed/30 text-primary-container',
    blue: 'border-[#1F3B63]/15 bg-[#1F3B63]/10 text-[#1F3B63]',
    orange: 'border-[#F08A2B]/20 bg-[#F08A2B]/10 text-[#B57A2E]',
    brown: 'border-[#B57A2E]/20 bg-[#B57A2E]/10 text-[#B57A2E]',
    gray: 'border-outline-variant bg-surface-container-low text-on-surface-variant',
    red: 'border-error/20 bg-error-container text-on-error-container',
};

const statusMap = {
    waiting_shipping_confirmation: ['Menunggu Ongkir', 'orange'],
    shipping_cost_confirmed: ['Ongkir Dikonfirmasi', 'blue'],
    ready_to_ship: ['Siap Dikirim', 'sage'],
    waiting_payment: ['Menunggu Bayar', 'brown'],
    payment_received: ['Pembayaran Diterima', 'blue'],
    processing: ['Diproses', 'sage'],
    shipped: ['Dikirim', 'blue'],
    delivered: ['Terkirim', 'forest'],
    completed: ['Selesai', 'forest'],
    cancelled: ['Batal', 'red'],
    pending: ['Pending', 'gray'],
    paid: ['Lunas', 'forest'],
    waiting_confirmation: ['Menunggu Konfirmasi', 'orange'],
    confirmed: ['Dikonfirmasi', 'blue'],
    home_visit: ['Home Visit', 'sage'],
    clinic_visit: ['Kunjungan Klinik', 'forest'],
};

function humanize(value) {
    return String(value ?? 'Status')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CustomerStatusBadge({ status, label, tone }) {
    const mapped = statusMap[status] ?? [humanize(status), 'gray'];
    const displayLabel = label ?? mapped[0];
    const displayTone = tone ?? mapped[1];

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 font-label-sm text-[10px] font-bold uppercase tracking-[0.12em] ${toneClasses[displayTone] ?? toneClasses.gray}`}
        >
            {displayLabel}
        </span>
    );
}
