import { Download, QrCode } from 'lucide-react';

/**
 * QR Code untuk link referral staff.
 * Memakai API publik QR (tanpa npm package baru) agar hasil scan andal.
 */
export default function ReferralQrCode({
    value = '',
    fileName = 'referral-qr',
    size = 220,
    label = 'QR Code Referral',
    helper = 'Scan untuk membuka link pendaftaran. Unduh untuk dicetak atau dibagikan offline.',
    className = '',
}) {
    if (!value) {
        return (
            <div
                className={`rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center text-sm text-gray-500 ${className}`}
            >
                QR belum tersedia — kode referral staff kosong.
            </div>
        );
    }

    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&ecc=M&color=1E4D3A&bgcolor=FFFFFF&data=${encodeURIComponent(value)}`;
    const downloadName = `${String(fileName).replace(/[^\w.-]+/g, '_') || 'referral-qr'}.png`;

    const handleDownload = async () => {
        try {
            const response = await fetch(qrSrc);
            if (!response.ok) {
                throw new Error('Gagal mengunduh QR');
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        } catch {
            window.open(qrSrc, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            className={`flex flex-col items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:flex-row sm:items-start ${className}`}
        >
            <div className="shrink-0 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
                <img
                    alt={`QR Code ${fileName}`}
                    className="h-auto w-full max-w-[220px]"
                    height={size}
                    loading="lazy"
                    src={qrSrc}
                    width={size}
                />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <QrCode aria-hidden="true" className="h-4 w-4 text-[#1E4D3A]" />
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        {label}
                    </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{helper}</p>
                <p className="mt-2 break-all text-xs text-gray-400">{value}</p>
                <button
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#1E4D3A] bg-white px-5 py-2.5 text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                    onClick={handleDownload}
                    type="button"
                >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Unduh QR (PNG)
                </button>
            </div>
        </div>
    );
}
