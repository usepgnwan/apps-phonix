<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'location' => ['required', 'string', 'max:255'],
            'organizer' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
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
                $validator->errors()->add('branch_id', 'Anda hanya dapat membuat event untuk cabang Anda sendiri.');
            }
        });
    }
}
