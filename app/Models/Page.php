<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    use HasFactory;

    protected $fillable = ['sidebar_item_id', 'title', 'slug', 'content'];

    public function sidebarItem(): BelongsTo
    {
        return $this->belongsTo(SidebarItem::class);
    }
}
