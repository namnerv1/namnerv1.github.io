// My LED Sign — service worker 0.6.0 (ฉบับทดสอบ pwa-test/)
// เก็บไฟล์แอปไว้ในเครื่อง เพื่อให้เปิดได้แม้ไม่มีเน็ต (PWA Integration Plan Draft 2 ข้อ 3.4)
// - ติดตั้ง: ดึงทุกไฟล์แบบสด (cache:'reload') ต้องได้ 200 ครบ และ index.html ต้องเป็นเวอร์ชัน VER
//   ไม่ผ่าน = ติดตั้งไม่สำเร็จ → ตัวเก่ากับแคชเก่าทำงานต่อ (เปิดออฟไลน์ได้) แล้ว Chrome จะลองใหม่ครั้งหน้า
// - เริ่มทำงาน: ลบเฉพาะแคชที่ขึ้นต้นด้วย PREFIX ของตัวเอง (แคชใช้ร่วมกันทั้งเว็บ ห้ามลบของคนอื่น)
// - ตอบ: เฉพาะไฟล์ของแอป — แคชก่อน แล้วอัปเดตเบื้องหลัง (index.html เก็บทับเฉพาะเวอร์ชันที่ตรง)
const VER='0.6.0';
const PREFIX='led-sign-test-';
const CACHE=PREFIX+VER;
const ICONS='../';
const FILES=['./','index.html','manifest.webmanifest',ICONS+'icon-192.png',ICONS+'icon-512.png',ICONS+'icon-maskable.png'];
const PAGES=['./','index.html'];
const abs=u=>new URL(u,self.location.href).href;
const SHELL=new Set(FILES.map(abs));
const IDX=new Set(PAGES.map(abs));
const MARK=/<meta name="app-version" content="([^"]*)">/;
const verOK=t=>{const m=MARK.exec(t);return !!m&&m[1]===VER};

self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const got=await Promise.all(FILES.map(async u=>{
    const r=await fetch(new Request(u,{cache:'reload'}));
    if(!r.ok)throw new Error('LED Sign SW: '+u+' -> '+r.status);
    if(PAGES.includes(u)&&!verOK(await r.clone().text()))throw new Error('LED Sign SW: '+u+' is not version '+VER);
    return [abs(u),r];
  }));
  const existed=await caches.has(CACHE); // แคชชื่อเดียวกันของตัวที่ทำงานอยู่ — ห้ามลบ
  const c=await caches.open(CACHE);
  try{for(const [u,r] of got)await c.put(u,r)}
  catch(err){if(!existed)await caches.delete(CACHE);throw err}
  await self.skipWaiting();
})())});

self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const ks=await caches.keys();
  await Promise.all(ks.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})())});

self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  const url=new URL(q.url);url.search='';url.hash='';const key=url.href;
  if(!SHELL.has(key))return; // ไม่ใช่ไฟล์ของแอป → ปล่อยผ่านไปเน็ตตามปกติ ไม่เก็บ
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=await c.match(key);
    const net=fetch(q).then(async r=>{
      if(r&&r.ok&&r.type==='basic'){
        if(IDX.has(key)){if(verOK(await r.clone().text()))await c.put(key,r.clone())}
        else await c.put(key,r.clone());
      }
      return r;
    });
    if(hit){e.waitUntil(net.catch(()=>{}));return hit}
    try{return await net}
    catch(err){const fb=q.mode==='navigate'?await c.match(abs('index.html')):null;if(fb)return fb;throw err}
  })());
});
