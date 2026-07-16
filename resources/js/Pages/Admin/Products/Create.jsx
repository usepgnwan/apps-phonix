import { Head, Link, useForm, usePage } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import ImageUploadField from '@/Components/Admin/ImageUploadField';
import { isBranchAdmin } from '@/utils/adminScope';
import { FieldError, TextField, SelectField, TextAreaField } from '@/Components/Admin/FormFields';

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

function AdminProdukTambah({ productCategories: productKategori = [], branches = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const branchAdmin = isBranchAdmin(user);

    const form = useForm({
        product_category_id: '',
        name: '',
        slug: '',
        bpom_number: '',
        price: '',
        short_description: '',
        full_description: '',
        composition: '',
        packaging_type: '',
        content_amount: '',
        content_unit: '',
        benefits: '',
        usage_rules: '',
        notes: '',
        thumbnail: null,
        stock_quantity: 0,
        low_stock_threshold: 0,
        branch_stocks: {}, // { [branchId]: { stock_quantity: 0, low_stock_threshold: 0 } }
        is_active: true,
        is_featured: false,
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.products.store'));
    }

    return (
        <>
            <Head title="Tambah Produk" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.products.index')}
                        >
                            Kembali
                        </Link>
                    )}
                    description="Tambahkan produk baru dengan harga, stok, dan informasi katalog."
                    eyebrow="Katalog / Produk"
                    title="Tambah Produk"
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
                            <ImageUploadField
                                error={form.errors.thumbnail}
                                label="Thumbnail Gambar"
                                onChange={(file) => form.setData('thumbnail', file)}
                                currentImage={null}
                            />
                        </div>
                        
                        <div className="mt-8 border-t border-[#E5E7EB] pt-6">
                            <h3 className="mb-1 font-bold text-[#333333]">
                                {branchAdmin ? 'Stok Produk (Cabang Anda)' : 'Stok Produk (Per Cabang)'}
                            </h3>
                            {branchAdmin && (
                                <p className="mb-4 font-body-sm text-xs text-gray-500">
                                    Admin cabang hanya dapat mengatur stok untuk cabang sendiri.
                                </p>
                            )}
                            {!branchAdmin && <div className="mb-4" />}
                            <div className="space-y-4">
                                {branches.map((branch) => (
                                    <div key={branch.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="font-medium text-gray-800 mb-3">{branch.name}</div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <TextField
                                                error={form.errors[`branch_stocks.${branch.id}.stock_quantity`]}
                                                label="Stok Tersedia"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    form.setData('branch_stocks', {
                                                        ...form.data.branch_stocks,
                                                        [branch.id]: {
                                                            ...form.data.branch_stocks[branch.id],
                                                            stock_quantity: val
                                                        }
                                                    });
                                                }}
                                                type="number"
                                                value={form.data.branch_stocks[branch.id]?.stock_quantity ?? 0}
                                            />
                                            <TextField
                                                error={form.errors[`branch_stocks.${branch.id}.low_stock_threshold`]}
                                                label="Batas Stok Rendah"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    form.setData('branch_stocks', {
                                                        ...form.data.branch_stocks,
                                                        [branch.id]: {
                                                            ...form.data.branch_stocks[branch.id],
                                                            low_stock_threshold: val
                                                        }
                                                    });
                                                }}
                                                type="number"
                                                value={form.data.branch_stocks[branch.id]?.low_stock_threshold ?? 0}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {branches.length === 0 && (
                                    <p className="text-sm text-gray-500">Belum ada cabang yang terdaftar. Tambahkan cabang terlebih dahulu.</p>
                                )}
                            </div>
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
                            Simpan Produk
                        </button>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminProdukTambah.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProdukTambah;
