import { Head, Link, useForm, usePage } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FieldError,
    SelectField,
    TextAreaField,
    TextField,
} from '@/Components/Admin/FormFields';
import { adminBranchName, isBranchAdmin, isCentralAdmin, resolveFormBranchId } from '@/utils/adminScope';
import { readableLabel } from '@/utils/format';

function AdminLeadTambah({
    leadSources = [],
    users = [],
    customerProfiles = [],
    events = [],
    leadStatuses = [],
    branches = [],
    defaultBranchId = null,
}) {
    const { auth, branches: sharedBranches = [] } = usePage().props;
    const user = auth?.user;
    const branchOptions = branches.length > 0 ? branches : sharedBranches;
    const lockedBranch = isBranchAdmin(user);
    const initialBranchId = resolveFormBranchId(user, {
        defaultBranchId,
        branches: branchOptions,
    });

    const form = useForm({
        branch_id: initialBranchId || '',
        assigned_staff_id: '',
        customer_profile_id: '',
        lead_source_id: '',
        event_id: '',
        name: '',
        whatsapp_number: '',
        address: '',
        interested_product_notes: '',
        interested_service_notes: '',
        initial_complaint: '',
        follow_up_status: 'new',
        internal_notes: '',
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.leads.store'));
    }

    return (
        <>
            <Head title="Tambah Lead" />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.leads.index')}>Kembali</Link>} description="Tambahkan prospek baru ke pipeline CRM Phoenix." eyebrow="Lead & CRM / Lead" title="Tambah Lead" />
                <AdminCard className="p-5">
                    <form className="grid grid-cols-1 gap-4 xl:grid-cols-2" onSubmit={submit}>
                        {lockedBranch ? (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Cabang</p>
                                <p className="mt-1 font-body-sm text-sm font-bold text-gray-700">
                                    {adminBranchName(user, branchOptions) || 'Cabang Aktif'}
                                </p>
                                <FieldError message={form.errors.branch_id} />
                            </div>
                        ) : isCentralAdmin(user) ? (
                            <SelectField
                                error={form.errors.branch_id}
                                label="Cabang"
                                name="branch_id"
                                onChange={(event) => form.setData('branch_id', event.target.value)}
                                value={form.data.branch_id}
                            >
                                <option value="">Pilih cabang (opsional)</option>
                                {branchOptions.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </SelectField>
                        ) : null}
                        <TextField error={form.errors.name} label="Nama" name="name" onChange={(event) => form.setData('name', event.target.value)} value={form.data.name} />
                        <TextField error={form.errors.whatsapp_number} label="Nomor WhatsApp" name="whatsapp_number" onChange={(event) => form.setData('whatsapp_number', event.target.value)} value={form.data.whatsapp_number} />
                        <SelectField error={form.errors.lead_source_id} label="Sumber Lead" name="lead_source_id" onChange={(event) => form.setData('lead_source_id', event.target.value)} value={form.data.lead_source_id}><option value="">Pilih sumber lead</option>{leadSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</SelectField>
                        <SelectField error={form.errors.follow_up_status} label="Status Follow Up" name="follow_up_status" onChange={(event) => form.setData('follow_up_status', event.target.value)} value={form.data.follow_up_status}>{leadStatuses.map((status) => <option key={status} value={status}>{readableLabel(status)}</option>)}</SelectField>
                        <SelectField error={form.errors.assigned_staff_id} label="Staff Ditugaskan" name="assigned_staff_id" onChange={(event) => form.setData('assigned_staff_id', event.target.value)} value={form.data.assigned_staff_id}><option value="">Belum ditugaskan</option>{users.map((staff) => <option key={staff.id} value={staff.id}>{staff.name}</option>)}</SelectField>
                        <SelectField error={form.errors.customer_profile_id} label="Profil Customer" name="customer_profile_id" onChange={(event) => form.setData('customer_profile_id', event.target.value)} value={form.data.customer_profile_id}><option value="">Tidak terhubung</option>{customerProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</SelectField>
                        <SelectField error={form.errors.event_id} label="Event" name="event_id" onChange={(event) => form.setData('event_id', event.target.value)} value={form.data.event_id}><option value="">Tidak dari event</option>{events.map((eventItem) => <option key={eventItem.id} value={eventItem.id}>{eventItem.name}</option>)}</SelectField>
                        <TextAreaField error={form.errors.address} label="Alamat" name="address" onChange={(event) => form.setData('address', event.target.value)} value={form.data.address} />
                        <TextAreaField error={form.errors.interested_product_notes} label="Catatan Minat Produk" name="interested_product_notes" onChange={(event) => form.setData('interested_product_notes', event.target.value)} value={form.data.interested_product_notes} />
                        <TextAreaField error={form.errors.interested_service_notes} label="Catatan Minat Layanan" name="interested_service_notes" onChange={(event) => form.setData('interested_service_notes', event.target.value)} value={form.data.interested_service_notes} />
                        <TextAreaField error={form.errors.initial_complaint} label="Keluhan Awal" name="initial_complaint" onChange={(event) => form.setData('initial_complaint', event.target.value)} value={form.data.initial_complaint} />
                        <TextAreaField error={form.errors.internal_notes} label="Catatan Internal" name="internal_notes" onChange={(event) => form.setData('internal_notes', event.target.value)} value={form.data.internal_notes} />
                        <div className="xl:col-span-2"><button className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60" disabled={form.processing} type="submit">Simpan Lead</button></div>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminLeadTambah.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadTambah;
