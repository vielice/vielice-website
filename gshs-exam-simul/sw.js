// 캐시 우선: 한 번 설치되면 서버 없이 기기에 저장된 파일로만 동작합니다.
// index.html을 수정하면 이 값을 올려야 새 버전이 배포됩니다 (서버가 살아 있을 때만).
// 이전 주소(/gshs/)에 설치된 앱이 같은 캐시 저장소를 쓰므로, 이 접두어의 캐시만 정리합니다.
const PREFIX = 'gshs-exam-simul-';
const CACHE = PREFIX + 'v20261020.8';
const ASSETS = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 페이지 이동은 항상 저장된 index로 응답, 나머지는 캐시에 없을 때만 네트워크
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./').then((hit) => hit || fetch(req)));
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // 웹폰트는 opaque 응답으로 오므로 함께 저장해 오프라인에서도 글꼴 유지
      if ((res.ok && new URL(req.url).origin === location.origin) || (req.url.startsWith('https://fonts.') && (res.ok || res.type === 'opaque'))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
