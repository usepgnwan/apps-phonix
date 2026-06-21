<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::latest()->paginate(10);
        return Inertia::render('Admin/Videos/Index', [
            'videos' => $videos
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Videos/Create');
    }

    public function store(Request $request)
    {
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

    public function edit(Video $video)
    {
        return Inertia::render('Admin/Videos/Edit', [
            'video' => $video
        ]);
    }

    public function update(Request $request, Video $video)
    {
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
        $video->delete();

        return redirect()->route('admin.videos.index')->with('success', 'Video berhasil dihapus.');
    }

    public function togglePin(Video $video)
    {
        $newStatus = !$video->is_pinned;

        if ($newStatus) {
            Video::query()->where('id', '!=', $video->id)->update(['is_pinned' => false]);
        }

        $video->update(['is_pinned' => $newStatus]);

        return back()->with('success', $newStatus ? 'Video berhasil disematkan.' : 'Penyematan video dibatalkan.');
    }
}
