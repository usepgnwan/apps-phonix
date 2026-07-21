<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'category',
    'description',
    'body_text',
    'file_path',
    'original_filename',
    'mime_type',
    'is_active',
    'sort_order',
])]
class MarketingKit extends Model
{
    public const CATEGORY_IMAGE = 'image';

    public const CATEGORY_TEXT = 'text';

    public const CATEGORY_VIDEO = 'video';

    public const CATEGORY_PDF = 'pdf';

    public const CATEGORIES = [
        self::CATEGORY_IMAGE,
        self::CATEGORY_TEXT,
        self::CATEGORY_VIDEO,
        self::CATEGORY_PDF,
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function categoryLabel(): string
    {
        return match ($this->category) {
            self::CATEGORY_IMAGE => 'Gambar',
            self::CATEGORY_TEXT => 'Copywriting',
            self::CATEGORY_VIDEO => 'Video',
            self::CATEGORY_PDF => 'Dokumen (PDF)',
            default => $this->category,
        };
    }

    public function publicFileUrl(): ?string
    {
        if ($this->file_path === null || $this->file_path === '') {
            return null;
        }

        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://') || str_starts_with($this->file_path, '/')) {
            return $this->file_path;
        }

        return '/'.$this->file_path;
    }
}
