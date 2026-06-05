import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';

function FieldError({ message }) {
    return message ? (
        <p className="mt-1 font-body-sm text-xs text-red-700">
            {message}
        </p>
    ) : null;
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

function methodTitle(paymentMethod) {
    if (paymentMethod.type === 'qris') {
        return paymentMethod.qris_image_path || 'QRIS';
    }

    return paymentMethod.bank_name || 'Bank Transfer';
}

function AdminPaymentMethodsEdit({ paymentMethod }) {
    const form = useForm({
        type: paymentMethod.type ?? 'bank_transfer',
        bank_name: paymentMethod.bank_name ?? '',
        account_number: paymentMethod.account_number ?? '',
        account_holder_name: paymentMethod.account_holder_name ?? '',
        qris_image_path: paymentMethod.qris_image_path ?? '',
        instructions: paymentMethod.instructions ?? '',
        is_active: Boolean(paymentMethod.is_active),
    });

    function submit(event) {
        event.preventDefault();
        form.put(route('admin.payment-methods.update', paymentMethod.id));
    }

    return (
        <>
            <Head title={`Edit ${methodTitle(paymentMethod)}`} />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.payment-methods.show', paymentMethod.id)}
                        >
                            Detail
                        </Link>
                    )}
                    description="Perbarui field metode pembayaran sesuai validasi backend yang sudah tersedia."
                    eyebrow="Commerce / Metode Pembayaran"
                    title={`Edit ${methodTitle(paymentMethod)}`}
                />
                <AdminCard className="p-5">
                    <form className="space-y-5" onSubmit={submit}>
                        <SelectField
                            error={form.errors.type}
                            label="Tipe"
                            onChange={(event) => form.setData('type', event.target.value)}
                            value={form.data.type}
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="qris">QRIS</option>
                        </SelectField>

                        {form.data.type === 'bank_transfer' && (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <TextField
                                    error={form.errors.bank_name}
                                    label="Nama Bank"
                                    onChange={(event) => form.setData('bank_name', event.target.value)}
                                    value={form.data.bank_name}
                                />
                                <TextField
                                    error={form.errors.account_number}
                                    label="Nomor Rekening"
                                    onChange={(event) => form.setData('account_number', event.target.value)}
                                    value={form.data.account_number}
                                />
                                <TextField
                                    error={form.errors.account_holder_name}
                                    label="Nama Pemilik Rekening"
                                    onChange={(event) => form.setData('account_holder_name', event.target.value)}
                                    value={form.data.account_holder_name}
                                />
                            </div>
                        )}

                        {form.data.type === 'qris' && (
                            <TextField
                                error={form.errors.qris_image_path}
                                label="Path Gambar QRIS"
                                onChange={(event) => form.setData('qris_image_path', event.target.value)}
                                value={form.data.qris_image_path}
                            />
                        )}

                        <TextAreaField
                            error={form.errors.instructions}
                            label="Instruksi"
                            onChange={(event) => form.setData('instructions', event.target.value)}
                            value={form.data.instructions}
                        />
                        <CheckboxField
                            checked={form.data.is_active}
                            error={form.errors.is_active}
                            label="Metode pembayaran aktif"
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

AdminPaymentMethodsEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPaymentMethodsEdit;
