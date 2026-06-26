<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $metrics = [
            'total' => Event::count(),
            'active' => Event::where('is_active', true)->where('start_date', '<=', now())->where('end_date', '>=', now())->count(),
            'upcoming' => Event::where('start_date', '>', now())->count(),
            'past' => Event::where('end_date', '<', now())->count(),
        ];

        $events = Event::query()
            ->withCount(['leads', 'offlineSales'])
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Events/Index', [
            'events' => $events,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Events/Create');
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        Event::query()->create($request->validated());

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil ditambahkan.');
    }

    public function show(Event $event): Response
    {
        $this->authorizeAdmin();

        $event->loadCount(['leads', 'offlineSales']);

        return Inertia::render('Admin/Events/Show', [
            'event' => $event,
        ]);
    }

    public function edit(Event $event): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Events/Edit', [
            'event' => $event,
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $event->update($request->validated());

        return redirect()->route('admin.events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $this->authorizeAdmin();

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
