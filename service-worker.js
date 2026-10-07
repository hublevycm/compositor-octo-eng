const CACHE_NAME='composerm-pwa-v4';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./icons/composerm-logo.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(r=>{
      const cp=r.clone(); caches.open(CACHE_NAME).then(c=>c.put('./index.html',cp)); return r;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{
    if(r.ok){const cp=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request,cp));}
    return r;
  })));
});