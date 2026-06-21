import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';

function bookingLabel(booking) {
    return [booking.booking_number, booking.customer_profile?.name, booking.service?.name].filter(Boolean).join(' / ') || `Booking #${booking.id}`;
}

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

function SelectField({ children, error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <select className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} value={value ?? ''}>
                {children}
            </select>
            <FieldError message={error} />
        </label>
    );
}

function TextAreaField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <textarea className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} rows="4" value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

function TextField({ error, label, name, onChange, value }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <input className="mt-2 block w-full rounded-2xl border-[#E5E7EB] font-body-sm text-sm text-[#333333] shadow-sm focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} type="text" value={value ?? ''} />
            <FieldError message={error} />
        </label>
    );
}

function FileField({ error, fileName, label, name, onChange }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
            <input accept="application/pdf" className="mt-2 block w-full rounded-2xl border border-[#E5E7EB] bg-white font-body-sm text-sm text-[#333333] shadow-sm file:mr-4 file:border-0 file:bg-[#1E4D3A] file:px-4 file:py-3 file:font-body-sm file:text-sm file:font-bold file:text-white focus:border-[#1E4D3A] focus:ring-[#1E4D3A]" name={name} onChange={onChange} type="file" />
            <p className="mt-1 font-body-sm text-xs text-gray-500">{fileName || 'PDF opsional, maksimal 10MB.'}</p>
            <FieldError message={error} />
        </label>
    );
}

