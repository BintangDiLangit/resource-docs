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

    // Article Management
    Route::get('/article-ai', [PageController::class, 'articleAi'])->name('article-ai');
    Route::get('/article/create', [PageController::class, 'createArticle'])->name('article.create');
    Route::post('/generate-article', [PageController::class, 'generateArticleFromPrompt']);
    Route::post('/auto-generate-article', [PageController::class, 'autoGenerateArticle']);
    Route::post('/article/create-or-update', [PageController::class, 'createOrUpdate'])->name('article.create-or-update');
    Route::get('/article/{id}/edit', [PageController::class, 'editArticle'])->name('article.edit');
    
    // Settings routes (deprecated - functionality moved to dashboard)
    // Route::get('/settings', [PageController::class, 'setting'])->name('setting');
    // Route::get('/settings/get-page/{sidebarItemId}', [PageController::class, 'getPageBySidebarItem'])->name('setting.get-page');
    // Route::post('/settings/update-page', [PageController::class, 'createOrUpdate'])->name('setting.update-page');
    // Route::post('/settings/update-sidebar-item', [PageController::class, 'updateSidebarItem'])->name('setting.update-sidebar-item');
});
Route::get('/', [PageController::class, 'index'])->name('home');
Route::get('/support-me', [PageController::class, 'supportMe'])->name('support.me');
Route::get('/page/{slug}', [PageController::class, 'show'])->where('slug', '.*')->name('page.show');
Route::get('/sidebar-data', [PageController::class, 'getSidebarData']);
Route::get('/search', [PageController::class, 'search']);

// Test route for Z.AI integration (remove in production)
Route::get('/test-zai', function () {
    $apiKey = config('services.zai.api_key');
    $baseUrl = config('services.zai.base_url');
    
    return response()->json([
        'api_key_configured' => !empty($apiKey),
        'base_url' => $baseUrl,
        'message' => $apiKey ? 'Z.AI is configured' : 'Z.AI API key not found in config'
    ]);
});

require __DIR__ . '/auth.php';
require __DIR__ . '/dev.php';
