<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\CustomerProfile;
use App\Models\Event;
use App\Models\FieldActivity;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@phoenix.test'],
            [
                'name' => 'Admin Phoenix',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $fieldStaff = User::query()->updateOrCreate(
            ['email' => 'field@phoenix.test'],
            [
                'name' => 'Field Staff Phoenix',
                'password' => Hash::make('password'),
                'role' => 'field_staff',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $customer = User::query()->updateOrCreate(
            ['email' => 'customer@phoenix.test'],
            [
                'name' => 'Customer Phoenix',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $customerProfile = CustomerProfile::query()->updateOrCreate(
            ['user_id' => $customer->id],
            [
                'name' => 'Customer Phoenix',
                'whatsapp_number' => '081234567890',
                'primary_address' => 'Jl. Herbal Sehat No. 10, Jakarta',
                'member_status' => 'member',
                'internal_notes' => 'Akun dummy untuk testing dashboard dan flow customer.',
            ]
        );

        $category = ProductCategory::query()->updateOrCreate(
            ['slug' => 'herbal-dummy'],
            [
                'name' => 'Herbal Dummy',
                'description' => 'Kategori dummy untuk testing katalog Phoenix.',
                'is_active' => true,
            ]
        );

        $product = Product::query()->updateOrCreate(
            ['slug' => 'madu-herbal-dummy'],
            [
                'product_category_id' => $category->id,
                'name' => 'Madu Herbal Dummy',
                'price' => 125000,
                'short_description' => 'Produk dummy untuk pengujian katalog dan rekomendasi.',
                'full_description' => 'Madu herbal dummy digunakan untuk mencoba tampilan katalog, stok, dan rekomendasi produk.',
                'benefits' => 'Membantu pengujian data produk.',
                'usage_rules' => 'Gunakan hanya sebagai data dummy.',
                'notes' => 'Data seeder lokal.',
                'image_path' => null,
                'stock_quantity' => 25,
                'low_stock_threshold' => 5,
                'is_active' => true,
                'is_featured' => true,
            ]
        );

        $service = Service::query()->updateOrCreate(
            ['slug' => 'konsultasi-herbal-dummy'],
            [
                'name' => 'Konsultasi Herbal Dummy',
                'description' => 'Layanan dummy untuk testing booking dan dashboard.',
                'price' => 150000,
                'visit_type' => 'both',
                'image_path' => null,
                'is_active' => true,
                'is_featured' => true,
            ]
        );

        $event = Event::query()->updateOrCreate(
            ['name' => 'Pameran Herbal Dummy'],
            [
                'event_date' => now()->addDays(7)->toDateString(),
                'location' => 'Jakarta Convention Dummy Hall',
                'organizer' => 'Tim Phoenix',
                'notes' => 'Event dummy untuk testing lead dan offline sales.',
            ]
        );

        $leadSource = LeadSource::query()->updateOrCreate(
            ['slug' => 'door-to-door-dummy'],
            [
                'name' => 'Door to Door Dummy',
                'is_active' => true,
            ]
        );

        $lead = Lead::query()->updateOrCreate(
            ['whatsapp_number' => '089876543210'],
            [
                'assigned_staff_id' => $fieldStaff->id,
                'customer_profile_id' => $customerProfile->id,
                'lead_source_id' => $leadSource->id,
                'event_id' => $event->id,
                'name' => 'Prospek Dummy Phoenix',
                'address' => 'Jl. Prospek Sehat No. 8, Jakarta',
                'interested_product_notes' => $product->name,
                'interested_service_notes' => $service->name,
                'initial_complaint' => 'Ingin konsultasi herbal dan terapi.',
                'follow_up_status' => 'needs_follow_up',
                'internal_notes' => 'Lead dummy assigned ke Field Staff Phoenix.',
            ]
        );

        Booking::query()->updateOrCreate(
            ['booking_number' => 'BK-DUMMY-0001'],
            [
                'user_id' => $customer->id,
                'customer_profile_id' => $customerProfile->id,
                'service_id' => $service->id,
                'name' => $customerProfile->name,
                'whatsapp_number' => $customerProfile->whatsapp_number,
                'visit_type' => 'home_visit',
                'desired_schedule_at' => now()->addDays(3),
                'complaint_notes' => 'Booking dummy untuk mencoba dashboard dan admin booking.',
                'status' => 'waiting_confirmation',
                'admin_notes' => null,
            ]
        );

        FieldActivity::query()->updateOrCreate(
            [
                'field_staff_id' => $fieldStaff->id,
                'lead_id' => $lead->id,
                'activity_type' => 'follow_up',
            ],
            [
                'activity_at' => now()->subDay(),
                'notes' => 'Follow-up dummy via WhatsApp.',
                'follow_up_status' => 'needs_follow_up',
            ]
        );

        $admin->touch();
    }
}
