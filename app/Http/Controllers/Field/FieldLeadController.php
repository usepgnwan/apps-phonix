<?php

namespace App\Http\Controllers\Field;

use App\Http\Controllers\Controller;
use App\Http\Requests\Field\StoreFieldActivityRequest;
use App\Http\Requests\Field\UpdateFieldLeadStatusRequest;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FieldLeadController extends Controller
{
    private const LEAD_STATUSES = [
        'new',
        'interested',
        'needs_follow_up',
        'booking_examination',
        'purchased',
        'not_interested',
    ];

    public function index(Request $request): Response
    {
        $this->ensureActiveFieldStaff($request);

        return Inertia::render('Welcome', [
            'page' => 'field.leads.index',
            'leads' => Lead::query()
                ->where('assigned_staff_id', $request->user()->id)
                ->with(['leadSource', 'customerProfile', 'event'])
                ->latest()
                ->paginate(10),
            'leadStatuses' => self::LEAD_STATUSES,
        ]);
    }

    public function show(Request $request, Lead $lead): Response
    {
        $this->ensureActiveFieldStaff($request);
        $this->ensureAssignedLead($request, $lead);

        return Inertia::render('Welcome', [
            'page' => 'field.leads.show',
            'lead' => $lead->load(['leadSource', 'customerProfile', 'event', 'fieldActivities']),
            'activityTypes' => ['visit', 'follow_up', 'note'],
            'leadStatuses' => self::LEAD_STATUSES,
        ]);
    }

    public function updateStatus(UpdateFieldLeadStatusRequest $request, Lead $lead): RedirectResponse
    {
        $this->ensureAssignedLead($request, $lead);

        $lead->update($request->validated());

        return redirect()->route('field.leads.show', $lead);
    }

    public function storeActivity(StoreFieldActivityRequest $request, Lead $lead): RedirectResponse
    {
        $this->ensureAssignedLead($request, $lead);

        $lead->fieldActivities()->create(array_merge($request->validated(), [
            'field_staff_id' => $request->user()->id,
        ]));

        return redirect()->route('field.leads.show', $lead);
    }

    private function ensureActiveFieldStaff(Request $request): void
    {
        $user = $request->user();

        abort_unless($user?->role === 'field_staff' && $user->is_active === true, 403);
    }

    private function ensureAssignedLead(Request $request, Lead $lead): void
    {
        abort_unless($lead->assigned_staff_id === $request->user()?->id, 404);
    }
}
