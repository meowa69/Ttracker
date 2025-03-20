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
        Schema::create('committee_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('committee_id'); // Define the column first
            $table->foreign('committee_id')->references('id')->on('committees')->onDelete('cascade'); // Then reference it
    
            $table->foreignId('term_id')->constrained('committee_terms')->onDelete('cascade'); // Link to the term
            $table->string('member_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_members');
    }
};
