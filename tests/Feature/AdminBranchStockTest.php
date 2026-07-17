<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\BranchProductStock;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBranchStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_branch_stock_page(): void
    {
        $this->get(route('admin.stock.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_cabang_is_forbidden_from_branch_stock_page(): void
    {
        $branch = $this->createBranch('Bandung', 'BDG');
        $adminCabang = User::factory()->adminBranch($branch->id)->create();

        $this->actingAs($adminCabang)
            ->get(route('admin.stock.index'))
            ->assertForbidden();
    }

    public function test_admin_pusat_defaults_to_pusat_branch_when_branch_id_missing(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $indramayu = $this->createBranch('Indramayu', 'IDM');
        $pusat = $this->createBranch('Pusat', 'PST');
        $category = $this->createCategory();
        $product = $this->createProduct($category, 'PASON', 'pason-default');

        BranchProductStock::query()->create([
            'branch_id' => $pusat->id,
            'product_id' => $product->id,
            'stock_quantity' => 8,
            'low_stock_threshold' => 0,
        ]);
        BranchProductStock::query()->create([
            'branch_id' => $indramayu->id,
            'product_id' => $product->id,
            'stock_quantity' => 3,
            'low_stock_threshold' => 0,
        ]);

        $response = $this->inertiaGet($admin, route('admin.stock.index'));

        $response->assertOk()
            ->assertJsonPath('component', 'Admin/Stock/Index')
            ->assertJsonPath('props.page', 'admin.stock.index')
            ->assertJsonPath('props.selectedBranch.id', $pusat->id)
            ->assertJsonPath('props.filters.branch_id', $pusat->id)
            ->assertJsonPath('props.summary.product_count', 1)
            ->assertJsonPath('props.summary.total_units', 8)
            ->assertJsonCount(1, 'props.stocks.data');
    }

    public function test_admin_pusat_defaults_to_head_office_name_when_code_not_pst(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $this->createBranch('Indramayu', 'IDM');
        $headOffice = $this->createBranch('Head Office', 'HO');

        $response = $this->inertiaGet($admin, route('admin.stock.index'));

        $response->assertOk()
            ->assertJsonPath('props.selectedBranch.id', $headOffice->id)
            ->assertJsonPath('props.filters.branch_id', $headOffice->id);
    }

    public function test_admin_pusat_sees_only_products_with_stock_greater_than_zero_for_selected_branch(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $category = $this->createCategory();
        $headOffice = $this->createBranch('Head Office', 'HO');
        $indramayu = $this->createBranch('Indramayu', 'IDM');

        $pason = $this->createProduct($category, 'PASON', 'pason');
        $etapro = $this->createProduct($category, 'ETAPRO', 'etapro');
        $vitto = $this->createProduct($category, 'VITTO', 'vitto');

        BranchProductStock::query()->create([
            'branch_id' => $headOffice->id,
            'product_id' => $pason->id,
            'stock_quantity' => 8,
            'low_stock_threshold' => 0,
        ]);
        BranchProductStock::query()->create([
            'branch_id' => $headOffice->id,
            'product_id' => $etapro->id,
            'stock_quantity' => 0,
            'low_stock_threshold' => 0,
        ]);
        BranchProductStock::query()->create([
            'branch_id' => $indramayu->id,
            'product_id' => $vitto->id,
            'stock_quantity' => 12,
            'low_stock_threshold' => 0,
        ]);

        $response = $this->inertiaGet($admin, route('admin.stock.index', [
            'branch_id' => $headOffice->id,
        ]));

        $response->assertOk()
            ->assertJsonPath('component', 'Admin/Stock/Index')
            ->assertJsonPath('props.selectedBranch.id', $headOffice->id)
            ->assertJsonPath('props.summary.product_count', 1)
            ->assertJsonPath('props.summary.total_units', 8)
            ->assertJsonCount(1, 'props.stocks.data')
            ->assertJsonPath('props.stocks.data.0.product_id', $pason->id)
            ->assertJsonPath('props.stocks.data.0.stock_quantity', 8);
    }

    public function test_admin_pusat_can_search_products_within_selected_branch(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $category = $this->createCategory();
        $branch = $this->createBranch('Masamba', 'MSB');

        $pason = $this->createProduct($category, 'PASON', 'pason-search');
        $etapro = $this->createProduct($category, 'ETAPRO', 'etapro-search');

        BranchProductStock::query()->create([
            'branch_id' => $branch->id,
            'product_id' => $pason->id,
            'stock_quantity' => 5,
            'low_stock_threshold' => 0,
        ]);
        BranchProductStock::query()->create([
            'branch_id' => $branch->id,
            'product_id' => $etapro->id,
            'stock_quantity' => 7,
            'low_stock_threshold' => 0,
        ]);

        $response = $this->inertiaGet($admin, route('admin.stock.index', [
            'branch_id' => $branch->id,
            'search' => 'PASON',
        ]));

        $response->assertOk()
            ->assertJsonCount(1, 'props.stocks.data')
            ->assertJsonPath('props.stocks.data.0.product.name', 'PASON');
    }

    public function test_inactive_branch_returns_not_found(): void
    {
        $admin = User::factory()->adminCentral()->create();
        $branch = $this->createBranch('Cabang Nonaktif', 'OFF', active: false);

        $this->inertiaGet($admin, route('admin.stock.index', [
            'branch_id' => $branch->id,
        ]))->assertNotFound();
    }

    private function inertiaGet(User $user, string $url)
    {
        $headers = ['X-Inertia' => 'true'];

        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        return $this->actingAs($user)->withHeaders($headers)->get($url);
    }

    private function createBranch(string $name, string $code, bool $active = true): Branch
    {
        return Branch::query()->create([
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'code' => $code,
            'address' => 'Alamat '.$name,
            'phone_number' => '08'.random_int(100000000, 999999999),
            'description' => null,
            'is_active' => $active,
        ]);
    }

    private function createCategory(): ProductCategory
    {
        return ProductCategory::query()->create([
            'name' => 'Kategori Stok',
            'slug' => 'kategori-stok-'.uniqid(),
            'description' => null,
            'is_active' => true,
        ]);
    }

    private function createProduct(ProductCategory $category, string $name, string $slug): Product
    {
        return Product::query()->create([
            'product_category_id' => $category->id,
            'name' => $name,
            'slug' => $slug,
            'price' => 100000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'benefits' => null,
            'usage_rules' => null,
            'notes' => null,
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }
}
