import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    MessageCircle,
    RotateCcw,
    UserRound,
} from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    DetailRow,
    FieldError,
    SelectField,
    TextAreaField,
    TextField,
} from '@/Components/Admin/FormFields';
import { adminBranchName, isBranchAdmin, isCentralAdmin, resolveFormBranchId } from '@/utils/adminScope';
import {
    formatDateTime,
    formatDateTimeInput,
    readableLabel,
    relationName,
} from '@/utils/format';

function normalizeWhatsappDigits(value) {
    if (!value) {
        return null;
    }

    let digits = String(value).replace(/\D+/g, '');

    if (!digits) {
        return null;
    }

    if (digits.startsWith('0')) {
        digits = `62${digits.slice(1)}`;
    } else if (!digits.startsWith('62')) {
        digits = `62${digits}`;
    }

    return digits;
}

function leadWhatsappUrl(lead) {
    const digits = normalizeWhatsappDigits(lead.whatsapp_number);

    if (!digits) {
        return null;
    }

    const name = lead.name ?? `Lead #${lead.id}`;
    const status = readableLabel(lead.follow_up_status);
    const message = `Halo ${name}, kami menghubungi Anda dari Phoenix terkait follow-up lead (status: ${status}).`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function nextStepHint(lead) {
    const status = lead.follow_up_status;

    if (status === 'purchased') {
        return 'Lead sudah membeli. Pantau customer terkait dan catat follow-up jika masih ada kebutuhan lanjutan.';
    }

    if (status === 'not_interested') {
        return 'Lead menandai tidak tertarik. Tidak ada aksi prioritas; simpan catatan jika diperlukan.';
    }

    if (status === 'needs_follow_up') {
        return 'Langkah berikutnya: hubungi via WhatsApp, catat hasil follow-up, lalu perbarui status CRM.';
    }

    if (status === 'booking_examination') {
        return 'Langkah berikutnya: pastikan booking/pemeriksaan sudah terjadwal dan update status setelah ada progress.';
    }

    if (status === 'interested') {
        return 'Langkah berikutnya: kualifikasi minat, tawarkan layanan/produk relevan, dan jadwalkan follow-up.';
    }

    return 'Langkah berikutnya: hubungi lead baru, verifikasi minat, lalu update status follow-up.';
}

function SectionHeader({ eyebrow, title, description, action }) {
    return (
        <div className={`mb-4 ${action ? 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between' : ''}`}>
            <div>
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 font-body-sm text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

function StatusPill({ label, children }) {
    return (
        <div className="inline-flex flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm">
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {label}
            </span>
            <div>{children}</div>
        </div>
    );
}

function PrimarySubmitButton({ children, disabled }) {
    return (
        <button
            className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            type="submit"
        >
            {children}
        </button>
    );
}

function StatusOptions({ statuses }) {
    return statuses.map((status) => (
        <option key={status} value={status}>
            {readableLabel(status)}
        </option>
    ));
}

function TextBlock({ label, children }) {
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <p className="mt-2 whitespace-pre-line font-body-sm text-sm leading-6 text-[#333333]">
                {children || '-'}
            </p>
        </div>
    );
}

function AdminLeadShow({
    lead,
    leadStatuses = [],
    leadSources = [],
    users = [],
    customerProfiles = [],
    events = [],
    branches = [],
    defaultBranchId = null,
}) {
    const { auth, branches: sharedBranches = [] } = usePage().props;
    const user = auth?.user;
    const branchOptions = branches.length > 0 ? branches : sharedBranches;
    const lockedBranch = isBranchAdmin(user);
    const title = lead.name ?? `Lead #${lead.id}`;
    const followUps = lead.lead_follow_ups ?? [];
    const chatUrl = leadWhatsappUrl(lead);
    const stepHint = nextStepHint(lead);

    const editForm = useForm({
        branch_id: resolveFormBranchId(user, {
            defaultBranchId,
            branches: branchOptions,
            existingBranchId: lead.branch_id ?? '',
        }) || '',
        assigned_staff_id: lead.assigned_staff_id ?? '',
        customer_profile_id: lead.customer_profile_id ?? '',
        lead_source_id: lead.lead_source_id ?? '',
        event_id: lead.event_id ?? '',
        name: lead.name ?? '',
        whatsapp_number: lead.whatsapp_number ?? '',
        address: lead.address ?? '',
        interested_product_notes: lead.interested_product_notes ?? '',
        interested_service_notes: lead.interested_service_notes ?? '',
        initial_complaint: lead.initial_complaint ?? '',
        follow_up_status: lead.follow_up_status ?? 'new',
        internal_notes: lead.internal_notes ?? '',
    });
    const statusForm = useForm({ follow_up_status: lead.follow_up_status ?? 'new' });
    const followUpForm = useForm({
        status: lead.follow_up_status ?? 'new',
        notes: '',
        followed_up_at: formatDateTimeInput(new Date()),
    });

    function submitEdit(event) {
        event.preventDefault();
        editForm.patch(route('admin.leads.update', lead.id), { preserveScroll: true });
    }

    function submitStatus(event) {
        event.preventDefault();
        statusForm.patch(route('admin.leads.status.update', lead.id), { preserveScroll: true });
    }

    function submitFollowUp(event) {
        event.preventDefault();
        followUpForm.post(route('admin.leads.follow-ups.store', lead.id), {
            preserveScroll: true,
            onSuccess: () => {
                followUpForm.setData('notes', '');
                followUpForm.setData('followed_up_at', formatDateTimeInput(new Date()));
            },
        });
    }

    return (
        <>
            <Head title={`Admin ${title}`} />

            <div className="space-y-6">
                <AdminPageHeader
                    action={(
                        <div className="flex flex-wrap items-center gap-2.5">
                            <a
                                className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                                href="#aksi-crm"
                            >
                                Update Status
                            </a>
                            {chatUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 font-body-sm text-sm font-bold text-[#128C7E] transition hover:bg-[#25D366]/20"
                                    href={chatUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageCircle aria-hidden="true" className="h-4 w-4" />
                                    WhatsApp
                                </a>
                            ) : null}
                            <Link
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 font-body-sm text-sm font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                href={route('admin.leads.index')}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    )}
                    description="Kelola detail lead, status CRM, dan histori follow-up dari halaman yang sama."
                    eyebrow="Lead & CRM / Lead"
                    title={title}
                />

                <div className="flex flex-wrap items-stretch gap-2.5">
                    <StatusPill label="Status Follow Up">
                        <StatusBadge status={lead.follow_up_status} />
                    </StatusPill>
                    <StatusPill label="Cabang">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#1E4D3A]">
                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                            {relationName(lead.branch, 'Tanpa cabang')}
                        </span>
                    </StatusPill>
                    <StatusPill label="Sumber">
                        <span className="font-body-sm text-xs font-bold text-[#333333]">
                            {relationName(lead.lead_source, '-')}
                        </span>
                    </StatusPill>
                    <StatusPill label="Staff">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-bold text-[#333333]">
                            <UserRound aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                            {relationName(lead.assigned_staff, 'Belum ditugaskan')}
                        </span>
                    </StatusPill>
                    <StatusPill label="Follow Up">
                        <span className="inline-flex items-center gap-1 font-body-sm text-xs font-extrabold text-[#1E4D3A]">
                            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                            {followUps.length}
                        </span>
                    </StatusPill>
                </div>

                <div className="rounded-2xl border border-[#A8C5B3]/50 bg-[#A8C5B3]/15 px-4 py-3">
                    <p className="font-body-sm text-sm font-medium text-[#1E4D3A]">
                        {stepHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <AdminCard className="p-5 xl:col-span-1">
                        <SectionHeader
                            action={chatUrl ? (
                                <a
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 font-body-sm text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366]/20"
                                    href={chatUrl}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                                    Chat
                                </a>
                            ) : null}
                            eyebrow="Lead"
                            title="Ringkasan Lead"
                        />
                        <div className="grid grid-cols-1 gap-3">
                            <DetailRow label="Nama">{title}</DetailRow>
                            <DetailRow label="Status">
                                <StatusBadge status={lead.follow_up_status} />
                            </DetailRow>
                            <DetailRow label="WhatsApp">{lead.whatsapp_number || '-'}</DetailRow>
                            <DetailRow label="Cabang">{relationName(lead.branch, '-')}</DetailRow>
                            <DetailRow label="Sumber Lead">{relationName(lead.lead_source)}</DetailRow>
                            <DetailRow label="Staff Ditugaskan">{relationName(lead.assigned_staff, 'Belum ditugaskan')}</DetailRow>
                            <DetailRow label="Profil Customer">
                                {lead.customer_profile_id ? (
                                    <Link
                                        className="font-bold text-[#1E4D3A] underline-offset-4 hover:underline"
                                        href={route('admin.customers.show', lead.customer_profile_id)}
                                    >
                                        {relationName(lead.customer_profile, `Customer #${lead.customer_profile_id}`)}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </DetailRow>
                            <DetailRow label="Event">
                                {lead.event_id ? (
                                    <Link
                                        className="font-bold text-[#1E4D3A] underline-offset-4 hover:underline"
                                        href={route('admin.events.show', lead.event_id)}
                                    >
                                        {relationName(lead.event, `Event #${lead.event_id}`)}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </DetailRow>
                            <DetailRow label="Alamat">{lead.address || '-'}</DetailRow>
                        </div>
                    </AdminCard>

                    <AdminCard className="p-5 xl:col-span-1">
                        <SectionHeader eyebrow="Catatan" title="Minat & Keluhan" />
                        <div className="space-y-3">
                            <TextBlock label="Catatan Minat Produk">{lead.interested_product_notes}</TextBlock>
                            <TextBlock label="Catatan Minat Layanan">{lead.interested_service_notes}</TextBlock>
                            <TextBlock label="Keluhan Awal">{lead.initial_complaint}</TextBlock>
                            <TextBlock label="Catatan Internal">{lead.internal_notes}</TextBlock>
                        </div>
                    </AdminCard>

                    <div className="space-y-6 scroll-mt-24 xl:col-span-1" id="aksi-crm">
                        <AdminCard className="border-[#1E4D3A]/15 p-5 shadow-sm shadow-[#1E4D3A]/5">
                            <SectionHeader
                                description="Ubah status follow-up CRM lead."
                                eyebrow="Status"
                                title="Perbarui Status"
                            />
                            <form className="space-y-4" onSubmit={submitStatus}>
                                <SelectField
                                    error={statusForm.errors.follow_up_status}
                                    label="Status Follow Up"
                                    name="follow_up_status"
                                    onChange={(event) => statusForm.setData('follow_up_status', event.target.value)}
                                    value={statusForm.data.follow_up_status}
                                >
                                    <StatusOptions statuses={leadStatuses} />
                                </SelectField>
                                <PrimarySubmitButton disabled={statusForm.processing}>
                                    Simpan Status
                                </PrimarySubmitButton>
                            </form>
                        </AdminCard>

                        <AdminCard className="p-5">
                            <SectionHeader
                                description="Catat hasil kontak terbaru dengan lead."
                                eyebrow="Follow Up"
                                title="Tambah Follow Up"
                            />
                            <form className="space-y-4" onSubmit={submitFollowUp}>
                                <SelectField
                                    error={followUpForm.errors.status}
                                    label="Status"
                                    name="status"
                                    onChange={(event) => followUpForm.setData('status', event.target.value)}
                                    value={followUpForm.data.status}
                                >
                                    <StatusOptions statuses={leadStatuses} />
                                </SelectField>
                                <TextField
                                    error={followUpForm.errors.followed_up_at}
                                    label="Waktu Follow Up"
                                    name="followed_up_at"
                                    onChange={(event) => followUpForm.setData('followed_up_at', event.target.value)}
                                    type="datetime-local"
                                    value={followUpForm.data.followed_up_at}
                                />
                                <TextAreaField
                                    error={followUpForm.errors.notes}
                                    label="Catatan"
                                    name="notes"
                                    onChange={(event) => followUpForm.setData('notes', event.target.value)}
                                    value={followUpForm.data.notes}
                                />
                                <PrimarySubmitButton disabled={followUpForm.processing}>
                                    Simpan Follow Up
                                </PrimarySubmitButton>
                            </form>
                        </AdminCard>
                    </div>
                </div>

                <AdminCard className="p-5">
                    <SectionHeader
                        description="Field mengikuti validasi backend lead yang sudah ada."
                        eyebrow="Lead"
                        title="Perbarui Lead"
                    />
                    <form className="grid grid-cols-1 gap-4 xl:grid-cols-2" onSubmit={submitEdit}>
                        {lockedBranch ? (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                                    Cabang
                                </p>
                                <p className="mt-1 font-body-sm text-sm font-bold text-gray-700">
                                    {adminBranchName(user, branchOptions) || relationName(lead.branch, 'Cabang Aktif')}
                                </p>
                                <FieldError message={editForm.errors.branch_id} />
                            </div>
                        ) : isCentralAdmin(user) ? (
                            <SelectField
                                error={editForm.errors.branch_id}
                                label="Cabang"
                                name="branch_id"
                                onChange={(event) => editForm.setData('branch_id', event.target.value)}
                                value={editForm.data.branch_id}
                            >
                                <option value="">Pilih cabang (opsional)</option>
                                {branchOptions.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </SelectField>
                        ) : null}

                        <TextField
                            error={editForm.errors.name}
                            label="Nama"
                            name="name"
                            onChange={(event) => editForm.setData('name', event.target.value)}
                            value={editForm.data.name}
                        />
                        <TextField
                            error={editForm.errors.whatsapp_number}
                            label="Nomor WhatsApp"
                            name="whatsapp_number"
                            onChange={(event) => editForm.setData('whatsapp_number', event.target.value)}
                            value={editForm.data.whatsapp_number}
                        />
                        <SelectField
                            error={editForm.errors.lead_source_id}
                            label="Sumber Lead"
                            name="lead_source_id"
                            onChange={(event) => editForm.setData('lead_source_id', event.target.value)}
                            value={editForm.data.lead_source_id}
                        >
                            <option value="">Pilih sumber lead</option>
                            {leadSources.map((source) => (
                                <option key={source.id} value={source.id}>{source.name}</option>
                            ))}
                        </SelectField>
                        <SelectField
                            error={editForm.errors.follow_up_status}
                            label="Status Follow Up"
                            name="follow_up_status"
                            onChange={(event) => editForm.setData('follow_up_status', event.target.value)}
                            value={editForm.data.follow_up_status}
                        >
                            <StatusOptions statuses={leadStatuses} />
                        </SelectField>
                        <SelectField
                            error={editForm.errors.assigned_staff_id}
                            label="Staff Ditugaskan"
                            name="assigned_staff_id"
                            onChange={(event) => editForm.setData('assigned_staff_id', event.target.value)}
                            value={editForm.data.assigned_staff_id}
                        >
                            <option value="">Belum ditugaskan</option>
                            {users.map((staff) => (
                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                            ))}
                        </SelectField>
                        <SelectField
                            error={editForm.errors.customer_profile_id}
                            label="Profil Customer"
                            name="customer_profile_id"
                            onChange={(event) => editForm.setData('customer_profile_id', event.target.value)}
                            value={editForm.data.customer_profile_id}
                        >
                            <option value="">Tidak terhubung</option>
                            {customerProfiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>{profile.name}</option>
                            ))}
                        </SelectField>
                        <SelectField
                            error={editForm.errors.event_id}
                            label="Event"
                            name="event_id"
                            onChange={(event) => editForm.setData('event_id', event.target.value)}
                            value={editForm.data.event_id}
                        >
                            <option value="">Tidak dari event</option>
                            {events.map((eventItem) => (
                                <option key={eventItem.id} value={eventItem.id}>{eventItem.name}</option>
                            ))}
                        </SelectField>
                        <TextAreaField
                            error={editForm.errors.address}
                            label="Alamat"
                            name="address"
                            onChange={(event) => editForm.setData('address', event.target.value)}
                            value={editForm.data.address}
                        />
                        <TextAreaField
                            error={editForm.errors.interested_product_notes}
                            label="Catatan Minat Produk"
                            name="interested_product_notes"
                            onChange={(event) => editForm.setData('interested_product_notes', event.target.value)}
                            value={editForm.data.interested_product_notes}
                        />
                        <TextAreaField
                            error={editForm.errors.interested_service_notes}
                            label="Catatan Minat Layanan"
                            name="interested_service_notes"
                            onChange={(event) => editForm.setData('interested_service_notes', event.target.value)}
                            value={editForm.data.interested_service_notes}
                        />
                        <TextAreaField
                            error={editForm.errors.initial_complaint}
                            label="Keluhan Awal"
                            name="initial_complaint"
                            onChange={(event) => editForm.setData('initial_complaint', event.target.value)}
                            value={editForm.data.initial_complaint}
                        />
                        <TextAreaField
                            error={editForm.errors.internal_notes}
                            label="Catatan Internal"
                            name="internal_notes"
                            onChange={(event) => editForm.setData('internal_notes', event.target.value)}
                            value={editForm.data.internal_notes}
                        />
                        <div className="xl:col-span-2">
                            <PrimarySubmitButton disabled={editForm.processing}>
                                Simpan Lead
                            </PrimarySubmitButton>
                        </div>
                    </form>
                </AdminCard>

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4">
                        <SectionHeader
                            description="Riwayat kontak dan update status lead."
                            eyebrow="CRM"
                            title="Riwayat Follow Up"
                        />
                    </div>
                    {followUps.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Follow-up lead akan tampil di sini setelah dicatat."
                                title="Belum ada follow-up."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Status', 'Catatan', 'Staff', 'Waktu Follow Up'].map((heading) => (
                                            <th
                                                className="px-4 py-3 text-left font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500"
                                                key={heading}
                                                scope="col"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                                    {followUps.map((followUp) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={followUp.id}>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge status={followUp.status} />
                                            </td>
                                            <td className="px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {followUp.notes || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {relationName(followUp.user)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-[#1E4D3A]" />
                                                    {formatDateTime(followUp.followed_up_at)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminLeadShow.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLeadShow;
