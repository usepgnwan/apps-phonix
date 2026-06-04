<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadFollowUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['new', 'interested', 'needs_follow_up', 'booking_examination', 'purchased', 'not_interested'])],
            'notes' => ['required', 'string'],
            'followed_up_at' => ['required', 'date'],
            'user_id' => ['prohibited'],
        ];
    }
}
