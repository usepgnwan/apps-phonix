import { Head, router, useForm } from '@inertiajs/react';
import { Edit, MessageSquare, Plus, Star, Search } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard.jsx';
import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader.jsx';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout.jsx';
import Pagination from '@/Components/Admin/Pagination.jsx';
import { FieldError, TextField, TextAreaField, SelectField } from '@/Components/Admin/FormFields';

function StatusBadge({ isActive }) {
    if (isActive) {
        return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Aktif</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Tidak Aktif</span>;
}

const emptyForm = {
    customer_name: '',
    content: '',
    rating: 5,
    is_active: true,
    photo: null,
};

function FileField({ label, error, file, onChange, currentPhotoPath }) {
    return (
        <label className="block">
            <span className="font-label-sm text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
            </span>
            <input
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 block w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 font-body-sm text-sm text-[#333333] shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#1E4D3A] file:px-4 file:py-2 file:font-body-sm file:text-sm file:font-bold file:text-white focus:border-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type="file"
            />
            <p className="mt-2 font-body-sm text-xs text-gray-500">
                {file
                    ? `File dipilih: ${file.name}`
                    : currentPhotoPath
                        ? 'Upload file baru jika ingin mengganti foto saat ini.'
                        : 'Pilih foto JPG, PNG, atau WebP (opsional).'}
            </p>
            {currentPhotoPath && !file && (
                <div className="mt-3">
                    <img
                        src={currentPhotoPath.startsWith('http') || currentPhotoPath.startsWith('/') ? currentPhotoPath : `/storage/${currentPhotoPath}`}
                        alt="Foto saat ini"
                        className="h-16 w-16 rounded-full border object-cover"
                    />
                </div>
            )}
            <FieldError message={error} />
        </label>
    );
}

function CheckboxField({ checked, error, label, onChange }) {
    return (
        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
            <input
                checked={checked}
                className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                onChange={onChange}
                type="checkbox"
            />
            <span>
                <span className="block font-body-sm text-sm font-bold text-[#333333]">{label}</span>
                <FieldError message={error} />
            </span>
        </label>
    );
}

function TestimonialFormFields({ data, setData, errors, currentPhotoPath = null }) {
    return (
        <div className="space-y-4">
            <TextField
                error={errors.customer_name}
                label="Nama Pelanggan"
                onChange={(event) => setData('customer_name', event.target.value)}
                value={data.customer_name}
            />
            <SelectField
                error={errors.rating}
                label="Rating"
                onChange={(event) => setData('rating', parseInt(event.target.value, 10))}
                value={data.rating}
            >
                <option value={5}>5 Bintang (Sangat Baik)</option>
                <option value={4}>4 Bintang (Baik)</option>
                <option value={3}>3 Bintang (Cukup)</option>
                <option value={2}>2 Bintang (Kurang)</option>
                <option value={1}>1 Bintang (Sangat Kurang)</option>
            </SelectField>
            <FileField
                currentPhotoPath={currentPhotoPath}
                error={errors.photo}
                file={data.photo}
                label="Foto (Opsional)"
                onChange={(event) => setData('photo', event.target.files[0] ?? null)}
            />
            <TextAreaField
                error={errors.content}
                label="Ulasan / Komentar"
                onChange={(event) => setData('content', event.target.value)}
                rows={4}
                value={data.content}
            />
            <CheckboxField
                checked={Boolean(data.is_active)}
                error={errors.is_active}
                label="Tampilkan testimoni ini di web"
                onChange={(event) => setData('is_active', event.target.checked)}
            />
        </div>
    );
}

function AdminTestimonialIndex({ testimonials, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        ...emptyForm,
    });

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.testimonials.index'), { search: newSearch, per_page: newPerPage }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        handleFilterChange(e.target.value, perPage);
    };

    const handleLimitChange = (e) => {
        setPerPage(e.target.value);
        handleFilterChange(search, e.target.value);
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setData({ ...emptyForm });
        setSelectedTestimonial(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (testimonial) => {
        clearErrors();
        setSelectedTestimonial(testimonial);
        setData({
            customer_name: testimonial.customer_name ?? '',
            content: testimonial.content ?? '',
            rating: testimonial.rating ?? 5,
            is_active: Boolean(testimonial.is_active),
            photo: null,
            _method: 'put',
        });
        setIsEditModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        clearErrors();
        reset();
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTestimonial(null);
        clearErrors();
        reset();
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.testimonials.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setData({ ...emptyForm });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!selectedTestimonial) {
            return;
        }

        post(route('admin.testimonials.update', selectedTestimonial.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedTestimonial(null);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Kelola Testimoni" />
            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-5 py-2.5 font-body-sm text-sm font-bold text-white transition hover:bg-[#1E4D3A]/90"
                            onClick={openCreateModal}
                            type="button"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Testimoni
                        </button>
                    )}
                    description="Kelola ulasan dan testimoni pelanggan yang akan ditampilkan di halaman publik."
                    eyebrow="Konten Web"
                    title="Testimoni Pelanggan"
                />

                <AdminCard className="overflow-hidden">
                    <div className="border-b border-[#E5E7EB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau isi ulasan..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Tampilkan</span>
                            <select
                                value={perPage}
                                onChange={handleLimitChange}
                                className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-[#F9FAFB]"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>data</span>
                        </div>
                    </div>

                    {testimonials.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-on-surface">
                                <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
                                    <tr>
                                        <th className="px-6 py-4 font-bold" scope="col">Pelanggan</th>
                                        <th className="px-6 py-4 font-bold" scope="col">Ulasan</th>
                                        <th className="px-6 py-4 font-bold" scope="col">Rating</th>
                                        <th className="px-6 py-4 font-bold" scope="col">Status</th>
                                        <th className="px-6 py-4 text-right font-bold" scope="col">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {testimonials.data.map((testimonial) => (
                                        <tr className="transition hover:bg-surface-container-low/50" key={testimonial.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {testimonial.photo_path ? (
                                                        <img
                                                            src={testimonial.photo_path.startsWith('http') || testimonial.photo_path.startsWith('/') ? testimonial.photo_path : `/storage/${testimonial.photo_path}`}
                                                            alt={testimonial.customer_name}
                                                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim text-primary-container">
                                                            <MessageSquare className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-primary-container">{testimonial.customer_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="line-clamp-2 max-w-xs text-on-surface-variant">{testimonial.content}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-[#F08A2B]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star className={`h-4 w-4 ${i < testimonial.rating ? 'fill-current' : 'text-gray-300'}`} key={i} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge isActive={testimonial.is_active} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-container transition hover:bg-primary-fixed/30"
                                                        onClick={() => openEditModal(testimonial)}
                                                        type="button"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <AdminDeleteButton
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error-container"
                                                        description="Testimoni ini akan dihapus permanen."
                                                        itemName={testimonial.customer_name}
                                                        routeName="admin.testimonials.destroy"
                                                        routeParams={testimonial.id}
                                                        title="Hapus testimoni?"
                                                    >
                                                        Hapus
                                                    </AdminDeleteButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-5 border-t border-outline-variant">
                                <Pagination links={testimonials.links} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 rounded-full bg-surface-container p-4 text-primary-container">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 font-headline-sm text-lg font-bold text-primary-container">Belum Ada Testimoni</h3>
                            <p className="mb-6 max-w-sm text-sm text-on-surface-variant">Tambahkan ulasan pelanggan untuk ditampilkan di website.</p>
                            <button
                                className="inline-flex items-center gap-2 rounded-full border border-outline px-4 py-2 text-sm font-bold text-primary-container transition hover:bg-surface-container"
                                onClick={openCreateModal}
                                type="button"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Testimoni
                            </button>
                        </div>
                    )}
                </AdminCard>
            </div>

            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="lg">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Tambah Testimoni</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Tambahkan ulasan pelanggan baru beserta rating dan foto opsional.
                    </p>
                    <TestimonialFormFields data={data} setData={setData} errors={errors} />
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163B2C] disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Testimoni'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="lg">
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Edit Testimoni</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Perbarui testimoni{selectedTestimonial?.customer_name ? `: ${selectedTestimonial.customer_name}` : ''}.
                    </p>
                    <TestimonialFormFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        currentPhotoPath={selectedTestimonial?.photo_path}
                    />
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1E4D3A] px-4 py-2 text-sm font-bold text-white hover:bg-[#163B2C] disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

AdminTestimonialIndex.layout = (page) => <AdminLayout children={page} />;
export default AdminTestimonialIndex;
