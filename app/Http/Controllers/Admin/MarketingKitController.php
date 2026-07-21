<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMarketingKitRequest;
use App\Http\Requests\Admin\UpdateMarketingKitRequest;
use App\Models\MarketingKit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MarketingKitController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function storeUpload(UploadedFile $file): array
    {
        $dir = public_path('files/marketing-kits');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $originalFilename = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType() ?: $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $filename = Str::random(40).'.'.$extension;
        $file->move($dir, $filename);

        return [
            'file_path' => 'files/marketing-kits/'.$filename,
            'original_filename' => $originalFilename,
            'mime_type' => $mimeType,
        ];
    }

    private function deleteStoredFile(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        $absolute = public_path(ltrim($path, '/'));
        if (File::exists($absolute)) {
            File::delete($absolute);
        }
    }

    public function index(Request $request): Response
    {
        $this->authorizeAdmin();

        $kits = MarketingKit::query()
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (MarketingKit $kit) => [
                'id' => $kit->id,
                'title' => $kit->title,
                'category' => $kit->category,
                'category_label' => $kit->categoryLabel(),
                'description' => $kit->description,
                'body_text' => $kit->body_text,
                'file_path' => $kit->file_path,
                'file_url' => $kit->publicFileUrl(),
                'original_filename' => $kit->original_filename,
                'is_active' => $kit->is_active,
                'sort_order' => $kit->sort_order,
            ]);

        return Inertia::render('Admin/MarketingKits/Index', [
            'page' => 'admin.marketing-kits.index',
            'kits' => $kits,
        ]);
    }

    public function store(StoreMarketingKitRequest $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validated();
        $payload = [
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'body_text' => $validated['body_text'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
            'file_path' => null,
            'original_filename' => null,
            'mime_type' => null,
        ];

        if ($request->hasFile('file')) {
            $payload = array_merge($payload, $this->storeUpload($request->file('file')));
        }

        MarketingKit::query()->create($payload);

        return redirect()
            ->route('admin.marketing-kits.index')
            ->with('success', 'Materi marketing kit berhasil dipublikasikan.');
    }

    public function update(UpdateMarketingKitRequest $request, MarketingKit $marketingKit): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validated();
        $payload = [
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'body_text' => $validated['body_text'] ?? null,
            'is_active' => $validated['is_active'],
            'sort_order' => $validated['sort_order'],
        ];

        if ($request->hasFile('file')) {
            $this->deleteStoredFile($marketingKit->file_path);
            $payload = array_merge($payload, $this->storeUpload($request->file('file')));
        }

        $marketingKit->update($payload);

        return redirect()
            ->route('admin.marketing-kits.index')
            ->with('success', 'Materi marketing kit berhasil diperbarui.');
    }

    public function destroy(MarketingKit $marketingKit): RedirectResponse
    {
        $this->authorizeAdmin();

        $this->deleteStoredFile($marketingKit->file_path);
        $marketingKit->delete();

        return redirect()
            ->route('admin.marketing-kits.index')
            ->with('success', 'Materi marketing kit berhasil dihapus.');
    }
}
