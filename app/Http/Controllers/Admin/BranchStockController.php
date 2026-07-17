<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\BranchProductStock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchStockController extends Controller
{
    private function authorizeAdminPusat(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat melihat stok keseluruhan per cabang.');
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdminPusat();

        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 25);

        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 25;
        }

        $branches = Branch::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $branchId = $request->filled('branch_id')
            ? (int) $request->input('branch_id')
            : $this->defaultBranchId($branches);

        $selectedBranch = null;
        $stocks = null;
        $summary = [
            'product_count' => 0,
            'total_units' => 0,
        ];

        if ($branchId !== null) {
            $selectedBranch = $branches->firstWhere('id', $branchId);

            if ($selectedBranch === null) {
                abort(404, 'Cabang tidak ditemukan atau tidak aktif.');
            }

            $baseQuery = BranchProductStock::query()
                ->where('branch_id', $branchId)
                ->where('stock_quantity', '>', 0)
                ->whereHas('product')
                ->whereHas('branch');

            $summary = [
                'product_count' => (clone $baseQuery)->count(),
                'total_units' => (int) (clone $baseQuery)->sum('stock_quantity'),
            ];

            $stocks = (clone $baseQuery)
                ->with([
                    'product:id,product_category_id,name,slug,image_path,is_active',
                    'product.productCategory:id,name',
                ])
                ->when($search, function ($query, $search) {
                    $query->whereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
                })
                ->join('products', 'products.id', '=', 'branch_product_stocks.product_id')
                ->orderBy('products.name')
                ->select('branch_product_stocks.*')
                ->paginate($perPage)
                ->withQueryString();
        }

        return Inertia::render('Admin/Stock/Index', [
            'page' => 'admin.stock.index',
            'branches' => $branches,
            'selectedBranch' => $selectedBranch,
            'stocks' => $stocks,
            'summary' => $summary,
            'filters' => [
                'branch_id' => $branchId,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    private function defaultBranchId(\Illuminate\Support\Collection $branches): ?int
    {
        if ($branches->isEmpty()) {
            return null;
        }

        $pusat = $branches->first(function (Branch $branch) {
            $code = strtoupper((string) $branch->code);
            $name = strtolower((string) $branch->name);

            return $code === 'PST'
                || str_contains($name, 'pusat')
                || str_contains($name, 'head office')
                || str_contains($name, 'headoffice');
        });

        return (int) ($pusat?->id ?? $branches->first()->id);
    }
}
