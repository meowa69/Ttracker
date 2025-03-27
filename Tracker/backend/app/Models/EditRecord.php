<?php

// EditRecord.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EditRecord extends Model
{
    protected $table = 'edit_record';
    protected $fillable = [
        'record_id', 'committee_sponsor', 'status', 'vice_mayor_forwarded',
        'vice_mayor_received', 'city_mayor_forwarded', 'city_mayor_received',
        'transmitted_to', 'date_transmitted', 'remarks'
    ];

    public function addRecord()
    {
        return $this->belongsTo(AddRecord::class, 'record_id');
    }
}