<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FieldActivity;
use App\Models\Lead;
use App\Models\OfflineSale;
use App\Models\Order;
use App\Models\ProductRecommendation;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    private function authorizeAdmin(): void
    {
        $user = request()->user();

        abort_unless($user !== null && $user->role === 'admin' && $user->is_active, 403);
    }

    public function index(): Response
    {
        $this->authorizeAdmin();

        return Inertia::render('Admin/Reports/Index', [
            'page' => 'admin.reports.index',
            'reports' => [
                'leadsBySource' => $this->leadsBySource(),
                'leadsByAssignedStaff' => $this->leadsByAssignedStaff(),
                'bookingsByService' => $this->bookingsByService(),
                'bookingsByStatus' => $this->bookingsByStatus(),
                'ordersByStatus' => $this->ordersByStatus(),
                'websiteOrderRevenue' => $this->websiteOrderRevenue(),
                'offlineSalesRevenue' => $this->offlineSalesRevenue(),
                'fieldActivitiesByType' => $this->fieldActivitiesByType(),
                'productRecommendationsByProduct' => $this->productRecommendationsByProduct(),
            ],
        ]);
    }

    private function leadsBySource()
    {
        return Lead::query()
            ->selectRaw('lead_source_id, COUNT(*) as total')
            ->with('leadSource:id,name')
            ->groupBy('lead_source_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Lead $lead): array => [
                'id' => $lead->lead_source_id,
                'name' => $lead->leadSource?->name ?? 'No source',
                'total' => (int) $lead->total,
            ]);
    }

    private function leadsByAssignedStaff()
    {
        return Lead::query()
            ->selectRaw('assigned_staff_id, COUNT(*) as total')
            ->with('assignedStaff:id,name,email')
            ->groupBy('assigned_staff_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Lead $lead): array => [
                'id' => $lead->assigned_staff_id,
                'name' => $lead->assignedStaff?->name ?? 'Unassigned',
                'email' => $lead->assignedStaff?->email,
                'total' => (int) $lead->total,
            ]);
    }

    private function bookingsByService()
    {
        return Booking::query()
            ->selectRaw('service_id, COUNT(*) as total')
            ->with('service:id,name')
            ->groupBy('service_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (Booking $booking): array => [
                'id' => $booking->service_id,
                'name' => $booking->service?->name ?? 'No service',
                'total' => (int) $booking->total,
            ]);
    }

    private function bookingsByStatus()
    {
        return Booking::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (Booking $booking): array => [
                'status' => $booking->status,
                'total' => (int) $booking->total,
            ]);
    }

    private function ordersByStatus()
    {
        return Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (Order $order): array => [
                'status' => $order->status,
                'total' => (int) $order->total,
            ]);
    }

    private function websiteOrderRevenue(): string
    {
        return number_format((float) Order::query()
            ->where(function ($query): void {
                $query->where('payment_status', 'paid')
                    ->orWhere('status', 'payment_received');
            })
            ->sum('total'), 2, '.', '');
    }

    private function offlineSalesRevenue(): string
    {
        return number_format((float) OfflineSale::query()->sum('total'), 2, '.', '');
    }

    private function fieldActivitiesByType()
    {
        return FieldActivity::query()
            ->selectRaw('activity_type, COUNT(*) as total')
            ->groupBy('activity_type')
            ->orderBy('activity_type')
            ->get()
            ->map(fn (FieldActivity $fieldActivity): array => [
                'activityType' => $fieldActivity->activity_type,
                'total' => (int) $fieldActivity->total,
            ]);
    }

    private function productRecommendationsByProduct()
    {
        return ProductRecommendation::query()
            ->selectRaw('product_id, COUNT(*) as total')
            ->with('product:id,name,slug')
            ->groupBy('product_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn (ProductRecommendation $recommendation): array => [
                'id' => $recommendation->product_id,
                'name' => $recommendation->product?->name ?? 'No product',
                'slug' => $recommendation->product?->slug,
                'total' => (int) $recommendation->total,
            ]);
    }
}
