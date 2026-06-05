export default function CustomerDetailRow({ label, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-outline-variant/80 bg-surface-container-low px-4 py-3 ${className}`}>
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/70">
                {label}
            </p>
            <div className="mt-1 font-body-sm text-sm font-semibold leading-6 text-on-surface">
                {children || '-'}
            </div>
        </div>
    );
}
