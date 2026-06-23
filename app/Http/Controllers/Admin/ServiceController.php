<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $services = Service::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Services/Index', [
            'page' => 'admin.services.index',
            'services' => $services,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Services/Create', [
            'page' => 'admin.services.create',
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('thumbnail')) {
            $data['image_path'] = $this->processAndSaveThumbnail($request->file('thumbnail'));
        }
        unset($data['thumbnail']);

        Service::query()->create($data);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Layanan berhasil disimpan.');
    }

    public function show(Service $service): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Services/Show', [
            'page' => 'admin.services.show',
            'service' => $service,
        ]);
    }

    public function edit(Service $service): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Services/Edit', [
            'page' => 'admin.services.edit',
            'service' => $service,
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('thumbnail')) {
            if ($service->image_path && File::exists(public_path($service->image_path))) {
                File::delete(public_path($service->image_path));
            }

            $data['image_path'] = $this->processAndSaveThumbnail($request->file('thumbnail'));
        }
        unset($data['thumbnail']);

        $service->update($data);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Layanan berhasil diperbarui.');
    }

    private function processAndSaveThumbnail($file): string
    {
        $dir = public_path('images/services');
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $filename = time() . '_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.jpg';
        $destPath = $dir . '/' . $filename;

        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file->getRealPath());
        $image->scaleDown(width: 1200);
        $image->encode(new JpegEncoder(quality: 80))->save($destPath);

        return '/images/services/' . $filename;
    }

    public function destroy(Service $service): RedirectResponse
    {
        $this->authorizeAdmin();

        $service->delete();

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Layanan berhasil dihapus.');
    }
}
