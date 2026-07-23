import { Head, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import { FieldError, SelectField, TextAreaField, TextField } from '@/Components/Admin/FormFields';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';

const emptyForm = {
    title: '',
    category: 'image',
    description: '',
    body_text: '',
    file: null,
    is_active: true,
    sort_order: 0,
};

const categoryOptions = [
    { value: 'image', label: 'Gambar (Brosur/Banner)' },
    { value: 'text', label: 'Copywriting / Teks' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'Dokumen (PDF)' },
];

function categoryBadgeClass(category) {
    return {
        image: 'bg-sky-100 text-sky-800',
        text: 'bg-violet-100 text-violet-800',
        video: 'bg-rose-100 text-rose-800',
        pdf: 'bg-amber-100 text-amber-800',
    }[category] ?? 'bg-gray-100 text-gray-700';
}

function FileField({ error, file, label, onChange, currentFileName, accept }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                accept={accept}
                className="mt-2 block w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 font-body-sm text-sm text-[#333333] shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A] file:px-4 file:py-2 file:font-body-sm file:text-sm file:font-bold file:text-white focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type="file"
            />
            <p className="mt-2 font-body-sm text-xs text-gray-500">
                {file
                    ? `File dipilih: ${file.name}`
                    : currentFileName
                        ? `File saat ini: ${currentFileName}`
                        : 'Pilih file sesuai kategori materi.'}
            </p>
            <FieldError message={error} />
        </label>
    );
}

function acceptForCategory(category) {
    return {
        image: 'image/jpeg,image/png,image/webp,image/gif',
        video: 'video/mp4,video/webm,video/quicktime',
        pdf: 'application/pdf',
        text: '*/*',
    }[category] ?? '*/*';
}

