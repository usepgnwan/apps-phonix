import { Head, Link } from '@inertiajs/react';
import { Edit3, UserRound } from 'lucide-react';

import CustomerCard from '@/Components/Customer/CustomerCard';
import CustomerDetailRow from '@/Components/Customer/CustomerDetailRow';
import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import CustomerLayout from '@/Layouts/CustomerLayout';

export default function CustomerProfileShow({ customerProfile }) {
    const title = customerProfile?.name ?? 'Profil Customer';

    return (
        <>
            <Head title="Profil Customer" />

            <div className="space-y-8">
                <CustomerPageHeader
                    action={(
                        <Link
                            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 font-body-sm text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary"
                            href={route('customer.profile.edit')}
                        >
                            <Edit3 aria-hidden="true" className="h-4 w-4" />
                            Edit Profil
                        </Link>
                    )}
                    description="Data ini dipakai Phoenix untuk menghubungi Anda dan menyiapkan layanan atau pengiriman dengan lebih rapi."
                    eyebrow="Profil Customer"
                    icon={UserRound}
                    title={title}
                />

                <CustomerCard className="p-5">
                    <CustomerSectionHeader eyebrow="Data Kontak" title="Informasi Utama" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <CustomerDetailRow label="Nama">{customerProfile?.name}</CustomerDetailRow>
                        <CustomerDetailRow label="WhatsApp">{customerProfile?.whatsapp_number}</CustomerDetailRow>
                        <CustomerDetailRow className="md:col-span-2" label="Alamat Utama">{customerProfile?.primary_address}</CustomerDetailRow>
                    </div>
                </CustomerCard>
            </div>
        </>
    );
}

CustomerProfileShow.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
