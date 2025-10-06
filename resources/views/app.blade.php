<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'MyApp') }}</title>
    <meta name="description" content="{{ $serverSeo['description'] ?? 'Default description' }}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BINTANGMFHD">
    <meta property="og:url" content="{{ $serverSeo['url'] ?? URL::current() }}">
    <meta property="og:title" content="{{ $serverSeo['title'] ?? 'Docs Bintang Miftaqul Huda - BINTANGMFHD' }}">
    <meta property="og:description" content="{{ $serverSeo['description'] ?? 'Default description' }}">
    <meta property="og:image" content="{{ $serverSeo['image'] }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@bintangmfhd">
    <meta name="twitter:creator" content="@bintangmfhd">
    <meta property="twitter:url" content="{{ $serverSeo['url'] ?? URL::current() }}">
    <meta property="twitter:title" content="{{ $serverSeo['title'] ?? 'Docs Bintang Miftaqul Huda - BINTANGMFHD' }}">
    <meta property="twitter:description" content="{{ $serverSeo['description'] ?? 'Default description' }}">
    <meta property="twitter:image" content="{{ $serverSeo['image'] }}">

    <!-- SEO Meta -->
    <meta name="keywords"
        content="bintangmfhd, resume, cv, vCard, portfolio, software engineer, programmer, Bintang Miftaqul Huda, documentation, docs">
    <meta name="robots" content="index, follow, noodp">
    <meta name="googlebot" content="index, follow">
    <meta name="google" content="notranslate">
    <link rel="canonical" href="{{ $serverSeo['url'] ?? 'https://docs.bintangmfhd.com/' }}">

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6910825338601925"
        crossorigin="anonymous"></script>

    <!--Favicon-->
    <link rel="icon" type="image/png" sizes="32x32" href="https://bintangmfhd.com/assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="https://bintangmfhd.com/assets/images/favicon-16x16.png">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

    {{-- This is where dynamic tags from <Head> get injected --}}
    @inertiaHead
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>