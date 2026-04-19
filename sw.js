var CACHE = 'trophy-v8';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}));
  self.skipWaiting();
});
self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()}).then(function(){
      // Просим все открытые вкладки перезагрузиться чтобы подхватить свежий код
      return self.clients.matchAll({type:'window'}).then(function(cs){
        cs.forEach(function(c){c.postMessage({type:'RELOAD'})});
      });
    })
  );
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
