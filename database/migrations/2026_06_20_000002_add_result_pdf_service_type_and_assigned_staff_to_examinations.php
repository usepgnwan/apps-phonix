<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('examinations', function (Blueprint $table) {
            $table->string('result_pdf_path')->nullable()->after('result');
            $table->string('service_type')->nullable()->after('result_pdf_path');
            $table->foreignId('assigned_staff_id')->nullable()->after('internal_recommendation')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('examinations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_staff_id');
            $table->dropColumn(['result_pdf_path', 'service_type']);
        });
    }
};
