<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['waiting_confirmation', 'confirmed', 'completed', 'cancelled'])],
            'admin_notes' => ['nullable', 'string'],
        ];
    }
}
