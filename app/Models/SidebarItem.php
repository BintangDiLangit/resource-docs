<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SidebarItem extends Model
{
    use HasFactory;
    protected $fillable = ['sidebar_section_id', 'title', 'url', 'is_current'];

    public function sidebarSection(): BelongsTo
    {
        return $this->belongsTo(SidebarSection::class);
    }

    public function page(): HasOne
    {
        return $this->hasOne(Page::class);
    }
}
