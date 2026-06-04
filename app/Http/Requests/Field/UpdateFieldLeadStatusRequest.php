<?php

namespace App\Http\Requests\Field;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFieldLeadStatusRequest extends FormRequest
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
            'follow_up_status' => ['required', Rule::in(['new', 'interested', 'needs_follow_up', 'booking_examination', 'purchased', 'not_interested'])],
        ];
    }
}
