import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarCheck, Lock, MapPin, UserRound } from 'lucide-react';

import { EmptyState, formatRupiah, PrimaryLink, ProductImage, PublicCard, PublicShell, SecondaryLink, serviceVisitOptions, visitTypeLabel } from '@/Components/Public/commerce.jsx';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-error">{message}</p> : null;
}

function selectedInitialService(services, serviceId) {
    return services.find((service) => String(service.id) === String(serviceId)) ?? services[0] ?? null;
}

export default function BookingCreate({ customerProfile, services = [] }) {
    const searchParams = new URLSearchParams(window.location.search);
    const initialService = selectedInitialService(services, searchParams.get('service_id'));
    const initialVisitOptions = serviceVisitOptions(initialService);
    const hasProfile = Boolean(customerProfile);
    const { data, errors, post, processing, setData } = useForm({
        complaint_notes: '',
        desired_schedule_at: '',
        name: '',
        service_id: initialService?.id ?? '',
        visit_type: initialVisitOptions[0]?.value ?? '',
        whatsapp_number: '',
    });
    const selectedService = selectedInitialService(services, data.service_id);
    const visitOptions = serviceVisitOptions(selectedService);

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
            <div className="space-y-8">
                <section className="rounded-[2rem] border border-outline-variant/70 bg-white p-8 shadow-sm shadow-primary-container/5 md:p-10">
                    <p className="font-label-sm text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">Booking Layanan</p>
                    <h1 className="mt-3 font-headline-xl text-4xl font-bold leading-tight text-primary-container md:text-5xl">Atur jadwal terapi Phoenix Anda.</h1>
                    <p className="mt-4 max-w-3xl font-body-md text-body-md text-on-surface-variant">Lengkapi pilihan layanan, tipe kunjungan, dan keluhan utama. Tim Phoenix akan mengonfirmasi jadwal melalui WhatsApp.</p>
                </section>

                {services.length === 0 ? (
                    <EmptyState action={<SecondaryLink href={route('services.index')}>Lihat Katalog Layanan</SecondaryLink>} description="Belum ada layanan aktif yang dapat dibooking saat ini." title="Layanan belum tersedia." />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                        <PublicCard className="p-6 md:p-8">
                            <h2 className="font-headline-lg text-headline-lg text-primary-container">Detail Booking</h2>
                            <form className="mt-6 space-y-5" onSubmit={submit}>
                                <label className="block">
                                    <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Pilih Layanan</span>
                                    <select className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name="service_id" onChange={(event) => updateService(event.target.value)} value={data.service_id}>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - {formatRupiah(service.price)}
                                            </option>
                                        ))}
                                    </select>
                                    <FieldError message={errors.service_id} />
                                </label>

                                {!hasProfile && (
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <label className="block">
                                            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Nama Lengkap</span>
                                            <input className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name="name" onChange={(event) => setData('name', event.target.value)} value={data.name} />
                                            <FieldError message={errors.name} />
                                        </label>

                                        <label className="block">
                                            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Nomor WhatsApp</span>
                                            <input className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name="whatsapp_number" onChange={(event) => setData('whatsapp_number', event.target.value)} placeholder="08xxxxxxxxxx" value={data.whatsapp_number} />
                                            <FieldError message={errors.whatsapp_number} />
                                        </label>
                                    </div>
                                )}

                                <fieldset>
                                    <legend className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Tipe Kunjungan</legend>
                                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {visitOptions.map((option) => (
                                            <label className={`flex cursor-pointer items-center gap-3 rounded-3xl border p-4 transition ${data.visit_type === option.value ? 'border-primary-container bg-primary-fixed/35' : 'border-outline-variant bg-white hover:bg-primary-fixed/20'}`} key={option.value}>
                                                <input checked={data.visit_type === option.value} className="border-outline text-primary-container focus:ring-primary-container" name="visit_type" onChange={(event) => setData('visit_type', event.target.value)} type="radio" value={option.value} />
                                                <span className="font-body-sm text-sm font-bold text-primary-container">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <FieldError message={errors.visit_type} />
                                </fieldset>

                                <label className="block">
                                    <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Jadwal yang Diinginkan</span>
                                    <input className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name="desired_schedule_at" onChange={(event) => setData('desired_schedule_at', event.target.value)} type="datetime-local" value={data.desired_schedule_at} />
                                    <FieldError message={errors.desired_schedule_at} />
                                </label>

                                <label className="block">
                                    <span className="font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Keluhan / Catatan</span>
                                    <textarea className="mt-2 block w-full rounded-2xl border-outline-variant bg-white font-body-sm text-sm text-on-surface shadow-sm focus:border-primary-container focus:ring-primary-container" name="complaint_notes" onChange={(event) => setData('complaint_notes', event.target.value)} rows="6" value={data.complaint_notes} />
                                    <FieldError message={errors.complaint_notes} />
                                </label>

                                <FieldError message={errors.customer_profile} />
                                <button className="inline-flex w-full items-center justify-center rounded-full bg-primary-container px-5 py-3 font-label-md text-sm font-bold text-white shadow-sm shadow-primary-container/20 transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={processing} type="submit">
                                    <CalendarCheck aria-hidden="true" className="mr-2 h-4 w-4" />
                                    Kirim Booking
                                </button>
                            </form>
                        </PublicCard>

                        <aside className="space-y-5">
                            {hasProfile ? (
                                <PublicCard className="p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary-container">
                                            <UserRound aria-hidden="true" className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Profil Customer</p>
                                            <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">{customerProfile.name}</h2>
                                            <p className="mt-2 font-body-sm text-sm text-on-surface-variant">WhatsApp: {customerProfile.whatsapp_number}</p>
                                            <p className="mt-1 font-body-sm text-sm leading-6 text-on-surface-variant">{customerProfile.primary_address}</p>
                                        </div>
                                    </div>
                                </PublicCard>
                            ) : (
                                <PublicCard className="p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary-container">
                                            <UserRound aria-hidden="true" className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="font-label-sm text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Booking Guest</p>
                                            <h2 className="mt-2 font-headline-md text-headline-md text-primary-container">Tanpa akun juga bisa booking.</h2>
                                            <p className="mt-2 font-body-sm text-sm leading-6 text-on-surface-variant">Isi nama dan WhatsApp pada form. Admin Phoenix akan menghubungi untuk konfirmasi jadwal.</p>
                                        </div>
                                    </div>
                                </PublicCard>
                            )}

                            {selectedService && (
                                <PublicCard className="overflow-hidden">
                                    <ProductImage alt={selectedService.name} className="h-44 w-full" imagePath={selectedService.image_path} />
                                    <div className="p-6">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-fixed-dim bg-primary-fixed/25 px-3 py-1.5 font-body-sm text-xs font-bold text-primary-container">
                                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                                            {visitTypeLabel(selectedService.visit_type)}
                                        </span>
                                        <h2 className="mt-3 font-headline-md text-headline-md text-primary-container">{selectedService.name}</h2>
                                        <p className="mt-3 line-clamp-3 font-body-sm text-sm leading-6 text-on-surface-variant">{selectedService.description}</p>
                                        <p className="mt-5 font-body-lg text-lg font-extrabold text-primary-container">{formatRupiah(selectedService.price)}</p>
                                        <Link className="mt-4 inline-flex rounded-full border border-primary-fixed-dim px-4 py-2 font-body-sm text-xs font-bold text-primary-container transition hover:bg-primary-fixed/30" href={route('services.show', selectedService.slug)}>
                                            Lihat detail layanan
                                        </Link>
                                    </div>
                                </PublicCard>
                            )}

                            <PublicCard className="bg-primary-fixed/25 p-5">
                                <div className="flex gap-3">
                                    <Lock aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary-container" />
                                    <p className="font-body-sm text-sm leading-6 text-on-surface-variant">Validasi final tetap dilakukan server, termasuk layanan aktif, jadwal masa depan, dan tipe kunjungan yang didukung layanan.</p>
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
