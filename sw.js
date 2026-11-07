/* Offline cache so the app keeps working on the tablet even if the server is off. */
const VERSION = 'axie-piano-v2.5';
const FILES = [
  './',
  'index.html',
  'css/style.css?v=2.4',
  'manifest.webmanifest?v=2.4',
  'icon.svg?v=2.4',
  'js/store.js?v=2.4',
  'js/music.js?v=2.4',
  'js/audio.js?v=2.4',
  'js/axolotl.js?v=2.4',
  'js/piano.js?v=2.4',
  'js/staff.js?v=2.4',
  'js/songs.js?v=2.4',
  'js/curriculum.js?v=2.4',
  'js/ui.js?v=2.4',
  'js/games.js?v=2.4',
  'js/songplayer.js?v=2.4',
  'js/composer.js?v=2.4',
  'js/app.js?v=2.4',
  'audio/piano/A0.mp3',
  'audio/piano/C1.mp3',
  'audio/piano/Ds1.mp3',
  'audio/piano/Fs1.mp3',
  'audio/piano/A1.mp3',
  'audio/piano/C2.mp3',
  'audio/piano/Ds2.mp3',
  'audio/piano/Fs2.mp3',
  'audio/piano/A2.mp3',
  'audio/piano/C3.mp3',
  'audio/piano/Ds3.mp3',
  'audio/piano/Fs3.mp3',
  'audio/piano/A3.mp3',
  'audio/piano/C4.mp3',
  'audio/piano/Ds4.mp3',
  'audio/piano/Fs4.mp3',
  'audio/piano/A4.mp3',
  'audio/piano/C5.mp3',
  'audio/piano/Ds5.mp3',
  'audio/piano/Fs5.mp3',
  'audio/piano/A5.mp3',
  'audio/piano/C6.mp3',
  'audio/piano/Ds6.mp3',
  'audio/piano/Fs6.mp3',
  'audio/piano/A6.mp3',
  'audio/piano/C7.mp3',
  'audio/piano/Ds7.mp3',
  'audio/piano/Fs7.mp3',
  'audio/piano/A7.mp3',
  'audio/piano/C8.mp3',
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
