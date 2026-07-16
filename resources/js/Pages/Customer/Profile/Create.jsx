import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Sprout } from 'lucide-react';

import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import { SubmitButton, TextAreaField, TextField } from '@/Components/Panel/FormFields';
import PanelCard from '@/Components/Panel/PanelCard';
import CustomerLayout from '@/Layouts/CustomerLayout';

export default function CustomerProfileCreate() {
    const form = useForm({
        name: '',
        primary_address: '',
        whatsapp_number: '',
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('customer.profile.store'));
    }

    return (
        <>
            <Head title="Lengkapi Profil Customer" />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full border border-[#1E4D3A] bg-white px-4 py-2 text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href="/"
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Beranda
                        </Link>
                    )}
                    description="Lengkapi data dasar agar dashboard customer, order, dan booking Phoenix bisa disiapkan khusus untuk Anda."
                    eyebrow="Mulai Ruang Customer"
                    icon={Sprout}
                    title="Lengkapi Profil Anda"
                />

                <PanelCard className="p-5">
                    <CustomerSectionHeader eyebrow="Form Profil" title="Data yang Dibutuhkan" description="Phoenix hanya meminta nama, nomor WhatsApp, dan alamat utama untuk tahap ini." />
                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                error={form.errors.name}
                                label="Nama"
                                name="name"
                                onChange={(event) => form.setData('name', event.target.value)}
                                value={form.data.name}
                            />
                            <TextField
                                error={form.errors.whatsapp_number}
                                label="Nomor WhatsApp"
                                name="whatsapp_number"
                                onChange={(event) => form.setData('whatsapp_number', event.target.value)}
                                value={form.data.whatsapp_number}
                            />
                        </div>
                        <TextAreaField
                            error={form.errors.primary_address}
                            label="Alamat Utama"
                            name="primary_address"
                            onChange={(event) => form.setData('primary_address', event.target.value)}
                            value={form.data.primary_address}
                        />
                        <SubmitButton disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Profil'}
                        </SubmitButton>
                    </form>
                </PanelCard>
            </div>
        </>
    );
}

CustomerProfileCreate.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
