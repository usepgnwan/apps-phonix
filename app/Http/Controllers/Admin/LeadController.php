<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLeadFollowUpRequest;
use App\Http\Requests\Admin\StoreLeadRequest;
use App\Http\Requests\Admin\UpdateLeadRequest;
use App\Http\Requests\Admin\UpdateLeadStatusRequest;
use App\Models\Branch;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    private const LEAD_STATUSES = ['new', 'interested', 'needs_follow_up', 'booking_examination', 'purchased', 'not_interested'];

    private function authorizeAdmin(): User
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function ensureLeadInScope(User $actor, Lead $lead): void
    {
        $actor->ensureCanAccessBranch(
            $lead->branch_id !== null ? (int) $lead->branch_id : null,
            'Akses ditolak: Lead ini bukan milik cabang Anda.'
        );
    }

    private function activeFieldStaffQuery(User $actor)
    {
        $query = User::query()
            ->where('role', 'field_staff')
            ->where('is_active', true)
            ->orderBy('name');

        return $actor->applyBranchScope($query);
    }

    private function branchesForActor(User $actor)
    {
        $forcedBranchId = $actor->forcedBranchId();

        if ($forcedBranchId !== null) {
            return Branch::query()->where('id', $forcedBranchId)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        }

        return Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']);
    }

    private function eventsQuery(User $actor)
    {
        return $actor->applyBranchScope(Event::query()->latest());
    }

    public function index(Request $request): Response
    {
        $user = $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $metricsQuery = $user->applyBranchScope(Lead::query());

        $metrics = [
            'total' => (clone $metricsQuery)->count(),
            'newLead' => (clone $metricsQuery)->where('follow_up_status', 'new')->count(),
            'interested' => (clone $metricsQuery)->where('follow_up_status', 'interested')->count(),
            'needsFollowUp' => (clone $metricsQuery)->where('follow_up_status', 'needs_follow_up')->count(),
            'purchased' => (clone $metricsQuery)->where('follow_up_status', 'purchased')->count(),
        ];

        $query = $user->applyBranchScope(
            Lead::query()->with([
                'leadSource:id,name,slug,is_active',
                'assignedStaff:id,name,email',
                'customerProfile:id,name,whatsapp_number',
                'event:id,name,start_date,end_date,is_active',
                'branch:id,name',
            ])
        );

        $leads = $query->when($search, function ($q, $search) {
            $q->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('whatsapp_number', 'like', "%{$search}%")
                    ->orWhereHas('assignedStaff', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Leads/Index', [
            'page' => 'admin.leads.index',
            'leads' => $leads,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $user = $this->authorizeAdmin();

        return Inertia::render('Admin/Leads/Create', [
            'page' => 'admin.leads.create',
            'leadSources' => LeadSource::query()->where('is_active', true)->latest()->get(),
            'users' => $this->activeFieldStaffQuery($user)->get(['id', 'name', 'email', 'role', 'is_active', 'branch_id']),
            'customerProfiles' => CustomerProfile::query()->visibleToAdmin($user)->latest()->get(),
            'events' => $this->eventsQuery($user)->get(),
            'leadStatuses' => self::LEAD_STATUSES,
            'branches' => $this->branchesForActor($user),
            'defaultBranchId' => $user->forcedBranchId(),
        ]);
    }

    public function store(StoreLeadRequest $request): RedirectResponse
    {
        $this->authorizeAdmin();

        Lead::query()->create($request->validated());

        return redirect()->route('admin.leads.index')->with('success', 'Lead berhasil ditambahkan.');
    }

    public function show(Lead $lead): Response
    {
        $user = $this->authorizeAdmin();
        $this->ensureLeadInScope($user, $lead);

        $lead->load([
            'leadSource:id,name,slug,is_active',
            'assignedStaff:id,name,email',
            'customerProfile:id,name,whatsapp_number',
            'event:id,name,start_date,end_date,is_active',
            'branch:id,name',
            'leadFollowUps.user:id,name,email',
        ]);

        return Inertia::render('Admin/Leads/Show', [
            'page' => 'admin.leads.show',
            'lead' => $lead,
            'leadStatuses' => self::LEAD_STATUSES,
            'leadSources' => LeadSource::query()->where('is_active', true)->latest()->get(),
            'users' => $this->activeFieldStaffQuery($user)->get(['id', 'name', 'email', 'role', 'is_active', 'branch_id']),
            'customerProfiles' => CustomerProfile::query()->visibleToAdmin($user)->latest()->get(),
            'events' => $this->eventsQuery($user)->get(),
            'branches' => $this->branchesForActor($user),
            'defaultBranchId' => $user->forcedBranchId(),
        ]);
    }

    public function update(UpdateLeadRequest $request, Lead $lead): RedirectResponse
    {
        $user = $this->authorizeAdmin();
        $this->ensureLeadInScope($user, $lead);

        $lead->update($request->validated());

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Lead berhasil diperbarui.');
    }

    public function updateStatus(UpdateLeadStatusRequest $request, Lead $lead): RedirectResponse
    {
        $user = $this->authorizeAdmin();
        $this->ensureLeadInScope($user, $lead);

        $lead->update($request->validated());

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Status lead berhasil diperbarui.');
    }

    public function storeFollowUp(StoreLeadFollowUpRequest $request, Lead $lead): RedirectResponse
    {
        $user = $this->authorizeAdmin();
        $this->ensureLeadInScope($user, $lead);

        $lead->leadFollowUps()->create([
            'user_id' => $user->id,
            'status' => $request->validated()['status'],
            'notes' => $request->validated()['notes'],
            'followed_up_at' => $request->validated()['followed_up_at'],
        ]);

        return redirect()->route('admin.leads.show', $lead)->with('success', 'Follow-up lead berhasil ditambahkan.');
    }
}
