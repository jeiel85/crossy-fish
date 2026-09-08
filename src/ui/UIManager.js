import confetti from 'canvas-confetti';
import { BIOMES } from '../world/Biomes.js';

export class UIManager {
  constructor(game) {
    this.game = game;

    // HUD
    this.scoreDisplay = document.getElementById('score-display');
    this.fishDisplay = document.getElementById('fish-display');
    this.stageName = document.getElementById('stage-name');
    this.stageStep = document.getElementById('stage-step');
    this.stageIcon = document.getElementById('stage-icon');

    this.weatherIcon = document.getElementById('weather-icon');
    this.timeIcon = document.getElementById('time-icon');
    this.soundIcon = document.getElementById('sound-icon');
    this.btnAutoplay = document.getElementById('btn-autoplay');

    // Action button
    this.btnActionFish = document.getElementById('btn-action-fish');
    this.actionIcon = document.getElementById('action-icon');
    this.actionText = document.getElementById('action-text');

    // Overlays
    this.strikeOverlay = document.getElementById('strike-overlay');
    this.strikeGaugeFill = document.getElementById('strike-gauge-fill');
    this.reelingOverlay = document.getElementById('reeling-overlay');
    this.tensionNeedle = document.getElementById('tension-needle');
    this.progressFill = document.getElementById('progress-fill');
    this.catchProgressPercent = document.getElementById('catch-progress-percent');
    this.reelingStatusBadge = document.getElementById('reeling-status-badge');

    // Catch Popup
    this.catchPopup = document.getElementById('catch-popup');
    this.catchName = document.getElementById('catch-name');
    this.catchEmoji = document.getElementById('catch-emoji');
    this.catchStats = document.getElementById('catch-stats');
    this.catchRarity = document.getElementById('catch-rarity');
    this.catchRecord = document.getElementById('catch-record');
    this.catchPts = document.getElementById('catch-pts');
    this.catchStars = document.getElementById('catch-stars');

    // Modals
    this.startOverlay = document.getElementById('start-overlay');
    this.weatherModal = document.getElementById('weather-modal');
    this.fishdexModal = document.getElementById('fishdex-modal');
    this.fishdexGrid = document.getElementById('fishdex-grid');
    this.fishdexSummary = document.getElementById('fishdex-summary');
    this.leaderboardModal = document.getElementById('leaderboard-modal');
    this.leaderboardRows = document.getElementById('leaderboard-rows');
    this.helpModal = document.getElementById('help-modal');

    this.activeLeaderboardTab = 'global';

    this.initEventListeners();
  }

