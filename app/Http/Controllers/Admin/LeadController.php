<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLeadRequest;
use App\Http\Requests\Admin\StoreLeadFollowUpRequest;
use App\Http\Requests\Admin\UpdateLeadRequest;
use App\Http\Requests\Admin\UpdateLeadStatusRequest;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    private const LEAD_STATUSES = ['new', 'interested', 'needs_follow_up', 'booking_examination', 'purchased', 'not_interested'];

    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.leads.index',
            'leads' => Lead::query()
                ->with(['leadSource:id,name,slug,is_active', 'assignedStaff:id,name,email', 'customerProfile:id,name,whatsapp_number', 'event:id,name,event_date'])
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.leads.create',
            'leadSources' => LeadSource::query()->where('is_active', true)->latest()->get(),
            'users' => User::query()->latest()->get(),
            'customerProfiles' => CustomerProfile::query()->latest()->get(),
            'events' => Event::query()->latest()->get(),
            'leadStatuses' => self::LEAD_STATUSES,
        ]);
    }

    public function store(StoreLeadRequest $request): RedirectResponse
    {
        Lead::query()->create($request->validated());

        return redirect()->route('admin.leads.index')->with('success', 'Lead berhasil ditambahkan.');
    }

    public function show(Lead $lead): Response
    {
        $this->authorizeAdmin();

        $lead->load([
            'leadSource:id,name,slug,is_active',
            'assignedStaff:id,name,email',
            'customerProfile:id,name,whatsapp_number',
            'event:id,name,event_date',
            'leadFollowUps.user:id,name,email',
        ]);

        return Inertia::render('Welcome', [
            'page' => 'admin.leads.show',
            'lead' => $lead,
            'leadStatuses' => self::LEAD_STATUSES,
        ]);
    }

    public function update(UpdateLeadRequest $request, Lead $lead): RedirectResponse
    {
        $lead->update($request->validated());

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Lead berhasil diperbarui.');
    }

    public function updateStatus(UpdateLeadStatusRequest $request, Lead $lead): RedirectResponse
    {
        $lead->update($request->validated());

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Status lead berhasil diperbarui.');
    }

    public function storeFollowUp(StoreLeadFollowUpRequest $request, Lead $lead): RedirectResponse
    {
        $lead->leadFollowUps()->create([
            'user_id' => $request->user()->id,
            'status' => $request->validated()['status'],
            'notes' => $request->validated()['notes'],
            'followed_up_at' => $request->validated()['followed_up_at'],
        ]);

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Follow-up lead berhasil ditambahkan.');
    }
}
