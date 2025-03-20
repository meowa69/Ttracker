<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeTerm extends Model
{
    use HasFactory;

    protected $fillable = ['term'];

    public function members()
    {
        return $this->hasMany(CommitteeMember::class);
    }
}
