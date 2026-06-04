<?php

namespace App\Http\Requests\Field;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFieldActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $lead = $this->route('lead');

        return $user?->role === 'field_staff'
            && $user->is_active === true
            && $lead?->assigned_staff_id === $user->id;
    }

    public function rules(): array
    {
        return [
            'activity_type' => ['required', Rule::in(['visit', 'follow_up', 'note'])],
            'activity_at' => ['required', 'date'],
            'notes' => ['required', 'string'],
            'follow_up_status' => ['nullable', Rule::in(['new', 'interested', 'needs_follow_up', 'booking_examination', 'purchased', 'not_interested'])],
            'field_staff_id' => ['prohibited'],
            'lead_id' => ['prohibited'],
        ];
    }
}
