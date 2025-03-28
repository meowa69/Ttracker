<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('edit_record', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('record_id');
            $table->string('committee_sponsor')->nullable();
            $table->string('status')->nullable();
            $table->date('vice_mayor_forwarded')->nullable();
            $table->date('vice_mayor_received')->nullable();
            $table->date('city_mayor_forwarded')->nullable();
            $table->date('city_mayor_received')->nullable();
            $table->string('transmitted_to')->nullable();
            $table->date('date_transmitted')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('completed')->default(false);
            $table->date('completion_date')->nullable();
            $table->timestamps();

            $table->foreign('record_id')->references('id')->on('add_record')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('edit_record');
    }
};