import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import {
    DetailRow,
    SelectField,
    TextAreaField,
    TextField,
} from '@/Components/Admin/FormFields';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import FieldLayout from '@/Layouts/FieldLayout';
import {
    formatDateTime,
    formatDateTimeInput,
    readableLabel,
    relationName,
} from '@/utils/format';

export default function FieldLeadsShow({ lead, activityTypes = [], leadStatuses = [] }) {
    const activities = lead.field_activities ?? [];
    const statusForm = useForm({
        follow_up_status: lead.follow_up_status ?? 'new',
    });
    const activityForm = useForm({
        activity_type: 'follow_up',
        activity_at: formatDateTimeInput(),
        notes: '',
        follow_up_status: '',
    });

    function submitStatus(event) {
        event.preventDefault();
        statusForm.patch(route('field.leads.status.update', lead.id), {
            preserveScroll: true,
        });
    }

    function submitActivity(event) {
        event.preventDefault();
        activityForm.post(route('field.leads.activities.store', lead.id), {
            preserveScroll: true,
            onSuccess: () => {
                activityForm.reset('notes', 'follow_up_status');
                activityForm.setData('activity_at', formatDateTimeInput());
                activityForm.setData('activity_type', 'follow_up');
            },
        });
    }

    return (
        <FieldLayout>
            <Head title={`Lead · ${lead.name}`} />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <Link
                            className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                            href={route('field.leads.index')}
                        >
                            Kembali
                        </Link>
                    )}
                    description="Detail lead yang ditugaskan, perbarui status follow-up, dan catat aktivitas lapangan."
                    eyebrow="Field Staff / Lead"
                    title={lead.name}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        helper="Status follow-up saat ini"
                        icon="S"
                        label="Status"
                        tone="forest"
                        value={readableLabel(lead.follow_up_status)}
                    />
                    <MetricCard
                        helper="Sumber lead"
                        icon="L"
                        label="Sumber"
                        tone="blue"
                        value={relationName(lead.lead_source)}
                    />
                    <MetricCard
                        helper="Event terkait"
                        icon="E"
                        label="Event"
                        tone="sage"
                        value={relationName(lead.event)}
                    />
                    <MetricCard
                        helper="Aktivitas tercatat"
                        icon="A"
                        label="Aktivitas"
                        tone="brown"
                        value={activities.length}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AdminCard className="p-5">
                        <div className="mb-4">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Lead
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Ringkasan Lead
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailRow label="Nama">{lead.name}</DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge status={lead.follow_up_status} />
                            </DetailRow>
                            <DetailRow label="WhatsApp">{lead.whatsapp_number}</DetailRow>
                            <DetailRow label="Sumber Lead">{relationName(lead.lead_source)}</DetailRow>
                            <DetailRow label="Profil Customer">{relationName(lead.customer_profile)}</DetailRow>
                            <DetailRow label="Event">{relationName(lead.event)}</DetailRow>
                            <div className="sm:col-span-2">
                                <DetailRow label="Alamat">{lead.address}</DetailRow>
                            </div>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5">
                        <div className="mb-4">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Catatan
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Minat & Keluhan
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <DetailRow label="Catatan Produk Diminati">
                                {lead.interested_product_notes}
                            </DetailRow>
                            <DetailRow label="Catatan Layanan Diminati">
                                {lead.interested_service_notes}
                            </DetailRow>
                            <DetailRow label="Keluhan Awal">{lead.initial_complaint}</DetailRow>
                            <DetailRow label="Catatan Internal">{lead.internal_notes}</DetailRow>
                        </div>
                    </AdminCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5">
                        <div className="mb-4">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Status
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Perbarui Status
                            </h2>
                        </div>
                        <form className="space-y-4" onSubmit={submitStatus}>
                            <SelectField
                                error={statusForm.errors.follow_up_status}
                                label="Status Follow-up"
                                name="follow_up_status"
                                onChange={(event) => statusForm.setData('follow_up_status', event.target.value)}
                                value={statusForm.data.follow_up_status}
                            >
                                {leadStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {readableLabel(status)}
                                    </option>
                                ))}
                            </SelectField>
                            <button
                                className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60"
                                disabled={statusForm.processing}
                                type="submit"
                            >
                                Simpan Status
                            </button>
                        </form>
                    </AdminCard>

                    <AdminCard className="p-5 xl:col-span-2">
                        <div className="mb-4">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Aktivitas
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Tambah Aktivitas
                            </h2>
                        </div>
                        <form className="grid grid-cols-1 gap-4 xl:grid-cols-2" onSubmit={submitActivity}>
                            <SelectField
                                error={activityForm.errors.activity_type}
                                label="Jenis Aktivitas"
                                name="activity_type"
                                onChange={(event) => activityForm.setData('activity_type', event.target.value)}
                                value={activityForm.data.activity_type}
                            >
                                {activityTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {readableLabel(type)}
                                    </option>
                                ))}
                            </SelectField>
                            <TextField
                                error={activityForm.errors.activity_at}
                                label="Waktu Aktivitas"
                                name="activity_at"
                                onChange={(event) => activityForm.setData('activity_at', event.target.value)}
                                type="datetime-local"
                                value={activityForm.data.activity_at}
                            />
                            <SelectField
                                error={activityForm.errors.follow_up_status}
                                label="Status Follow-up"
                                name="follow_up_status"
                                onChange={(event) => activityForm.setData('follow_up_status', event.target.value)}
                                value={activityForm.data.follow_up_status}
                            >
                                <option value="">Tidak mengubah status lead</option>
                                {leadStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {readableLabel(status)}
                                    </option>
                                ))}
                            </SelectField>
                            <div className="xl:col-span-2">
                                <TextAreaField
                                    error={activityForm.errors.notes}
                                    label="Catatan"
                                    name="notes"
                                    onChange={(event) => activityForm.setData('notes', event.target.value)}
                                    value={activityForm.data.notes}
                                />
                            </div>
                            <div className="xl:col-span-2">
                                <button
                                    className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-60"
                                    disabled={activityForm.processing}
                                    type="submit"
                                >
                                    Simpan Aktivitas
                                </button>
                            </div>
                        </form>
                    </AdminCard>
                </div>

                <AdminCard className="p-5">
                    <div className="mb-4">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Riwayat
                        </p>
                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                            Aktivitas Lapangan
                        </h2>
                    </div>
                    {activities.length === 0 ? (
                        <EmptyState
                            description="Aktivitas lead akan tampil setelah dicatat."
                            title="Belum ada aktivitas."
                        />
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] p-4"
                                    key={activity.id}
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                                {readableLabel(activity.activity_type)}
                                            </p>
                                            <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                                {formatDateTime(activity.activity_at)}
                                            </p>
                                        </div>
                                        {activity.follow_up_status && (
                                            <StatusBadge status={activity.follow_up_status} />
                                        )}
                                    </div>
                                    <p className="mt-3 whitespace-pre-line font-body-sm text-sm leading-6 text-gray-600">
                                        {activity.notes}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminCard>
            </div>
        </FieldLayout>
    );
}
