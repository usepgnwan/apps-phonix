<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['assigned_staff_id', 'customer_profile_id', 'lead_source_id', 'event_id', 'name', 'whatsapp_number', 'address', 'interested_product_notes', 'interested_service_notes', 'initial_complaint', 'follow_up_status', 'internal_notes'])]
class Lead extends Model
{
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function customerProfile(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    public function leadSource(): BelongsTo
    {
        return $this->belongsTo(LeadSource::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function leadFollowUps(): HasMany
    {
        return $this->hasMany(LeadFollowUp::class);
    }

    public function fieldActivities(): HasMany
    {
        return $this->hasMany(FieldActivity::class);
    }

    public function offlineSales(): HasMany
    {
        return $this->hasMany(OfflineSale::class);
    }
}
