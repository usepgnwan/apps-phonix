<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\Video;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'featuredProducts' => Product::query()
                ->with('productCategory:id,name,slug')
                ->where('is_active', true)
                ->where('is_featured', true)
                ->latest()
                ->limit(6)
                ->get(['id', 'product_category_id', 'name', 'slug', 'price', 'short_description', 'image_path', 'is_featured']),
            'featuredServices' => Service::query()
                ->where('is_active', true)
                ->where('is_featured', true)
                ->latest()
                ->limit(3)
                ->get(['id', 'name', 'slug', 'description', 'price', 'visit_type', 'image_path', 'is_featured']),
            'testimonials' => Testimonial::query()
                ->where('is_active', true)
                ->latest()
                ->limit(6)
                ->get(['id', 'customer_name', 'content', 'photo_path']),
            'pinnedVideo' => Video::query()
                ->where('is_pinned', true)
                ->latest()
                ->first(['id', 'title', 'video_link']),
            'videos' => Video::query()
                ->where('is_pinned', false)
                ->inRandomOrder()
                ->limit(8)
                ->get(['id', 'title', 'video_link']),
        ]);
    }
}
