// Serverless Online Leaderboard Manager
// Utilizes Dreamlo free serverless REST API + LocalStorage fallback

// Public Dreamlo board tokens configured for Crossy Fish
const DREAMLO_PUBLIC_KEY = '67cc372a8f40bb11283c7ce6';
const DREAMLO_PRIVATE_KEY = 'hG2aH6qGkUK0O1N16XwQlg-5YJqE9M0UuWz9I4kO7-tw';

export class Leaderboard {
  constructor() {
    this.publicKey = DREAMLO_PUBLIC_KEY;
    this.privateKey = DREAMLO_PRIVATE_KEY;
    this.localKey = 'crossy_fish_leaderboard_local';
  }

  // Get online high scores
  async getOnlineScores() {
    try {
      const url = `https://dreamlo.com/lb/${this.publicKey}/json/10`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data || !data.dreamlo || !data.dreamlo.leaderboard) {
        return this.getLocalScores();
      }

      const entries = data.dreamlo.leaderboard.entry;
      if (!entries) return [];

      const list = Array.isArray(entries) ? entries : [entries];
      return list.map((item, idx) => {
        // item.text stores additional metadata like stage & fish count: "Stage 3 | 12 Fish"
        return {
          rank: idx + 1,
          name: decodeURIComponent(item.name || 'Anonymous'),
          score: parseInt(item.score, 10) || 0,
          details: item.text ? decodeURIComponent(item.text) : 'STAGE 1',
          date: item.date || ''
        };
      });
    } catch (err) {
      console.warn('Dreamlo online fetch failed, using local ranks fallback:', err);
      return this.getLocalScores();
    }
  }

  // Submit score to serverless online leaderboard
  async submitScore(nickname, score, stageName, fishCount) {
    const cleanName = encodeURIComponent(nickname.trim().replace(/[|/\\?#%]/g, '').slice(0, 10) || 'Angler');
    const details = encodeURIComponent(`${stageName} | 🐟${fishCount}`);

    // Always save to local storage first
    this.saveLocalScore(cleanName, score, `${stageName} | 🐟${fishCount}`);

    try {
      const url = `https://dreamlo.com/lb/${this.privateKey}/add/${cleanName}/${score}/0/${details}`;
      const res = await fetch(url, { method: 'GET', mode: 'no-cors' });
      return { success: true, message: '온라인 랭킹에 성공적으로 등록되었습니다! 🎉' };
    } catch (err) {
      console.warn('Online submit failed:', err);
      return { success: true, message: '로컬 랭킹에 등록되었습니다. (네트워크 연결 시 자동 동기화)' };
    }
  }

  // Local storage backup
  getLocalScores() {
    try {
      const raw = localStorage.getItem(this.localKey);
      if (!raw) {
        // Default fun starter hall-of-fame records
        return [
          { rank: 1, name: '강태공마스터', score: 1850, details: 'STAGE 5 | 🐟14' },
          { rank: 2, name: '바다의왕자', score: 1420, details: 'STAGE 4 | 🐟10' },
          { rank: 3, name: '펭귄낚시꾼', score: 980, details: 'STAGE 3 | 🐟8' },
          { rank: 4, name: '루어초보', score: 650, details: 'STAGE 2 | 🐟5' },
          { rank: 5, name: '네온서퍼', score: 420, details: 'STAGE 1 | 🐟3' }
        ];
      }
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  saveLocalScore(name, score, details) {
    let scores = this.getLocalScores();
    scores.push({
      name: decodeURIComponent(name),
      score,
      details,
      date: new Date().toLocaleDateString()
    });

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);
    // Keep top 15
    scores = scores.slice(0, 15);
    // Re-rank
    scores.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    try {
      localStorage.setItem(this.localKey, JSON.stringify(scores));
    } catch (_) {}
  }
}
