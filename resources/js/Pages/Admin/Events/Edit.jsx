import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';

function formatInputDate(value) {
    return value ? String(value).slice(0, 10) : '';
}

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

function TextField({ error, label, name, onChange, type = 'text', value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <input className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} type={type} value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <textarea className="mt-2 block min-h-32 w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

function CheckboxField({ checked, error, label, onChange }) {
    return (
        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] p-4">
            <input checked={checked} className="mt-1 rounded border-[#A8C5B3] text-[#1E4D3A] focus:ring-[#1E4D3A]" onChange={onChange} type="checkbox" />
            <span>
                <span className="block font-body-sm text-sm font-bold text-[#333333]">{label}</span>
                <span className="mt-1 block font-body-sm text-xs text-gray-500">Nonaktifkan jika event tidak perlu muncul sebagai event aktif meskipun periodenya berjalan.</span>
                <FieldError message={error} />
            </span>
        </label>
    );
}

function AdminEventEdit({ event }) {
    const form = useForm({
        name: event.name ?? '',
        start_date: formatInputDate(event.start_date),
        end_date: formatInputDate(event.end_date),
        location: event.location ?? '',
        organizer: event.organizer ?? '',
        notes: event.notes ?? '',
        is_active: Boolean(event.is_active),
    });

    function submit(submitEvent) {
        submitEvent.preventDefault();
        form.patch(route('admin.events.update', event.id));
    }

    return (
        <>
            <Head title={`Edit ${event.name}`} />
            <div className="space-y-8">
                <AdminPageHeader action={<Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.events.show', event.id)}>Kembali</Link>} description="Perbarui informasi event untuk kebutuhan tracking lead dan penjualan offline." eyebrow="CRM & Field / Event" title={`Edit ${event.name}`} />
                <AdminCard className="p-5">
                    <form className="space-y-4" onSubmit={submit}>
                        <TextField error={form.errors.name} label="Nama" name="name" onChange={(changeEvent) => form.setData('name', changeEvent.target.value)} value={form.data.name} />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextField error={form.errors.start_date} label="Tanggal Mulai" name="start_date" onChange={(changeEvent) => form.setData('start_date', changeEvent.target.value)} type="date" value={form.data.start_date} />
                            <TextField error={form.errors.end_date} label="Tanggal Selesai" name="end_date" onChange={(changeEvent) => form.setData('end_date', changeEvent.target.value)} type="date" value={form.data.end_date} />
                        </div>
                        <TextField error={form.errors.location} label="Lokasi" name="location" onChange={(changeEvent) => form.setData('location', changeEvent.target.value)} value={form.data.location} />
                        <TextField error={form.errors.organizer} label="Organizer" name="organizer" onChange={(changeEvent) => form.setData('organizer', changeEvent.target.value)} value={form.data.organizer} />
                        <TextAreaField error={form.errors.notes} label="Catatan" name="notes" onChange={(changeEvent) => form.setData('notes', changeEvent.target.value)} value={form.data.notes} />
                        <CheckboxField checked={form.data.is_active} error={form.errors.is_active} label="Aktif" onChange={(changeEvent) => form.setData('is_active', changeEvent.target.checked)} />
                        <button className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60" disabled={form.processing} type="submit">Simpan Event</button>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminEventEdit.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminEventEdit;