function AdminPemeriksaanCreate({ bookings = [], customerProfiles = [], fieldStaff = [], products = [] }) {
    const form = useForm({ customer_mode: 'registered', customer_profile_id: '', guest_name: '', guest_whatsapp_number: '', guest_address: '', booking_id: '', service_type: '', assigned_staff_id: '', complaint: '', result: '', result_pdf: null, internal_recommendation: '', product_recommendations: [] });
    const isGuest = form.data.customer_mode === 'guest';
    const filteredBookings = bookings.filter((booking) => !form.data.customer_profile_id || String(booking.customer_profile_id) === String(form.data.customer_profile_id));
    const selectedFileName = form.data.result_pdf?.name;

    function updateRecommendation(rowId, key, value) {
        form.setData('product_recommendations', form.data.product_recommendations.map((item) => item.row_id === rowId ? { ...item, [key]: value } : item));
    }

    function addRecommendation() {
        form.setData('product_recommendations', [...form.data.product_recommendations, { row_id: crypto.randomUUID(), product_id: '', notes: '' }]);
    }

    function removeRecommendation(rowId) {
        form.setData('product_recommendations', form.data.product_recommendations.filter((item) => item.row_id !== rowId));
    }

    function submit(event) {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            customer_profile_id: data.customer_mode === 'guest' ? null : data.customer_profile_id,
            booking_id: data.booking_id || null,
            assigned_staff_id: data.assigned_staff_id || null,
            product_recommendations: data.product_recommendations
                .filter((item) => item.product_id)
                .map(({ product_id, notes }) => ({ product_id, notes })),
        }));

        form.post(route('admin.examinations.store'), { forceFormData: true });
    }

    return (
        <>
            <Head title="Tambah Pemeriksaan" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={<Link className="rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.examinations.index')}>Kembali</Link>}
                    description="Catat hasil pemeriksaan dan rekomendasi produk dari halaman POS pemeriksaan terpisah."
                    eyebrow="Booking & Customer / Pemeriksaan"
                    title="Tambah Pemeriksaan"
                />
                <AdminCard className="p-5">
                    <div className="mb-5">
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">POS Pemeriksaan</p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">Input Pemeriksaan Baru</h2>
                            <p className="mt-1 font-body-sm text-sm text-gray-500">Pilih customer terdaftar atau guest/walk-in, lalu catat hasil pemeriksaan.</p>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div className="xl:col-span-2">
                                <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Tipe Customer</span>
                                <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#F6F7F7] p-1">
                                    <button className={`rounded-xl px-4 py-2 font-body-sm text-sm font-bold transition ${!isGuest ? 'bg-[#1E4D3A] text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`} onClick={() => form.setData((data) => ({ ...data, customer_mode: 'registered', guest_name: '', guest_whatsapp_number: '', guest_address: '' }))} type="button">Customer Terdaftar</button>
                                    <button className={`rounded-xl px-4 py-2 font-body-sm text-sm font-bold transition ${isGuest ? 'bg-[#1E4D3A] text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`} onClick={() => form.setData((data) => ({ ...data, customer_mode: 'guest', customer_profile_id: '', booking_id: '' }))} type="button">Guest / Walk-in</button>
                                </div>
                                <FieldError message={form.errors.customer_mode} />
                            </div>
                            {isGuest ? (
                                <>
                                    <TextField error={form.errors.guest_name} label="Nama Guest" name="guest_name" onChange={(event) => form.setData('guest_name', event.target.value)} value={form.data.guest_name} />
                                    <TextField error={form.errors.guest_whatsapp_number} label="Nomor WhatsApp Guest" name="guest_whatsapp_number" onChange={(event) => form.setData('guest_whatsapp_number', event.target.value)} value={form.data.guest_whatsapp_number} />
                                    <TextAreaField error={form.errors.guest_address} label="Alamat Guest" name="guest_address" onChange={(event) => form.setData('guest_address', event.target.value)} value={form.data.guest_address} />
                                </>
                            ) : (
                                <>
                                    <SelectField error={form.errors.customer_profile_id} label="Profil Customer" name="customer_profile_id" onChange={(event) => form.setData((data) => ({ ...data, customer_profile_id: event.target.value, booking_id: '' }))} value={form.data.customer_profile_id}>
                                        <option value="">Pilih customer</option>
                                        {customerProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                                    </SelectField>
                                    <SelectField error={form.errors.booking_id} label="Booking" name="booking_id" onChange={(event) => form.setData('booking_id', event.target.value)} value={form.data.booking_id}>
                                        <option value="">Tidak terhubung booking</option>
                                        {filteredBookings.map((booking) => <option key={booking.id} value={booking.id}>{bookingLabel(booking)}</option>)}
                                    </SelectField>
                                </>
                            )}
                            <TextField error={form.errors.service_type} label="Jenis Layanan" name="service_type" onChange={(event) => form.setData('service_type', event.target.value)} value={form.data.service_type} />
                            <SelectField error={form.errors.assigned_staff_id} label="Staff Bertugas" name="assigned_staff_id" onChange={(event) => form.setData('assigned_staff_id', event.target.value)} value={form.data.assigned_staff_id}>
                                <option value="">Belum ditugaskan</option>
                                {fieldStaff.map((staff) => <option key={staff.id} value={staff.id}>{staff.name}</option>)}
                            </SelectField>
                            <TextAreaField error={form.errors.complaint} label="Keluhan" name="complaint" onChange={(event) => form.setData('complaint', event.target.value)} value={form.data.complaint} />
                            <TextAreaField error={form.errors.result} label="Hasil" name="result" onChange={(event) => form.setData('result', event.target.value)} value={form.data.result} />
                            <FileField error={form.errors.result_pdf} fileName={selectedFileName} label="Upload Hasil PDF" name="result_pdf" onChange={(event) => form.setData('result_pdf', event.target.files?.[0] ?? null)} />
                            <TextAreaField error={form.errors.internal_recommendation} label="Rekomendasi Internal" name="internal_recommendation" onChange={(event) => form.setData('internal_recommendation', event.target.value)} value={form.data.internal_recommendation} />
                        </div>

                        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F6F7F7] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="font-body-md text-sm font-extrabold text-[#333333]">Rekomendasi Produk</h3>
                                    <p className="mt-1 font-body-sm text-xs text-gray-500">Opsional, hanya menyimpan rekomendasi. Tidak membuat order atau mengurangi stok.</p>
                                </div>
                                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" onClick={addRecommendation} type="button">
                                    <Plus aria-hidden="true" className="h-4 w-4" /> Tambah Produk
                                </button>
                            </div>
                            {form.data.product_recommendations.length === 0 ? (
                                <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-body-sm text-sm text-gray-500">Belum ada produk direkomendasikan.</p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {form.data.product_recommendations.map((item) => (
                                        <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-3 lg:grid-cols-[1fr_1fr_auto]" key={item.row_id}>
                                            <SelectField error={form.errors[`product_recommendations.${form.data.product_recommendations.indexOf(item)}.product_id`]} label="Produk" name="product_id" onChange={(event) => updateRecommendation(item.row_id, 'product_id', event.target.value)} value={item.product_id}>
                                                <option value="">Pilih produk</option>
                                                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                                            </SelectField>
                                            <TextAreaField error={form.errors[`product_recommendations.${form.data.product_recommendations.indexOf(item)}.notes`]} label="Catatan" name="notes" onChange={(event) => updateRecommendation(item.row_id, 'notes', event.target.value)} value={item.notes} />
                                            <button className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 px-4 font-body-sm text-sm font-bold text-red-700 transition hover:bg-red-50" onClick={() => removeRecommendation(item.row_id)} type="button">
                                                <Trash2 aria-hidden="true" className="h-4 w-4" /> Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button className="rounded-full bg-[#1E4D3A] px-5 py-3 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60" disabled={form.processing} type="submit">
                                Simpan Pemeriksaan
                            </button>
                        </div>
                    </form>
                </AdminCard>
            </div>
        </>
    );
}

AdminPemeriksaanCreate.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPemeriksaanCreate;
