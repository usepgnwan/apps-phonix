<?php

namespace App\Http\Controllers\Field;

use App\Http\Controllers\Controller;
use App\Models\FieldActivity;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FieldDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureActiveFieldStaff($request);

        $user = $request->user();
        $leadQuery = Lead::query()->where('assigned_staff_id', $user->id);

        return Inertia::render('Field/Dashboard', [
            'summary' => [
                'assignedLeadsCount' => (clone $leadQuery)->count(),
                'openLeadsCount' => (clone $leadQuery)->whereNotIn('follow_up_status', ['purchased', 'not_interested'])->count(),
                'activitiesCount' => FieldActivity::query()->where('field_staff_id', $user->id)->count(),
            ],
            'recentLeads' => (clone $leadQuery)
                ->with(['leadSource', 'customerProfile', 'event'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }

    private function ensureActiveFieldStaff(Request $request): void
    {
        $user = $request->user();

        abort_unless($user?->role === 'field_staff' && $user->is_active === true, 403);
    }
}
