// /gshs/ 주소는 폐기됨 (/gshs-exam-simul/ 로 이전).
// 기존에 설치된 앱의 서비스 워커를 이 파일로 교체해 캐시를 지우고 스스로 해제합니다.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('gshs-v')).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});
