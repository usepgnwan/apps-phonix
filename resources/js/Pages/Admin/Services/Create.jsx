import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import ImageUploadField from '@/Components/Admin/ImageUploadField';
import AdminLayout from '@/Layouts/AdminLayout';

const visitTipeOptions = ['home_visit', 'office_visit', 'both'];
const visitTipeLabels = { home_visit: 'Home Visit', office_visit: 'Office Visit', both: 'Home & Office' };

function FieldError({ message }) {
    return message ? (
        <p className="mt-1 font-body-sm text-xs text-red-700">
            {message}
        </p>
    ) : null;
}

function TextField({ error, label, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type={type}
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <textarea
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                rows="4"
                value={value ?? ''}
            />
            <FieldError message={error} />
        </label>
    );
}

function SelectField({ children, error, label, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <select
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                value={value ?? ''}
            >
                {children}
            </select>
            <FieldError message={error} />
        </label>
    );
}

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

function AdminLayananTambah() {
    const form = useForm({
        name: '',
        slug: '',
        description: '',
        key_features: '',
        benefits: '',
        price: '',
        visit_type: 'both',
        thumbnail: null,
        is_active: true,
        is_featured: false,
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.services.store'));
    }

    return (
        <>
            <Head title="Tambah Layanan" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.services.index')}
                        >
                            Kembali
                        </Link>
                    )}
                    description="Tambahkan layanan terapi baru untuk katalog Phoenix."
                    eyebrow="Catalog / Layanan"
                    title="Tambah Layanan"
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
                                currentImage={null}
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
                            Simpan Layanan
                        </button>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminLayananTambah.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLayananTambah;
