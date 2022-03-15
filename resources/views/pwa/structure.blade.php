<!DOCTYPE html><html lang="“es”">
  <head>
    <meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="”content-language”" content="”en-ar”/">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link rel="manifest" href="{{url('/manifest.json')}}">
	<link rel="stylesheet" href="/css/materialize.min.css">
	@yield ('header-links')
	@yield ('title')
	<meta name="apple-mobile-web-app-status-bar" content="#FFF">
    <meta name="theme-color" content="#FFF">
    <link rel="icon" type="image/png" sizes="196x196" href="/images/favicon-196.png">
    <link rel="apple-touch-icon" href="/images/apple-icon-180.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2048-2732.png" media="(prefers-color-scheme: dark) and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2732-2048.png" media="(prefers-color-scheme: dark) and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1668-2388.png" media="(prefers-color-scheme: dark) and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2388-1668.png" media="(prefers-color-scheme: dark) and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1536-2048.png" media="(prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2048-1536.png" media="(prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1668-2224.png" media="(prefers-color-scheme: dark) and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2224-1668.png" media="(prefers-color-scheme: dark) and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1620-2160.png" media="(prefers-color-scheme: dark) and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2160-1620.png" media="(prefers-color-scheme: dark) and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1284-2778.png" media="(prefers-color-scheme: dark) and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2778-1284.png" media="(prefers-color-scheme: dark) and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1170-2532.png" media="(prefers-color-scheme: dark) and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2532-1170.png" media="(prefers-color-scheme: dark) and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1125-2436.png" media="(prefers-color-scheme: dark) and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2436-1125.png" media="(prefers-color-scheme: dark) and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1242-2688.png" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2688-1242.png" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-828-1792.png" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1792-828.png" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1242-2208.png" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-2208-1242.png" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-750-1334.png" media="(prefers-color-scheme: dark) and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1334-750.png" media="(prefers-color-scheme: dark) and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-640-1136.png" media="(prefers-color-scheme: dark) and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="/images/apple-splash-dark-1136-640.png" media="(prefers-color-scheme: dark) and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
  </head>
  <body>
	@yield ('body')
    @yield ('script')  
  </body>
</html>