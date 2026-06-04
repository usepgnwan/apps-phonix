<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $customerProfile = $this->resolveCustomerProfile($request);

        if ($customerProfile === null) {
            return $this->redirectToProfile();
        }

        return Inertia::render('Welcome', [
            'page' => 'customer.dashboard.index',
            'customerProfile' => $customerProfile,
            'summary' => [
                'ordersCount' => $customerProfile->orders()->count(),
                'bookingsCount' => $customerProfile->bookings()->count(),
                'voucherRedemptionsCount' => $customerProfile->voucherRedemptions()->count(),
                'examinationsCount' => $customerProfile->examinations()->count(),
                'productRecommendationsCount' => $customerProfile->productRecommendations()->count(),
            ],
            'recentOrders' => $customerProfile->orders()
                ->with('voucherRedemption.voucher:id,code,name')
                ->latest()
                ->limit(5)
                ->get(['id', 'order_number', 'customer_profile_id', 'voucher_id', 'subtotal', 'voucher_discount_amount', 'shipping_cost', 'total', 'shipping_status', 'payment_status', 'status', 'created_at']),
            'recentBookings' => $customerProfile->bookings()
                ->with('service:id,name,slug,visit_type')
                ->latest()
                ->limit(5)
                ->get(['id', 'booking_number', 'customer_profile_id', 'service_id', 'visit_type', 'desired_schedule_at', 'status', 'created_at']),
            'recentExaminations' => $customerProfile->examinations()
                ->latest()
                ->limit(5)
                ->get(['id', 'customer_profile_id', 'booking_id', 'complaint', 'result', 'summary', 'created_at']),
            'recentProductRecommendations' => $customerProfile->productRecommendations()
                ->with('product:id,name,slug,price,image_path')
                ->latest()
                ->limit(5)
                ->get(['id', 'customer_profile_id', 'product_id', 'examination_id', 'notes', 'created_at']),
        ]);
    }

    public function showOrder(Request $request, Order $order): Response|RedirectResponse
    {
        $customerProfile = $this->resolveCustomerProfile($request);

        if ($customerProfile === null) {
            return $this->redirectToProfile();
        }

        abort_unless($order->customer_profile_id === $customerProfile->id && $order->user_id === $request->user()->id, 404);

        $order->load('orderItems.product:id,name,slug,price,image_path', 'voucherRedemption.voucher:id,code,name');

        return Inertia::render('Welcome', [
            'page' => 'customer.dashboard.orders.show',
            'order' => $order,
        ]);
    }

    public function showBooking(Request $request, Booking $booking): Response|RedirectResponse
    {
        $customerProfile = $this->resolveCustomerProfile($request);

        if ($customerProfile === null) {
            return $this->redirectToProfile();
        }

        abort_unless($booking->customer_profile_id === $customerProfile->id && $booking->user_id === $request->user()->id, 404);

        $booking->load('service:id,name,slug,description,price,visit_type,image_path', 'examinations.productRecommendations.product:id,name,slug,price,image_path');

        return Inertia::render('Welcome', [
            'page' => 'customer.dashboard.bookings.show',
            'booking' => $booking,
        ]);
    }

    private function resolveCustomerProfile(Request $request): ?CustomerProfile
    {
        return CustomerProfile::query()
            ->where('user_id', $request->user()->id)
            ->first();
    }

    private function redirectToProfile(): RedirectResponse
    {
        return redirect()
            ->route('customer.profile.create')
            ->with('error', 'Lengkapi profil customer sebelum membuka dashboard customer.');
    }
}
