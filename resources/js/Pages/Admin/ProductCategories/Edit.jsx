import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

function TextField({ error, label, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type="text"
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

function AdminProductKategoriEdit({ productKategori }) {
    const form = useForm({
        name: productKategori.name ?? '',
        slug: productKategori.slug ?? '',
        description: productKategori.description ?? '',
        is_active: Boolean(productKategori.is_active),
    });

    function submit(event) {
        event.preventDefault();
        form.patch(route('admin.product-categories.update', productKategori.id));
    }

    return (
        <>
            <Head title={`Edit ${productKategori.name}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.product-categories.show', productKategori.id)}
                        >
                            Detail
                        </Link>
                    )}
                    description="Perbarui informasi kategori produk."
                    eyebrow="Catalog / Kategori Produk"
                    title={`Edit ${productKategori.name}`}
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
                        </div>

                        <TextAreaField
                            error={form.errors.description}
                            label="Deskripsi"
                            onChange={(event) => form.setData('description', event.target.value)}
                            value={form.data.description}
                        />
                        <CheckboxField
                            checked={form.data.is_active}
                            error={form.errors.is_active}
                            label="Kategori aktif"
                            onChange={(event) => form.setData('is_active', event.target.checked)}
                        />

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

AdminProductKategoriEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductKategoriEdit;
