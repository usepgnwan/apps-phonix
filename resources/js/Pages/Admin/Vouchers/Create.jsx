import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
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

function AdminVouchersTambah() {
    const form = useForm({
        code: '',
        name: '',
        description: '',
        discount_type: 'fixed',
        discount_value: '',
        minimum_purchase: '',
        starts_at: '',
        ends_at: '',
        usage_limit: '',
        is_published: true,
        target_audience: 'all',
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.vouchers.store'));
    }

    return (
        <>
            <Head title="Tambah Voucher" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.vouchers.index')}
                        >
                            Kembali
                        </Link>
                    )}
                    description="Tambahkan voucher baru dengan nominal diskon, periode berlaku, dan batas penggunaan."
                    eyebrow="Commerce / Voucher"
                    title="Tambah Voucher"
                />
                <AdminCard className="p-5">
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                error={form.errors.code}
                                label="Kode"
                                onChange={(event) => form.setData('code', event.target.value)}
                                value={form.data.code}
                            />
                            <TextField
                                error={form.errors.name}
                                label="Nama"
                                onChange={(event) => form.setData('name', event.target.value)}
                                value={form.data.name}
                            />
                            <SelectField
                                error={form.errors.discount_type}
                                label="Tipe Diskon"
                                onChange={(event) => form.setData('discount_type', event.target.value)}
                                value={form.data.discount_type}
                            >
                                <option value="fixed">Nominal Tetap</option>
                                <option value="percentage">Persentase</option>
                            </SelectField>
                            <SelectField
                                error={form.errors.target_audience}
                                label="Target Audiens"
                                onChange={(event) => form.setData('target_audience', event.target.value)}
                                value={form.data.target_audience}
                            >
                                <option value="all">Semua Pengguna</option>
                                <option value="member">Hanya Member</option>
                                <option value="non_member">Hanya Non Member</option>
                            </SelectField>
                            <TextField
                                error={form.errors.discount_value}
                                label="Nilai Diskon"
                                onChange={(event) => form.setData('discount_value', event.target.value)}
                                type="number"
                                value={form.data.discount_value}
                            />
                            <TextField
                                error={form.errors.minimum_purchase}
                                label="Minimum Pembelian"
                                onChange={(event) => form.setData('minimum_purchase', event.target.value)}
                                type="number"
                                value={form.data.minimum_purchase}
                            />
                            <TextField
                                error={form.errors.usage_limit}
                                label="Batas Penggunaan"
                                onChange={(event) => form.setData('usage_limit', event.target.value)}
                                type="number"
                                value={form.data.usage_limit}
                            />
                            <TextField
                                error={form.errors.starts_at}
                                label="Mulai Berlaku"
                                onChange={(event) => form.setData('starts_at', event.target.value)}
                                type="datetime-local"
                                value={form.data.starts_at}
                            />
                            <TextField
                                error={form.errors.ends_at}
                                label="Berakhir Pada"
                                onChange={(event) => form.setData('ends_at', event.target.value)}
                                type="datetime-local"
                                value={form.data.ends_at}
                            />
                        </div>
                        <TextAreaField
                            error={form.errors.description}
                            label="Deskripsi"
                            onChange={(event) => form.setData('description', event.target.value)}
                            value={form.data.description}
                        />
                        <CheckboxField
                            checked={form.data.is_published}
                            error={form.errors.is_published}
                            label="Voucher dipublikasikan"
                            onChange={(event) => form.setData('is_published', event.target.checked)}
                        />
                        <button
                            className="rounded-full bg-[#1E4D3A] px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={form.processing}
                            type="submit"
                        >
                            Simpan Voucher
                        </button>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminVouchersTambah.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminVouchersTambah;
