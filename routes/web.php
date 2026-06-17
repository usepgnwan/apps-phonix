<?php

use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\Customer\CustomerProfileController;
use App\Http\Controllers\Admin\ProductCategoryController as AdminProductCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\ExaminationController as AdminExaminationController;
use App\Http\Controllers\Admin\PaymentMethodController as AdminPaymentMethodController;
use App\Http\Controllers\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Admin\LeadSourceController as AdminLeadSourceController;
use App\Http\Controllers\Admin\OfflineSaleController as AdminOfflineSaleController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Admin\VideoController as AdminVideoController;
use App\Http\Controllers\Admin\VoucherController as AdminVoucherController;
use App\Http\Controllers\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Admin\PositionController as AdminPositionController;
use App\Http\Controllers\Admin\TeamController as AdminTeamController;
use App\Http\Controllers\Admin\StaffController as AdminStaffController;
use App\Http\Controllers\Public\BookingController;
use App\Http\Controllers\Public\CartController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Field\FieldDashboardController;
use App\Http\Controllers\Field\FieldLeadController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\OrderLookupController;
use App\Http\Controllers\Public\ProductController;
use App\Http\Controllers\Public\ServiceController;
use App\Http\Controllers\Public\SitemapController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServiceController::class, 'show'])->name('services.show');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{cartItem}', [CartController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy'])->name('cart.items.destroy');
Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/orders/lookup', [OrderLookupController::class, 'create'])->name('orders.lookup.create');
Route::post('/orders/lookup', [OrderLookupController::class, 'store'])->middleware('throttle:10,1')->name('orders.lookup.store');
Route::get('/orders/lookup/{order:order_number}', [OrderLookupController::class, 'show'])->name('orders.lookup.show');
Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');

Route::get('/dashboard', function (Request $request): RedirectResponse {
    $user = $request->user();

    if ($user?->role === 'admin' && $user->is_active) {
        return redirect()->route('admin.dashboard.index');
    }

    if ($user?->role === 'field_staff' && $user->is_active) {
        return redirect()->route('field.dashboard.index');
    }

    return redirect()->route('customer.dashboard.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard.index');
        Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');

        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');

        Route::resource('product-categories', AdminProductCategoryController::class);
        Route::resource('products', AdminProductController::class);
        Route::resource('services', AdminServiceController::class);
        Route::resource('events', AdminEventController::class);
        Route::resource('payment-methods', AdminPaymentMethodController::class);
        Route::resource('videos', AdminVideoController::class);
        Route::resource('testimonials', AdminTestimonialController::class);
        Route::resource('lead-sources', AdminLeadSourceController::class);
        Route::resource('positions', AdminPositionController::class)->except(['create', 'show', 'edit']);
        Route::resource('teams', AdminTeamController::class)->except(['create', 'show', 'edit']);
        Route::resource('staff', AdminStaffController::class)->except(['create', 'show', 'edit']);
        Route::get('/leads', [AdminLeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/create', [AdminLeadController::class, 'create'])->name('leads.create');
        Route::post('/leads', [AdminLeadController::class, 'store'])->name('leads.store');
        Route::get('/leads/{lead}', [AdminLeadController::class, 'show'])->name('leads.show');
        Route::patch('/leads/{lead}', [AdminLeadController::class, 'update'])->name('leads.update');
        Route::patch('/leads/{lead}/status', [AdminLeadController::class, 'updateStatus'])->name('leads.status.update');
        Route::post('/leads/{lead}/follow-ups', [AdminLeadController::class, 'storeFollowUp'])->name('leads.follow-ups.store');
        Route::get('/vouchers/{voucher}/redemptions', [AdminVoucherController::class, 'redemptions'])->name('vouchers.redemptions.index');
        Route::resource('vouchers', AdminVoucherController::class);

        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/shipping', [AdminOrderController::class, 'updateShipping'])->name('orders.shipping.update');
        Route::patch('orders/{order}/payment', [AdminOrderController::class, 'updatePayment'])->name('orders.payment.update');
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status.update');
        Route::get('orders/{order}/invoice', [AdminOrderController::class, 'invoice'])->name('orders.invoice');

        Route::get('/offline-sales', [AdminOfflineSaleController::class, 'index'])->name('offline-sales.index');
        Route::post('/offline-sales', [AdminOfflineSaleController::class, 'store'])->name('offline-sales.store');
        Route::get('/offline-sales/{offlineSale}', [AdminOfflineSaleController::class, 'show'])->name('offline-sales.show');
        Route::get('/offline-sales/{offlineSale}/print', [AdminOfflineSaleController::class, 'print'])->name('offline-sales.print');
        Route::get('/offline-sales/{offlineSale}/invoice', [AdminOfflineSaleController::class, 'invoice'])->name('offline-sales.invoice');

        Route::get('/examinations', [AdminExaminationController::class, 'index'])->name('examinations.index');
        Route::get('/examinations/create', [AdminExaminationController::class, 'create'])->name('examinations.create');
        Route::post('/examinations', [AdminExaminationController::class, 'store'])->name('examinations.store');
        Route::get('/examinations/{examination}', [AdminExaminationController::class, 'show'])->name('examinations.show');

        Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');
        Route::get('/customers/{customerProfile}', [AdminCustomerController::class, 'show'])->name('customers.show');
        Route::patch('/customers/{customerProfile}', [AdminCustomerController::class, 'update'])->name('customers.update');

        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [AdminBookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->name('bookings.status.update');
        Route::patch('/bookings/{booking}/schedule', [AdminBookingController::class, 'updateSchedule'])->name('bookings.schedule.update');
    });

    Route::get('/customer/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard.index');
    Route::get('/customer/dashboard/orders/{order}', [CustomerDashboardController::class, 'showOrder'])->name('customer.dashboard.orders.show');
    Route::get('/customer/dashboard/bookings/{booking}', [CustomerDashboardController::class, 'showBooking'])->name('customer.dashboard.bookings.show');
    Route::get('/customer/profile', [CustomerProfileController::class, 'show'])->name('customer.profile.show');
    Route::get('/customer/profile/create', [CustomerProfileController::class, 'create'])->name('customer.profile.create');
    Route::post('/customer/profile', [CustomerProfileController::class, 'store'])->name('customer.profile.store');
    Route::get('/customer/profile/edit', [CustomerProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::patch('/customer/profile', [CustomerProfileController::class, 'update'])->name('customer.profile.update');

    Route::prefix('field')->name('field.')->group(function () {
        Route::get('/dashboard', [FieldDashboardController::class, 'index'])->name('dashboard.index');
        Route::get('/leads', [FieldLeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/{lead}', [FieldLeadController::class, 'show'])->name('leads.show');
        Route::patch('/leads/{lead}/status', [FieldLeadController::class, 'updateStatus'])->name('leads.status.update');
        Route::post('/leads/{lead}/activities', [FieldLeadController::class, 'storeActivity'])->name('leads.activities.store');
    });

    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
