<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SidebarSection extends Model
{
    use HasFactory;

    protected $fillable = ['title_section'];

    public function sidebarItems(): HasMany
    {
        return $this->hasMany(SidebarItem::class);
    }
}
