import { Head, Link } from '@inertiajs/react';
import { Edit3, UserRound } from 'lucide-react';

import CustomerPageHeader from '@/Components/Customer/CustomerPageHeader';
import CustomerSectionHeader from '@/Components/Customer/CustomerSectionHeader';
import { DetailRow } from '@/Components/Panel/FormFields';
import PanelCard from '@/Components/Panel/PanelCard';
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
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-[#1E4D3A]/20 transition hover:bg-[#163B2C]"
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

                <PanelCard className="p-5">
                    <CustomerSectionHeader eyebrow="Data Kontak" title="Informasi Utama" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <DetailRow label="Nama">{customerProfile?.name}</DetailRow>
                        <DetailRow label="WhatsApp">{customerProfile?.whatsapp_number}</DetailRow>
                        <DetailRow className="md:col-span-2" label="Alamat Utama">{customerProfile?.primary_address}</DetailRow>
                    </div>
                </PanelCard>
            </div>
        </>
    );
}

CustomerProfileShow.layout = (page) => <CustomerLayout>{page}</CustomerLayout>;