  initEventListeners() {
    // 1. Start Game
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      this.startOverlay.style.display = 'none';
      this.game.start();
    });

    // 2. Stage Switcher
    document.getElementById('btn-prev-stage')?.addEventListener('click', () => {
      this.game.prevStage();
    });
    document.getElementById('btn-next-stage')?.addEventListener('click', () => {
      this.game.nextStage();
    });

    // 3. Canvas Water Click / Touch Targeting
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#hud') || e.target.closest('.popup-modal')) return;
      this.game.onWaterClicked(e);
    });

    // 4. Action Button Handling (Cast, Strike, Reel Hold)
    const handleActionDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mechanic = this.game.fishingMechanic;

      if (mechanic.state === 'IDLE') {
        mechanic.castDefault();
      } else if (mechanic.state === 'STRIKE_WINDOW') {
        mechanic.hook();
      } else if (mechanic.state === 'REELING') {
        mechanic.setReeling(true);
        this.btnActionFish.classList.add('active-hold');
      }
    };

    const handleActionUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mechanic = this.game.fishingMechanic;
      if (mechanic.state === 'REELING') {
        mechanic.setReeling(false);
        this.btnActionFish.classList.remove('active-hold');
      }
    };

    this.btnActionFish.addEventListener('mousedown', handleActionDown);
    window.addEventListener('mouseup', handleActionUp);
    this.btnActionFish.addEventListener('touchstart', handleActionDown, { passive: false });
    window.addEventListener('touchend', handleActionUp, { passive: false });

    // 5. Directional Movement & Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (this.game.state !== 'PLAYING') return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.game.player.handleDirection('UP');
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        this.game.player.handleDirection('DOWN');
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        this.game.player.handleDirection('LEFT');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        this.game.player.handleDirection('RIGHT');
      } else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        const mechanic = this.game.fishingMechanic;
        if (mechanic.state === 'IDLE') mechanic.castDefault();
        else if (mechanic.state === 'STRIKE_WINDOW') mechanic.hook();
        else if (mechanic.state === 'REELING') {
          mechanic.setReeling(true);
          this.btnActionFish.classList.add('active-hold');
        }
      } else if (e.code === 'KeyB') {
        this.btnAutoplay.click();
      } else if (e.code === 'KeyV' || e.code === 'KeyC') {
        this.game.cycleCameraMode();
      } else if (e.code === 'BracketLeft') {
        this.game.prevStage();
      } else if (e.code === 'BracketRight') {
        this.game.nextStage();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        const mechanic = this.game.fishingMechanic;
        if (mechanic.state === 'REELING') {
          mechanic.setReeling(false);
          this.btnActionFish.classList.remove('active-hold');
        }
      }
    });

    // Mobile D-Pad Buttons
    document.querySelectorAll('.dpad-btn').forEach((btn) => {
      const handleDpad = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = btn.dataset.dir;
        if (dir) this.game.player.handleDirection(dir);
      };
      btn.addEventListener('touchstart', handleDpad, { passive: false });
      btn.addEventListener('click', handleDpad);
    });

    // Touch Swipe Gestures
    let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('#hud') || e.target.closest('.popup-modal')) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.target.closest('#hud') || e.target.closest('.popup-modal')) return;
      if (this.game.state !== 'PLAYING') return;

      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) > 26) {
        if (absX > absY) {
          if (deltaX > 0) this.game.player.handleDirection('RIGHT');
          else this.game.player.handleDirection('LEFT');
        } else {
          if (deltaY < 0) this.game.player.handleDirection('UP');
          else this.game.player.handleDirection('DOWN');
        }
      }
    }, { passive: true });

    // 6. Auto-Fishing Bot
    this.btnAutoplay.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = this.game.autoPlayAI.toggle();
      this.btnAutoplay.classList.toggle('active', active);
      this.btnAutoplay.querySelector('.bot-label').textContent = active ? 'AUTO: ON' : 'AUTO: OFF';
    });

    // 7. Sound Toggle
    document.getElementById('btn-sound')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = this.game.audio.toggleMute();
      this.soundIcon.textContent = muted ? '🔇' : '🔊';
    });

    // 8. Weather Selector
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

    // 9. Day / Night Toggle
    document.getElementById('btn-time-cycle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.weatherSystem.toggleDayNight();
    });
    document.getElementById('btn-toggle-night')?.addEventListener('click', () => {
      this.game.weatherSystem.toggleDayNight();
    });

    // 10. Camera Perspective Switcher
    document.getElementById('btn-camera-view')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.cycleCameraMode();
    });

    // 11. Fishdex Modal
    document.getElementById('btn-fishdex-open')?.addEventListener('click', () => {
      this.openFishdex();
    });
    document.getElementById('btn-close-fishdex')?.addEventListener('click', () => {
      this.fishdexModal.style.display = 'none';
    });
    document.getElementById('btn-close-fishdex-action')?.addEventListener('click', () => {
      this.fishdexModal.style.display = 'none';
    });

    // 11. Leaderboard Modal
    document.getElementById('btn-leaderboard-open')?.addEventListener('click', () => {
      this.openLeaderboard();
    });
    document.getElementById('btn-close-leaderboard')?.addEventListener('click', () => {
      this.leaderboardModal.style.display = 'none';
    });
    document.getElementById('btn-close-ranks')?.addEventListener('click', () => {
      this.leaderboardModal.style.display = 'none';
    });
    document.getElementById('btn-refresh-ranks')?.addEventListener('click', () => {
      this.refreshLeaderboard();
    });

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

    // Submit Score
    document.getElementById('btn-submit-score')?.addEventListener('click', async () => {
      const input = document.getElementById('player-nickname');
      const status = document.getElementById('submit-status-msg');
      const name = input.value.trim() || '강태공';
      const score = this.game.score;
      const stage = this.stageStep.textContent;
      const fish = this.game.fishCaught;

      status.textContent = '랭킹 등록 중... ⏳';
      status.style.color = '#38bdf8';

      const res = await this.game.leaderboard.submitScore(name, score, stage, fish);
      status.textContent = res.message;
      status.style.color = '#4ade80';
      await this.refreshLeaderboard();
    });

    // 12. Help Modal
    document.getElementById('btn-help-open')?.addEventListener('click', () => {
      this.helpModal.style.display = 'flex';
    });
    document.getElementById('btn-close-help')?.addEventListener('click', () => {
      this.helpModal.style.display = 'none';
    });
    document.getElementById('btn-close-help-action')?.addEventListener('click', () => {
      this.helpModal.style.display = 'none';
    });
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
      sunny: '☀️',
      drizzle: '🌧️',
      storm: '⛈️',
      snow: '❄️',
      fog: '🌫️',
      sunset: '🌅',
      night: '🌌',
      cherry: '🌸'
    };
    this.weatherIcon.textContent = weatherEmojis[weatherType] || '☀️';
    this.timeIcon.textContent = (weatherType === 'night' || isNight) ? '🌙' : '🌤️';
  }

  updateCameraMode(mode) {
    const label = document.getElementById('view-mode-label');
    if (label) label.textContent = mode.name.split(' ')[0];
  }

  setFishingActionState(state) {
    this.btnActionFish.className = 'action-btn';
    if (state === 'strike') {
      this.btnActionFish.classList.add('btn-strike');
      this.actionIcon.textContent = '⚡';
      this.actionText.textContent = 'STRIKE!';
    } else if (state === 'reeling') {
      this.btnActionFish.classList.add('btn-reeling');
      this.actionIcon.textContent = '🔄';
      this.actionText.textContent = 'REEL!';
    } else if (state === 'casting' || state === 'waiting') {
      this.actionIcon.textContent = '⏳';
      this.actionText.textContent = 'WAIT...';
    } else {
      this.actionIcon.textContent = '🎣';
      this.actionText.textContent = 'CAST';
    }
  }

  showStrikeAlert() {
    this.strikeOverlay.style.display = 'block';
    this.strikeGaugeFill.style.width = '100%';
  }

  updateStrikeGauge(ratio) {
    this.strikeGaugeFill.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
  }

  hideStrikeAlert() {
    this.strikeOverlay.style.display = 'none';
  }

  showReelModal(show) {
    this.reelingOverlay.style.display = show ? 'block' : 'none';
  }

  updateTensionGauge(tension, progress, inSweetSpot) {
    this.tensionNeedle.style.left = `${tension}%`;
    this.progressFill.style.width = `${progress}%`;
    this.catchProgressPercent.textContent = `${Math.round(progress)}%`;

    if (tension > 80) {
      this.reelingStatusBadge.className = 'reeling-status danger';
      this.reelingStatusBadge.textContent = '위험! (RELEASE!)';
    } else if (tension < 20) {
      this.reelingStatusBadge.className = 'reeling-status loose';
      this.reelingStatusBadge.textContent = '느슨함 (HOLD REEL!)';
    } else {
      this.reelingStatusBadge.className = 'reeling-status';
      this.reelingStatusBadge.textContent = '적정 구간 (PERFECT!)';
    }
  }

  showCatchPopup(fish, sizeCm, weightKg, isNewRecord, isNewSpecies) {
    this.catchName.textContent = fish.name;
    this.catchEmoji.textContent = fish.emoji;
    this.catchStats.textContent = `길이: ${sizeCm}cm | 무게: ${weightKg}kg`;
    this.catchRarity.textContent = `${fish.rarity.toUpperCase()} CATCH!`;
    this.catchPts.textContent = `+${fish.points} PTS`;

    if (isNewRecord || isNewSpecies) {
      this.catchRecord.style.display = 'inline-block';
      this.catchRecord.textContent = isNewSpecies ? '★ NEW SPECIES! ★' : '★ NEW RECORD SIZE! ★';
    } else {
      this.catchRecord.style.display = 'none';
    }

    const stars = fish.rarity === 'legendary' ? '★★★★★' : (fish.rarity === 'rare' ? '★★★☆☆' : '★☆☆☆☆');
    this.catchStars.textContent = stars;

    this.catchPopup.style.display = 'block';

    confetti({
      particleCount: fish.rarity === 'legendary' ? 90 : 40,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      this.catchPopup.style.display = 'none';
    }, 2200);
  }

  showTemporaryAlert(msg) {
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
      position: absolute;
      top: 18%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      border: 2px solid #38bdf8;
      color: #fff;
      padding: 10px 22px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.5);
      z-index: 1000;
      pointer-events: none;
      animation: bounceIn 0.25s ease;
    `;
    alertBox.textContent = msg;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.remove();
    }, 1600);
  }

  openFishdex() {
    this.fishdexModal.style.display = 'flex';
    const totalCaught = this.game.fishdex.getTotalCaught();
    const uniqueCount = this.game.fishdex.getUniqueSpeciesCount();
    this.fishdexSummary.textContent = `수집한 물고기: ${uniqueCount} / 20종 | 총 어획량: ${totalCaught}마리`;

    this.fishdexGrid.innerHTML = '';
    BIOMES.forEach((biome) => {
      biome.fishSpecies.forEach((fish) => {
        const entry = this.game.fishdex.getEntry(fish.id);
        const card = document.createElement('div');

        if (entry) {
          card.className = 'fishdex-card unlocked';
          card.innerHTML = `
            <div class="card-emoji">${fish.emoji}</div>
            <div class="card-name">${fish.name}</div>
            <div class="card-count">${entry.count}마리 낚음</div>
            <div class="card-max">최대: ${entry.maxSize}cm</div>
          `;
        } else {
          card.className = 'fishdex-card locked';
          card.innerHTML = `
            <div class="card-emoji">❓</div>
            <div class="card-name">${fish.name}</div>
            <div class="card-count">미발견</div>
            <div class="card-max">${biome.name.split(' ')[0]}</div>
          `;
        }
        this.fishdexGrid.appendChild(card);
      });
    });
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
      this.leaderboardRows.innerHTML = '<tr><td colspan="5" class="loading-td">등록된 기록이 없습니다.</td></tr>';
      return;
    }

    this.leaderboardRows.innerHTML = '';
    list.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const medal = idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : `${idx + 1}`));
      tr.innerHTML = `
        <td>${medal}</td>
        <td><strong>${item.name}</strong></td>
        <td><strong style="color: #38bdf8">${item.score}</strong></td>
        <td>${item.details.split('|')[0] || '-'}</td>
        <td>${item.details.split('|')[1] || '-'}</td>
      `;
      this.leaderboardRows.appendChild(tr);
    });
  }
}
