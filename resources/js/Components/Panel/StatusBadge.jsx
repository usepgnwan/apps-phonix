const toneClasses = {
    forest: 'border-[#1E4D3A]/15 bg-[#1E4D3A]/10 text-[#1E4D3A]',
    sage: 'border-[#6FA788]/20 bg-[#A8C5B3]/25 text-[#1E4D3A]',
    blue: 'border-[#1F3B63]/15 bg-[#1F3B63]/10 text-[#1F3B63]',
    orange: 'border-[#F08A2B]/20 bg-[#F08A2B]/10 text-[#B57A2E]',
    brown: 'border-[#B57A2E]/20 bg-[#B57A2E]/10 text-[#B57A2E]',
    gray: 'border-gray-200 bg-gray-100 text-gray-600',
    red: 'border-red-200 bg-red-50 text-red-700',
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
    new: ['Baru', 'blue'],
    interested: ['Tertarik', 'sage'],
    needs_follow_up: ['Perlu Follow Up', 'orange'],
    booking_examination: ['Booking Pemeriksaan', 'brown'],
    purchased: ['Membeli', 'forest'],
    not_interested: ['Tidak Tertarik', 'gray'],
    active: ['Aktif', 'forest'],
    rejected: ['Ditolak', 'red'],
    suspended: ['Suspended', 'orange'],
    hold: ['Tertahan', 'orange'],
    approved: ['Siap Cair', 'forest'],
    home_visit: ['Home Visit', 'sage'],
    clinic_visit: ['Kunjungan Klinik', 'forest'],
    online: ['Online', 'blue'],
};

function humanize(value) {
    return String(value ?? 'Status')
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ status, label, tone }) {
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
