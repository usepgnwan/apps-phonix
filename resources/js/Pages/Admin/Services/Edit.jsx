import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import ImageUploadField from '@/Components/Admin/ImageUploadField';
import AdminLayout from '@/Layouts/AdminLayout';
import { FieldError, TextField, SelectField, TextAreaField } from '@/Components/Admin/FormFields';

const visitTipeOptions = ['home_visit', 'office_visit', 'both'];
const visitTipeLabels = { home_visit: 'Home Visit', office_visit: 'Office Visit', both: 'Home & Office' };

function CheckboxField({ checked, error, label, onChange }) {
    return (
        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
            <input
                checked={checked}
                className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type="checkbox"
            />
            <span>
                <span className="block font-body-sm text-sm font-bold text-[#333333]">
                    {label}
                </span>
                <FieldError message={error} />
            </span>
        </label>
    );
}

function AdminLayananEdit({ service }) {
    const form = useForm({
        _method: 'patch',
        name: service.name ?? '',
        slug: service.slug ?? '',
        description: service.description ?? '',
        key_features: service.key_features ?? '',
        benefits: service.benefits ?? '',
        price: service.price ?? '',
        visit_type: service.visit_type ?? 'both',
        thumbnail: null,
        is_active: Boolean(service.is_active),
        is_featured: Boolean(service.is_featured),
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.services.update', service.id), {
            forceFormData: true,
        });
    }

    return (
        <>
            <Head title={`Edit ${service.name}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.services.show', service.id)}
                        >
                            Detail
                        </Link>
                    )}
                    description="Perbarui data layanan, tipe kunjungan, dan status katalog."
                    eyebrow="Catalog / Layanan"
                    title={`Edit ${service.name}`}
                />
                <AdminCard className="p-5">
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                error={form.errors.name}
                                label="Nama"
                                onChange={(event) => form.setData('name', event.target.value)}
                                value={form.data.name}
                            />
                            <TextField
                                error={form.errors.slug}
                                label="Slug"
                                onChange={(event) => form.setData('slug', event.target.value)}
                                value={form.data.slug}
                            />
                            <TextField
                                error={form.errors.price}
                                label="Harga"
                                onChange={(event) => form.setData('price', event.target.value)}
                                type="number"
                                value={form.data.price}
                            />
                            <SelectField
                                error={form.errors.visit_type}
                                label="Tipe Kunjungan"
                                onChange={(event) => form.setData('visit_type', event.target.value)}
                                value={form.data.visit_type}
                            >
                                {visitTipeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {visitTipeLabels[option]}
                                    </option>
                                ))}
                            </SelectField>
                            <ImageUploadField
                                currentImage={service.image_path}
                                error={form.errors.thumbnail}
                                label="Thumbnail Gambar"
                                onChange={(file) => form.setData('thumbnail', file)}
                            />
                        </div>
                        <TextAreaField
                            error={form.errors.description}
                            label="Deskripsi"
                            onChange={(event) => form.setData('description', event.target.value)}
                            value={form.data.description}
                        />
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextAreaField
                                error={form.errors.key_features}
                                label="Keunggulan & Fitur Utama"
                                onChange={(event) => form.setData('key_features', event.target.value)}
                                value={form.data.key_features}
                            />
                            <TextAreaField
                                error={form.errors.benefits}
                                label="Manfaat"
                                onChange={(event) => form.setData('benefits', event.target.value)}
                                value={form.data.benefits}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CheckboxField
                                checked={form.data.is_active}
                                error={form.errors.is_active}
                                label="Layanan aktif"
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            <CheckboxField
                                checked={form.data.is_featured}
                                error={form.errors.is_featured}
                                label="Layanan unggulan"
                                onChange={(event) => form.setData('is_featured', event.target.checked)}
                            />
                        </div>
                        <button
                            className="rounded-full bg-[#1E4D3A] px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={form.processing}
                            type="submit"
                        >
                            Simpan Perubahan
                        </button>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminLayananEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLayananEdit;
