<?php

use App\Http\Controllers;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SidebarController;
use App\Http\Controllers\SidebarSectionController;
use Illuminate\Support\Facades\Route;

// Route::get('/', Controllers\HomeController::class)->name('home');
Route::get('about', Controllers\AboutController::class)->name('about');

Route::get('dashboard', Controllers\DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/settings', [PageController::class, 'setting'])->name('setting');
    Route::resource('sidebar-sections', SidebarSectionController::class);
    Route::resource('sidebar-sections.sidebar-items', SidebarController::class)->shallow();
});
Route::get('/', [PageController::class, 'index'])->name('home');
Route::get('/support-me', [PageController::class, 'supportMe'])->name('support.me');
Route::get('/page/{slug}', [PageController::class, 'show'])->name('page.show');

require __DIR__ . '/auth.php';
require __DIR__ . '/dev.php';
