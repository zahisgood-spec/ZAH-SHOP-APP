/* 展商城 Service Worker：讓網站可安裝成 App，並在斷線時仍能開啟外殼 */
const VER = 'zah-v1';
const SHELL = ['./', './index.html', './employee.html', './manifest-admin.json', './manifest-staff.json', './icon-192.png', './icon-512.png', './pwa.js'];
const CDN = ['cdn.tailwindcss.com', 'unpkg.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Firestore / Storage 即時資料一律走網路，不快取
  if (/firestore\.googleapis\.com|firebasestorage|googleapis\.com\/(identitytoolkit|v1)/.test(u.host + u.pathname)) return;
  const sameOrigin = u.origin === location.origin;
  if (!sameOrigin && !CDN.includes(u.host)) return;

  if (r.mode === 'navigate') { // 頁面：先抓最新，失敗才用快取
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match(u.pathname.includes('employee') ? './employee.html' : './index.html'))));
    return;
  }
  // 其他資源：先用快取、背景更新
  e.respondWith(caches.match(r).then(m => {
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; }).catch(() => m);
    return m || net;
  }));
});