function KitFormFields({ data, setData, errors, currentFileName = null }) {
    const isText = data.category === 'text';

    return (
        <div className="space-y-4">
            <TextField
                error={errors.title}
                label="Judul Materi"
                name="title"
                onChange={(event) => setData('title', event.target.value)}
                placeholder="Contoh: Katalog Produk Lengkap"
                value={data.title}
            />
            <SelectField
                error={errors.category}
                label="Kategori Format"
                name="category"
                onChange={(event) => setData('category', event.target.value)}
                value={data.category}
            >
                {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
            <TextAreaField
                error={errors.description}
                label="Deskripsi / Instruksi Singkat"
                name="description"
                onChange={(event) => setData('description', event.target.value)}
                rows={3}
                value={data.description}
            />
            {isText ? (
                <TextAreaField
                    error={errors.body_text}
                    label="Naskah Copywriting"
                    name="body_text"
                    onChange={(event) => setData('body_text', event.target.value)}
                    rows={6}
                    value={data.body_text}
                />
            ) : (
                <FileField
                    accept={acceptForCategory(data.category)}
                    currentFileName={currentFileName}
                    error={errors.file}
                    file={data.file}
                    label="Upload File"
                    onChange={(event) => setData('file', event.target.files?.[0] ?? null)}
                />
            )}
            <TextField
                error={errors.sort_order}
                label="Urutan"
                name="sort_order"
                onChange={(event) => setData('sort_order', event.target.value)}
                type="number"
                value={data.sort_order}
            />
            <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                <input
                    checked={Boolean(data.is_active)}
                    className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                    onChange={(event) => setData('is_active', event.target.checked)}
                    type="checkbox"
                />
                <span>
                    <span className="block font-body-sm text-sm font-bold text-[#333333]">Aktif / Dipublikasikan</span>
                    <span className="block font-body-sm text-xs text-gray-500">
                        Materi aktif tampil di dashboard afiliator.
                    </span>
                    <FieldError message={errors.is_active} />
                </span>
            </label>
        </div>
    );
}

function AdminMarketingKitsIndex({ kits = [] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedKit, setSelectedKit] = useState(null);

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    const openCreateModal = () => {
        createForm.clearErrors();
        createForm.setData({ ...emptyForm });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (kit) => {
        setSelectedKit(kit);
        editForm.clearErrors();
        editForm.setData({
            title: kit.title || '',
            category: kit.category || 'image',
            description: kit.description || '',
            body_text: kit.body_text || '',
            file: null,
            is_active: Boolean(kit.is_active),
            sort_order: kit.sort_order ?? 0,
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (event) => {
        event.preventDefault();
        createForm.transform((data) => ({
            title: data.title,
            category: data.category,
            description: data.description,
            body_text: data.category === 'text' ? data.body_text : null,
            is_active: Boolean(data.is_active) ? 1 : 0,
            sort_order: Number(data.sort_order || 0),
            ...(data.file ? { file: data.file } : {}),
        }));
        createForm.post(route('admin.marketing-kits.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                createForm.setData({ ...emptyForm });
            },
        });
    };

    const handleEdit = (event) => {
        event.preventDefault();
        if (!selectedKit) {
            return;
        }

        editForm.transform((data) => ({
            title: data.title,
            category: data.category,
            description: data.description,
            body_text: data.category === 'text' ? data.body_text : (data.body_text || null),
            is_active: Boolean(data.is_active) ? 1 : 0,
            sort_order: Number(data.sort_order || 0),
            ...(data.file ? { file: data.file } : {}),
        }));
        editForm.post(route('admin.marketing-kits.update', selectedKit.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedKit(null);
                editForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Admin Marketing Kit" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            onClick={openCreateModal}
                            type="button"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Unggah Materi
                        </button>
                    )}
                    description="Unggah dan kelola materi promosi harian untuk afiliator."
                    eyebrow="Affiliate / Marketing Kit"
                    title="Manajemen Marketing Kit"
                />

                <AdminCard className="overflow-hidden">
                    {kits.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Tambahkan brosur, video, copywriting, atau PDF agar afiliator bisa mempromosikan dengan mudah."
                                title="Belum ada materi marketing kit."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Kategori', 'Judul Materi', 'Deskripsi Singkat', 'Urutan', 'Status', 'Aksi'].map((heading) => (
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
                                    {kits.map((kit) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={kit.id}>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${categoryBadgeClass(kit.category)}`}>
                                                    {kit.category_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {kit.title}
                                            </td>
                                            <td className="max-w-xs px-4 py-4 font-body-sm text-sm text-gray-600">
                                                <span className="line-clamp-2">{kit.description || '-'}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {kit.sort_order ?? 0}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge
                                                    label={kit.is_active ? 'Aktif' : 'Nonaktif'}
                                                    status={kit.is_active ? 'active' : 'pending'}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                        onClick={() => openEditModal(kit)}
                                                        type="button"
                                                    >
                                                        Edit
                                                    </button>
                                                    <AdminDeleteButton
                                                        itemName={kit.title}
                                                        routeName="admin.marketing-kits.destroy"
                                                        routeParams={kit.id}
                                                        title="Hapus Materi Marketing Kit"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdminCard>
            </div>

            <Modal onClose={() => setIsCreateModalOpen(false)} show={isCreateModalOpen}>
                <form className="p-6" onSubmit={handleCreate}>
                    <h2 className="mb-4 font-body-lg text-lg font-extrabold text-[#333333]">
                        Unggah Materi Baru
                    </h2>
                    <KitFormFields data={createForm.data} errors={createForm.errors} setData={createForm.setData} />
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            onClick={() => setIsCreateModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-[#013625] disabled:opacity-50"
                            disabled={createForm.processing}
                            type="submit"
                        >
                            Simpan & Publikasikan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal onClose={() => setIsEditModalOpen(false)} show={isEditModalOpen}>
                <form className="p-6" onSubmit={handleEdit}>
                    <h2 className="mb-4 font-body-lg text-lg font-extrabold text-[#333333]">
                        Edit Materi Marketing Kit
                    </h2>
                    <KitFormFields
                        currentFileName={selectedKit?.original_filename}
                        data={editForm.data}
                        errors={editForm.errors}
                        setData={editForm.setData}
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            className="rounded-full px-4 py-2 font-body-sm text-sm font-bold text-gray-600 hover:bg-gray-100"
                            onClick={() => setIsEditModalOpen(false)}
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            className="rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white hover:bg-[#013625] disabled:opacity-50"
                            disabled={editForm.processing}
                            type="submit"
                        >
                            Perbarui
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

AdminMarketingKitsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminMarketingKitsIndex;
