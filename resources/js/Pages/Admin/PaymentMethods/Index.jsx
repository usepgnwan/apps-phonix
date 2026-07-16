import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AdminDeleteButton from '@/Components/Admin/AdminDeleteButton';
import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import MetricCard from '@/Components/Admin/MetricCard';
import StatusBadge from '@/Components/Admin/StatusBadge';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Admin/Pagination';
import { FieldError, TextField, SelectField, TextAreaField } from '@/Components/Admin/FormFields';
import { formatNumber } from '@/utils/format';

function typeLabel(type) {
    if (type === 'qris') return 'QRIS';
    if (type === 'cash') return 'Cash / Tunai';
    return 'Bank Transfer';
}

function methodTitle(paymentMethod) {
    if (paymentMethod.type === 'qris') {
        return paymentMethod.qris_image_path || 'QRIS';
    }
    if (paymentMethod.type === 'cash') {
        return paymentMethod.bank_name || 'Pembayaran Tunai';
    }
    return paymentMethod.bank_name || 'Bank Transfer';
}

function detailSummary(paymentMethod) {
    if (paymentMethod.type === 'qris') {
        return paymentMethod.qris_image_path || 'Path QRIS belum diisi.';
    }
    if (paymentMethod.type === 'cash') {
        return 'Pembayaran dilakukan secara langsung.';
    }
    return [paymentMethod.account_number, paymentMethod.account_holder_name]
        .filter(Boolean)
        .join(' / ') || 'Detail rekening belum diisi.';
}

const emptyForm = {
    type: 'bank_transfer',
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    qris_image: null,
    instructions: '',
    is_active: true,
};

function FileField({ error, existingPath, file, label, onChange }) {
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
                    : existingPath
                        ? `Path saat ini: ${existingPath}`
                        : 'Pilih gambar QRIS JPG, PNG, atau WebP maksimal 2MB.'}
            </p>
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
                <span className="block font-body-sm text-sm font-bold text-[#333333]">
                    {label}
                </span>
                <FieldError message={error} />
            </span>
        </label>
    );
}

function PaymentMethodFormFields({ data, setData, errors, existingQrisPath = null }) {
    return (
        <div className="space-y-4">
            <SelectField
                error={errors.type}
                label="Tipe"
                onChange={(event) => setData('type', event.target.value)}
                value={data.type}
            >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="qris">QRIS</option>
                <option value="cash">Cash / Tunai</option>
            </SelectField>

            {data.type === 'bank_transfer' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                        error={errors.bank_name}
                        label="Nama Bank"
                        onChange={(event) => setData('bank_name', event.target.value)}
                        value={data.bank_name}
                    />
                    <TextField
                        error={errors.account_number}
                        label="Nomor Rekening"
                        onChange={(event) => setData('account_number', event.target.value)}
                        value={data.account_number}
                    />
                    <div className="sm:col-span-2">
                        <TextField
                            error={errors.account_holder_name}
                            label="Nama Pemilik Rekening"
                            onChange={(event) => setData('account_holder_name', event.target.value)}
                            value={data.account_holder_name}
                        />
                    </div>
                </div>
            )}

            {data.type === 'qris' && (
                <FileField
                    error={errors.qris_image}
                    existingPath={existingQrisPath}
                    file={data.qris_image}
                    label="Gambar QRIS"
                    onChange={(event) => setData('qris_image', event.target.files[0] ?? null)}
                />
            )}

            <TextAreaField
                error={errors.instructions}
                label="Instruksi"
                onChange={(event) => setData('instructions', event.target.value)}
                rows={3}
                value={data.instructions}
            />
            <CheckboxField
                checked={Boolean(data.is_active)}
                error={errors.is_active}
                label="Metode pembayaran aktif"
                onChange={(event) => setData('is_active', event.target.checked)}
            />
        </div>
    );
}

