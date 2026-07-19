<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingScheduleRequest;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\User;
use App\Services\Affiliate\AffiliateCommissionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    private function authorizeAdmin(): User
    {
        $user = request()->user();

        abort_unless($user !== null && $user->isAdmin(), 403);

        return $user;
    }

    /**
     * Admin pusat: semua cabang aktif. Admin cabang: hanya cabangnya.
     */
    private function branchesForActor(User $actor): Collection
    {
        $forcedBranchId = $actor->forcedBranchId();

        if ($forcedBranchId !== null) {
            return Branch::query()
                ->where('id', $forcedBranchId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        return Branch::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /**
     * Resolve branch filter: admin cabang dikunci ke cabangnya;
     * admin pusat boleh pilih branch_id dari request.
     */
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

    private function applyOptionalBranchFilter(Builder $query, ?int $branchId): void
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
        $status = $request->input('status');
        $branchId = $this->resolveBranchId($user, $request->input('branch_id'));
        $perPage = $request->input('per_page', 10);

        $metricsQuery = $user->applyBranchScope(Booking::query());
        $this->applyOptionalBranchFilter($metricsQuery, $branchId);

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

        $this->applyOptionalBranchFilter($query, $branchId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhereHas('customerProfile', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('service', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($startDate) {
            $query->whereDate('desired_schedule_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('desired_schedule_at', '<=', $endDate);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $bookings = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $showBranchFilter = $user->isAdminPusat();
        $lockedBranchName = null;

        if (! $showBranchFilter && $user->isAdminCabang()) {
            $lockedBranchName = $user->branch?->name
                ?? Branch::query()->where('id', $user->branch_id)->value('name');
        }

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'branch_id' => $branchId,
                'per_page' => $perPage,
            ],
            'branches' => $showBranchFilter ? $this->branchesForActor($user) : [],
            'showBranchFilter' => $showBranchFilter,
            'lockedBranchName' => $lockedBranchName,
        ]);
    }

    public function show(Booking $booking): Response
    {
        $user = $this->authorizeAdmin();

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
        $user = $this->authorizeAdmin();

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
        $user = $this->authorizeAdmin();

        $user->ensureCanAccessBranch(
            $booking->branch_id !== null ? (int) $booking->branch_id : null,
            'Akses ditolak: Booking ini bukan milik cabang Anda.'
        );

        $booking->update($request->validated());

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Jadwal booking berhasil diperbarui.');
    }
}
