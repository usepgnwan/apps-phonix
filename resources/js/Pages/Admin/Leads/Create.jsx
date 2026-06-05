import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';

function readableLabel(value) {
    return String(value ?? 'Tidak diketahui').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

function TextField({ error, label, name, onChange, value }) {
    return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><input className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''} /><FieldError message={error} /></label>;
}

function SelectField({ children, error, label, name, onChange, value }) {
    return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><select className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''}>{children}</select><FieldError message={error} /></label>;
}

function TextAreaField({ error, label, name, onChange, value }) {
    return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><textarea className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} rows="4" value={value ?? ''} /><FieldError message={error} /></label>;
}

function AdminLeadTambah({ leadSources = [], users = [], customerProfiles = [], events = [], leadStatuses = [] }) {
    const form = useForm({ assigned_staff_id: '', customer_profile_id: '', lead_source_id: '', event_id: '', name: '', whatsapp_number: '', address: '', interested_product_notes: '', interested_service_notes: '', initial_complaint: '', follow_up_status: 'new', internal_notes: '' });

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
                        <TextField error={form.errors.name} label="Nama" name="name" onChange={(event) => form.setData('name', event.target.value)} value={form.data.name} />
                        <TextField error={form.errors.whatsapp_number} label="Nomor WhatsApp" name="whatsapp_number" onChange={(event) => form.setData('whatsapp_number', event.target.value)} value={form.data.whatsapp_number} />
                        <SelectField error={form.errors.lead_source_id} label="Sumber Lead" name="lead_source_id" onChange={(event) => form.setData('lead_source_id', event.target.value)} value={form.data.lead_source_id}><option value="">Pilih sumber lead</option>{leadSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</SelectField>
                        <SelectField error={form.errors.follow_up_status} label="Status Follow Up" name="follow_up_status" onChange={(event) => form.setData('follow_up_status', event.target.value)} value={form.data.follow_up_status}>{leadStatuses.map((status) => <option key={status} value={status}>{readableLabel(status)}</option>)}</SelectField>
                        <SelectField error={form.errors.assigned_staff_id} label="Staff Ditugaskan" name="assigned_staff_id" onChange={(event) => form.setData('assigned_staff_id', event.target.value)} value={form.data.assigned_staff_id}><option value="">Belum ditugaskan</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</SelectField>
                        <SelectField error={form.errors.customer_profile_id} label="Profil Customer" name="customer_profile_id" onChange={(event) => form.setData('customer_profile_id', event.target.value)} value={form.data.customer_profile_id}><option value="">Tidak terhubung</option>{customerProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</SelectField>
                        <SelectField error={form.errors.event_id} label="Event" name="event_id" onChange={(event) => form.setData('event_id', event.target.value)} value={form.data.event_id}><option value="">Tidak dari event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</SelectField>
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
