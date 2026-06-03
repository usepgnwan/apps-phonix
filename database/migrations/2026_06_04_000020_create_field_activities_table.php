<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('field_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('field_staff_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->string('activity_type');
            $table->timestamp('activity_at');
            $table->text('notes');
            $table->string('follow_up_status')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_activities');
    }
};
