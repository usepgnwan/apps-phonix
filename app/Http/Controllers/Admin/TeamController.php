<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();
        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola tim.');
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $teams = Team::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Teams/Index', [
            'teams' => $teams,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:teams,name',
            'description' => 'nullable|string',
        ]);

        Team::create($validated);

        return redirect()->route('admin.teams.index')->with('success', 'Tim berhasil ditambahkan.');
    }

    public function update(Request $request, Team $team)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:teams,name,' . $team->id,
            'description' => 'nullable|string',
        ]);

        $team->update($validated);

        return redirect()->route('admin.teams.index')->with('success', 'Tim berhasil diperbarui.');
    }

    public function destroy(Team $team)
    {
        $this->authorizeAdmin();

        if ($team->users()->count() > 0) {
            return redirect()->route('admin.teams.index')->with('error', 'Tim tidak dapat dihapus karena masih digunakan oleh staff.');
        }

        $team->delete();

        return redirect()->route('admin.teams.index')->with('success', 'Tim berhasil dihapus.');
    }
}
