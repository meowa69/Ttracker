<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddRecord extends Model
{
    use HasFactory;

    protected $table = 'add_record';

    protected $fillable = [
        'no', 'document_type', 'date_approved', 'title'
    ];
}
