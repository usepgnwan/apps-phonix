import { Head, Link, router } from '@inertiajs/react';
import { Edit, MessageSquare, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard.jsx';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader.jsx';
import AdminLayout from '@/Layouts/AdminLayout.jsx';

function StatusBadge({ isActive }) {
    if (isActive) {
        return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Aktif</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Tidak Aktif</span>;
}

function AdminTestimonialIndex({ testimonials = [] }) {
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
                    {testimonials.length > 0 ? (
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
                                    {testimonials.map((testimonial) => (
                                        <tr className="transition hover:bg-surface-container-low/50" key={testimonial.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim text-primary-container">
                                                        <MessageSquare className="h-5 w-5" />
                                                    </div>
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
