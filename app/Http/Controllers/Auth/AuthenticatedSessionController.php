<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\URL;

class AuthenticatedSessionController extends Controller
{
    private function defaultSeo(): array
    {
        return [
            'title'       => 'Docs Bintang Miftaqul Huda - BINTANGMFHD',
            'description' => 'Welcome to BINTANGMFHD documentation, where you will find useful resources on development.',
            'image'       => "https://bintangmfhd.s3.ap-southeast-3.amazonaws.com/photos/1/Tech/64e0bb014746fpueucwmxjg.png",
            'url'         => URL::current() ?? '/',
        ];
    }
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $serverSeo       = $this->defaultSeo();
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ])->withViewData(compact('serverSeo'));
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
