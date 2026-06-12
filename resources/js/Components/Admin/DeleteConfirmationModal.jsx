import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmationModal({
    description,
    isOpen,
    itemName,
    onCancel,
    onConfirm,
    processing = false,
    title = 'Hapus data?',
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
            <button
                aria-label="Tutup modal konfirmasi hapus"
                className="absolute inset-0 bg-[#1E4D3A]/35 backdrop-blur-sm"
                onClick={processing ? undefined : onCancel}
                type="button"
            />
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl shadow-[#1E4D3A]/20">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-[#F08A2B] to-[#B57A2E]" />
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                            <AlertTriangle aria-hidden="true" className="h-6 w-6" />
                        </div>
                        <button
                            aria-label="Tutup"
                            className="rounded-full p-2 text-gray-400 transition hover:bg-[#F6F7F7] hover:text-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={processing}
                            onClick={onCancel}
                            type="button"
                        >
                            <X aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-5 space-y-2">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-red-700">
                            Konfirmasi Hapus
                        </p>
                        <h2 className="font-body-lg text-xl font-extrabold text-[#333333]">
                            {title}
                        </h2>
                        <p className="font-body-sm text-sm leading-6 text-gray-500">
                            {description ?? 'Data ini akan dihapus permanen dari admin Phoenix.'}
                        </p>
                    </div>

                    {itemName && (
                        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-red-700">
                                Data yang dihapus
                            </p>
                            <p className="mt-1 break-words font-body-sm text-sm font-bold text-[#333333]">
                                {itemName}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            className="rounded-full border border-[#E5E7EB] px-5 py-2.5 font-body-sm text-sm font-bold text-[#333333] transition hover:bg-[#F6F7F7] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={processing}
                            onClick={onCancel}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-red-700 px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={processing}
                            onClick={onConfirm}
                            type="button"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
