import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.game = game; // Exposed for debugging / testing
});

// PWA: 서비스워커 등록 (오프라인 실행·홈 화면 설치)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
