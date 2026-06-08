import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';

function FieldError({ message }) { return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null; }
function TextField({ error, label, name, onChange, value }) { return <label className="block"><span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span><input className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''} /><FieldError message={error} /></label>; }
function CheckboxField({ checked, error, label, onChange }) { return <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><input checked={checked} className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]" onChange={onChange} type="checkbox" /><span><span className="block font-body-sm text-sm font-bold text-[#333333]">{label}</span><span className="block font-body-sm text-xs text-gray-500">Sumber aktif dapat dipakai saat membuat lead.</span><FieldError message={error} /></span></label>; }

function AdminLeadSumbersEdit({ leadSource }) {
    const form = useForm({ name: leadSource.name ?? '', slug: leadSource.slug ?? '', is_active: Boolean(leadSource.is_active) });
    function submit(event) { event.preventDefault(); form.patch(route('admin.lead-sources.update', leadSource.id)); }
    return <><Head title={`Edit ${leadSource.name}`} /><div className="space-y-8"><AdminPageHeader action={<Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.lead-sources.show', leadSource.id)}>Kembali</Link>} description="Perbarui nama, slug, dan status aktif lead source." eyebrow="Lead & CRM / Sumber Lead" title={`Edit ${leadSource.name}`} /><AdminCard className="p-5"><form className="space-y-4" onSubmit={submit}><TextField error={form.errors.name} label="Nama" name="name" onChange={(event) => form.setData('name', event.target.value)} value={form.data.name} /><TextField error={form.errors.slug} label="Slug" name="slug" onChange={(event) => form.setData('slug', event.target.value)} value={form.data.slug} /><CheckboxField checked={form.data.is_active} error={form.errors.is_active} label="Aktif" onChange={(event) => form.setData('is_active', event.target.checked)} /><button className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60" disabled={form.processing} type="submit">Simpan Sumber</button></form></AdminCard></div></>;
}

AdminLeadSumbersEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadSumbersEdit;
