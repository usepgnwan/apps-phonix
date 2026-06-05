import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit3 } from 'lucide-react';

import CustomerCard from '@/Components/Customer/CustomerCard';
import { CustomerSubmitButton, CustomerTextAreaField, CustomerTextField } from '@/Components/Customer/CustomerFormFields';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import CustomerLayout from '@/Layouts/CustomerLayout';

export default function CustomerProfileEdit({ customerProfile }) {
    const form = useForm({
        name: customerProfile?.name ?? '',
        primary_address: customerProfile?.primary_address ?? '',
        whatsapp_number: customerProfile?.whatsapp_number ?? '',
    });

    function submit(event) {
        event.preventDefault();
        form.patch(route('customer.profile.update'));
    }

    return (
        <>
            <Head title="Edit Profil Customer" />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-primary-container bg-white px-4 py-2 font-body-sm text-sm font-bold text-primary-container transition hover:bg-primary-container hover:text-white"
                            href={route('customer.profile.show')}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Profil
                        </Link>
                    )}
                    description="Perbarui data kontak yang dipakai untuk koordinasi layanan Phoenix dan pengiriman produk herbal."
                    eyebrow="Edit Profil"
                    icon={Edit3}
                    title="Perbarui Profil Customer"
                />

                <CustomerCard className="p-5">
                    <CustomerSectionHeader eyebrow="Form Profil" title="Informasi Utama" description="Form ini hanya mengubah nama, WhatsApp, dan alamat utama Anda." />
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <CustomerTextField
                                error={form.errors.name}
                                label="Nama"
                                name="name"
                                onChange={(event) => form.setData('name', event.target.value)}
                                value={form.data.name}
                            />
                            <CustomerTextField
                                error={form.errors.whatsapp_number}
                                label="Nomor WhatsApp"
                                name="whatsapp_number"
                                onChange={(event) => form.setData('whatsapp_number', event.target.value)}
                                value={form.data.whatsapp_number}
                            />
                        </div>
                        <CustomerTextAreaField
                            error={form.errors.primary_address}
                            label="Alamat Utama"
                            name="primary_address"
                            onChange={(event) => form.setData('primary_address', event.target.value)}
                            value={form.data.primary_address}
                        />
                        <CustomerSubmitButton disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </CustomerSubmitButton>
                    </form>
                </CustomerCard>
            </div>
        </>
    );
}

CustomerProfileEdit.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
