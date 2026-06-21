<?php

namespace App\Services;

use App\Models\CustomerProfile;
use App\Models\Examination;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExaminationService
{
    public function create(array $data, User $admin): Examination
    {
        return DB::transaction(function () use ($data, $admin): Examination {
            $customerProfileId = $this->resolveCustomerProfileId($data);
            $resultPdfPath = isset($data['result_pdf']) ? Storage::disk('public')->put('examination-results', $data['result_pdf']) : null;

            $examination = Examination::query()->create([
                'customer_profile_id' => $customerProfileId,
                'booking_id' => $data['booking_id'] ?? null,
                'service_type' => $data['service_type'],
                'assigned_staff_id' => $data['assigned_staff_id'] ?? null,
                'complaint' => $data['complaint'],
                'result' => $data['result'],
                'result_pdf_path' => $resultPdfPath,
                'summary' => $data['result'],
                'internal_recommendation' => $data['internal_recommendation'],
                'created_by' => $admin->id,
            ]);

            foreach ($data['product_recommendations'] ?? [] as $recommendation) {
                $examination->productRecommendations()->create([
                    'customer_profile_id' => $customerProfileId,
                    'product_id' => $recommendation['product_id'],
                    'notes' => $recommendation['notes'] ?? null,
                    'created_by' => $admin->id,
                ]);
            }

            return $examination->load(['customerProfile', 'booking', 'creator', 'assignedStaff', 'productRecommendations.product']);
        });
    }

    private function resolveCustomerProfileId(array $data): int
    {
        if (($data['customer_mode'] ?? 'registered') === 'registered') {
            return (int) $data['customer_profile_id'];
        }

        $customerProfile = CustomerProfile::query()->create([
            'user_id' => null,
            'name' => $data['guest_name'],
            'whatsapp_number' => $data['guest_whatsapp_number'],
            'primary_address' => $data['guest_address'],
            'member_status' => 'non_member',
            'internal_notes' => 'Dibuat otomatis dari POS pemeriksaan.',
        ]);

        return $customerProfile->id;
    }
}
