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

    protected function prepareForValidation(): void
    {
        $user = $this->user();
        $forcedBranchId = $user?->forcedBranchId();

        if ($forcedBranchId !== null) {
            $this->merge(['branch_id' => $forcedBranchId]);
        }
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'exists:branches,id'],
            'assigned_staff_id' => [
                'nullable',
                Rule::exists('users', 'id')
                    ->where('role', 'field_staff')
                    ->where('is_active', true),
            ],
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            if (! $user) {
                return;
            }

            $branchId = $this->input('branch_id');
            if ($branchId !== null && ! $user->canAccessBranch((int) $branchId)) {
                $validator->errors()->add('branch_id', 'Anda hanya dapat mengubah lead ke cabang Anda sendiri.');
            }
        });
    }
}
