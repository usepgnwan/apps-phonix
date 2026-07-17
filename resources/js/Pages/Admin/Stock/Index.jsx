import { Head, Link, router } from '@inertiajs/react';
import { Eye, Package, Search, Warehouse } from 'lucide-react';
import { useState } from 'react';

import AdminCard from '@/Components/Admin/AdminCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/Admin/EmptyState';
import Pagination from '@/Components/Admin/Pagination';
import StatusBadge from '@/Components/Admin/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';

function AdminStockIndex({ branches = [], selectedBranch = null, stocks = null, summary = null, filters = {} }) {
    const [branchId, setBranchId] = useState(filters?.branch_id ? String(filters.branch_id) : '');
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 25);

    const applyFilters = (next = {}) => {
        const payload = {
            branch_id: next.branch_id !== undefined ? next.branch_id : branchId,
            search: next.search !== undefined ? next.search : search,
            per_page: next.per_page !== undefined ? next.per_page : perPage,
        };

        if (!payload.branch_id) {
            delete payload.branch_id;
            delete payload.search;
        }

        if (!payload.search) {
            delete payload.search;
        }

        router.get(route('admin.stock.index'), payload, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleBranchChange = (event) => {
        const value = event.target.value;
        setBranchId(value);
        setSearch('');
        applyFilters({ branch_id: value, search: '' });
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearch(value);
        applyFilters({ search: value });
    };

    const handlePerPageChange = (event) => {
        const value = event.target.value;
        setPerPage(value);
        applyFilters({ per_page: value });
    };

    const rows = stocks?.data ?? [];
    const productCount = summary?.product_count ?? 0;
    const totalUnits = summary?.total_units ?? 0;

    return (
        <>
            <Head title="Stok Cabang" />
            <div className="space-y-8">
                <AdminPageHeader
                    description="Lihat stok produk yang tersedia di satu cabang. Halaman ini read-only untuk Admin Pusat."
                    eyebrow="Master Data / Stok Cabang"
                    icon={Warehouse}
                    title="Stok Cabang"
                />

                <AdminCard className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="w-full sm:max-w-xs">
                                <label className="mb-1 block font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    Cabang
                                </label>
                                <select
                                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-3 pr-8 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={handleBranchChange}
                                    value={branchId}
                                >
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}{branch.code ? ` (${branch.code})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {branchId ? (
                                <div className="relative w-full sm:max-w-md sm:self-end">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-2.5 pl-10 pr-4 font-body-sm text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                        onChange={handleSearchChange}
                                        placeholder="Cari nama produk..."
                                        type="text"
                                        value={search}
                                    />
                                </div>
                            ) : null}
                        </div>

                        {branchId ? (
                            <div className="flex items-center gap-2 self-end text-sm text-gray-500">
                                <span>Tampilkan</span>
                                <select
                                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 text-sm focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A]"
                                    onChange={handlePerPageChange}
                                    value={perPage}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>data</span>
                            </div>
                        ) : null}
                    </div>

                    {!branchId ? (
                        <div className="py-12">
                            <EmptyState
                                description="Pilih cabang di atas untuk menampilkan produk yang masih memiliki stok di cabang tersebut."
                                title="Pilih cabang terlebih dahulu"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-3 border-b border-[#E5E7EB] px-5 py-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Cabang
                                    </p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                        {selectedBranch?.name ?? '-'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Produk berstok
                                    </p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                        {productCount}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3">
                                    <p className="font-label-sm text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Total unit
                                    </p>
                                    <p className="mt-1 font-body-sm text-sm font-bold text-[#333333]">
                                        {totalUnits}
                                    </p>
                                </div>
                            </div>

                            {rows.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-[#F9FAFB] font-label-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                <tr>
                                                    <th className="px-6 py-4">Produk</th>
                                                    <th className="px-6 py-4">Kategori</th>
                                                    <th className="px-6 py-4">Stok</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E5E7EB] font-body-sm">
                                                {rows.map((stock) => {
                                                    const product = stock.product;
                                                    const category = product?.product_category ?? product?.productCategory;

                                                    return (
                                                        <tr key={stock.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F6F7F7]">
                                                                        {product?.image_path ? (
                                                                            <img
                                                                                alt={product.name}
                                                                                className="h-full w-full object-cover"
                                                                                src={product.image_path}
                                                                            />
                                                                        ) : (
                                                                            <Package className="h-5 w-5 text-gray-300" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-[#333333]">
                                                                            {product?.name ?? `Produk #${stock.product_id}`}
                                                                        </p>
                                                                        {product?.slug ? (
                                                                            <p className="mt-0.5 text-xs text-gray-400">
                                                                                {product.slug}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">
                                                                {category?.name ?? '-'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-bold text-[#1E4D3A]">
                                                                    {Number(stock.stock_quantity ?? 0)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge
                                                                    label={product?.is_active ? 'Aktif' : 'Nonaktif'}
                                                                    tone={product?.is_active ? 'forest' : 'gray'}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex justify-end">
                                                                    {product?.id ? (
                                                                        <Link
                                                                            className="inline-flex items-center gap-1.5 rounded-full border border-[#1E4D3A] px-3 py-1.5 font-body-sm text-xs font-bold text-[#1E4D3A] transition hover:bg-[#1E4D3A] hover:text-white"
                                                                            href={route('admin.products.show', product.id)}
                                                                        >
                                                                            <Eye aria-hidden="true" className="h-4 w-4" />
                                                                            Detail
                                                                        </Link>
                                                                    ) : null}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-[#E5E7EB] p-5">
                                        <Pagination links={stocks.links} />
                                    </div>
                                </>
                            ) : (
                                <div className="py-12">
                                    <EmptyState
                                        description={
                                            search
                                                ? 'Tidak ada produk berstok yang cocok dengan pencarian di cabang ini.'
                                                : 'Tidak ada produk dengan stok lebih dari 0 di cabang ini.'
                                        }
                                        title="Tidak ada produk berstok"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </AdminCard>
            </div>
        </>
    );
}

AdminStockIndex.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminStockIndex;
