import { Sprout } from 'lucide-react';

export default function PanelEmptyState({ title, description, icon }) {
    const IconComponent = icon ?? Sprout;

    return (
        <div className="rounded-2xl border border-dashed border-[#A8C5B3]/70 bg-[#F6F7F7] px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A8C5B3]/25 text-[#1E4D3A]">
                <IconComponent aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="font-body-lg text-sm font-bold text-[#1E4D3A]">
                {title}
            </p>
            {description && (
                <p className="mx-auto mt-2 max-w-sm font-body-sm text-xs leading-5 text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}
