var CACHE = 'trophy-v1';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}));
  self.skipWaiting();
});
self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Google Fonts — cache first
  if (url.indexOf('fonts.googleapis.com') !== -1 || url.indexOf('fonts.gstatic.com') !== -1){
    e.respondWith(caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(r){
        var cl=r.clone(); caches.open(CACHE).then(function(c){c.put(e.request,cl)}); return r;
      });
    }));
    return;
  }
  // App files — network first, cache fallback
  e.respondWith(fetch(e.request).then(function(r){
    var cl=r.clone(); caches.open(CACHE).then(function(c){c.put(e.request,cl)}); return r;
  }).catch(function(){return caches.match(e.request)}));
});
