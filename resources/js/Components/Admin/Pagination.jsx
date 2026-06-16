import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-6">
            {links.map((link, index) => {
                const isFirstOrLast = index === 0 || index === links.length - 1;
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»');

                if (link.url === null) {
                    return (
                        <div
                            key={index}
                            className="px-3 py-2 text-sm text-gray-400 border border-transparent rounded cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-2 text-sm rounded border transition ${
                            link.active
                                ? 'bg-[#1E4D3A] text-white border-[#1E4D3A] font-bold'
                                : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
