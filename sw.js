// sw.js - Version corrigée
const CACHE_NAME = 'finger-beat-audio-v3';
const STATIC_CACHE = 'static-v3';

const staticAssets = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(staticAssets))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Gestion spéciale pour les fichiers audio
  if (request.url.includes('.mp3')) {
    event.respondWith(serveAudio(event.request));
    return;
  }
  
  // Stratégie Cache First pour les autres assets
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
  );
});

async function serveAudio(request) {
  // Créer un cache spécifique pour les audio
  const audioCache = await caches.open(CACHE_NAME);
  
  try {
    // Essayer d'abord le réseau
    const networkResponse = await fetch(request);
    
    // Mettre en cache la nouvelle réponse
    audioCache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // Fallback au cache si réseau échoue
    const cachedResponse = await audioCache.match(request);
    return cachedResponse || new Response('Audio non disponible');
  }
}