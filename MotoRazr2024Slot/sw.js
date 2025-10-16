const CACHE_NAME = 'razr-slot-v1';
const ASSETS = [
  '/',
  '/MotoRazr2024Slot/',
  '/MotoRazr2024Slot/index.html',
  '/MotoRazr2024Slot/styles.css',
  '/MotoRazr2024Slot/main.js',
  '/MotoRazr2024Slot/manifest.webmanifest'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=> cache.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.filter(k=> k!==CACHE_NAME).map(k=> caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache=> cache.put(e.request, copy));
      return resp;
    }).catch(()=> caches.match('/MotoRazr2024Slot/index.html')))
  );
});
