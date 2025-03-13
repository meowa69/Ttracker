<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('edit_record', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['ordinance', 'resolution']);
            $table->string('committee_sponsor');
            $table->string('status');
            $table->date('vice_mayor_forwarded')->nullable();
            $table->date('vice_mayor_received')->nullable();
            $table->date('city_mayor_forwarded')->nullable();
            $table->date('city_mayor_received')->nullable();
            $table->string('transmitted_to');
            $table->date('date_transmitted');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('edit_records');
    }
};
