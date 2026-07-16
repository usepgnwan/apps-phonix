import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { FieldError, TextField, TextAreaField } from '@/Components/Admin/FormFields';

function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

const emptyForm = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
};

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

function CategoryFormFields({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <TextField
                error={errors.name}
                label="Nama"
                name="name"
                onChange={(event) => setData('name', event.target.value)}
                value={data.name}
            />
            <TextField
                error={errors.slug}
                label="Slug"
                name="slug"
                onChange={(event) => setData('slug', event.target.value)}
                placeholder="Opsional, otomatis dari nama jika kosong"
                value={data.slug}
            />
            <TextAreaField
                error={errors.description}
                label="Deskripsi"
                name="description"
                onChange={(event) => setData('description', event.target.value)}
                rows={3}
                value={data.description}
            />
            <CheckboxField
                checked={Boolean(data.is_active)}
                error={errors.is_active}
                label="Kategori aktif"
                onChange={(event) => setData('is_active', event.target.checked)}
            />
        </div>
    );
}

function AdminProductKategoriIndex({ productCategories, filters }) {
    const productKategori = productCategories.data || productCategories;

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        ...emptyForm,
    });

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(
            route('admin.product-categories.index'),
            { search: newSearch, per_page: newPerPage },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
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
        setSelectedCategory(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category) => {
        clearErrors();
        setSelectedCategory(category);
        setData({
            name: category.name ?? '',
            slug: category.slug ?? '',
            description: category.description ?? '',
            is_active: Boolean(category.is_active),
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
        setSelectedCategory(null);
        clearErrors();
        reset();
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.product-categories.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setData({ ...emptyForm });
            },
            preserveScroll: true,
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!selectedCategory) {
            return;
        }

        patch(route('admin.product-categories.update', selectedCategory.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Admin Kategori Produk" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            onClick={openCreateModal}
                            type="button"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Kategori
                        </button>
                    )}
                    description="Kelola kategori produk herbal dan terapi agar katalog tetap rapi untuk customer."
                    eyebrow="Catalog / Kategori Produk"
                    title="Kategori Produk"
                />

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                Catalog
                            </p>
                            <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                Daftar Kategori Produk
                            </h2>
                        </div>
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari kategori..."
                                    value={search}
                                    onChange={handleSearch}
                                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                />
                            </div>
                            <div className="flex shrink-0 items-center gap-2 text-sm text-gray-500">
                                <span>Tampilkan</span>
                                <select
                                    value={perPage}
                                    onChange={handleLimitChange}
                                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {productKategori.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Kategori produk akan tampil di sini setelah dibuat."
                                title="Belum ada kategori produk."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Nama', 'Slug', 'Status', 'Dibuat', 'Aksi'].map((heading) => (
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
                                    {productKategori.map((category) => (
                                        <tr
                                            className="transition hover:bg-[#A8C5B3]/10"
                                            key={category.id}
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {category.name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {category.slug ?? '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge
                                                    label={category.is_active ? 'Aktif' : 'Nonaktif'}
                                                    tone={category.is_active ? 'forest' : 'gray'}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatDate(category.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                        href={route('admin.product-categories.show', category.id)}
                                                    >
                                                        Detail
                                                    </Link>
                                                    <button
                                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                                        onClick={() => openEditModal(category)}
                                                        type="button"
                                                    >
                                                        Edit
                                                    </button>
                                                    <AdminDeleteButton
                                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                                        description="Kategori produk akan dihapus dari master katalog admin."
                                                        itemName={category.name}
                                                        routeName="admin.product-categories.destroy"
                                                        routeParams={category.id}
                                                        title="Hapus kategori produk?"
                                                    >
                                                        Hapus
                                                    </AdminDeleteButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {productCategories.links?.length > 0 && (
                                <div className="border-t border-[#E5E7EB] p-5">
                                    <Pagination links={productCategories.links} />
                                </div>
                            )}
                        </div>
                    )}
                </AdminCard>
            </div>

            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Tambah Kategori Produk</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Buat kategori baru untuk mengelompokkan produk Phoenix.
                    </p>
                    <CategoryFormFields data={data} setData={setData} errors={errors} />
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
                            {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="md">
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Edit Kategori Produk</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Perbarui informasi kategori{selectedCategory?.name ? `: ${selectedCategory.name}` : ''}.
                    </p>
                    <CategoryFormFields data={data} setData={setData} errors={errors} />
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

AdminProductKategoriIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductKategoriIndex;
