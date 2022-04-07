/*jshint esversion: 6 */
/* eslint-disable no-console */

const version = `Beta 0.2`; // Only for internal purppouse. Change this every time i need to reload the SW
const DEBUG = true;
console.log('Update SW');

// When the user navigates to your site,
// the browser tries to redownload the script file that defined the service
// worker in the background.
// If there is even a byte's difference in the service worker file compared
// to what it currently has, it considers it 'new'.
// console.log(global);
// const { assets } = global.serviceWorkerOption;
// let { assets } = {};

const CACHE_NAME = new Date().toISOString();

// let assetsToCache = [...assets, 'https://fonts.googleapis.com/icon?family=Material+Icons', '/app/inicio', '/app/camionetas', 
//     '/app/pedidos', '/app/cierres', '/app/cargas', '/app/clientes', 
//     '/app/autorizacion', '/app/usuarios', '/app/soporte',
//     '/css/materialize.min.css', '/js/materialize.min.js', '/css/datatables.min.css', '/js/jquery-3.3.1.min.js',
//     '/js/datatables.min.js', 'https://fonts.gstatic.com/s/materialicons/v88/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
//     '/manifest.json'    
//   ];
  let assetsToCache = ['https://fonts.googleapis.com/icon?family=Material+Icons', '/app/inicio', '/app/clientes', 
  '/app/sectores', '/app/planillas', '/app/notificaciones', '/app/users',
  '/css/materialize.min.css', '/js/materialize.min.js', '/css/datatables.min.css', '/css/app.css', '/js/ui.js', '/js/app_clientes.js',
  '/js/app_sectores.js', '/js/app_planillas.js',
  '/js/datatables.min.js', 'https://fonts.gstatic.com/s/materialicons/v88/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/manifest.json', '/images/manifest-icon-192.png', '/images/manifest-icon-512.png', '/js/jSignature.min.noconflict.js' 
];
// let assetsToCache = [ '/images/manifest-icon-192.png', '/images/manifest-icon-512.png'
// ];
let assetsToSkip = ['/', '/app', '/logout', '/api/users', 'https://db.davbros.com.ar'];

// console.log('Assets before process');
// console.log(assetsToCache);
assetsToCache = assetsToCache.map(path => {
  return new URL(path, global.location).toString();
});

console.log('Assets after process');
console.log(assetsToCache);

// When the service worker is first added to a computer.
self.addEventListener('install', event => { 
  // Perform install steps.
  if (DEBUG) {
    console.log('[SW] Install event');
    console.log(global.location);
  }

  // fetch('/mix-manifest.json', { redirect: 'follow' })
  // .then(response => response.json())
  //     .then(data => assets = data)
  //         .then( ()=> {console.log(`Assets are => `)
  //                     console.log(assets)}
  //         )
  // ;

  // Add core website files to cache during serviceworker installation.
  event.waitUntil(
    global.caches
      .open(CACHE_NAME)
      .then(cache => {
        //console.log(assetsToCache);
        // Save cache name on server
        assetsToCache.map(asset => {
          try {
            console.log(`Asset is => ${asset}`);
            cache.add(asset);
          } catch (error) {
            console.log(`Error adding to cache. Resource => ${asset}`);
          }
        })
        return cache;
      })
      .then(() => {
        if (DEBUG) {
          console.log('Cached assets: main', assetsToCache);
        }
      })
      .catch(error => {
        console.log(`Error on cache.addAll => ${error}`);
        console.error(error);
        // throw error;
      })
  );
});

// After the install event.
self.addEventListener('activate', event => {
  if (DEBUG) {
    console.log('[SW] Activate event');
  }

  // Clean the caches
  event.waitUntil(
    global.caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log(cacheName);
          // Delete the caches that are not the current one.
          if (cacheName.indexOf(CACHE_NAME) === 0) {
            return null;
          }

          return global.caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('message', event => {
  switch (event.data.action) {
    case 'skipWaiting':
      if (self.skipWaiting) {
        self.skipWaiting();
        self.clients.claim();
      }
      break;
    default:
      break;
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignore not GET request.
  if (request.method !== 'GET') {
    if (DEBUG) {
      console.log(`[SW] Ignore non GET request ${request.method}`);
    }
    return;
  }
  // Ignore online features. / Login & Logout
  if (assetsToSkip.includes(request.url)) {
    return;
  }

  const requestUrl = new URL(request.url);

  // Ignore DB access.
  if (requestUrl.origin === 'https://db.davbros.com.ar') {
    if (DEBUG) {
      console.log(`[SW] Ignore difference origin ${requestUrl.origin}`);
    }
    return;
  }

  const resource = global.caches.match(request).then(response => {
    if (response) {
      if (DEBUG) {
        console.log(`[SW] fetch URL ${requestUrl.href} from cache`);
      }

      return response;
    }

    // Load and cache known assets.
    return fetch(request, { redirect: 'follow' })
      .then(responseNetwork => {
        if (!responseNetwork || !responseNetwork.ok) {
          if (DEBUG) {
            console.log(
              `[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${
                responseNetwork.status
              } ${responseNetwork.type}`
            );
          }

          return responseNetwork;
        }

        if (DEBUG) {
          console.log(`[SW] URL ${requestUrl.href} fetched`);
        }

        const responseCache = responseNetwork.clone();

        global.caches
          .open(CACHE_NAME)
          .then(cache => {
            // console.log('Request');
            // console.log(request);
            // console.log('ResponseCache');
            // console.log(responseCache);
            // // Ahora lo vemos
            // if (assetsToSkip.includes(request.url)) {
            //   return responseNetwork;
            // }
            return cache.put(request, responseCache);
          })
          .then(() => {
            if (DEBUG) {
              console.log(`[SW] Cache asset: ${requestUrl.href}`);
            }
          });

        return responseNetwork;
      })
      .catch(() => {
        // User is landing on our page.
        if (event.request.mode === 'navigate') {
          return global.caches.match('./');
        }

        return null;
      });
  });

  event.respondWith(resource);
});