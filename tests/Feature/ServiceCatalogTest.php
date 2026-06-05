<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_index_renders_public_services_index_component(): void
    {
        $service = $this->createService();

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('services.index'));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Services/Index')
            ->assertJsonPath('props.services.data.0.id', $service->id);
    }

    public function test_service_show_renders_public_services_show_component(): void
    {
        $service = $this->createService();

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('services.show', $service));

        $response
            ->assertOk()
            ->assertJsonPath('component', 'Public/Services/Show')
            ->assertJsonPath('props.service.id', $service->id);
    }

    public function test_inactive_service_show_returns_not_found(): void
    {
        $service = $this->createService(isActive: false);

        $response = $this->withHeaders($this->inertiaHeaders())->get(route('services.show', $service));

        $response->assertNotFound();
    }

    private function createService(bool $isActive = true): Service
    {
        return Service::query()->create([
            'name' => 'Konsultasi Herbal '.Service::query()->count(),
            'slug' => 'konsultasi-herbal-'.Service::query()->count(),
            'description' => 'Layanan konsultasi herbal.',
            'price' => 150000,
            'visit_type' => 'both',
            'is_active' => $isActive,
            'is_featured' => false,
        ]);
    }

    private function inertiaHeaders(): array
    {
        $headers = ['X-Inertia' => 'true'];

        if (file_exists(public_path('build/manifest.json'))) {
            $headers['X-Inertia-Version'] = hash_file('xxh128', public_path('build/manifest.json'));
        }

        return $headers;
    }
}
