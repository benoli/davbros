const mix = require('laravel-mix');
require('laravel-mix-clean');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
mix.js('resources/js/app_manager.js', 'public/js')
mix.js('resources/js/app_inicio.js', 'public/js')
mix.js('resources/js/app_clientes.js', 'public/js')
mix.js('resources/js/app_sectores.js', 'public/js')
mix.js('resources/js/app_planillas.js', 'public/js')
// mix.js('resources/js/app_devices.js', 'public/js')
// mix.js('resources/js/app_reparaciones.js', 'public/js')
// mix.js('resources/js/app_suppliers.js', 'public/js')
// mix.js('resources/js/app_users.js', 'public/js')
mix.js('resources/js/sw.js', 'public/app')
// mix.js('resources/js/workers/sync_backend_worker.js', 'public/js')
    // .sass('resources/sass/app.scss', 'public/css')
    .postCss('resources/css/app.css', 'public/css', [
        //
    ])
    .sourceMaps()
    .clean();
        if (mix.inProduction()) {
        mix.clean();
        mix.version();
        mix.then(async () => {
          const convertToFileHash = require("laravel-mix-make-file-hash");
          const fileHashedManifest = await convertToFileHash({
            publicPath: "public",
            manifestFilePath: "public/mix-manifest.json",
            blacklist: ["web.config", "robots.txt", "index.php", "favicon.ico", "apple_devices.json", ".htaccess", "manifest.json"],
            keepBlacklistedEntries: true,
          });
          // get assets name on SW
        });
      }
mix.copy('public_assets/', 'public/');