<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreBookingRequest;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $bookings = Booking::query()
            ->with('service:id,name,slug,visit_type')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Welcome', [
            'page' => 'bookings.index',
            'bookings' => $bookings,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Welcome', [
            'page' => 'bookings.create',
            'customerProfile' => $request->user()->customerProfile,
            'services' => Service::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description', 'price', 'visit_type', 'image_path']),
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $customerProfile = CustomerProfile::query()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        $validated = $request->validated();

        $booking = Booking::query()->create([
            'booking_number' => $this->generateBookingNumber(),
            'user_id' => $request->user()->id,
            'customer_profile_id' => $customerProfile->id,
            'service_id' => $validated['service_id'],
            'name' => $customerProfile->name,
            'whatsapp_number' => $customerProfile->whatsapp_number,
            'visit_type' => $validated['visit_type'],
            'desired_schedule_at' => $validated['desired_schedule_at'],
            'complaint_notes' => $validated['complaint_notes'],
            'status' => 'waiting_confirmation',
        ]);

        return redirect()
            ->route('bookings.show', $booking)
            ->with('success', 'Booking berhasil dibuat dan menunggu konfirmasi admin.');
    }

    public function show(Request $request, Booking $booking): Response
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load('service:id,name,slug,description,price,visit_type,image_path');

        return Inertia::render('Welcome', [
            'page' => 'bookings.show',
            'booking' => $booking,
        ]);
    }

    private function generateBookingNumber(): string
    {
        do {
            $bookingNumber = 'BK-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Booking::query()->where('booking_number', $bookingNumber)->exists());

        return $bookingNumber;
    }
}