function AdminPaymentMethodsIndex({ paymentMethods, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        ...emptyForm,
    });

    const handleFilterChange = (newSearch, newPerPage) => {
        router.get(route('admin.payment-methods.index'), { search: newSearch, per_page: newPerPage }, {
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
        setSelectedPaymentMethod(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (paymentMethod) => {
        clearErrors();
        setSelectedPaymentMethod(paymentMethod);
        setData({
            type: paymentMethod.type ?? 'bank_transfer',
            bank_name: paymentMethod.bank_name ?? '',
            account_number: paymentMethod.account_number ?? '',
            account_holder_name: paymentMethod.account_holder_name ?? '',
            qris_image: null,
            instructions: paymentMethod.instructions ?? '',
            is_active: Boolean(paymentMethod.is_active),
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
        setSelectedPaymentMethod(null);
        clearErrors();
        reset();
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.payment-methods.store'), {
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
        if (!selectedPaymentMethod) {
            return;
        }

        post(route('admin.payment-methods.update', selectedPaymentMethod.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedPaymentMethod(null);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Admin Metode Pembayaran" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            onClick={openCreateModal}
                            type="button"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Metode
                        </button>
                    )}
                    description="Kelola metode pembayaran yang tersedia untuk pembayaran order Phoenix."
                    eyebrow="Commerce / Metode Pembayaran"
                    title="Metode Pembayaran"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <MetricCard
                        helper="Seluruh metode admin"
                        icon="P"
                        label="Total"
                        tone="forest"
                        value={formatNumber(metrics.total)}
                    />
                    <MetricCard
                        helper="Metode yang aktif"
                        icon="A"
                        label="Aktif"
                        tone="sage"
                        value={formatNumber(metrics.active)}
                    />
                    <MetricCard
                        helper="Rekening bank transfer"
                        icon="B"
                        label="Bank Transfer"
                        tone="blue"
                        value={formatNumber(metrics.bankTransfer)}
                    />
                    <MetricCard
                        helper="Path QRIS tersimpan"
                        icon="Q"
                        label="QRIS"
                        tone="brown"
                        value={formatNumber(metrics.qris)}
                    />
                    <MetricCard
                        helper="Metode tunai"
                        icon="C"
                        label="Cash / Tunai"
                        tone="orange"
                        value={formatNumber(metrics.cash)}
                    />
                    <MetricCard
                        helper="Order terkait"
                        icon="O"
                        label="Order"
                        tone="forest"
                        value={formatNumber(metrics.orders)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari metode pembayaran, bank..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full rounded-2xl border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Tampilkan</span>
                        <select
                            value={perPage}
                            onChange={handleLimitChange}
                            className="rounded-xl border border-[#E5E7EB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] font-body-sm bg-white shadow-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>data</span>
                    </div>
                </div>

                {paymentMethods.data.length === 0 ? (
                    <AdminCard className="p-5">
                        <EmptyState
                            description="Metode pembayaran akan tampil di sini setelah dibuat."
                            title="Belum ada metode pembayaran."
                        />
                    </AdminCard>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            {paymentMethods.data.map((paymentMethod) => (
                            <AdminCard className="p-5" key={paymentMethod.id}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            {typeLabel(paymentMethod.type)}
                                        </p>
                                        <h2 className="mt-1 font-body-lg text-lg font-extrabold text-[#333333]">
                                            {methodTitle(paymentMethod)}
                                        </h2>
                                        <p className="mt-2 line-clamp-2 font-body-sm text-sm leading-6 text-gray-500">
                                            {paymentMethod.instructions || 'Instruksi pembayaran belum tersedia.'}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        label={paymentMethod.is_active ? 'Aktif' : 'Nonaktif'}
                                        tone={paymentMethod.is_active ? 'forest' : 'gray'}
                                    />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatusBadge
                                        label={typeLabel(paymentMethod.type)}
                                        tone={paymentMethod.type === 'qris' ? 'brown' : 'blue'}
                                    />
                                    <StatusBadge
                                        label={`${formatNumber(paymentMethod.orders_count)} Order`}
                                        tone="sage"
                                    />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Details
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {detailSummary(paymentMethod)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                        <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Jumlah Order
                                        </p>
                                        <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                            {formatNumber(paymentMethod.orders_count)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                        href={route('admin.payment-methods.show', paymentMethod.id)}
                                    >
                                        Detail
                                    </Link>
                                    <button
                                        className="rounded-full border border-[#A8C5B3] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#A8C5B3]/20"
                                        onClick={() => openEditModal(paymentMethod)}
                                        type="button"
                                    >
                                        Edit
                                    </button>
                                    <AdminDeleteButton
                                        className="rounded-full border border-red-200 px-3 py-1.5 font-body-sm text-xs font-bold text-red-700 transition hover:bg-red-50"
                                        description="Metode pembayaran akan dihapus dari daftar metode pembayaran admin."
                                        itemName={methodTitle(paymentMethod)}
                                        routeName="admin.payment-methods.destroy"
                                        routeParams={paymentMethod.id}
                                        title="Hapus metode pembayaran?"
                                    >
                                        Hapus
                                    </AdminDeleteButton>
                                </div>
                            </AdminCard>
                        ))}
                        </div>
                        {paymentMethods.links?.length > 0 && (
                            <div className="flex justify-center mt-2">
                                <Pagination links={paymentMethods.links} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="lg">
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Tambah Metode Pembayaran</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Tambahkan metode bank transfer, QRIS, atau tunai untuk checkout order.
                    </p>
                    <PaymentMethodFormFields data={data} setData={setData} errors={errors} />
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
                            {processing ? 'Menyimpan...' : 'Simpan Metode'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="lg">
                <form onSubmit={handleEdit} className="p-6">
                    <h2 className="mb-1 text-lg font-bold text-[#1E4D3A]">Edit Metode Pembayaran</h2>
                    <p className="mb-5 text-sm text-gray-500">
                        Perbarui metode{selectedPaymentMethod ? `: ${methodTitle(selectedPaymentMethod)}` : ''}.
                    </p>
                    <PaymentMethodFormFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        existingQrisPath={selectedPaymentMethod?.qris_image_path}
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

AdminPaymentMethodsIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPaymentMethodsIndex;
