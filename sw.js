/* Offline cache so the app keeps working on the tablet even if the server is off. */
const VERSION = 'axie-piano-v2.3';
const FILES = [
  './',
  'index.html',
  'css/style.css?v=2.3',
  'manifest.webmanifest?v=2.3',
  'icon.svg?v=2.3',
  'js/store.js?v=2.3',
  'js/music.js?v=2.3',
  'js/audio.js?v=2.3',
  'js/axolotl.js?v=2.3',
  'js/piano.js?v=2.3',
  'js/staff.js?v=2.3',
  'js/songs.js?v=2.3',
  'js/curriculum.js?v=2.3',
  'js/ui.js?v=2.3',
  'js/games.js?v=2.3',
  'js/songplayer.js?v=2.3',
  'js/composer.js?v=2.3',
  'js/app.js?v=2.3'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network first so changes are immediate, fallback to cache offline
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const c = r.clone();
        caches.open(VERSION).then(ca => ca.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
