import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { StaffFormFields } from './FormFields';

function AdminStaffCreate({
    positions = [],
    teams = [],
    branches = [],
    defaultBranchId = null,
}) {
    const isBranchLocked = Boolean(defaultBranchId);
    const [photoPreview, setPhotoPreview] = useState(null);

    const form = useForm({
        name: '',
        email: '',
        phone_number: '',
        team_id: '',
        position_id: '',
        branch_id: defaultBranchId || '',
        password: '',
        photo: null,
    });

    const branchDisplayName =
        branches?.find((b) => String(b.id) === String(form.data.branch_id))?.name || 'Cabang Aktif';

    function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        form.setData('photo', file);
        setPhotoPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        form.post(route('admin.staff.store'));
    }

    return (
        <>
            <Head title="Tambah Staff" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('admin.staff.index')}
                        >
                            Kembali
                        </Link>
                    }
                    description="Tambahkan staff lapangan untuk penjualan offline, lead, dan penugasan cabang."
                    eyebrow="Sistem / Staff"
                    title="Tambah Staff Lapangan"
                />

                <AdminCard className="p-5 md:p-6">
                    <form className="space-y-6" onSubmit={submit}>
                        <StaffFormFields
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            positions={positions}
                            teams={teams}
                            branches={branches}
                            photoPreview={photoPreview}
                            onPhotoChange={handlePhotoChange}
                            isBranchLocked={isBranchLocked}
                            branchDisplayName={branchDisplayName}
                            isEdit={false}
                        />

                        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
                            <button
                                className="rounded-full bg-[#1E4D3A] px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={form.processing}
                                type="submit"
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Staff'}
                            </button>
                            <Link
                                className="rounded-full border border-[#E5E7EB] px-5 py-2.5 font-body-sm text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                                href={route('admin.staff.index')}
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

AdminStaffCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminStaffCreate;
