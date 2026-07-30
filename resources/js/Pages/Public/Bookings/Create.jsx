import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarCheck, MapPin, MessageCircle, UserRound } from 'lucide-react';

import { EmptyState, formatRupiah, ProductImage, PublicCard, PublicShell, SecondaryLink, serviceVisitOptions, visitTypeLabel } from '@/Components/Public/commerce.jsx';
import { FieldError } from '@/Components/Admin/FormFields';

function selectedInitialService(services, serviceId) {
    return services.find((service) => String(service.id) === String(serviceId)) ?? services[0] ?? null;
}

function ServiceSummaryCard({ service, compact = false }) {
    if (!service) {
        return null;
    }

    if (compact) {
        return (
            <PublicCard className="overflow-hidden lg:hidden">
                <div className="flex gap-4 p-4">
                    <ProductImage alt={service.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" imagePath={service.image_path} />
                    <div className="min-w-0 flex-1">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                            Layanan dipilih
                        </p>
                        <h2 className="mt-1 truncate font-body-md text-base font-extrabold text-primary-container">
                            {service.name}
                        </h2>
                        <p className="mt-1 font-body-sm text-sm font-bold text-primary-container">
                            {formatRupiah(service.price)}
                        </p>
                        <p className="mt-1 font-body-sm text-xs text-on-surface-variant">
                            {visitTypeLabel(service.visit_type)}
                        </p>
                    </div>
                </div>
            </PublicCard>
        );
    }

    return (
        <PublicCard className="hidden overflow-hidden lg:block">
            <ProductImage alt={service.name} className="h-44 w-full" imagePath={service.image_path} />
            <div className="p-6">
                <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    Ringkasan layanan
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                    {visitTypeLabel(service.visit_type)}
                </span>
                <h2 className="mt-3 font-headline-md text-headline-md text-primary-container">{service.name}</h2>
                <p className="mt-3 line-clamp-3 font-body-sm text-sm leading-6 text-on-surface-variant">{service.description}</p>
                <p className="mt-5 font-body-lg text-lg font-extrabold text-primary-container">{formatRupiah(service.price)}</p>
                <Link
                    className="mt-4 inline-flex rounded-full border border-primary-fixed-dim px-4 py-2 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30"
                    href={route('services.show', service.slug)}
                >
                    Lihat detail layanan
                </Link>
            </div>
        </PublicCard>
    );
}

export default function BookingCreate({ customerProfile, services = [], branches = [], staffReferralPrefill = null }) {
    const { selectedBranchId } = usePage().props;
    const searchParams = new URLSearchParams(window.location.search);
    const initialService = selectedInitialService(services, searchParams.get('service_id'));
    const initialVisitOptions = serviceVisitOptions(initialService);
    const hasProfile = Boolean(customerProfile);

    const prefilledBranchId = branches.some((branch) => String(branch.id) === String(selectedBranchId ?? ''))
        ? selectedBranchId
        : '';

    const { data, errors, post, processing, setData } = useForm({
        branch_id: prefilledBranchId || '',
        complaint_notes: '',
        desired_schedule_at: '',
        name: '',
        service_id: initialService?.id ?? '',
        visit_type: initialVisitOptions[0]?.value ?? '',
        whatsapp_number: '',
        staff_ref: staffReferralPrefill?.staff_code ?? '',
    });

    const selectedService = selectedInitialService(services, data.service_id);
    const visitOptions = serviceVisitOptions(selectedService);
    const selectedBranch = branches.find((branch) => String(branch.id) === String(data.branch_id ?? ''));

    function updateService(serviceId) {
        const nextService = selectedInitialService(services, serviceId);
        const nextVisitOptions = serviceVisitOptions(nextService);

        setData((current) => ({
            ...current,
            service_id: serviceId,
            visit_type: nextVisitOptions[0]?.value ?? '',
        }));
    }

    function submit(event) {
        event.preventDefault();

        post(route('bookings.store'));
    }

    return (
        <>
            <Head title="Booking Layanan Phoenix" />
            <div className="space-y-6">
                <section className="rounded-[1.75rem] border border-outline-variant/70 bg-white p-5 shadow-sm shadow-primary-container/5 md:p-6">
                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Booking layanan
                    </p>
                    <h1 className="mt-2 font-headline-xl text-2xl font-bold leading-tight text-primary-container md:text-3xl">
                        Lengkapi detail booking Anda
                    </h1>
                    <p className="mt-2 max-w-2xl font-body-md text-sm leading-6 text-on-surface-variant md:text-body-md">
                        Pilih cabang, jadwal, dan data kontak. Tim Phoenix akan mengonfirmasi via WhatsApp.
                    </p>
                </section>

                {services.length === 0 ? (
                    <EmptyState
                        action={<SecondaryLink href={route('services.index')}>Lihat Katalog Layanan</SecondaryLink>}
                        description="Belum ada layanan aktif yang dapat dibooking saat ini."
                        title="Layanan belum tersedia."
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-5">
                            <ServiceSummaryCard compact service={selectedService} />

                            <PublicCard className="p-5 md:p-7">
                                <h2 className="font-headline-lg text-headline-lg text-primary-container">Detail booking</h2>
                                <p className="mt-1 font-body-sm text-sm text-on-surface-variant">
                                    Lengkapi data di bawah, lalu kirim booking.
                                </p>

                                <form className="mt-6 space-y-5" onSubmit={submit}>
                                    <label className="block">
                                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                            Pilih cabang
                                        </span>
                                        <select
                                            className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                            name="branch_id"
                                            onChange={(event) => setData('branch_id', event.target.value)}
                                            required
                                            value={data.branch_id}
                                        >
                                            <option value="" disabled>
                                                Pilih cabang
                                            </option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedBranch && (
                                            <p className="mt-2 font-body-sm text-xs text-on-surface-variant">
                                                Cabang aktif: {selectedBranch.name}
                                            </p>
                                        )}
                                        <FieldError message={errors.branch_id} />
                                    </label>

                                    <label className="block">
                                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                            Pilih layanan
                                        </span>
                                        <select
                                            className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                            name="service_id"
                                            onChange={(event) => updateService(event.target.value)}
                                            value={data.service_id}
                                        >
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} — {formatRupiah(service.price)}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError message={errors.service_id} />
                                    </label>

                                    {!hasProfile && (
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <label className="block">
                                                <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                                    Nama lengkap
                                                </span>
                                                <input
                                                    className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                                    name="name"
                                                    onChange={(event) => setData('name', event.target.value)}
                                                    value={data.name}
                                                />
                                                <FieldError message={errors.name} />
                                            </label>

                                            <label className="block">
                                                <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                                    Nomor WhatsApp
                                                </span>
                                                <input
                                                    className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                                    name="whatsapp_number"
                                                    onChange={(event) => setData('whatsapp_number', event.target.value)}
                                                    placeholder="08xxxxxxxxxx"
                                                    value={data.whatsapp_number}
                                                />
                                                <FieldError message={errors.whatsapp_number} />
                                            </label>
                                        </div>
                                    )}

                                    <fieldset>
                                        <legend className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                            Tipe kunjungan
                                        </legend>
                                        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {visitOptions.map((option) => (
                                                <label
                                                    className={`flex cursor-pointer items-center gap-3 rounded-3xl border p-4 transition ${
                                                        data.visit_type === option.value
                                                            ? 'border-primary-container bg-primary-fixed/35'
                                                            : 'border-outline-variant bg-white hover:bg-primary-fixed/20'
                                                    }`}
                                                    key={option.value}
                                                >
                                                    <input
                                                        checked={data.visit_type === option.value}
                                                        className="border-outline text-primary-container focus:ring-primary-container"
                                                        name="visit_type"
                                                        onChange={(event) => setData('visit_type', event.target.value)}
                                                        type="radio"
                                                        value={option.value}
                                                    />
                                                    <span className="font-body-sm text-sm font-bold text-primary-container">
                                                        {option.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <FieldError message={errors.visit_type} />
                                    </fieldset>

                                    <label className="block">
                                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                            Jadwal yang diinginkan
                                        </span>
                                        <input
                                            className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                            name="desired_schedule_at"
                                            onChange={(event) => setData('desired_schedule_at', event.target.value)}
                                            type="datetime-local"
                                            value={data.desired_schedule_at}
                                        />
                                        <p className="mt-2 font-body-sm text-xs text-on-surface-variant">
                                            Ini preferensi Anda. Jadwal final dikonfirmasi admin.
                                        </p>
                                        <FieldError message={errors.desired_schedule_at} />
                                    </label>

                                    <label className="block">
                                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                            Keluhan / catatan
                                        </span>
                                        <textarea
                                            className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                            name="complaint_notes"
                                            onChange={(event) => setData('complaint_notes', event.target.value)}
                                            placeholder="Ceritakan keluhan atau kebutuhan Anda secara singkat."
                                            rows="4"
                                            value={data.complaint_notes}
                                        />
                                        <FieldError message={errors.complaint_notes} />
                                    </label>

                                    <label className="block">
                                        <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                                            Kode Referal Staf
                                        </span>
                                        <input
                                            className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm uppercase text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container"
                                            name="staff_ref"
                                            onChange={(event) => setData('staff_ref', event.target.value.toUpperCase())}
                                            placeholder="Contoh: STF-A9K2"
                                            type="text"
                                            value={data.staff_ref ?? ''}
                                        />
                                        <FieldError message={errors.staff_ref} />
                                    </label>

                                    <FieldError message={errors.customer_profile} />

                                    <button
                                        className="inline-flex w-full items-center justify-center rounded-full bg-primary-container px-5 py-3.5 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={processing}
                                        type="submit"
                                    >
                                        <CalendarCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                                        {processing ? 'Mengirim...' : 'Kirim Booking'}
                                    </button>
                                </form>
                            </PublicCard>
                        </div>

                        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                            {hasProfile ? (
                                <PublicCard className="p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary-container">
                                            <UserRound aria-hidden="true" className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                                Profil customer
                                            </p>
                                            <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">
                                                {customerProfile.name}
                                            </h2>
                                            <p className="mt-2 font-body-sm text-sm text-on-surface-variant">
                                                WhatsApp: {customerProfile.whatsapp_number}
                                            </p>
                                            {customerProfile.primary_address && (
                                                <p className="mt-1 font-body-sm text-sm leading-6 text-on-surface-variant">
                                                    {customerProfile.primary_address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </PublicCard>
                            ) : (
                                <PublicCard className="p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary-container">
                                            <UserRound aria-hidden="true" className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                                Booking guest
                                            </p>
                                            <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">
                                                Tanpa akun juga bisa
                                            </h2>
                                            <p className="mt-2 font-body-sm text-sm leading-6 text-on-surface-variant">
                                                Isi nama dan WhatsApp di form. Admin akan menghubungi untuk konfirmasi jadwal.
                                            </p>
                                        </div>
                                    </div>
                                </PublicCard>
                            )}

                            <ServiceSummaryCard service={selectedService} />

                            <PublicCard className="bg-primary-fixed/25 p-5">
                                <div className="flex gap-3">
                                    <MessageCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary-container" />
                                    <div>
                                        <p className="font-body-sm text-sm font-bold text-primary-container">
                                            Konfirmasi via WhatsApp
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm leading-6 text-on-surface-variant">
                                            Setelah booking terkirim, admin Phoenix akan menghubungi Anda untuk memastikan jadwal final.
                                        </p>
                                    </div>
                                </div>
                            </PublicCard>
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}

BookingCreate.layout = (page) => <PublicShell>{page}</PublicShell>;
