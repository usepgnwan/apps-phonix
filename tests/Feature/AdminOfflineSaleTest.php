<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\OfflineSale;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOfflineSaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_offline_sales_index(): void
    {
        $this->get(route('admin.offline-sales.index'))->assertRedirect(route('login'));
    }

    public function test_non_admin_gets_forbidden(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        $this->actingAs($user)->get(route('admin.offline-sales.index'))->assertForbidden();
    }

    public function test_inactive_admin_gets_forbidden(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => false]);

        $this->actingAs($admin)->get(route('admin.offline-sales.index'))->assertForbidden();
    }

    public function test_active_admin_can_view_index_create_and_show_pages(): void
    {
        $admin = $this->createAdmin();
        $product = $this->createProduct(['name' => 'Herbal A']);
        $customerProfile = $this->createCustomerProfile();
        $event = $this->createEvent();
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($event, $fieldStaff, $customerProfile);
        $offlineSale = $this->createOfflineSale($product, $customerProfile, $lead, $fieldStaff, $event);

        $this->inertiaGet($admin, route('admin.offline-sales.index'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/OfflineSales/Index')
            ->assertJsonPath('props.offlineSales.0.sale_number', $offlineSale->sale_number)
            ->assertJsonPath('props.offlineSales.0.customer_profile.name', $customerProfile->name)
            ->assertJsonPath('props.offlineSales.0.field_staff.id', $fieldStaff->id);

        $this->inertiaGet($admin, route('admin.offline-sales.create'))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/OfflineSales/Create')
            ->assertJsonPath('props.products.0.name', 'Herbal A')
            ->assertJsonPath('props.customerProfiles.0.name', $customerProfile->name)
            ->assertJsonPath('props.leads.0.id', $lead->id)
            ->assertJsonPath('props.fieldStaff.0.id', $fieldStaff->id)
            ->assertJsonPath('props.events.0.id', $event->id);

        $this->inertiaGet($admin, route('admin.offline-sales.show', $offlineSale))
            ->assertOk()
            ->assertJsonPath('component', 'Admin/OfflineSales/Show')
            ->assertJsonPath('props.offlineSale.offline_sale_items.0.product_name', $product->name)
            ->assertJsonPath('props.offlineSale.customer_profile.name', $customerProfile->name)
            ->assertJsonPath('props.offlineSale.lead.id', $lead->id)
            ->assertJsonPath('props.offlineSale.field_staff.id', $fieldStaff->id)
            ->assertJsonPath('props.offlineSale.event.id', $event->id);
    }

    public function test_active_admin_can_create_offline_sale_with_server_calculated_items_and_total(): void
    {
        $admin = $this->createAdmin();
        $productA = $this->createProduct(['name' => 'Herbal A', 'price' => 100000, 'stock_quantity' => 10]);
        $productB = $this->createProduct(['name' => 'Herbal B', 'price' => 75000, 'stock_quantity' => 10]);
        $customerProfile = $this->createCustomerProfile();
        $event = $this->createEvent();
        $fieldStaff = $this->createFieldStaff();
        $lead = $this->createLead($event, $fieldStaff, $customerProfile);

        $response = $this->actingAs($admin)->post(route('admin.offline-sales.store'), [
            'customer_profile_id' => $customerProfile->id,
            'lead_id' => $lead->id,
            'field_staff_id' => $fieldStaff->id,
            'event_id' => $event->id,
            'source' => 'event',
            'customer_name' => 'Customer Offline',
            'customer_whatsapp_number' => '08123456789',
            'notes' => 'Pembelian di event',
            'sold_at' => now()->format('Y-m-d H:i:s'),
            'total' => 1,
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 2, 'unit_price' => 1, 'line_total' => 1],
                ['product_id' => $productB->id, 'quantity' => 1],
            ],
        ]);

        $offlineSale = OfflineSale::query()->latest('id')->firstOrFail();
        $response->assertRedirect(route('admin.offline-sales.show', $offlineSale));

        $this->assertMatchesRegularExpression('/^OFF-\d{8}-[A-Z0-9]{6}$/', $offlineSale->sale_number);
        $this->assertSame('275000.00', (string) $offlineSale->total);
        $this->assertSame(10, $productA->fresh()->stock_quantity);
        $this->assertSame(10, $productB->fresh()->stock_quantity);

        $this->assertDatabaseHas('offline_sales', [
            'id' => $offlineSale->id,
            'customer_profile_id' => $customerProfile->id,
            'lead_id' => $lead->id,
            'field_staff_id' => $fieldStaff->id,
            'event_id' => $event->id,
            'source' => 'event',
            'customer_name' => 'Customer Offline',
            'customer_whatsapp_number' => '08123456789',
            'total' => 275000,
            'notes' => 'Pembelian di event',
        ]);
        $this->assertDatabaseHas('offline_sale_items', [
            'offline_sale_id' => $offlineSale->id,
            'product_id' => $productA->id,
            'product_name' => 'Herbal A',
            'unit_price' => 100000,
            'quantity' => 2,
            'line_total' => 200000,
        ]);
        $this->assertDatabaseHas('offline_sale_items', [
            'offline_sale_id' => $offlineSale->id,
            'product_id' => $productB->id,
            'product_name' => 'Herbal B',
            'unit_price' => 75000,
            'quantity' => 1,
            'line_total' => 75000,
        ]);
    }

    public function test_active_admin_can_create_offline_sale_with_nullable_relations(): void
    {
        $admin = $this->createAdmin();
        $product = $this->createProduct(['stock_quantity' => 5]);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), [
            'customer_profile_id' => null,
            'lead_id' => null,
            'field_staff_id' => null,
            'event_id' => null,
            'source' => 'offline',
            'customer_name' => 'Customer Walk In',
            'customer_whatsapp_number' => null,
            'notes' => null,
            'sold_at' => now()->format('Y-m-d H:i:s'),
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('offline_sales', [
            'customer_profile_id' => null,
            'lead_id' => null,
            'field_staff_id' => null,
            'event_id' => null,
            'source' => 'offline',
            'customer_name' => 'Customer Walk In',
        ]);
    }

    public function test_offline_sale_validation_rejects_invalid_source_and_empty_items(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), [
            'source' => 'invalid',
            'customer_name' => 'Customer Offline',
            'sold_at' => now()->format('Y-m-d H:i:s'),
            'items' => [],
        ])->assertSessionHasErrors(['source', 'items']);
    }

    public function test_offline_sale_validation_rejects_invalid_relations_and_field_staff(): void
    {
        $admin = $this->createAdmin();
        $product = $this->createProduct();
        $customer = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $inactiveFieldStaff = $this->createFieldStaff(['is_active' => false]);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), array_merge($this->offlineSalePayload($product), [
            'customer_profile_id' => 999999,
            'lead_id' => 999999,
            'field_staff_id' => $customer->id,
            'event_id' => 999999,
        ]))->assertSessionHasErrors(['customer_profile_id', 'lead_id', 'field_staff_id', 'event_id']);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), array_merge($this->offlineSalePayload($product), [
            'field_staff_id' => $inactiveFieldStaff->id,
        ]))->assertSessionHasErrors('field_staff_id');
    }

    public function test_offline_sale_validation_rejects_invalid_product_and_quantity(): void
    {
        $admin = $this->createAdmin();
        $inactiveProduct = $this->createProduct(['is_active' => false, 'stock_quantity' => 10]);
        $lowStockProduct = $this->createProduct(['stock_quantity' => 1]);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), array_merge($this->offlineSalePayload($inactiveProduct), [
            'items' => [
                ['product_id' => $inactiveProduct->id, 'quantity' => 1],
                ['product_id' => $lowStockProduct->id, 'quantity' => 0],
            ],
        ]))->assertSessionHasErrors(['items.0.product_id', 'items.1.quantity']);

        $this->actingAs($admin)->post(route('admin.offline-sales.store'), array_merge($this->offlineSalePayload($lowStockProduct), [
            'items' => [
                ['product_id' => $lowStockProduct->id, 'quantity' => 2],
            ],
        ]))->assertSessionHasErrors('items.0.quantity');
    }

    public function test_non_admin_cannot_create_offline_sale(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);
        $product = $this->createProduct();

        $this->actingAs($user)->post(route('admin.offline-sales.store'), $this->offlineSalePayload($product))->assertForbidden();
    }

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function inertiaGet(User $admin, string $url): \Illuminate\Testing\TestResponse
    {
        $request = $this->actingAs($admin)->withHeader('X-Inertia', 'true');

        if (file_exists(public_path('build/manifest.json'))) {
            $request->withHeader('X-Inertia-Version', hash_file('xxh128', public_path('build/manifest.json')));
        }

        return $request->get($url);
    }

    private function createFieldStaff(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['role' => 'field_staff', 'is_active' => true], $attributes));
    }

    private function createCustomerProfile(): CustomerProfile
    {
        $index = CustomerProfile::query()->count() + 1;
        $user = User::factory()->create(['role' => 'customer', 'is_active' => true]);

        return CustomerProfile::query()->create([
            'user_id' => $user->id,
            'name' => 'Customer '.$index,
            'whatsapp_number' => '0812345678'.$index,
            'primary_address' => 'Alamat '.$index,
            'member_status' => 'non_member',
        ]);
    }

    private function createEvent(): Event
    {
        $index = Event::query()->count() + 1;

        return Event::query()->create([
            'name' => 'Event '.$index,
            'event_date' => now()->addDay()->toDateString(),
            'location' => 'Lokasi '.$index,
            'organizer' => 'Organizer '.$index,
            'notes' => 'Catatan event',
        ]);
    }

    private function createLead(Event $event, User $fieldStaff, CustomerProfile $customerProfile): Lead
    {
        $leadSource = LeadSource::query()->create([
            'name' => 'Door to Door',
            'slug' => 'door-to-door-'.(LeadSource::query()->count() + 1),
            'is_active' => true,
        ]);

        return Lead::query()->create([
            'assigned_staff_id' => $fieldStaff->id,
            'customer_profile_id' => $customerProfile->id,
            'lead_source_id' => $leadSource->id,
            'event_id' => $event->id,
            'name' => 'Prospek Offline',
            'whatsapp_number' => '08123456789',
            'follow_up_status' => 'new',
        ]);
    }

    private function createProduct(array $attributes = []): Product
    {
        $index = Product::query()->count() + 1;
        $category = ProductCategory::query()->first() ?? ProductCategory::query()->create([
            'name' => 'Kategori Herbal',
            'slug' => 'kategori-herbal',
            'description' => 'Deskripsi kategori',
            'is_active' => true,
        ]);

        return Product::query()->create(array_merge([
            'product_category_id' => $category->id,
            'name' => 'Produk '.$index,
            'slug' => 'produk-'.$index,
            'price' => 100000,
            'short_description' => 'Singkat',
            'full_description' => 'Lengkap',
            'benefits' => 'Manfaat',
            'usage_rules' => 'Aturan',
            'notes' => 'Catatan',
            'image_path' => null,
            'stock_quantity' => 10,
            'low_stock_threshold' => 1,
            'is_active' => true,
            'is_featured' => false,
        ], $attributes));
    }

    private function createOfflineSale(Product $product, CustomerProfile $customerProfile, Lead $lead, User $fieldStaff, Event $event): OfflineSale
    {
        $offlineSale = OfflineSale::query()->create([
            'sale_number' => 'OFF-'.now()->format('Ymd').'-ABC123',
            'customer_profile_id' => $customerProfile->id,
            'lead_id' => $lead->id,
            'field_staff_id' => $fieldStaff->id,
            'event_id' => $event->id,
            'source' => 'event',
            'customer_name' => 'Customer Offline',
            'customer_whatsapp_number' => '08123456789',
            'total' => 100000,
            'notes' => 'Penjualan event',
            'sold_at' => now(),
        ]);

        $offlineSale->offlineSaleItems()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => 1,
            'line_total' => $product->price,
        ]);

        return $offlineSale;
    }

    private function offlineSalePayload(Product $product): array
    {
        return [
            'customer_profile_id' => null,
            'lead_id' => null,
            'field_staff_id' => null,
            'event_id' => null,
            'source' => 'offline',
            'customer_name' => 'Customer Offline',
            'customer_whatsapp_number' => '08123456789',
            'notes' => 'Catatan offline',
            'sold_at' => now()->format('Y-m-d H:i:s'),
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ];
    }
}
