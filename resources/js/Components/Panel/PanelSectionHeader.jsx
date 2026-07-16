export default function PanelSectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                {eyebrow && (
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        {eyebrow}
                    </p>
                )}
                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
