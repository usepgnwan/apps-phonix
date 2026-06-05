function FieldError({ message }) {
    return message ? (
        <p className="mt-1 font-body-sm text-xs text-error">
            {message}
        </p>
    ) : null;
}

export function CustomerTextField({ error, label, name, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                {label}
            </span>
            <input
                className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                name={name}
                onChange={onChange}
                type={type}
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

export function CustomerTextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                {label}
            </span>
            <textarea
                className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm transition focus:border-primary-container focus:ring-primary-container"
                name={name}
                onChange={onChange}
                rows="5"
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

export function CustomerSubmitButton({ children, disabled }) {
    return (
        <button
            className="inline-flex items-center justify-center rounded-full bg-primary-container px-5 py-2.5 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
}
