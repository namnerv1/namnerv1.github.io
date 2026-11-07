// เก็บไฟล์ไว้ในเครื่อง เพื่อให้แอปเปิดได้แม้ไม่มีเน็ต
// เมื่อแก้ไฟล์ index.html แล้วอัปโหลดใหม่ ให้เปลี่ยนเลขเวอร์ชันบรรทัดล่างนี้ด้วย
const CACHE='led-sign-v0.3.3';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(res=>{if(res&&res.ok&&new URL(e.request.url).origin===location.origin){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
