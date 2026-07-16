<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VideoController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola video.');
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $videos = Video::query()
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Videos/Index', [
            'videos' => $videos,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_link' => 'required|string|max:255',
            'is_pinned' => 'boolean'
        ]);

        $isPinned = $validated['is_pinned'] ?? false;

        if ($isPinned) {
            Video::query()->update(['is_pinned' => false]);
        }

        Video::create([
            'title' => $validated['title'],
            'video_link' => $validated['video_link'],
            'is_pinned' => $isPinned,
        ]);

        return redirect()->route('admin.videos.index')->with('success', 'Video berhasil ditambahkan.');
    }

    public function update(Request $request, Video $video)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_link' => 'required|string|max:255',
            'is_pinned' => 'boolean'
        ]);

        $isPinned = $validated['is_pinned'] ?? false;

        if ($isPinned) {
            Video::query()->where('id', '!=', $video->id)->update(['is_pinned' => false]);
        }

        $video->update([
            'title' => $validated['title'],
            'video_link' => $validated['video_link'],
            'is_pinned' => $isPinned,
        ]);

        return redirect()->route('admin.videos.index')->with('success', 'Video berhasil diperbarui.');
    }

    public function destroy(Video $video)
    {
        $this->authorizeAdmin();

        $video->delete();

        return redirect()->route('admin.videos.index')->with('success', 'Video berhasil dihapus.');
    }

    public function togglePin(Video $video)
    {
        $this->authorizeAdmin();

        $newStatus = !$video->is_pinned;

        if ($newStatus) {
            Video::query()->where('id', '!=', $video->id)->update(['is_pinned' => false]);
        }

        $video->update(['is_pinned' => $newStatus]);

        return back()->with('success', $newStatus ? 'Video berhasil disematkan.' : 'Penyematan video dibatalkan.');
    }
}
