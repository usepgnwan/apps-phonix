<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Branch;
use App\Models\BranchProductStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdmin(), 403);
    }

    /**
     * Admin pusat: semua cabang. Admin cabang: hanya cabangnya.
     */
    private function branchesForActor(): \Illuminate\Support\Collection
    {
        $user = request()->user();
        $forcedBranchId = $user->forcedBranchId();

        if ($forcedBranchId !== null) {
            return Branch::query()->where('id', $forcedBranchId)->orderBy('name')->get(['id', 'name']);
        }

        return Branch::query()->orderBy('name')->get(['id', 'name']);
    }

    private function syncBranchStocks(Product $product, ?array $branchStocks): void
    {
        if (! is_array($branchStocks)) {
            return;
        }

        $user = request()->user();

        foreach ($branchStocks as $branchId => $stockData) {
            $branchId = (int) $branchId;

            if (! $user->canAccessBranch($branchId)) {
                continue;
            }

            BranchProductStock::updateOrCreate(
                [
                    'branch_id' => $branchId,
                    'product_id' => $product->id,
                ],
                [
                    'stock_quantity' => $stockData['stock_quantity'] ?? 0,
                    'low_stock_threshold' => $stockData['low_stock_threshold'] ?? 0,
                ]
            );
        }
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        
        $products = Product::query()
            ->with(['productCategory:id,name,slug', 'branchStocks.branch'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'page' => 'admin.products.index',
            'products' => $products,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Products/Create', [
            'page' => 'admin.products.create',
            'productCategories' => ProductCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'branches' => $this->branchesForActor(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('thumbnail')) {
            $data['image_path'] = $this->processAndSaveThumbnail($request->file('thumbnail'));
        }

        unset($data['branch_stocks'], $data['thumbnail']);

        $product = Product::query()->create($data);

        $this->syncBranchStocks($product, $request->input('branch_stocks'));

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil disimpan.');
    }

    public function show(Product $product): Response
    {
        $this->authorizeAdmin();

        $product->load(['productCategory:id,name,slug', 'branchStocks.branch']);

        return Inertia::render('Admin/Products/Show', [
            'page' => 'admin.products.show',
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $this->authorizeAdmin();

        $product->load(['productCategory:id,name,slug', 'branchStocks.branch']);

        return Inertia::render('Admin/Products/Edit', [
            'page' => 'admin.products.edit',
            'product' => $product,
            'productCategories' => ProductCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'branches' => $this->branchesForActor(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('thumbnail')) {
            // Hapus gambar lama jika ada
            if ($product->image_path && File::exists(public_path($product->image_path))) {
                File::delete(public_path($product->image_path));
            }
            $data['image_path'] = $this->processAndSaveThumbnail($request->file('thumbnail'));
        }

        unset($data['branch_stocks'], $data['thumbnail']);

        $product->update($data);

        $this->syncBranchStocks($product, $request->input('branch_stocks'));

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    private function processAndSaveThumbnail($file): string
    {
        $dir = public_path('images/products');
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $filename = time() . '_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.jpg';
        $destPath = $dir . '/' . $filename;

        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file->getRealPath());

        // Kompres: resize jika lebih dari 1200px (maintain aspect ratio)
        $image->scaleDown(width: 1200);

        // Encode sebagai JPEG kualitas 80% dan simpan
        $image->encode(new JpegEncoder(quality: 80))->save($destPath);

        return '/images/products/' . $filename;
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($product->orderItems()->exists() || $product->offlineSaleItems()->exists() || $product->productRecommendations()->exists()) {
            return redirect()
                ->route('admin.products.index')
                ->with('error', 'Produk tidak dapat dihapus karena sudah dipakai pada transaksi atau rekomendasi. Nonaktifkan produk jika tidak ingin ditampilkan.');
        }

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
