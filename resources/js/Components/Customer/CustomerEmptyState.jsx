import { Sprout } from 'lucide-react';

export default function CustomerEmptyState({ title, description, icon }) {
    const IconComponent = icon ?? Sprout;

    return (
        <div className="rounded-3xl border border-dashed border-primary-fixed-dim bg-primary-fixed/20 px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-container shadow-sm shadow-primary-container/5">
                <IconComponent aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="font-body-lg text-sm font-bold text-primary-container">
                {title}
            </p>
            {description && (
                <p className="mx-auto mt-2 max-w-sm font-body-sm text-xs leading-5 text-on-surface-variant">
                    {description}
                </p>
            )}
        </div>
    );
}
