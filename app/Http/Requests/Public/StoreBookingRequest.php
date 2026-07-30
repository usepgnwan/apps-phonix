<?php

namespace App\Http\Requests\Public;

use App\Models\CustomerProfile;
use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', Rule::exists('branches', 'id')->where('is_active', true)],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'name' => [$this->user() === null ? 'required' : 'nullable', 'string', 'max:255'],
            'whatsapp_number' => [$this->user() === null ? 'required' : 'nullable', 'string', 'max:30'],
            'visit_type' => ['required', Rule::in(['home_visit', 'office_visit'])],
            'desired_schedule_at' => ['required', 'date', 'after:now'],
            'complaint_notes' => ['required', 'string', 'max:2000'],
            'staff_ref' => ['nullable', 'string', 'max:32'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->user() === null) {
                    return;
                }

                $customerProfileExists = CustomerProfile::query()
                    ->where('user_id', $this->user()->id)
                    ->exists();

                if (! $customerProfileExists) {
                    $validator->errors()->add('customer_profile', 'Profil customer belum tersedia.');
                }

                $service = Service::query()->find($this->integer('service_id'));

                if ($service === null) {
                    return;
                }

                if (! $service->is_active) {
                    $validator->errors()->add('service_id', 'Layanan sudah tidak aktif.');

                    return;
                }

                $visitType = $this->input('visit_type');

                if ($service->visit_type !== 'both' && $visitType !== $service->visit_type) {
                    $validator->errors()->add('visit_type', 'Tipe kunjungan tidak tersedia untuk layanan ini.');
                }
            },
        ];
    }
}
