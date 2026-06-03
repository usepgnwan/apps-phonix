<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'event_date', 'location', 'organizer', 'notes'])]
class Event extends Model
{
    protected function casts(): array
    {
        return [
            'event_date' => 'date',
        ];
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function offlineSales(): HasMany
    {
        return $this->hasMany(OfflineSale::class);
    }
}
