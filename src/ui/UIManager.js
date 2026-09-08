import confetti from 'canvas-confetti';

export class UIManager {
  constructor(game) {
    this.game = game;

    // HUD Elements
    this.scoreDisplay = document.getElementById('score-display');
    this.fishDisplay = document.getElementById('fish-display');
    this.comboBadge = document.getElementById('combo-badge');
    this.comboText = document.getElementById('combo-text');
    this.stageName = document.getElementById('stage-name');
    this.stageStep = document.getElementById('stage-step');
    this.stageIcon = document.getElementById('stage-icon');

    this.weatherIcon = document.getElementById('weather-icon');
    this.timeIcon = document.getElementById('time-icon');
    this.soundIcon = document.getElementById('sound-icon');
    this.btnAutoplay = document.getElementById('btn-autoplay');
    this.dangerBar = document.getElementById('danger-bar');

    // Action & Mobile
    this.btnActionFish = document.getElementById('btn-action-fish');
    this.mobileDpad = document.getElementById('mobile-dpad');

    // Overlays & Alerts
    this.fishingOverlay = document.getElementById('fishing-overlay');
    this.reelGaugeFill = document.getElementById('reel-gauge-fill');
    this.catchPopup = document.getElementById('catch-popup');
    this.catchName = document.getElementById('catch-name');
    this.catchEmoji = document.getElementById('catch-emoji');
    this.catchRarity = document.getElementById('catch-rarity');
    this.catchPts = document.getElementById('catch-pts');
    this.catchStars = document.getElementById('catch-stars');

    // Modals
    this.startOverlay = document.getElementById('start-overlay');
    this.gameoverModal = document.getElementById('gameover-modal');
    this.gameoverReason = document.getElementById('gameover-reason');
    this.finalScore = document.getElementById('final-score');
    this.finalStage = document.getElementById('final-stage');
    this.finalFish = document.getElementById('final-fish');
    this.playerNickname = document.getElementById('player-nickname');
    this.submitStatusMsg = document.getElementById('submit-status-msg');

    this.weatherModal = document.getElementById('weather-modal');
    this.leaderboardModal = document.getElementById('leaderboard-modal');
    this.leaderboardRows = document.getElementById('leaderboard-rows');
    this.helpModal = document.getElementById('help-modal');

    this.activeLeaderboardTab = 'global';
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.initEventListeners();
  }

