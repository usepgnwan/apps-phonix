<?php

namespace App\Http\Controllers\Field;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\StaffReferralClick;
use App\Models\User;
use App\Services\StaffReferral\StaffCodeGenerator;
use App\Services\StaffReferral\StaffReferralAttributionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FieldStaffReferralController extends Controller
{
    public function show(
        Request $request,
        StaffReferralAttributionService $attributionService,
        StaffCodeGenerator $codeGenerator
    ): Response {
        $user = $this->ensureActiveFieldStaff($request);

        if ($user->staff_code === null || $user->staff_code === '') {
            $user->forceFill([
                'staff_code' => $codeGenerator->generate(),
                'staff_referral_enabled' => $user->staff_referral_enabled ?? true,
            ])->save();
        }

        $registrationsSearch = $this->searchValue($request, 'registrations_search');
        $ordersSearch = $this->searchValue($request, 'orders_search');
        $bookingsSearch = $this->searchValue($request, 'bookings_search');
        $offlineSearch = $this->searchValue($request, 'offline_search');

        $registrationsPerPage = $this->perPageValue($request, 'registrations_per_page');
        $ordersPerPage = $this->perPageValue($request, 'orders_per_page');
        $bookingsPerPage = $this->perPageValue($request, 'bookings_per_page');
        $offlinePerPage = $this->perPageValue($request, 'offline_per_page');

        $clickCount = StaffReferralClick::query()
            ->where('staff_user_id', $user->id)
            ->count();

        $registrationCount = User::query()
            ->where('referred_by_staff_id', $user->id)
            ->count();

        $orderCount = Order::query()
            ->where('referred_by_staff_id', $user->id)
            ->count();

        $bookingCount = Booking::query()
            ->where('referred_by_staff_id', $user->id)
            ->count();

        $offlineSaleCount = OfflineSale::query()
            ->where('referred_by_staff_id', $user->id)
            ->count();

        $registrations = User::query()
            ->where('referred_by_staff_id', $user->id)
            ->when($registrationsSearch !== '', function (Builder $query) use ($registrationsSearch): void {
                $query->where(function (Builder $inner) use ($registrationsSearch): void {
                    $inner->where('name', 'like', "%{$registrationsSearch}%")
                        ->orWhere('email', 'like', "%{$registrationsSearch}%");
                });
            })
            ->latest('referred_at')
            ->paginate($registrationsPerPage, ['id', 'name', 'email', 'referred_at', 'created_at'], 'registrations_page')
            ->withQueryString();

        $orders = Order::query()
            ->where('referred_by_staff_id', $user->id)
            ->when($ordersSearch !== '', function (Builder $query) use ($ordersSearch): void {
                $query->where(function (Builder $inner) use ($ordersSearch): void {
                    $inner->where('order_number', 'like', "%{$ordersSearch}%")
                        ->orWhere('customer_name', 'like', "%{$ordersSearch}%")
                        ->orWhere('customer_email', 'like', "%{$ordersSearch}%")
                        ->orWhere('customer_whatsapp_number', 'like', "%{$ordersSearch}%");
                });
            })
            ->latest('id')
            ->paginate($ordersPerPage, [
                'id',
                'order_number',
                'customer_name',
                'total',
                'status',
                'payment_status',
                'created_at',
            ], 'orders_page')
            ->withQueryString();

        $bookings = Booking::query()
            ->where('referred_by_staff_id', $user->id)
            ->with(['service:id,name'])
            ->when($bookingsSearch !== '', function (Builder $query) use ($bookingsSearch): void {
                $query->where(function (Builder $inner) use ($bookingsSearch): void {
                    $inner->where('booking_number', 'like', "%{$bookingsSearch}%")
                        ->orWhere('name', 'like', "%{$bookingsSearch}%")
                        ->orWhere('whatsapp_number', 'like', "%{$bookingsSearch}%")
                        ->orWhereHas('service', function (Builder $serviceQuery) use ($bookingsSearch): void {
                            $serviceQuery->where('name', 'like', "%{$bookingsSearch}%");
                        });
                });
            })
            ->latest('id')
            ->paginate($bookingsPerPage, [
                'id',
                'booking_number',
                'service_id',
                'name',
                'status',
                'desired_schedule_at',
                'created_at',
            ], 'bookings_page')
            ->withQueryString();

        $offlineSales = OfflineSale::query()
            ->where('referred_by_staff_id', $user->id)
            ->when($offlineSearch !== '', function (Builder $query) use ($offlineSearch): void {
                $query->where(function (Builder $inner) use ($offlineSearch): void {
                    $inner->where('sale_number', 'like', "%{$offlineSearch}%")
                        ->orWhere('customer_name', 'like', "%{$offlineSearch}%")
                        ->orWhere('customer_whatsapp_number', 'like', "%{$offlineSearch}%")
                        ->orWhere('source', 'like', "%{$offlineSearch}%");
                });
            })
            ->latest('sold_at')
            ->paginate($offlinePerPage, [
                'id',
                'sale_number',
                'customer_name',
                'total',
                'source',
                'sold_at',
                'created_at',
            ], 'offline_page')
            ->withQueryString();

        return Inertia::render('Field/Referral/Show', [
            'staffCode' => $user->staff_code,
            'trackingUrl' => $attributionService->trackingUrl($user),
            'referralEnabled' => (bool) $user->staff_referral_enabled,
            'metrics' => [
                'click_count' => $clickCount,
                'registration_count' => $registrationCount,
                'order_count' => $orderCount,
                'booking_count' => $bookingCount,
                'offline_sale_count' => $offlineSaleCount,
            ],
            'registrations' => $registrations,
            'orders' => $orders,
            'bookings' => $bookings,
            'offlineSales' => $offlineSales,
            'filters' => [
                'registrations_search' => $registrationsSearch,
                'orders_search' => $ordersSearch,
                'bookings_search' => $bookingsSearch,
                'offline_search' => $offlineSearch,
                'registrations_per_page' => $registrationsPerPage,
                'orders_per_page' => $ordersPerPage,
                'bookings_per_page' => $bookingsPerPage,
                'offline_per_page' => $offlinePerPage,
            ],
        ]);
    }

    private function searchValue(Request $request, string $key): string
    {
        return trim((string) $request->input($key, ''));
    }

    private function perPageValue(Request $request, string $key): int
    {
        $perPage = (int) $request->input($key, 10);

        return in_array($perPage, [10, 25, 50], true) ? $perPage : 10;
    }

    private function ensureActiveFieldStaff(Request $request): User
    {
        $user = $request->user();

        abort_unless($user?->role === 'field_staff' && $user->is_active === true, 403);

        return $user;
    }
}
