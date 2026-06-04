<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingScheduleRequest;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
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
            'page' => 'admin.bookings.index',
            'bookings' => Booking::query()
                ->with([
                    'user:id,name,email',
                    'customerProfile:id,user_id,name,whatsapp_number,primary_address,member_status',
                    'service:id,name,slug,description,price,visit_type,image_path',
                ])
                ->latest()
                ->get(),
        ]);
    }

    public function show(Booking $booking): Response
    {
        $this->authorizeAdmin();

        $booking->load([
            'user:id,name,email',
            'customerProfile:id,user_id,name,whatsapp_number,primary_address,member_status',
            'service:id,name,slug,description,price,visit_type,image_path',
        ]);

        return Inertia::render('Welcome', [
            'page' => 'admin.bookings.show',
            'booking' => $booking,
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): RedirectResponse
    {
        $booking->update($request->validated());

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Status booking berhasil diperbarui.');
    }

    public function updateSchedule(UpdateBookingScheduleRequest $request, Booking $booking): RedirectResponse
    {
        $booking->update($request->validated());

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Jadwal booking berhasil diperbarui.');
    }
}
