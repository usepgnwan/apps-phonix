<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
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

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Products/Index', [
            'page' => 'admin.products.index',
            'products' => Product::query()->with('productCategory:id,name,slug')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Products/Create', [
            'page' => 'admin.products.create',
            'productCategories' => ProductCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        if ($request->hasFile('thumbnail')) {
            $data['image_path'] = $this->processAndSaveThumbnail($request->file('thumbnail'));
        }

        Product::query()->create($data);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil disimpan.');
    }

    public function show(Product $product): Response
    {
        $this->authorizeAdmin();

        $product->load('productCategory:id,name,slug');

        return Inertia::render('Admin/Products/Show', [
            'page' => 'admin.products.show',
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $this->authorizeAdmin();

        $product->load('productCategory:id,name,slug');

        return Inertia::render('Admin/Products/Edit', [
            'page' => 'admin.products.edit',
            'product' => $product,
            'productCategories' => ProductCategory::query()->orderBy('name')->get(['id', 'name', 'slug']),
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

        $product->update($data);

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

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
