<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" type="image/png" href="{{ asset('images/logo-transparent.png') }}">

        <!-- Preconnects ke domain eksternal -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="dns-prefetch" href="https://www.youtube.com">
        <link rel="dns-prefetch" href="https://wa.me">

        <!-- Fonts — non-blocking: preload lalu swap ke stylesheet via JS -->
        <link rel="preload" as="style"
              href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700&family=Playfair+Display:wght@600;700&display=swap"
              onload="this.onload=null;this.rel='stylesheet'">
        <noscript>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700&family=Playfair+Display:wght@600;700&display=swap">
        </noscript>

        <!-- Material Symbols — non-blocking -->
        <link rel="preload" as="style"
              href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
              onload="this.onload=null;this.rel='stylesheet'">
        <noscript>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap">
        </noscript>

        <!-- PWA Meta Tags -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#1E4D3A">

        <!-- Google Tag Manager / Analytics -->
        @if(config('services.gtm') && (!auth()->check() || auth()->user()->role !== 'admin') && !request()->is('admin*'))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.gtm') }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '{{ config('services.gtm') }}');
            </script>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js');
                });
            }
        </script>
    </body>
</html>

