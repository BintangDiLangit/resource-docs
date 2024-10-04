<?php

use App\Http\Controllers;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Route::get('/', Controllers\HomeController::class)->name('home');
Route::get('about', Controllers\AboutController::class)->name('about');

Route::get('dashboard', Controllers\DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/settings', [PageController::class, 'setting'])->name('setting');
    Route::get('/settings/get-page/{sidebarItemId}', [PageController::class, 'getPageBySidebarItem'])->name('setting.get-page');
    Route::post('/settings/update-page', [PageController::class, 'createOrUpdate'])->name('setting.update-page');
    Route::post('/settings/update-sidebar-item', [PageController::class, 'updateSidebarItem'])->name('setting.update-sidebar-item');
});
Route::get('/', [PageController::class, 'index'])->name('home');
Route::get('/support-me', [PageController::class, 'supportMe'])->name('support.me');
Route::get('/page/{slug}', [PageController::class, 'show'])->where('slug', '.*')->name('page.show');
Route::get('/sidebar-data', [PageController::class, 'getSidebarData']);

require __DIR__ . '/auth.php';
require __DIR__ . '/dev.php';
