import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function readableLabel(value) {
    return String(value ?? 'Tidak diketahui').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatDateTimeInput(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
}

function relationName(relation, fallback = '-') {
    return relation?.name ?? fallback;
}

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

function TextField({ error, label, name, onChange, type = 'text', value }) {
    return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><input className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} type={type} value={value ?? ''} /><FieldError message={error} /></label>;
}

function SelectField({ children, error, label, name, onChange, value }) {
    return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><select className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''}>{children}</select><FieldError message={error} /></label>;
}

function TextAreaField({ error, label, name, onChange, value }) {
    return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><textarea className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} rows="4" value={value ?? ''} /><FieldError message={error} /></label>;
}

function DetailRow({ label, children }) {
    return <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p><div className="mt-1 font-body-sm text-sm font-semibold text-[#333333]">{children ?? '-'}</div></div>;
}

function SectionHeader({ eyebrow, title, description }) {
    return <div className="mb-4"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{eyebrow}</p><h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{title}</h2>{description && <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">{description}</p>}</div>;
}

function StatusOptions({ statuses }) {
    return statuses.map((status) => <option key={status} value={status}>{readableLabel(status)}</option>);
}

function AdminLeadShow({ lead, leadStatuses = [], leadSources = [], users = [], customerProfiles = [], events = [] }) {
    const title = lead.name ?? `Lead #${lead.id}`;
    const followUps = lead.lead_follow_ups ?? [];
    const editForm = useForm({ assigned_staff_id: lead.assigned_staff_id ?? '', customer_profile_id: lead.customer_profile_id ?? '', lead_source_id: lead.lead_source_id ?? '', event_id: lead.event_id ?? '', name: lead.name ?? '', whatsapp_number: lead.whatsapp_number ?? '', address: lead.address ?? '', interested_product_notes: lead.interested_product_notes ?? '', interested_service_notes: lead.interested_service_notes ?? '', initial_complaint: lead.initial_complaint ?? '', follow_up_status: lead.follow_up_status ?? 'new', internal_notes: lead.internal_notes ?? '' });
    const statusForm = useForm({ follow_up_status: lead.follow_up_status ?? 'new' });
    const followUpForm = useForm({ status: lead.follow_up_status ?? 'new', notes: '', followed_up_at: formatDateTimeInput(new Date()) });

    function submitEdit(event) { event.preventDefault(); editForm.patch(route('admin.leads.update', lead.id), { preserveScroll: true }); }
    function submitStatus(event) { event.preventDefault(); statusForm.patch(route('admin.leads.status.update', lead.id), { preserveScroll: true }); }
    function submitFollowUp(event) { event.preventDefault(); followUpForm.post(route('admin.leads.follow-ups.store', lead.id), { preserveScroll: true }); }

    return (
        <>
            <Head title={`Admin ${title}`} />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.leads.index')}>Kembali ke Lead</Link>} description="Kelola detail lead, status CRM, dan histori follow-up dari halaman yang sama." eyebrow="Lead & CRM / Lead" title={title} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Status follow-up saat ini" icon="S" label="Status" tone="forest" value={readableLabel(lead.follow_up_status)} />
                    <MetricCard helper="Sumber prospek" icon="L" label="Sumber" tone="blue" value={relationName(lead.lead_source)} />
                    <MetricCard helper="Staff penanggung jawab" icon="A" label="Ditugaskan" tone="sage" value={relationName(lead.assigned_staff, 'Belum ditugaskan')} />
                    <MetricCard helper="Jumlah follow-up" icon="F" label="Follow Up" tone="orange" value={followUps.length} />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5"><SectionHeader eyebrow="Lead" title="Ringkasan Lead" /><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><DetailRow label="Nama">{title}</DetailRow><DetailRow label="Status"><StatusBadge status={lead.follow_up_status} /></DetailRow><DetailRow label="WhatsApp">{lead.whatsapp_number}</DetailRow><DetailRow label="Sumber Lead">{relationName(lead.lead_source)}</DetailRow><DetailRow label="Staff Ditugaskan">{relationName(lead.assigned_staff, 'Belum ditugaskan')}</DetailRow><DetailRow label="Profil Customer">{relationName(lead.customer_profile, '-')}</DetailRow><DetailRow label="Event">{relationName(lead.event, '-')}</DetailRow><DetailRow label="Alamat">{lead.address || '-'}</DetailRow></div></AdminCard>
                    <AdminCard className="p-5"><SectionHeader eyebrow="Catatan" title="Minat & Keluhan" /><div className="space-y-3"><DetailRow label="Catatan Minat Produk">{lead.interested_product_notes || '-'}</DetailRow><DetailRow label="Catatan Minat Layanan">{lead.interested_service_notes || '-'}</DetailRow><DetailRow label="Keluhan Awal">{lead.initial_complaint || '-'}</DetailRow><DetailRow label="Catatan Internal">{lead.internal_notes || '-'}</DetailRow></div></AdminCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5 xl:col-span-2"><SectionHeader eyebrow="Lead" title="Perbarui Lead" description="Field mengikuti validasi backend lead yang sudah ada." /><form className="grid grid-cols-1 gap-4 xl:grid-cols-2" onSubmit={submitEdit}><TextField error={editForm.errors.name} label="Nama" name="name" onChange={(event) => editForm.setData('name', event.target.value)} value={editForm.data.name} /><TextField error={editForm.errors.whatsapp_number} label="Nomor WhatsApp" name="whatsapp_number" onChange={(event) => editForm.setData('whatsapp_number', event.target.value)} value={editForm.data.whatsapp_number} /><SelectField error={editForm.errors.lead_source_id} label="Sumber Lead" name="lead_source_id" onChange={(event) => editForm.setData('lead_source_id', event.target.value)} value={editForm.data.lead_source_id}><option value="">Pilih sumber lead</option>{leadSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</SelectField><SelectField error={editForm.errors.follow_up_status} label="Status Follow Up" name="follow_up_status" onChange={(event) => editForm.setData('follow_up_status', event.target.value)} value={editForm.data.follow_up_status}><StatusOptions statuses={leadStatuses} /></SelectField><SelectField error={editForm.errors.assigned_staff_id} label="Staff Ditugaskan" name="assigned_staff_id" onChange={(event) => editForm.setData('assigned_staff_id', event.target.value)} value={editForm.data.assigned_staff_id}><option value="">Belum ditugaskan</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</SelectField><SelectField error={editForm.errors.customer_profile_id} label="Profil Customer" name="customer_profile_id" onChange={(event) => editForm.setData('customer_profile_id', event.target.value)} value={editForm.data.customer_profile_id}><option value="">Tidak terhubung</option>{customerProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</SelectField><SelectField error={editForm.errors.event_id} label="Event" name="event_id" onChange={(event) => editForm.setData('event_id', event.target.value)} value={editForm.data.event_id}><option value="">Tidak dari event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</SelectField><TextAreaField error={editForm.errors.address} label="Alamat" name="address" onChange={(event) => editForm.setData('address', event.target.value)} value={editForm.data.address} /><TextAreaField error={editForm.errors.interested_product_notes} label="Catatan Minat Produk" name="interested_product_notes" onChange={(event) => editForm.setData('interested_product_notes', event.target.value)} value={editForm.data.interested_product_notes} /><TextAreaField error={editForm.errors.interested_service_notes} label="Catatan Minat Layanan" name="interested_service_notes" onChange={(event) => editForm.setData('interested_service_notes', event.target.value)} value={editForm.data.interested_service_notes} /><TextAreaField error={editForm.errors.initial_complaint} label="Keluhan Awal" name="initial_complaint" onChange={(event) => editForm.setData('initial_complaint', event.target.value)} value={editForm.data.initial_complaint} /><TextAreaField error={editForm.errors.internal_notes} label="Catatan Internal" name="internal_notes" onChange={(event) => editForm.setData('internal_notes', event.target.value)} value={editForm.data.internal_notes} /><div className="xl:col-span-2"><button className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60" disabled={editForm.processing} type="submit">Simpan Lead</button></div></form></AdminCard>
                    <div className="space-y-6"><AdminCard className="p-5"><SectionHeader eyebrow="Status" title="Perbarui Status" /><form className="space-y-4" onSubmit={submitStatus}><SelectField error={statusForm.errors.follow_up_status} label="Status Follow Up" name="follow_up_status" onChange={(event) => statusForm.setData('follow_up_status', event.target.value)} value={statusForm.data.follow_up_status}><StatusOptions statuses={leadStatuses} /></SelectField><button className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60" disabled={statusForm.processing} type="submit">Simpan Status</button></form></AdminCard><AdminCard className="p-5"><SectionHeader eyebrow="Follow Up" title="Tambah Follow Up" /><form className="space-y-4" onSubmit={submitFollowUp}><SelectField error={followUpForm.errors.status} label="Status" name="status" onChange={(event) => followUpForm.setData('status', event.target.value)} value={followUpForm.data.status}><StatusOptions statuses={leadStatuses} /></SelectField><TextField error={followUpForm.errors.followed_up_at} label="Waktu Follow Up" name="followed_up_at" onChange={(event) => followUpForm.setData('followed_up_at', event.target.value)} type="datetime-local" value={followUpForm.data.followed_up_at} /><TextAreaField error={followUpForm.errors.notes} label="Catatan" name="notes" onChange={(event) => followUpForm.setData('notes', event.target.value)} value={followUpForm.data.notes} /><button className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60" disabled={followUpForm.processing} type="submit">Simpan Follow Up</button></form></AdminCard></div>
                </div>

                <AdminCard className="overflow-hidden"><div className="border-b border-[#E5E7EB] px-5 py-4"><SectionHeader eyebrow="CRM" title="Riwayat Follow Up" /></div>{followUps.length === 0 ? <div className="p-5"><EmptyState description="Follow-up lead akan tampil di sini setelah dicatat." title="Belum ada follow-up." /></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-[#E5E7EB]"><thead className="bg-[#F6F7F7]"><tr>{['Status', 'Catatan', 'Staff', 'Waktu Follow Up'].map((heading) => <th className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500" key={heading} scope="col">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#E5E7EB] bg-white">{followUps.map((followUp) => <tr key={followUp.id}><td className="whitespace-nowrap px-4 py-4"><StatusBadge status={followUp.status} /></td><td className="px-4 py-4 font-body-sm text-sm text-gray-600">{followUp.notes}</td><td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{relationName(followUp.user)}</td><td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">{formatDateTime(followUp.followed_up_at)}</td></tr>)}</tbody></table></div>}</AdminCard>
            </div>
        </>
    );
}

AdminLeadShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadShow;
