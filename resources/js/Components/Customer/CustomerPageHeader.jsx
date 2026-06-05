export default function CustomerPageHeader({ eyebrow, title, description, action, icon: IconComponent }) {
    return (
        <div className="flex flex-col gap-5 rounded-3xl border border-primary-fixed-dim/60 bg-gradient-to-br from-white via-surface to-primary-fixed/25 p-6 shadow-sm shadow-primary-container/5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
                {IconComponent && (
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-white shadow-sm shadow-primary-container/20">
                        <IconComponent aria-hidden="true" className="h-6 w-6" />
                    </div>
                )}
                <div>
                    {eyebrow && (
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.24em] text-primary-container">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="mt-2 font-headline-lg text-3xl font-bold tracking-tight text-primary-container sm:text-4xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-3 max-w-2xl font-body-sm text-sm leading-6 text-on-surface-variant">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