  initEventListeners() {
    // 1. Start Game
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      this.startOverlay.style.display = 'none';
      this.game.start();
    });

    // 2. Restart Game
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.gameoverModal.style.display = 'none';
      this.game.restart();
    });

    // 3. Cast / Reel Action Button
    this.btnActionFish.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.player.startFishing();
    });

    // 4. Auto-Play Bot Toggle
    this.btnAutoplay.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = this.game.autoPlayAI.toggle();
      this.btnAutoplay.classList.toggle('active', active);
      this.btnAutoplay.querySelector('.bot-label').textContent = active ? 'BOT: ON' : 'BOT: OFF';
    });

    // 5. Sound Mute Toggle
    document.getElementById('btn-sound')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = this.game.audio.toggleMute();
      this.soundIcon.textContent = muted ? '🔇' : '🔊';
    });

    // 6. Weather Modal Open & Close
    document.getElementById('btn-weather')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.weatherModal.style.display = 'flex';
    });
    document.getElementById('btn-close-weather')?.addEventListener('click', () => {
      this.weatherModal.style.display = 'none';
    });
    document.querySelectorAll('.weather-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.weather-opt').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.weather;
        this.game.weatherSystem.setWeather(type);
      });
    });

    // 7. Day / Night Cycle Toggle
    document.getElementById('btn-time-cycle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.weatherSystem.toggleDayNight();
    });
    document.getElementById('btn-toggle-night')?.addEventListener('click', () => {
      this.game.weatherSystem.toggleDayNight();
    });

    // 8. Online Leaderboard Modal
    document.getElementById('btn-leaderboard-open')?.addEventListener('click', () => {
      this.openLeaderboard();
    });
    document.getElementById('btn-close-leaderboard')?.addEventListener('click', () => {
      this.leaderboardModal.style.display = 'none';
    });
    document.getElementById('btn-close-ranks')?.addEventListener('click', () => {
      this.leaderboardModal.style.display = 'none';
    });
    document.getElementById('btn-view-ranks-from-gameover')?.addEventListener('click', () => {
      this.openLeaderboard();
    });
    document.getElementById('btn-refresh-ranks')?.addEventListener('click', () => {
      this.refreshLeaderboard();
    });

    // Leaderboard Tabs
    document.getElementById('tab-global')?.addEventListener('click', () => {
      this.activeLeaderboardTab = 'global';
      document.getElementById('tab-global').classList.add('active');
      document.getElementById('tab-local').classList.remove('active');
      this.refreshLeaderboard();
    });
    document.getElementById('tab-local')?.addEventListener('click', () => {
      this.activeLeaderboardTab = 'local';
      document.getElementById('tab-local').classList.add('active');
      document.getElementById('tab-global').classList.remove('active');
      this.refreshLeaderboard();
    });

    // 9. Submit Score
    document.getElementById('btn-submit-score')?.addEventListener('click', async () => {
      const name = this.playerNickname.value.trim() || 'Angler';
      const score = this.game.score;
      const stage = this.stageStep.textContent;
      const fish = this.game.fishCaught;

      this.submitStatusMsg.textContent = '랭킹 등록 중... ⏳';
      this.submitStatusMsg.style.color = '#38bdf8';

      const res = await this.game.leaderboard.submitScore(name, score, stage, fish);
      this.submitStatusMsg.textContent = res.message;
      this.submitStatusMsg.style.color = '#4ade80';
      document.getElementById('btn-submit-score').disabled = true;
    });

    // 10. Help Modal
    document.getElementById('btn-help-open')?.addEventListener('click', () => {
      this.helpModal.style.display = 'flex';
    });
    document.getElementById('btn-close-help')?.addEventListener('click', () => {
      this.helpModal.style.display = 'none';
    });
    document.getElementById('btn-close-help-action')?.addEventListener('click', () => {
      this.helpModal.style.display = 'none';
    });

    // 11. Mobile D-Pad Buttons
    document.querySelectorAll('.dpad-btn').forEach((btn) => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        this.handleDirectionInput(dir);
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        this.handleDirectionInput(dir);
      });
    });

    // 12. Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (this.game.state !== 'PLAYING') return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.game.player.hop(0, 1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.game.player.hop(0, -1);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.game.player.hop(-1, 0);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.game.player.hop(1, 0);
          break;
        case 'Space':
          e.preventDefault();
          this.game.player.startFishing();
          break;
        case 'KeyB':
          this.btnAutoplay.click();
          break;
      }
    });

    // 13. Touch Swipe Detection
    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('#hud') || e.target.closest('.popup-modal')) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.target.closest('#hud') || e.target.closest('.popup-modal')) return;
      if (this.game.state !== 'PLAYING') return;

      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Minimum swipe distance
      if (Math.max(absX, absY) > 28) {
        if (absX > absY) {
          if (deltaX > 0) this.game.player.hop(1, 0); // Right
          else this.game.player.hop(-1, 0); // Left
        } else {
          if (deltaY < 0) this.game.player.hop(0, 1); // Up / Forward
          else this.game.player.hop(0, -1); // Down / Back
        }
      } else {
        // Quick Tap without dragging = Hop Forward
        this.game.player.hop(0, 1);
      }
    }, { passive: true });
  }

  handleDirectionInput(dir) {
    if (this.game.state !== 'PLAYING') return;
    switch (dir) {
      case 'up': this.game.player.hop(0, 1); break;
      case 'down': this.game.player.hop(0, -1); break;
      case 'left': this.game.player.hop(-1, 0); break;
      case 'right': this.game.player.hop(1, 0); break;
    }
  }

  updateScore(score, fish) {
    this.scoreDisplay.textContent = score;
    this.fishDisplay.textContent = fish;
  }

  updateStage(biome, stageNumber) {
    this.stageName.textContent = biome.name;
    this.stageStep.textContent = `STAGE ${stageNumber}`;
    this.stageIcon.textContent = biome.icon;
  }

  updateWeatherIndicator(weatherType, isNight) {
    const weatherEmojis = {
      clear: '☀️',
      rain: '🌧️',
      snow: '❄️',
      fog: '🌫️'
    };
    this.weatherIcon.textContent = weatherEmojis[weatherType] || '☀️';
    this.timeIcon.textContent = isNight ? '🌙' : '🌤️';
  }

  setActionButtonState(state) {
    if (state === 'biting') {
      this.btnActionFish.className = 'action-btn reeling';
      this.btnActionFish.querySelector('.btn-icon').textContent = '❗';
      this.btnActionFish.querySelector('.btn-text').textContent = 'REEL!';
    } else if (state === 'casting') {
      this.btnActionFish.className = 'action-btn reeling';
      this.btnActionFish.querySelector('.btn-icon').textContent = '⏳';
      this.btnActionFish.querySelector('.btn-text').textContent = 'WAIT...';
    } else {
      this.btnActionFish.className = 'action-btn';
      this.btnActionFish.querySelector('.btn-icon').textContent = '🎣';
      this.btnActionFish.querySelector('.btn-text').textContent = 'CAST';
    }
  }

  showBiteAlert(duration) {
    this.fishingOverlay.style.display = 'block';
    this.reelGaugeFill.style.width = '100%';
    this.reelGaugeFill.style.transition = `width ${duration}s linear`;
    requestAnimationFrame(() => {
      this.reelGaugeFill.style.width = '0%';
    });
  }

  hideBiteAlert() {
    this.fishingOverlay.style.display = 'none';
  }

  showCatchPopup(fish) {
    this.catchName.textContent = fish.name;
    this.catchEmoji.textContent = fish.emoji;
    this.catchRarity.textContent = `${fish.rarity.toUpperCase()} CATCH!`;
    this.catchPts.textContent = `+${fish.points} PTS`;

    const stars = fish.rarity === 'legendary' ? '★★★★★' : (fish.rarity === 'rare' ? '★★★☆☆' : '★☆☆☆☆');
    this.catchStars.textContent = stars;

    this.catchPopup.style.display = 'block';

    // Confetti on rare or legendary
    if (fish.rarity === 'legendary' || fish.rarity === 'rare') {
      confetti({
        particleCount: fish.rarity === 'legendary' ? 80 : 35,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setTimeout(() => {
      this.catchPopup.style.display = 'none';
    }, 1800);
  }

  showTemporaryAlert(msg) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
      position: absolute;
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid #38bdf8;
      color: #fff;
      padding: 10px 20px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      z-index: 1000;
      pointer-events: none;
      animation: bounceIn 0.25s ease;
    `;
    alertBox.textContent = msg;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.remove();
    }, 1500);
  }

  updateDangerBar(progress) {
    this.dangerBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  }

  showGameOver(reason, score, stageName, fish) {
    this.gameoverReason.textContent = reason;
    this.finalScore.textContent = score;
    this.finalStage.textContent = stageName;
    this.finalFish.textContent = `${fish}마리`;
    this.submitStatusMsg.textContent = '';
    document.getElementById('btn-submit-score').disabled = false;

    this.gameoverModal.style.display = 'flex';
  }

  async openLeaderboard() {
    this.leaderboardModal.style.display = 'flex';
    await this.refreshLeaderboard();
  }

  async refreshLeaderboard() {
    this.leaderboardRows.innerHTML = '<tr><td colspan="5" class="loading-td">랭킹 불러오는 중... 🎣</td></tr>';

    let list = [];
    if (this.activeLeaderboardTab === 'global') {
      list = await this.game.leaderboard.getOnlineScores();
    } else {
      list = this.game.leaderboard.getLocalScores();
    }

    if (!list || list.length === 0) {
      this.leaderboardRows.innerHTML = '<tr><td colspan="5" class="loading-td">등록된 랭킹 기록이 없습니다.</td></tr>';
      return;
    }

    this.leaderboardRows.innerHTML = '';
    list.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const rankClass = idx === 0 ? 'rank-top1' : (idx === 1 ? 'rank-top2' : (idx === 2 ? 'rank-top3' : ''));
      const medal = idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : `${idx + 1}`));

      tr.innerHTML = `
        <td class="${rankClass}">${medal}</td>
        <td><strong>${item.name}</strong></td>
        <td><strong style="color: #38bdf8">${item.score}</strong></td>
        <td>${item.details.split('|')[0] || '-'}</td>
        <td>${item.details.split('|')[1] || '-'}</td>
      `;
      this.leaderboardRows.appendChild(tr);
    });
  }
}
