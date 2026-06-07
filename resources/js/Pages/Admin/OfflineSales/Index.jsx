import { Head, Link, useForm } from '@inertiajs/react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', { currency: 'IDR', maximumFractionDigits: 0, style: 'currency' }).format(Number(value ?? 0));
}

function formatDateTime(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
}

function formatDateTimeInput(value = new Date()) {
    return new Date(value).toISOString().slice(0, 16);
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function readableLabel(value) {
    return String(value ?? '-').replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
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

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div>
            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E4D3A]">{eyebrow}</p>
            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{title}</h2>
            {description && <p className="mt-1 font-body-sm text-sm leading-6 text-gray-500">{description}</p>}
        </div>
    );
}

function SummaryRow({ label, value, strong = false }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="font-body-sm text-sm text-gray-500">{label}</span>
            <span className={`${strong ? 'font-body-lg text-xl' : 'font-body-sm text-sm'} font-extrabold text-[#333333]`}>{value}</span>
        </div>
    );
}

function OfflineSalePosForm({ products, customerProfiles, leads, fieldStaff, events, sources }) {
    const form = useForm({
        customer_profile_id: '',
        lead_id: '',
        field_staff_id: '',
        event_id: '',
        source: 'offline',
        customer_name: '',
        customer_whatsapp_number: '',
        notes: '',
        sold_at: formatDateTimeInput(),
        items: [{ row_id: crypto.randomUUID(), product_id: '', quantity: 1 }],
    });

    const estimatedItems = form.data.items.map((item) => {
        const product = products.find((entry) => String(entry.id) === String(item.product_id));
        const quantity = Number(item.quantity ?? 0);
        const unitPrice = Number(product?.price ?? 0);

        return { ...item, lineTotal: unitPrice * quantity, product, quantity, unitPrice };
    });
    const estimatedTotal = estimatedItems.reduce((total, item) => total + item.lineTotal, 0);
    const estimatedQuantity = estimatedItems.reduce((total, item) => total + Number(item.quantity || 0), 0);

    function updateItem(index, key, value) {
        form.setData('items', form.data.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
    }

    function addItem() {
        form.setData('items', [...form.data.items, { row_id: crypto.randomUUID(), product_id: '', quantity: 1 }]);
    }

    function removeItem(index) {
        if (form.data.items.length > 1) {
            form.setData('items', form.data.items.filter((_, itemIndex) => itemIndex !== index));
        }
    }

    function submit(event) {
        event.preventDefault();
        form.post(route('admin.offline-sales.store'));
    }

    return (
        <form className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]" onSubmit={submit}>
            <div className="space-y-5">
                <AdminCard className="p-5">
                    <SectionHeading description="Lengkapi sumber transaksi, waktu jual, data customer, dan relasi CRM bila tersedia." eyebrow="Data Transaksi" title="Input Offline Sale" />
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SelectField error={form.errors.source} label="Sumber" name="source" onChange={(event) => form.setData('source', event.target.value)} value={form.data.source}>
                            {sources.map((source) => <option key={source} value={source}>{readableLabel(source)}</option>)}
                        </SelectField>
                        <TextField error={form.errors.sold_at} label="Tanggal Terjual" name="sold_at" onChange={(event) => form.setData('sold_at', event.target.value)} type="datetime-local" value={form.data.sold_at} />
                        <TextField error={form.errors.customer_name} label="Nama Customer" name="customer_name" onChange={(event) => form.setData('customer_name', event.target.value)} value={form.data.customer_name} />
                        <TextField error={form.errors.customer_whatsapp_number} label="Customer WhatsApp" name="customer_whatsapp_number" onChange={(event) => form.setData('customer_whatsapp_number', event.target.value)} value={form.data.customer_whatsapp_number} />
                        <SelectField error={form.errors.customer_profile_id} label="Profil Customer" name="customer_profile_id" onChange={(event) => form.setData('customer_profile_id', event.target.value)} value={form.data.customer_profile_id}>
                            <option value="">Tidak terhubung</option>
                            {customerProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.lead_id} label="Lead" name="lead_id" onChange={(event) => form.setData('lead_id', event.target.value)} value={form.data.lead_id}>
                            <option value="">Tidak terhubung</option>
                            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.field_staff_id} label="Staff Lapangan" name="field_staff_id" onChange={(event) => form.setData('field_staff_id', event.target.value)} value={form.data.field_staff_id}>
                            <option value="">Belum ditugaskan</option>
                            {fieldStaff.map((staff) => <option key={staff.id} value={staff.id}>{staff.name}</option>)}
                        </SelectField>
                        <SelectField error={form.errors.event_id} label="Event" name="event_id" onChange={(event) => form.setData('event_id', event.target.value)} value={form.data.event_id}>
                            <option value="">Tidak dari event</option>
                            {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
                        </SelectField>
                        <div className="md:col-span-2">
                            <TextAreaField error={form.errors.notes} label="Catatan" name="notes" onChange={(event) => form.setData('notes', event.target.value)} value={form.data.notes} />
                        </div>
                    </div>
                </AdminCard>
                <AdminCard className="overflow-hidden p-5">
                    <div className="rounded-3xl bg-[#A8C5B3]/20 p-5">
                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E4D3A]">Catatan Kalkulasi</p>
                        <p className="mt-2 font-body-sm text-sm leading-6 text-gray-600">Estimasi di halaman ini hanya membantu kasir/admin. Saat disimpan, server tetap menghitung ulang unit price, line total, total transaksi, dan stok dari database.</p>
                    </div>
                </AdminCard>
            </div>

            <div className="xl:sticky xl:top-24 xl:self-start">
                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] p-5">
                        <SectionHeading description="Pilih produk, atur kuantitas, lalu cek estimasi subtotal sebelum menyimpan." eyebrow="POS Produk" title="Keranjang Offline Sale" />
                    </div>
                    <div className="space-y-4 p-5">
                        {form.data.items.map((item, index) => {
                            const estimate = estimatedItems[index];
                            const product = estimate.product;
                            const itemError = form.errors[`items.${index}.product_id`] ?? form.errors[`items.${index}.quantity`];

                            return (
                                <div className="rounded-3xl border border-[#E5E7EB] bg-[#F6F7F7] p-4" key={item.row_id}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Item {index + 1}</p>
                                            <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{product?.name ?? 'Pilih produk'}</p>
                                        </div>
                                        <button className="rounded-full border border-[#E5E7EB] px-3 py-1.5 font-body-sm text-xs font-bold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40" disabled={form.data.items.length === 1} onClick={() => removeItem(index)} type="button">Hapus</button>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                                        <SelectField error={form.errors[`items.${index}.product_id`]} label="Produk" name={`items[${index}][product_id]`} onChange={(event) => updateItem(index, 'product_id', event.target.value)} value={item.product_id}>
                                            <option value="">Pilih produk</option>
                                            {products.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                                        </SelectField>
                                        <TextField error={form.errors[`items.${index}.quantity`]} label="Qty" name={`items[${index}][quantity]`} onChange={(event) => updateItem(index, 'quantity', event.target.value)} type="number" value={item.quantity} />
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl bg-white px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Harga</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatCurrency(estimate.unitPrice)}</p></div>
                                        <div className="rounded-2xl bg-white px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Line Total</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatCurrency(estimate.lineTotal)}</p></div>
                                        <div className="rounded-2xl bg-white px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Stok</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{product ? `${product.stock_quantity ?? 0} tersedia` : '-'}</p></div>
                                    </div>
                                    {itemError && <FieldError message={itemError} />}
                                </div>
                            );
                        })}
                        <button className="w-full rounded-full border border-dashed border-[#1E4D3A] px-4 py-3 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20" onClick={addItem} type="button">Tambah Item Produk</button>
                    </div>
                    <div className="border-t border-[#E5E7EB] bg-[#F6F7F7] p-5">
                        <div className="space-y-3 rounded-3xl bg-white p-5">
                            <SummaryRow label="Jumlah baris" value={`${form.data.items.length} item`} />
                            <SummaryRow label="Total qty" value={estimatedQuantity} />
                            <SummaryRow label="Subtotal estimasi" value={formatCurrency(estimatedTotal)} strong />
                            <p className="border-t border-[#E5E7EB] pt-3 font-body-sm text-xs leading-5 text-gray-500">Final price/total mengikuti perhitungan server saat submit.</p>
                        </div>
                        <button className="mt-4 w-full rounded-full bg-[#1E4D3A] px-5 py-3 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:cursor-not-allowed disabled:opacity-60" disabled={form.processing} type="submit">Simpan Offline Sale</button>
                    </div>
                </AdminCard>
            </div>
        </form>
    );
}

