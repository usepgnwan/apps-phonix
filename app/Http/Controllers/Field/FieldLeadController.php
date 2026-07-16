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

        $search = $request->input('search');

        $leads = Lead::query()
            ->where('assigned_staff_id', $request->user()->id)
            ->with(['leadSource', 'customerProfile', 'event'])
            ->when($search, function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('whatsapp_number', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Field/Leads/Index', [
            'leads' => $leads,
            'leadStatuses' => self::LEAD_STATUSES,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Request $request, Lead $lead): Response
    {
        $this->ensureActiveFieldStaff($request);
        $this->ensureAssignedLead($request, $lead);

        return Inertia::render('Field/Leads/Show', [
            'lead' => $lead->load(['leadSource', 'customerProfile', 'event', 'fieldActivities']),
            'activityTypes' => ['visit', 'follow_up', 'note'],
            'leadStatuses' => self::LEAD_STATUSES,
        ]);
    }

    public function updateStatus(UpdateFieldLeadStatusRequest $request, Lead $lead): RedirectResponse
    {
        $this->ensureAssignedLead($request, $lead);

        $lead->update($request->validated());

        return redirect()
            ->route('field.leads.show', $lead)
            ->with('success', 'Status lead berhasil diperbarui.');
    }

    public function storeActivity(StoreFieldActivityRequest $request, Lead $lead): RedirectResponse
    {
        $this->ensureAssignedLead($request, $lead);

        $lead->fieldActivities()->create(array_merge($request->validated(), [
            'field_staff_id' => $request->user()->id,
        ]));

        return redirect()
            ->route('field.leads.show', $lead)
            ->with('success', 'Aktivitas lapangan berhasil dicatat.');
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
