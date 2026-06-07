<?php

namespace App\Http\Requests\Admin;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreExaminationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'customer_mode' => ['required', Rule::in(['registered', 'guest'])],
            'customer_profile_id' => ['required_if:customer_mode,registered', 'nullable', 'exists:customer_profiles,id'],
            'guest_name' => ['required_if:customer_mode,guest', 'nullable', 'string', 'max:255'],
            'guest_whatsapp_number' => ['required_if:customer_mode,guest', 'nullable', 'string', 'max:30'],
            'guest_address' => ['required_if:customer_mode,guest', 'nullable', 'string', 'max:1000'],
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'complaint' => ['required', 'string'],
            'result' => ['required', 'string'],
            'summary' => ['required', 'string'],
            'internal_recommendation' => ['required', 'string'],
            'created_by' => ['prohibited'],
            'product_recommendations' => ['nullable', 'array'],
            'product_recommendations.*.product_id' => [
                'required',
                Rule::exists('products', 'id')->where('is_active', true),
            ],
            'product_recommendations.*.notes' => ['nullable', 'string'],
            'product_recommendations.*.created_by' => ['prohibited'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $bookingId = $this->input('booking_id');
                $customerProfileId = $this->input('customer_profile_id');
                $customerMode = $this->input('customer_mode');

                if ($customerMode === 'guest' && $bookingId !== null) {
                    $validator->errors()->add('booking_id', 'Booking hanya dapat dipilih untuk customer terdaftar.');

                    return;
                }

                if ($bookingId === null || $customerProfileId === null) {
                    return;
                }

                $booking = Booking::query()->find($bookingId);

                if ($booking !== null && $booking->customer_profile_id !== (int) $customerProfileId) {
                    $validator->errors()->add('booking_id', 'Booking tidak sesuai dengan customer profile yang dipilih.');
                }
            },
        ];
    }
}
