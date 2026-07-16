import { Head, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import StatusBadge from '@/Components/Admin/StatusBadge';
import { FieldError, SelectField, TextField } from '@/Components/Admin/FormFields';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency, formatNumber, readableLabel } from '@/utils/format';

const emptyCreateForm = {
    name: '',
    product_id: '',
    service_id: '',
    commission_type: 'percent',
    commission_value: '',
    is_active: true,
    sort_order: 0,
};

function formatCommissionValue(rule) {
    if (rule.commission_type === 'percent') {
        return `${formatNumber(rule.commission_value)}%`;
    }

    return formatCurrency(rule.commission_value);
}

function targetLabel(rule) {
    if (rule.product) {
        return `Produk · ${rule.product.name}`;
    }
    if (rule.service) {
        return `Layanan · ${rule.service.name}`;
    }
    return '-';
}

function AdminAffiliateCommissionRulesIndex({ rules, products, services }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState(null);

    const createForm = useForm({ ...emptyCreateForm });
    const editForm = useForm({
        commission_type: 'percent',
        commission_value: '',
        is_active: true,
    });

    const openCreateModal = () => {
        createForm.clearErrors();
        createForm.setData({ ...emptyCreateForm });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (rule) => {
        setSelectedRule(rule);
        editForm.clearErrors();
        editForm.setData({
            commission_type: rule.commission_type || 'percent',
            commission_value: rule.commission_value ?? '',
            is_active: Boolean(rule.is_active),
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = (event) => {
        event.preventDefault();
        createForm.transform((data) => ({
            ...data,
            product_id: data.product_id === '' ? null : data.product_id,
            service_id: data.service_id === '' ? null : data.service_id,
            is_active: Boolean(data.is_active),
            sort_order: Number(data.sort_order || 0),
        })).post(route('admin.affiliate-commission-rules.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                createForm.setData({ ...emptyCreateForm });
            },
        });
    };

    const handleEdit = (event) => {
        event.preventDefault();
        if (!selectedRule) {
            return;
        }

        editForm.transform((data) => ({
            commission_type: data.commission_type,
            commission_value: data.commission_value,
            is_active: Boolean(data.is_active),
        })).put(route('admin.affiliate-commission-rules.update', selectedRule.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedRule(null);
                editForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Admin Atur Komisi Affiliate" />

            <div className="space-y-8">
                <AdminPageHeader
                    action={(
                        <button
                            className="inline-flex items-center gap-2 rounded-full bg-[#1E4D3A] px-4 py-2 font-body-sm text-sm font-bold text-white transition hover:bg-[#013625]"
                            onClick={openCreateModal}
                            type="button"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Tambah Aturan
                        </button>
                    )}
                    description="Atur komisi per produk atau layanan untuk affiliate F1."
                    eyebrow="Affiliate / Atur Komisi"
                    title="Aturan Komisi"
                />

                <AdminCard className="overflow-hidden">
                    {rules.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                description="Tambahkan aturan komisi agar order/booking bisa menghasilkan komisi affiliate."
                                title="Belum ada aturan komisi."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#E5E7EB]">
                                <thead className="bg-[#F6F7F7]">
                                    <tr>
                                        {['Nama', 'Target', 'Tipe', 'Nilai', 'Urutan', 'Status', 'Aksi'].map((heading) => (
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
                                    {rules.map((rule) => (
                                        <tr className="transition hover:bg-[#A8C5B3]/10" key={rule.id}>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-bold text-[#333333]">
                                                {rule.name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {targetLabel(rule)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {readableLabel(rule.commission_type)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm font-extrabold text-[#1E4D3A]">
                                                {formatCommissionValue(rule)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 font-body-sm text-sm text-gray-600">
                                                {formatNumber(rule.sort_order ?? 0)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <StatusBadge
                                                    label={rule.is_active ? 'Aktif' : 'Nonaktif'}
                                                    status={rule.is_active ? 'active' : 'pending'}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <button
                                                    className="rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                    onClick={() => openEditModal(rule)}
                                                    type="button"
                                                >
                                                    Edit
                                                </button>
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
                        Tambah Aturan Komisi
                    </h2>
                    <div className="space-y-4">
                        <TextField
                            error={createForm.errors.name}
                            label="Nama Aturan"
                            name="name"
                            onChange={(event) => createForm.setData('name', event.target.value)}
                            value={createForm.data.name}
                        />
                        <SelectField
                            error={createForm.errors.product_id}
                            label="Produk (opsional jika pilih layanan)"
                            name="product_id"
                            onChange={(event) => {
                                createForm.setData({
                                    ...createForm.data,
                                    product_id: event.target.value,
                                    service_id: event.target.value ? '' : createForm.data.service_id,
                                });
                            }}
                            value={createForm.data.product_id}
                        >
                            <option value="">— Pilih produk —</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            error={createForm.errors.service_id}
                            label="Layanan (opsional jika pilih produk)"
                            name="service_id"
                            onChange={(event) => {
                                createForm.setData({
                                    ...createForm.data,
                                    service_id: event.target.value,
                                    product_id: event.target.value ? '' : createForm.data.product_id,
                                });
                            }}
                            value={createForm.data.service_id}
                        >
                            <option value="">— Pilih layanan —</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            error={createForm.errors.commission_type}
                            label="Tipe Komisi"
                            name="commission_type"
                            onChange={(event) => createForm.setData('commission_type', event.target.value)}
                            value={createForm.data.commission_type}
                        >
                            <option value="percent">Persen</option>
                            <option value="fixed">Nominal Tetap</option>
                        </SelectField>
                        <TextField
                            error={createForm.errors.commission_value}
                            label={createForm.data.commission_type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
                            name="commission_value"
                            onChange={(event) => createForm.setData('commission_value', event.target.value)}
                            type="number"
                            value={createForm.data.commission_value}
                        />
                        <TextField
                            error={createForm.errors.sort_order}
                            label="Urutan"
                            name="sort_order"
                            onChange={(event) => createForm.setData('sort_order', event.target.value)}
                            type="number"
                            value={createForm.data.sort_order}
                        />
                        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                            <input
                                checked={Boolean(createForm.data.is_active)}
                                className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                                onChange={(event) => createForm.setData('is_active', event.target.checked)}
                                type="checkbox"
                            />
                            <span>
                                <span className="block font-body-sm text-sm font-bold text-[#333333]">Aktif</span>
                                <span className="block font-body-sm text-xs text-gray-500">
                                    Aturan aktif dipakai saat menghitung komisi.
                                </span>
                                <FieldError message={createForm.errors.is_active} />
                            </span>
                        </label>
                    </div>
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
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal onClose={() => setIsEditModalOpen(false)} show={isEditModalOpen}>
                <form className="p-6" onSubmit={handleEdit}>
                    <h2 className="mb-2 font-body-lg text-lg font-extrabold text-[#333333]">
                        Edit Aturan Komisi
                    </h2>
                    <p className="mb-4 font-body-sm text-sm text-gray-600">
                        {selectedRule?.name} · {selectedRule ? targetLabel(selectedRule) : ''}
                    </p>
                    <div className="space-y-4">
                        <SelectField
                            error={editForm.errors.commission_type}
                            label="Tipe Komisi"
                            name="commission_type"
                            onChange={(event) => editForm.setData('commission_type', event.target.value)}
                            value={editForm.data.commission_type}
                        >
                            <option value="percent">Persen</option>
                            <option value="fixed">Nominal Tetap</option>
                        </SelectField>
                        <TextField
                            error={editForm.errors.commission_value}
                            label={editForm.data.commission_type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
                            name="commission_value"
                            onChange={(event) => editForm.setData('commission_value', event.target.value)}
                            type="number"
                            value={editForm.data.commission_value}
                        />
                        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                            <input
                                checked={Boolean(editForm.data.is_active)}
                                className="mt-1 rounded border-[#E5E7EB] text-[#1E4D3A] focus:ring-[#1E4D3A]"
                                onChange={(event) => editForm.setData('is_active', event.target.checked)}
                                type="checkbox"
                            />
                            <span>
                                <span className="block font-body-sm text-sm font-bold text-[#333333]">Aktif</span>
                                <FieldError message={editForm.errors.is_active} />
                            </span>
                        </label>
                    </div>
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

AdminAffiliateCommissionRulesIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminAffiliateCommissionRulesIndex;
