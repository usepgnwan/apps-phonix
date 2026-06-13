<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $products = Product::where('is_active', true)->get(['slug', 'updated_at']);
        $services = Service::where('is_active', true)->get(['slug', 'updated_at']);
        
        $urls = [
            [
                'loc' => url('/'),
                'lastmod' => now()->tz('UTC')->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '1.0'
            ],
            [
                'loc' => route('products.index'),
                'lastmod' => now()->tz('UTC')->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.8'
            ],
            [
                'loc' => route('services.index'),
                'lastmod' => now()->tz('UTC')->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.8'
            ],
        ];

        foreach ($products as $product) {
            $urls[] = [
                'loc' => route('products.show', $product->slug),
                'lastmod' => $product->updated_at->tz('UTC')->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.6'
            ];
        }

        foreach ($services as $service) {
            $urls[] = [
                'loc' => route('services.show', $service->slug),
                'lastmod' => $service->updated_at->tz('UTC')->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.6'
            ];
        }

        return response()->view('sitemap', [
            'urls' => $urls
        ])->header('Content-Type', 'text/xml');
    }
}
