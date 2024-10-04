<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'BintangDiLangit') }}</title>

    <!-- Basic Meta -->
    <meta name="title" content="Docs - Bintang Miftaqul Huda">
    <meta name="description"
        content="Documentation and Resources of Bintang Miftaqul Huda - BINTANGMFHD">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Bintang Miftaqul Huda - Software Engineer">
    <meta property="og:description"
        content="Documentation and Resources of Bintang Miftaqul Huda - BINTANGMFHD">
    <meta property="og:image" content="https://is3.cloudhost.id/portfolio123/storage/seo/64e0bb014746fpueucwmxjg.webp">
    <meta property="og:url" content="https://bintangmfhd.com/">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://bintangmfhd.com/">
    <meta property="twitter:title" content="Bintang Miftaqul Huda - Software Engineer">
    <meta property="twitter:description"
        content="Documentation and Resources of Bintang Miftaqul Huda - BINTANGMFHD">
    <meta property="twitter:image"
        content="https://is3.cloudhost.id/portfolio123/storage/main_image/main_image64de2f2450993xw9d1.jpg">

    <!-- SEO Meta -->
    <meta name="keywords"
        content="bintangmfhd, resume, cv, vCard, portfolio, software engineer, programmer, Bintang Miftaqul Huda, documentation, docs">
    <meta name="robots" content="index, follow, noodp">
    <meta name="googlebot" content="index, follow">
    <meta name="google" content="notranslate">
    <link rel="canonical" href="https://bintangmfhd.com/">

    <!--Favicon-->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/images/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('assets/images/favicon-16x16.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