function OfflineSaleList({ offlineSales }) {
    if (offlineSales.length === 0) {
        return <AdminCard className="p-5"><EmptyState description="Penjualan offline akan tampil di sini setelah dicatat." title="Belum ada offline sale." /></AdminCard>;
    }

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {offlineSales.map((sale) => (
                <AdminCard className="p-5" key={sale.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{sale.sale_number}</p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">{sale.customer_name}</h2>
                            <p className="mt-1 font-body-sm text-sm text-gray-500">{sale.customer_whatsapp_number || '-'}</p>
                        </div>
                        <div className="rounded-2xl bg-[#A8C5B3]/25 px-4 py-2 text-right">
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E4D3A]">Total</p>
                            <p className="font-body-sm text-sm font-bold text-[#333333]">{formatCurrency(sale.total)}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Sumber</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{readableLabel(sale.source)}</p></div>
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Tanggal Terjual</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{formatDateTime(sale.sold_at)}</p></div>
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Staff Lapangan</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{sale.field_staff?.name ?? '-'}</p></div>
                        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3"><p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Event</p><p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">{sale.event?.name ?? '-'}</p></div>
                    </div>
                    <Link className="mt-4 inline-flex rounded-full border border-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" href={route('admin.offline-sales.show', sale.id)}>Lihat Detail</Link>
                </AdminCard>
            ))}
        </div>
    );
}

