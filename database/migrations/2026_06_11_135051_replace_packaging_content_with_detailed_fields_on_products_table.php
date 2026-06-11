<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('packaging_content');
            $table->string('packaging_type')->nullable()->after('composition');
            $table->decimal('content_amount', 10, 2)->nullable()->after('packaging_type');
            $table->string('content_unit')->nullable()->after('content_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['packaging_type', 'content_amount', 'content_unit']);
            $table->string('packaging_content')->nullable()->after('composition');
        });
    }
};
