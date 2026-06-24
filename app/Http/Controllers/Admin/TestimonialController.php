<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestimonialRequest;
use App\Http\Requests\Admin\UpdateTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;

class TestimonialController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    private function processAndSavePhoto($file): ?string
    {
        if (!$file) {
            return null;
        }

        $dir = public_path('images/testimonials');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $manager = new ImageManager(new Driver());
        $filename = Str::random(40) . '.jpg';
        $destPath = $dir . '/' . $filename;

        $image = $manager->decode($file->getRealPath());
        $image->scaleDown(width: 500); // 500px is enough for testimonial avatar
        $image->encode(new JpegEncoder(quality: 80))->save($destPath);

        return '/images/testimonials/' . $filename;
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $testimonials = Testimonial::query()
            ->when($search, function ($query, $search) {
                $query->where('customer_name', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Testimonials/Index', [
            'page' => 'admin.testimonials.index',
            'testimonials' => $testimonials,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Testimonials/Create', [
            'page' => 'admin.testimonials.create',
        ]);
    }

    public function store(StoreTestimonialRequest $request): RedirectResponse
    {
        $data = $request->validated();
        
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->processAndSavePhoto($request->file('photo'));
        }
        unset($data['photo']);

        Testimonial::query()->create($data);

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimoni berhasil disimpan.');
    }

    public function edit(Testimonial $testimonial): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Testimonials/Edit', [
            'page' => 'admin.testimonials.edit',
            'testimonial' => $testimonial,
        ]);
    }

    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        $data = $request->validated();
        
        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($testimonial->photo_path && File::exists(public_path($testimonial->photo_path))) {
                File::delete(public_path($testimonial->photo_path));
            }
            $data['photo_path'] = $this->processAndSavePhoto($request->file('photo'));
        }
        unset($data['photo']);

        $testimonial->update($data);

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimoni berhasil diperbarui.');
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $this->authorizeAdmin();
        $testimonial->delete();

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimoni berhasil dihapus.');
    }
}
