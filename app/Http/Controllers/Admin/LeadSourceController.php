<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLeadSourceRequest;
use App\Http\Requests\Admin\UpdateLeadSourceRequest;
use App\Models\LeadSource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeadSourceController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdminPusat(), 403, 'Hanya Admin Pusat yang dapat mengelola sumber lead.');
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $status = $request->input('status');
        $perPage = $request->input('per_page', 10);

        $metricsQuery = LeadSource::query();
        $metrics = [
            'total' => (clone $metricsQuery)->count(),
            'active' => (clone $metricsQuery)->where('is_active', true)->count(),
            'inactive' => (clone $metricsQuery)->where('is_active', false)->count(),
        ];

        $query = LeadSource::query()->withCount('leads');

        if ($search) {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $leadSources = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/LeadSources/Index', [
            'page' => 'admin.lead-sources.index',
            'leadSources' => $leadSources,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreLeadSourceRequest $request): RedirectResponse
    {
        LeadSource::query()->create($request->validated());

        return redirect()->route('admin.lead-sources.index')->with('success', 'Lead source berhasil ditambahkan.');
    }

    public function show(LeadSource $leadSource): Response
    {
        $this->authorizeAdmin();

        $leadSource->loadCount('leads');

        return Inertia::render('Admin/LeadSources/Show', [
            'page' => 'admin.lead-sources.show',
            'leadSource' => $leadSource,
        ]);
    }

    public function update(UpdateLeadSourceRequest $request, LeadSource $leadSource): RedirectResponse
    {
        $leadSource->update($request->validated());

        return redirect()->route('admin.lead-sources.index')->with('success', 'Lead source berhasil diperbarui.');
    }

    public function destroy(LeadSource $leadSource): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($leadSource->leads()->exists()) {
            return redirect()->route('admin.lead-sources.index')->with('error', 'Lead source tidak dapat dihapus karena masih memiliki lead.');
        }

        $leadSource->delete();

        return redirect()->route('admin.lead-sources.index')->with('success', 'Lead source berhasil dihapus.');
    }
}
