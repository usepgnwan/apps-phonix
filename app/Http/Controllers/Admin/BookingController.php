<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingScheduleRequest;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Services\Affiliate\AffiliateCommissionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdmin(), 403);
    }

    public function index(\Illuminate\Http\Request $request): Response
    {
        $this->authorizeAdmin();

        $user = $request->user();
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $metricsQuery = $user->applyBranchScope(Booking::query());

        $metrics = [
            'totalBooking' => (clone $metricsQuery)->count(),
            'waitingConfirmation' => (clone $metricsQuery)->where('status', 'waiting_confirmation')->count(),
            'confirmed' => (clone $metricsQuery)->where('status', 'confirmed')->count(),
            'completed' => (clone $metricsQuery)->where('status', 'completed')->count(),
            'cancelled' => (clone $metricsQuery)->where('status', 'cancelled')->count(),
        ];

        $query = $user->applyBranchScope(
            Booking::query()->with([
                'branch:id,name',
                'user:id,name,email',
                'customerProfile:id,user_id,name,whatsapp_number,primary_address,member_status',
                'service:id,name,slug,description,price,visit_type,image_path',
            ])
        );

        $bookings = $query->when($search, function ($q, $search) {
                $q->where('booking_number', 'like', "%{$search}%")
                      ->orWhereHas('customerProfile', function ($q2) use ($search) {
                          $q2->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('service', function ($q2) use ($search) {
                          $q2->where('name', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function show(Booking $booking): Response
    {
        $this->authorizeAdmin();

        $user = request()->user();
        $user->ensureCanAccessBranch(
            $booking->branch_id !== null ? (int) $booking->branch_id : null,
            'Akses ditolak: Booking ini bukan milik cabang Anda.'
        );

        $booking->load([
            'branch:id,name',
            'user:id,name,email',
            'customerProfile:id,user_id,name,whatsapp_number,primary_address,member_status',
            'service:id,name,slug,description,price,visit_type,image_path',
        ]);

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking,
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): RedirectResponse
    {
        $this->authorizeAdmin();

        $user = request()->user();
        $user->ensureCanAccessBranch(
            $booking->branch_id !== null ? (int) $booking->branch_id : null,
            'Akses ditolak: Booking ini bukan milik cabang Anda.'
        );

        $booking->update($request->validated());

        $fresh = $booking->fresh();
        if ($fresh->status === 'completed') {
            app(AffiliateCommissionService::class)->createFromBooking($fresh);
        }

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Status booking berhasil diperbarui.');
    }

    public function updateSchedule(UpdateBookingScheduleRequest $request, Booking $booking): RedirectResponse
    {
        $this->authorizeAdmin();

        $user = request()->user();
        $user->ensureCanAccessBranch(
            $booking->branch_id !== null ? (int) $booking->branch_id : null,
            'Akses ditolak: Booking ini bukan milik cabang Anda.'
        );

        $booking->update($request->validated());

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Jadwal booking berhasil diperbarui.');
    }
}
