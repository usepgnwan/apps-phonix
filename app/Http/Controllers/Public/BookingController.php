<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreBookingRequest;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Service;
use App\Models\Setting;
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

        return Inertia::render('Public/Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Public/Bookings/Create', [
            'customerProfile' => $request->user()?->customerProfile,
            'services' => Service::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'description', 'price', 'visit_type', 'image_path']),
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $customerProfile = $user === null
            ? null
            : CustomerProfile::query()
                ->where('user_id', $user->id)
                ->firstOrFail();

        $booking = Booking::query()->create([
            'booking_number' => $this->generateBookingNumber(),
            'user_id' => $user?->id,
            'customer_profile_id' => $customerProfile?->id,
            'service_id' => $validated['service_id'],
            'name' => $customerProfile?->name ?? $validated['name'],
            'whatsapp_number' => $customerProfile?->whatsapp_number ?? $validated['whatsapp_number'],
            'visit_type' => $validated['visit_type'],
            'desired_schedule_at' => $validated['desired_schedule_at'],
            'complaint_notes' => $validated['complaint_notes'],
            'status' => 'waiting_confirmation',
        ]);
        $whatsappUrl = $this->bookingWhatsappUrl($booking);

        if ($user === null) {
            return redirect()
                ->route('services.index')
                ->with('success', 'Booking berhasil dibuat dan menunggu konfirmasi admin.')
                ->with('whatsapp_url', $whatsappUrl);
        }

        return redirect()
            ->route('bookings.show', $booking)
            ->with('success', 'Booking berhasil dibuat dan menunggu konfirmasi admin.')
            ->with('whatsapp_url', $whatsappUrl);
    }

    public function show(Request $request, Booking $booking): Response
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load('service:id,name,slug,description,price,visit_type,image_path');

        return Inertia::render('Public/Bookings/Show', [
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

    private function bookingWhatsappUrl(Booking $booking): string
    {
        $booking->loadMissing('service:id,name,price,visit_type');
        $visitType = [
            'both' => 'Home visit & klinik',
            'home_visit' => 'Home visit',
            'office_visit' => 'Kunjungan klinik',
        ][$booking->visit_type] ?? $booking->visit_type;
        $message = implode("\n", [
            'Halo Phoenix, saya ingin konfirmasi booking layanan.',
            '',
            'No Booking: '.$booking->booking_number,
            'Nama: '.$booking->name,
            'WhatsApp: '.$booking->whatsapp_number,
            'Layanan: '.($booking->service?->name ?? '-'),
            'Tipe Kunjungan: '.$visitType,
            'Jadwal: '.($booking->desired_schedule_at?->format('d/m/Y H:i') ?? '-'),
            'Keluhan/Catatan: '.($booking->complaint_notes ?: '-'),
        ]);

        $whatsappNumber = Setting::query()->where('key', 'whatsapp_number')->value('value') ?: '6281234567890';

        return 'https://wa.me/'.$whatsappNumber.'?text='.rawurlencode($message);
    }
}
