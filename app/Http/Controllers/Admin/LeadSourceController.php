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

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.lead-sources.index',
            'leadSources' => LeadSource::query()
                ->withCount('leads')
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.lead-sources.create',
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

        return Inertia::render('Welcome', [
            'page' => 'admin.lead-sources.show',
            'leadSource' => $leadSource,
        ]);
    }

    public function edit(LeadSource $leadSource): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.lead-sources.edit',
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
