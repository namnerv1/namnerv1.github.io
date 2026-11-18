// My LED Sign — ตัวปิดตัวเองของโฟลเดอร์ทดสอบ pwa-test/ (แผนข้อ T8.2)
// ลบเฉพาะแคชที่ขึ้นต้นด้วย 'led-sign-test-' แล้วยกเลิกตัวเอง — ไม่แตะแคชแอปจริง ('led-sign-v…') และไม่แตะข้อมูลใด ๆ
self.addEventListener('install',e=>{e.waitUntil(self.skipWaiting())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const ks=await caches.keys();
  await Promise.all(ks.filter(k=>k.startsWith('led-sign-test-')).map(k=>caches.delete(k)));
  await self.registration.unregister();
})())});
