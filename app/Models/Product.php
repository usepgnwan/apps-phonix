<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['product_category_id', 'name', 'slug', 'bpom_number', 'price', 'short_description', 'full_description', 'composition', 'packaging_type', 'content_amount', 'content_unit', 'benefits', 'usage_rules', 'notes', 'image_path', 'stock_quantity', 'low_stock_threshold', 'is_active', 'is_featured'])]
class Product extends Model
{
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function productRecommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class);
    }

    public function offlineSaleItems(): HasMany
    {
        return $this->hasMany(OfflineSaleItem::class);
    }
}
