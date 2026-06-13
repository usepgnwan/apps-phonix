import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminLayout from '@/Layouts/AdminLayout';

function FieldError({ message }) {
    return message ? <p className="mt-1 font-body-sm text-xs text-red-700">{message}</p> : null;
}

const defaultOrderTemplate = `
<p class="ql-align-center"><strong>Phoenix Herbal</strong></p>
<p class="ql-align-center">Struk Penjualan</p>
<p><br></p>
<p>No. Nota : [order]</p>
<p>Tanggal : [tanggal]</p>
<p>Pelanggan : [nama]</p>
<p>Kasir : [kasir]</p>
<p><br></p>
<p>[items]</p>
<p><br></p>
<p><strong>TOTAL Rp [total]</strong></p>
<p><br></p>
<p class="ql-align-center">Terima Kasih</p>
<p class="ql-align-center">Barang yang sudah dibeli</p>
<p class="ql-align-center">tidak dapat dikembalikan.</p>
`;

export default function Index({ settings }) {
    const form = useForm({
        order_template: settings.order_template || defaultOrderTemplate,
        receipt_email: settings.receipt_email || '',
        whatsapp_number: settings.whatsapp_number || '',
    });

    function submit(e) {
        e.preventDefault();
        form.post(route('admin.settings.update'));
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            [{ 'align': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    return (
        <>
            <Head title="Pengaturan Sistem" />
            <div className="space-y-6">
                <AdminPageHeader
                    title="Pengaturan Sistem"
                    eyebrow="Sistem / Pengaturan"
                    description="Kelola pengaturan dasar sistem dan template pesanan."
                />

                <form onSubmit={submit} className="space-y-6">
                    <AdminCard className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Umum</h3>
                        
                        <div className="mb-4 max-w-xl">
                            <label htmlFor="receipt_email" className="block text-sm font-semibold text-gray-700 mb-1">
                                Email Tujuan Receipt
                            </label>
                            <input
                                id="receipt_email"
                                type="email"
                                value={form.data.receipt_email}
                                onChange={(e) => form.setData('receipt_email', e.target.value)}
                                className="block w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 font-body-sm text-sm transition focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                placeholder="contoh: struk@phoenix.local"
                            />
                            <FieldError message={form.errors.receipt_email} />
                        </div>

                        <div className="mb-4 max-w-xl">
                            <label htmlFor="whatsapp_number" className="block text-sm font-semibold text-gray-700 mb-1">
                                Nomor WhatsApp (Tombol Floating)
                            </label>
                            <input
                                id="whatsapp_number"
                                type="text"
                                inputMode="tel"
                                value={form.data.whatsapp_number}
                                onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                className="block w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 font-body-sm text-sm transition focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                                placeholder="contoh: 6281234567890"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Gunakan format internasional tanpa tanda <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">+</code>. Awalan <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">0</code> akan otomatis diganti dengan <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">62</code>.
                            </p>
                            <FieldError message={form.errors.whatsapp_number} />
                        </div>
                    </AdminCard>

                    <AdminCard className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Template Pesanan / Struk</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Gunakan tag dinamis seperti <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">[order]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">[tanggal]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">[nama]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">[kasir]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">[items]</code>, dan <code className="bg-gray-100 px-1 py-0.5 rounded text-[#1E4D3A] font-mono">[total]</code> yang akan otomatis diubah oleh sistem.
                        </p>
                        
                        <div className="mb-4">
                            <ReactQuill 
                                theme="snow" 
                                value={form.data.order_template} 
                                onChange={(content) => form.setData('order_template', content)} 
                                modules={modules}
                                className="bg-white [&_.ql-container]:min-h-[300px] [&_.ql-editor]:min-h-[300px]"
                            />
                            <FieldError message={form.errors.order_template} />
                        </div>
                    </AdminCard>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-2xl bg-[#1E4D3A] px-6 py-3 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625] disabled:opacity-50"
                        >
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;
