export function FieldError({ message }) {
    return message ? (
        <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p>
    ) : null;
}

export function TextField({ error, label, name, onChange, placeholder, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

export function SelectField({ children, error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <select
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                value={value ?? ''}
            >
                {children}
            </select>
            <FieldError message={error} />
        </label>
    );
}

export function TextAreaField({ error, label, name, onChange, rows = 4, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <textarea
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                name={name}
                onChange={onChange}
                rows={rows}
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

export function DetailRow({ label, children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 ${className}`}>
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <div className="mt-1 font-body-sm text-sm font-semibold leading-6 text-[#333333]">
                {children || '-'}
            </div>
        </div>
    );
}

export function SubmitButton({ children, disabled }) {
    return (
        <button
            className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-5 py-2.5 font-label-md text-sm font-bold text-white shadow-sm shadow-[#1E4D3A]/20 transition hover:bg-[#163B2C] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
}
