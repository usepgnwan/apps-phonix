import { Head, Link, useForm } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard.jsx';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader.jsx';
import AdminLayout from '@/Layouts/AdminLayout.jsx';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-2 text-sm text-error">{message}</p>;
}

function TextField({ label, error, ...props }) {
    return (
        <label className="block">
            <span className="mb-2 block font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                {label}
            </span>
            <input
                className={`block w-full rounded-2xl border bg-surface-container-low px-4 py-3 font-body-sm text-sm text-on-surface shadow-sm focus:ring-primary-container ${error ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'}`}
                {...props}
            />
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ label, error, ...props }) {
    return (
        <label className="block">
            <span className="mb-2 block font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                {label}
            </span>
            <textarea
                className={`block w-full rounded-2xl border bg-surface-container-low px-4 py-3 font-body-sm text-sm text-on-surface shadow-sm focus:ring-primary-container ${error ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'}`}
                rows={4}
                {...props}
            />
            <FieldError message={error} />
        </label>
    );
}

function RatingSelectField({ label, error, value, onChange }) {
    return (
        <label className="block">
            <span className="mb-2 block font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                {label}
            </span>
            <select
                className={`block w-full rounded-2xl border bg-surface-container-low px-4 py-3 font-body-sm text-sm text-on-surface shadow-sm focus:ring-primary-container ${error ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'}`}
                onChange={onChange}
                value={value}
            >
                <option value="5">5 Bintang (Sangat Baik)</option>
                <option value="4">4 Bintang (Baik)</option>
                <option value="3">3 Bintang (Cukup)</option>
                <option value="2">2 Bintang (Kurang)</option>
                <option value="1">1 Bintang (Sangat Kurang)</option>
            </select>
            <FieldError message={error} />
        </label>
    );
}

function FileField({ label, error, file, onChange, currentPhotoPath }) {
    return (
        <label className="block">
            <span className="mb-2 block font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                {label}
            </span>
            <input
                accept="image/jpeg,image/png,image/webp"
                className={`block w-full rounded-2xl border bg-surface-container-low px-4 py-3 font-body-sm text-sm text-on-surface shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A] file:px-4 file:py-2 file:font-body-sm file:text-sm file:font-bold file:text-white focus:ring-primary-container ${error ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary-container'}`}
                onChange={onChange}
                type="file"
            />
            <p className="mt-2 font-body-sm text-xs text-on-surface-variant">
                {file ? `File dipilih: ${file.name}` : (currentPhotoPath ? 'Upload file baru jika ingin mengganti foto saat ini.' : 'Pilih foto JPG, PNG, atau WebP (opsional).')}
            </p>
            {currentPhotoPath && !file && (
                <div className="mt-3">
                    <img src={currentPhotoPath.startsWith('http') || currentPhotoPath.startsWith('/') ? currentPhotoPath : `/storage/${currentPhotoPath}`} alt="Foto saat ini" className="w-16 h-16 rounded-full object-cover border" />
                </div>
            )}
            <FieldError message={error} />
        </label>
    );
}

function AdminTestimonialEdit({ testimonial }) {
    const form = useForm({
        _method: 'PUT',
        customer_name: testimonial.customer_name,
        content: testimonial.content,
        rating: testimonial.rating,
        is_active: testimonial.is_active,
        photo: null,
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.testimonials.update', testimonial.id), { forceFormData: true });
    }

    return (
        <>
            <Head title={`Edit Testimoni - ${testimonial.customer_name}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.testimonials.index')}
                        >
                            Kembali
                        </Link>
                    )}
                    description="Perbarui informasi ulasan pelanggan dan status penampilannya."
                    eyebrow="Testimoni"
                    title={`Edit Testimoni: ${testimonial.customer_name}`}
                />

                <AdminCard className="p-5">
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                error={form.errors.customer_name}
                                label="Nama Pelanggan"
                                onChange={(event) => form.setData('customer_name', event.target.value)}
                                value={form.data.customer_name}
                            />
                            
                            <RatingSelectField
                                error={form.errors.rating}
                                label="Rating"
                                onChange={(event) => form.setData('rating', parseInt(event.target.value))}
                                value={form.data.rating}
                            />

                            <div className="md:col-span-2">
                                <FileField
                                    error={form.errors.photo}
                                    file={form.data.photo}
                                    label="Foto (Opsional)"
                                    onChange={(event) => form.setData('photo', event.target.files[0] ?? null)}
                                    currentPhotoPath={testimonial.photo_path}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <TextAreaField
                                    error={form.errors.content}
                                    label="Ulasan / Komentar"
                                    onChange={(event) => form.setData('content', event.target.value)}
                                    value={form.data.content}
                                />
                            </div>
                        </div>

                        <div className="mt-8 border-t border-outline-variant pt-5">
                            <label className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <input
                                        checked={form.data.is_active}
                                        className="peer sr-only"
                                        onChange={(event) => form.setData('is_active', event.target.checked)}
                                        type="checkbox"
                                    />
                                    <div className="h-6 w-11 rounded-full bg-surface-container-highest transition peer-checked:bg-primary-container" />
                                    <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-full" />
                                </div>
                                <span className="font-body-sm text-sm font-bold text-on-surface">Tampilkan Testimoni ini di Web</span>
                            </label>
                            <FieldError message={form.errors.is_active} />
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-outline-variant pt-5">
                            <Link
                                className="rounded-full px-5 py-2.5 font-body-sm text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
                                href={route('admin.testimonials.index')}
                            >
                                Batal
                            </Link>
                            <button
                                className="rounded-full bg-primary-container px-6 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-primary disabled:opacity-50"
                                disabled={form.processing}
                                type="submit"
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminTestimonialEdit.layout = (page) => <AdminLayout children={page} />;
export default AdminTestimonialEdit;
