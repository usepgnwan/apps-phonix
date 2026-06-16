import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import ImageUploadField from '@/Components/Admin/ImageUploadField';

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

function AdminProdukEdit({ product, productCategories: productKategori = [] }) {
    const form = useForm({
        _method: 'patch',
        product_category_id: product.product_category_id ?? product.product_category?.id ?? product.productKategori?.id ?? '',
        name: product.name ?? '',
        slug: product.slug ?? '',
        bpom_number: product.bpom_number ?? '',
        price: product.price ?? '',
        short_description: product.short_description ?? '',
        full_description: product.full_description ?? '',
        composition: product.composition ?? '',
        packaging_type: product.packaging_type ?? '',
        content_amount: product.content_amount ?? '',
        content_unit: product.content_unit ?? '',
        benefits: product.benefits ?? '',
        usage_rules: product.usage_rules ?? '',
        notes: product.notes ?? '',
        thumbnail: null,
        stock_quantity: product.stock_quantity ?? 0,
        low_stock_threshold: product.low_stock_threshold ?? 0,
        is_active: Boolean(product.is_active),
        is_featured: Boolean(product.is_featured),
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.products.update', product.id));
    }

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.products.show', product.id)}
                        >
                            Detail
                        </Link>
                    )}
                    description="Perbarui data produk, stok, dan status katalog."
                    eyebrow="Katalog / Produk"
                    title={`Edit ${product.name}`}
                />
                <AdminCard className="p-5">
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <SelectField
                                error={form.errors.product_category_id}
                                label="Kategori"
                                onChange={(event) => form.setData('product_category_id', event.target.value)}
                                value={form.data.product_category_id}
                            >
                                <option value="">Pilih kategori</option>
                                {productKategori.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </SelectField>
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
                                error={form.errors.bpom_number}
                                label="No. BPOM"
                                onChange={(event) => form.setData('bpom_number', event.target.value)}
                                value={form.data.bpom_number}
                            />
                            <TextField
                                error={form.errors.price}
                                label="Harga"
                                onChange={(event) => form.setData('price', event.target.value)}
                                type="number"
                                value={form.data.price}
                            />
                            <TextField
                                error={form.errors.stock_quantity}
                                label="Stok"
                                onChange={(event) => form.setData('stock_quantity', event.target.value)}
                                type="number"
                                value={form.data.stock_quantity}
                            />
                            <TextField
                                error={form.errors.low_stock_threshold}
                                label="Ambang Stok Rendah"
                                onChange={(event) => form.setData('low_stock_threshold', event.target.value)}
                                type="number"
                                value={form.data.low_stock_threshold}
                            />
                            <ImageUploadField
                                error={form.errors.thumbnail}
                                label="Thumbnail Gambar"
                                onChange={(file) => form.setData('thumbnail', file)}
                                currentImage={product.image_path}
                            />
                        </div>
                        <TextAreaField
                            error={form.errors.short_description}
                            label="Deskripsi Singkat"
                            onChange={(event) => form.setData('short_description', event.target.value)}
                            value={form.data.short_description}
                        />
                        <TextAreaField
                            error={form.errors.full_description}
                            label="Deskripsi Lengkap"
                            onChange={(event) => form.setData('full_description', event.target.value)}
                            value={form.data.full_description}
                        />
                        <TextAreaField
                            error={form.errors.composition}
                            label="Komposisi"
                            onChange={(event) => form.setData('composition', event.target.value)}
                            value={form.data.composition}
                        />
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <SelectField
                                error={form.errors.packaging_type}
                                label="Tipe Kemasan"
                                onChange={(event) => form.setData('packaging_type', event.target.value)}
                                value={form.data.packaging_type}
                            >
                                <option value="">Pilih Kemasan</option>
                                <option value="Botol">Botol</option>
                                <option value="Box">Box</option>
                                <option value="Pouch">Pouch</option>
                                <option value="Sachet">Sachet</option>
                                <option value="Tube">Tube</option>
                                <option value="Blister">Blister</option>
                                <option value="Pcs">Pcs</option>
                            </SelectField>
                            <TextField
                                error={form.errors.content_amount}
                                label="Berat / Jumlah Isi"
                                onChange={(event) => form.setData('content_amount', event.target.value)}
                                type="number"
                                value={form.data.content_amount}
                            />
                            <SelectField
                                error={form.errors.content_unit}
                                label="Satuan Berat / Isi"
                                onChange={(event) => form.setData('content_unit', event.target.value)}
                                value={form.data.content_unit}
                            >
                                <option value="">Pilih Satuan</option>
                                <option value="Gram">Gram</option>
                                <option value="Kg">Kg</option>
                                <option value="mg">mg</option>
                                <option value="ml">ml</option>
                                <option value="Liter">Liter</option>
                                <option value="Kapsul">Kapsul</option>
                                <option value="Tablet">Tablet</option>
                            </SelectField>
                        </div>
                        <TextAreaField
                            error={form.errors.benefits}
                            label="Manfaat"
                            onChange={(event) => form.setData('benefits', event.target.value)}
                            value={form.data.benefits}
                        />
                        <TextAreaField
                            error={form.errors.usage_rules}
                            label="Aturan Pakai"
                            onChange={(event) => form.setData('usage_rules', event.target.value)}
                            value={form.data.usage_rules}
                        />
                        <TextAreaField
                            error={form.errors.notes}
                            label="Catatan"
                            onChange={(event) => form.setData('notes', event.target.value)}
                            value={form.data.notes}
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CheckboxField
                                checked={form.data.is_active}
                                error={form.errors.is_active}
                                label="Produk aktif"
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                            />
                            <CheckboxField
                                checked={form.data.is_featured}
                                error={form.errors.is_featured}
                                label="Produk unggulan"
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

AdminProdukEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProdukEdit;
