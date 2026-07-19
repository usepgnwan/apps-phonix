<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && $user->role === 'admin' && $user->is_active;
    }

    public function rules(): array
    {
        return [
            // Aksi fulfillment lanjutan (setelah siap dikirim).
            'status' => ['required', Rule::in(['processing', 'shipped', 'completed', 'cancelled'])],
            'admin_notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status order wajib dipilih.',
            'status.in' => 'Status order tidak valid untuk aksi admin.',
        ];
    }
}