function AdminOfflineSalesIndex({ offlineSales = [], products = [], customerProfiles = [], leads = [], fieldStaff = [], events = [], sources = [] }) {
    const metrics = {
        total: offlineSales.length,
        revenue: offlineSales.reduce((total, sale) => total + Number(sale.total ?? 0), 0),
        events: offlineSales.filter((sale) => sale.source === 'event').length,
        doorToDoor: offlineSales.filter((sale) => sale.source === 'door_to_door').length,
    };

    function scrollToSection(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <>
            <Head title="Admin Penjualan Offline" />
            <div className="space-y-8">
                <AdminPageHeader description="Catat penjualan offline langsung dari halaman ini, lalu pantau transaksi event, door to door, dan penjualan langsung." eyebrow="Commerce / Penjualan Offline" title="Penjualan Offline" />
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button className="inline-flex items-center justify-center rounded-full bg-[#1E4D3A] px-5 py-3 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]" onClick={() => scrollToSection('pos-offline-sale')} type="button">
                        Ke POS Penjualan
                    </button>
                    <button className="inline-flex items-center justify-center rounded-full border border-[#1E4D3A] px-5 py-3 font-body-sm text-sm font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white" onClick={() => scrollToSection('riwayat-offline-sale')} type="button">
                        Ke Riwayat Penjualan
                    </button>
                </div>
                <section id="pos-offline-sale" className="scroll-mt-24">
                    <OfflineSalePosForm customerProfiles={customerProfiles} events={events} fieldStaff={fieldStaff} leads={leads} products={products} sources={sources} />
                </section>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard helper="Seluruh transaksi offline" icon="O" label="Total Penjualan" tone="forest" value={formatNumber(metrics.total)} />
                    <MetricCard helper="Akumulasi total transaksi" icon="R" label="Revenue" tone="sage" value={formatCurrency(metrics.revenue)} />
                    <MetricCard helper="Transaksi dari event" icon="E" label="Penjualan Event" tone="blue" value={formatNumber(metrics.events)} />
                    <MetricCard helper="Transaksi door to door" icon="D" label="Door to Door" tone="brown" value={formatNumber(metrics.doorToDoor)} />
                </div>
                <section id="riwayat-offline-sale" className="space-y-4 scroll-mt-24">
                    <SectionHeading description="Riwayat transaksi terbaru tetap tampil di halaman yang sama setelah input POS." eyebrow="Riwayat" title="Daftar Offline Sale" />
                    <OfflineSaleList offlineSales={offlineSales} />
                </section>
            </div>
        </>
    );
}

AdminOfflineSalesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOfflineSalesIndex;
