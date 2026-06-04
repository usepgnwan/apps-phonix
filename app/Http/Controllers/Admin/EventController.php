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

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.events.index',
            'events' => Event::query()
                ->withCount(['leads', 'offlineSales'])
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.events.create',
        ]);
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

        return Inertia::render('Welcome', [
            'page' => 'admin.events.show',
            'event' => $event,
        ]);
    }

    public function edit(Event $event): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Welcome', [
            'page' => 'admin.events.edit',
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
