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
        $query = Service::query()
            ->where('is_active', true);

        if ($search = request('search')) {
            $query->where('name', 'ilike', '%' . $search . '%');
        }

        $sort = request('sort', 'latest');
        if ($sort === 'name') {
            $query->orderBy('name');
        } elseif ($sort === 'price_low') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('price', 'desc');
        } else {
            $query->orderByDesc('is_featured')->latest();
        }

        $perPage = request('perPage', 12);
        if (!in_array($perPage, [12, 24, 36])) {
            $perPage = 12;
        }

        return Inertia::render('Public/Services/Index', [
            'services' => $query->paginate($perPage)->withQueryString(),
        ]);
    }

    public function show(Service $service): Response
    {
        abort_unless($service->is_active, 404);

        return Inertia::render('Public/Services/Show', [
            'service' => $service,
            'relatedServices' => Service::query()
                ->where('is_active', true)
                ->whereKeyNot($service->id)
                ->latest()
                ->limit(4)
                ->get(['id', 'name', 'slug', 'description', 'price', 'visit_type', 'image_path', 'is_featured']),
        ]);
    }
}
