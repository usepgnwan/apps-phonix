import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import IndonesiaAddressFields, {
    composeIndonesiaAddress,
} from '@/Components/IndonesiaAddressFields';
import AdminLayout from '@/Layouts/AdminLayout';
import { FieldError, TextField, TextAreaField } from '@/Components/Admin/FormFields';

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
                <span className="block font-body-sm text-sm font-bold text-[#333333]">{label}</span>
                <span className="mt-1 block font-body-sm text-xs text-gray-500">
                    Cabang aktif dapat dipilih di transaksi, booking, dan stok produk.
                </span>
                <FieldError message={error} />
            </span>
        </label>
    );
}

function AdminBranchesEdit({ branch }) {
    // Alamat lama disimpan sebagai string utuh; taruh di detail agar tetap terbaca saat edit.
    const [addressDetail, setAddressDetail] = useState(branch.address ?? '');
    const form = useForm({
        name: branch.name ?? '',
        code: branch.code ?? '',
        address: branch.address ?? '',
        phone_number: branch.phone_number ?? '',
        description: branch.description ?? '',
        is_active: Boolean(branch.is_active),
    });

    function handleAddressChange({ detail, composed }) {
        setAddressDetail(detail);
        form.setData('address', composed);
    }

    function submit(event) {
        event.preventDefault();

        const composedAddress =
            form.data.address ||
            composeIndonesiaAddress({
                detail: addressDetail,
                village: '',
                district: '',
                city: '',
                province: '',
            });

        form.transform((data) => ({
            ...data,
            address: composedAddress,
        }));
        form.put(route('admin.branches.update', branch.id));
    }

    return (
        <>
            <Head title={`Edit ${branch.name}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.branches.index')}
                        >
                            Kembali
                        </Link>
                    }
                    description="Perbarui data lokasi cabang, kontak, dan status aktif."
                    eyebrow="Sistem / Cabang"
                    title={`Edit ${branch.name}`}
                />

                <AdminCard className="p-5 md:p-6">
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                error={form.errors.name}
                                label="Nama Cabang"
                                name="name"
                                onChange={(event) => form.setData('name', event.target.value)}
                                value={form.data.name}
                            />
                            <TextField
                                error={form.errors.code}
                                label="Kode Cabang (maks. 10 karakter)"
                                name="code"
                                onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                                value={form.data.code}
                            />
                        </div>

                        <TextField
                            error={form.errors.phone_number}
                            label="Nomor Telepon"
                            name="phone_number"
                            onChange={(event) => form.setData('phone_number', event.target.value)}
                            value={form.data.phone_number}
                        />

                        <div>
                            <p className="mb-3 font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                                Alamat Cabang
                            </p>
                            {branch.address ? (
                                <p className="mb-4 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 font-body-sm text-sm text-gray-600">
                                    Alamat tersimpan saat ini:{' '}
                                    <span className="font-semibold text-[#333333]">{branch.address}</span>
                                    . Pilih ulang wilayah di bawah jika ingin memperbarui struktur alamat.
                                </p>
                            ) : null}
                            <IndonesiaAddressFields
                                detail={addressDetail}
                                disabled={form.processing}
                                error={form.errors.address}
                                onChange={handleAddressChange}
                            />
                        </div>

                        <TextAreaField
                            error={form.errors.description}
                            label="Deskripsi / Catatan Internal"
                            name="description"
                            onChange={(event) => form.setData('description', event.target.value)}
                            rows={3}
                            value={form.data.description}
                        />

                        <CheckboxField
                            checked={form.data.is_active}
                            error={form.errors.is_active}
                            label="Cabang Aktif"
                            onChange={(event) => form.setData('is_active', event.target.checked)}
                        />

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                className="rounded-full bg-[#1E4D3A] px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={form.processing}
                                type="submit"
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                            <Link
                                className="rounded-full border border-[#E5E7EB] px-5 py-2.5 font-body-sm text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                                href={route('admin.branches.index')}
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminBranchesEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminBranchesEdit;
