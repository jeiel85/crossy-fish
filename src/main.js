import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.game = game; // Exposed for debugging / testing
});

// PWA: 서비스워커 등록 (오프라인 실행·홈 화면 설치)
// 개발 서버(npm run dev)에서는 등록하지 않아 수정한 소스가 캐시에 가려지지 않게 한다.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
