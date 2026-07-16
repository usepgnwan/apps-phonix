export default function PanelPageHeader({ eyebrow, title, description, action, icon: IconComponent }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
                {IconComponent && (
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A8C5B3]/25 text-[#1E4D3A]">
                        <IconComponent aria-hidden="true" className="h-6 w-6" />
                    </div>
                )}
                <div>
                    {eyebrow && (
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.24em] text-[#1E4D3A]">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="mt-2 font-body-lg text-2xl font-extrabold tracking-tight text-[#333333] sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 max-w-2xl font-body-sm text-sm leading-6 text-gray-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
