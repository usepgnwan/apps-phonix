import { Head, Link, router } from '@inertiajs/react';
import { Edit, MessageSquare, Plus, Star, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard.jsx';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader.jsx';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import Pagination from '@/Components/Admin/Pagination.jsx';

function StatusBadge({ isActive }) {
    if (isActive) {
        return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Aktif</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Tidak Aktif</span>;
}

function AdminTestimonialIndex({ testimonials, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.testimonials.index'), { search: newSearch, per_page: newPerPage }, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        handleFilterChange(e.target.value, perPage);
    };

    const handleLimitChange = (e) => {
        setPerPage(e.target.value);
        handleFilterChange(search, e.target.value);
    };

    function handleDelete(testimonial) {
        if (confirm(`Apakah Anda yakin ingin menghapus testimoni dari "${testimonial.customer_name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(route('admin.testimonials.destroy', testimonial.id));
        }
    }

    return (
        <>
            <Head title="Kelola Testimoni" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#1E4D3A]/90"
                            href={route('admin.testimonials.create')}
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Testimoni
                        </Link>
                    )}
                    description="Kelola ulasan dan testimoni pelanggan yang akan ditampilkan di halaman publik."
                    eyebrow="Konten Web"
                    title="Testimoni Pelanggan"
                />

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau isi ulasan..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Tampilkan</span>
                            <select
                                value={perPage}
                                onChange={handleLimitChange}
                                className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>data</span>
                        </div>
                    </div>

                    {testimonials.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-on-surface">
                                <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
                                    <tr>
                                        <th className="px-6 py-4 font-bold" scope="col">Pelanggan</th>
                                        <th className="px-6 py-4 font-bold" scope="col">Ulasan</th>
                                        <th className="px-6 py-4 font-bold" scope="col">Rating</th>
                                        <th className="px-6 py-4 font-bold" scope="col">Status</th>
                                        <th className="px-6 py-4 text-right font-bold" scope="col">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {testimonials.data.map((testimonial) => (
                                        <tr className="transition hover:bg-surface-container-low/50" key={testimonial.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {testimonial.photo_path ? (
                                                        <img
                                                            src={testimonial.photo_path.startsWith('http') || testimonial.photo_path.startsWith('/') ? testimonial.photo_path : `/storage/${testimonial.photo_path}`}
                                                            alt={testimonial.customer_name}
                                                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim text-primary-container">
                                                            <MessageSquare className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-primary-container">{testimonial.customer_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="line-clamp-2 max-w-xs text-on-surface-variant">{testimonial.content}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-[#F08A2B]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star className={`h-4 w-4 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`} key={i} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge isActive={testimonial.is_active} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-container transition hover:bg-primary-fixed/30"
                                                        href={route('admin.testimonials.edit', testimonial.id)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error-container"
                                                        onClick={() => handleDelete(testimonial)}
                                                        type="button"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-5 border-t border-outline-variant">
                                <Pagination links={testimonials.links} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 rounded-full bg-surface-container p-4 text-primary-container">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 font-headline-sm text-lg font-bold text-primary-container">Belum Ada Testimoni</h3>
                            <p className="mb-6 max-w-sm text-sm text-on-surface-variant">Tambahkan ulasan pelanggan untuk ditampilkan di website.</p>
                            <Link
                                className="inline-flex items-center gap-2 rounded-full border border-outline px-4 py-2 text-sm font-bold text-primary-container transition hover:bg-surface-container"
                                href={route('admin.testimonials.create')}
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Testimoni
                            </Link>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminTestimonialIndex.layout = (page) => <AdminLayout children={page} />;
export default AdminTestimonialIndex;
