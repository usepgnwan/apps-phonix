<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'assigned_staff_id' => ['nullable', 'exists:users,id'],
            'customer_profile_id' => ['nullable', 'exists:customer_profiles,id'],
            'lead_source_id' => ['required', 'exists:lead_sources,id'],
            'event_id' => ['nullable', 'exists:events,id'],
            'name' => ['required', 'string', 'max:255'],
            'whatsapp_number' => ['required', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'interested_product_notes' => ['nullable', 'string'],
            'interested_service_notes' => ['nullable', 'string'],
            'initial_complaint' => ['nullable', 'string'],
            'follow_up_status' => ['required', Rule::in(['new', 'interested', 'needs_follow_up', 'booking_examination', 'purchased', 'not_interested'])],
            'internal_notes' => ['nullable', 'string'],
        ];
    }
}
