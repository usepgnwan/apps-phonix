<?php

namespace App\Services;

use App\Models\Examination;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ExaminationService
{
    public function create(array $data, User $admin): Examination
    {
        return DB::transaction(function () use ($data, $admin): Examination {
            $examination = Examination::query()->create([
                'customer_profile_id' => $data['customer_profile_id'],
                'booking_id' => $data['booking_id'] ?? null,
                'complaint' => $data['complaint'],
                'result' => $data['result'],
                'summary' => $data['summary'],
                'internal_recommendation' => $data['internal_recommendation'],
                'created_by' => $admin->id,
            ]);

            foreach ($data['product_recommendations'] ?? [] as $recommendation) {
                $examination->productRecommendations()->create([
                    'customer_profile_id' => $data['customer_profile_id'],
                    'product_id' => $recommendation['product_id'],
                    'notes' => $recommendation['notes'] ?? null,
                    'created_by' => $admin->id,
                ]);
            }

            return $examination->load(['customerProfile', 'booking', 'creator', 'productRecommendations.product']);
        });
    }
}
