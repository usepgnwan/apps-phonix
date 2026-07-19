<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Models\Branch;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    private function ensureEventInScope(User $actor, Event $event): void
    {
        $actor->ensureCanAccessBranch(
            $event->branch_id !== null ? (int) $event->branch_id : null,
            'Akses ditolak: Event ini bukan milik cabang Anda.'
        );
    }

    private function branchesForActor(User $actor)
    {
        $forcedBranchId = $actor->forcedBranchId();

        if ($forcedBranchId !== null) {
            return Branch::query()->where('id', $forcedBranchId)->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        }

        return Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']);
    }

    private function resolveBranchId(User $user, ?string $requestedBranchId): ?int
    {
        $forcedBranchId = $user->forcedBranchId();

        if ($forcedBranchId !== null) {
            return $forcedBranchId;
        }

        if ($user->isAdminPusat() && $requestedBranchId !== null && $requestedBranchId !== '') {
            return (int) $requestedBranchId;
        }

        return null;
    }

    private function applyOptionalBranchFilter($query, ?int $branchId): void
    {
        if ($branchId !== null) {
            $query->where('branch_id', $branchId);
        }
    }

    public function index(Request $request): Response
    {
        $user = $this->authorizeAdmin();

        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $filter = $request->input('filter');
        $branchId = $this->resolveBranchId($user, $request->input('branch_id'));
        $perPage = $request->input('per_page', 10);

        $metricsQuery = $user->applyBranchScope(Event::query());
        $this->applyOptionalBranchFilter($metricsQuery, $branchId);

        $metrics = [
            'total' => (clone $metricsQuery)->count(),
            'active' => (clone $metricsQuery)->where('is_active', true)->where('start_date', '<=', now())->where('end_date', '>=', now())->count(),
            'upcoming' => (clone $metricsQuery)->where('start_date', '>', now())->count(),
            'past' => (clone $metricsQuery)->where('end_date', '<', now())->count(),
        ];

        $query = $user->applyBranchScope(
            Event::query()
                ->withCount(['leads', 'offlineSales'])
                ->with('branch:id,name')
        );

        $this->applyOptionalBranchFilter($query, $branchId);

        if ($search) {
            $query->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('organizer', 'like', "%{$search}%");
            });
        }

        if ($startDate) {
            $query->whereDate('start_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('end_date', '<=', $endDate);
        }

        if ($filter === 'active') {
            $query->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now());
        } elseif ($filter === 'upcoming') {
            $query->where('start_date', '>', now());
        } elseif ($filter === 'past') {
            $query->where('end_date', '<', now());
        }

        $events = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $showBranchFilter = $user->isAdminPusat();
        $lockedBranchName = null;

        if (! $showBranchFilter && $user->isAdminCabang()) {
            $lockedBranchName = $user->branch?->name
                ?? Branch::query()->where('id', $user->branch_id)->value('name');
        }

        return Inertia::render('Admin/Events/Index', [
            'events' => $events,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'filter' => $filter,
                'branch_id' => $branchId,
                'per_page' => $perPage,
            ],
            'branches' => $showBranchFilter ? $this->branchesForActor($user) : [],
            'showBranchFilter' => $showBranchFilter,
            'lockedBranchName' => $lockedBranchName,
        ]);
    }

    public function create(): Response
    {
        $user = $this->authorizeAdmin();

        return Inertia::render('Admin/Events/Create', [
            'branches' => $this->branchesForActor($user),
            'defaultBranchId' => $user->forcedBranchId(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $this->authorizeAdmin();

        Event::query()->create($request->validated());

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil ditambahkan.');
    }

    public function show(Event $event): Response
    {
        $user = $this->authorizeAdmin();
        $this->ensureEventInScope($user, $event);

        $event->loadCount(['leads', 'offlineSales']);
        $event->load('branch:id,name');

        return Inertia::render('Admin/Events/Show', [
            'event' => $event,
        ]);
    }

    public function edit(Event $event): Response
    {
        $user = $this->authorizeAdmin();
        $this->ensureEventInScope($user, $event);

        return Inertia::render('Admin/Events/Edit', [
            'event' => $event,
            'branches' => $this->branchesForActor($user),
            'defaultBranchId' => $user->forcedBranchId(),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $user = $this->authorizeAdmin();
        $this->ensureEventInScope($user, $event);

        $event->update($request->validated());

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $user = $this->authorizeAdmin();
        $this->ensureEventInScope($user, $event);

        if ($event->leads()->exists()) {
            return redirect()->route('admin.events.index')->with('error', 'Event tidak dapat dihapus karena masih memiliki lead.');
        }

        if ($event->offlineSales()->exists()) {
            return redirect()->route('admin.events.index')->with('error', 'Event tidak dapat dihapus karena masih memiliki penjualan offline.');
        }

        $event->delete();

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil dihapus.');
    }
}
