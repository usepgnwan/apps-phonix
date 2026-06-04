<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'page' => 'services.index',
            'services' => Service::query()
                ->where('is_active', true)
                ->latest()
                ->paginate(12)
                ->withQueryString(),
        ]);
    }

    public function show(Service $service): Response
    {
        abort_unless($service->is_active, 404);

        return Inertia::render('Welcome', [
            'page' => 'services.show',
            'service' => $service,
            'relatedServices' => Service::query()
                ->where('is_active', true)
                ->whereKeyNot($service->id)
                ->latest()
                ->limit(4)
                ->get(['id', 'name', 'slug', 'description', 'price', 'visit_type', 'image_path']),
        ]);
    }
}
