import * as THREE from 'three';

export class FishingMechanic {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    this.state = 'IDLE'; // 'IDLE', 'CASTING', 'WAITING_BITE', 'STRIKE_WINDOW', 'REELING', 'CAUGHT'
    
    // Target cast position
    this.targetPos = new THREE.Vector3(0, 0, 5);
    this.castStartPos = new THREE.Vector3(0, 1.2, 0);
    this.castProgress = 0;
    this.castDuration = 0.5;

    // Bobber in water
    this.bobber = this.createBobber();
    this.scene.add(this.bobber);
    this.bobber.visible = false;

    // Fishing line
    this.lineGeo = new THREE.BufferGeometry();
    this.lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    this.fishingLine = new THREE.Line(this.lineGeo, this.lineMat);
    this.scene.add(this.fishingLine);
    this.fishingLine.visible = false;

    // Hooked fish reference
    this.hookedFish = null;
    this.biteTimer = 0;
    this.strikeWindowTimer = 0;

    // Reeling Tension Mini-game
    this.tension = 50; // 0 to 100
    this.catchProgress = 0; // 0 to 100
    this.isReelingInput = false;
    this.fishFightTimer = 0;
    this.dangerTimer = 0;
    this.looseTimer = 0;

    // Splash particle
    this.splashRing = this.createSplashRing();
    this.scene.add(this.splashRing);
    this.splashRing.visible = false;
  }

  createBobber() {
    const group = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.2),
      new THREE.MeshLambertMaterial({ color: 0xef4444 })
    );
    top.position.y = 0.06;

    const bot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.2),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    bot.position.y = -0.06;

    const stick = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.35, 0.04),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    stick.position.y = 0.15;

    group.add(top);
    group.add(bot);
    group.add(stick);
    return group;
  }

  createSplashRing() {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.35, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    return ring;
  }

  castTo(targetX, targetZ) {
    if (this.state !== 'IDLE') return;

    // Clamp target within water bounds (X: -8 to 8, Z: 2 to 12)
    const clampedX = Math.max(-8, Math.min(8, targetX));
    const clampedZ = Math.max(2.2, Math.min(12.5, targetZ));
    this.targetPos.set(clampedX, 0, clampedZ);

    this.state = 'CASTING';
    this.castProgress = 0;

    // Rod tip world position
    const rodTip = this.getRodTipPosition();
    this.castStartPos.copy(rodTip);

    this.bobber.position.copy(this.castStartPos);
    this.bobber.visible = true;
    this.fishingLine.visible = true;

    this.game.audio.playCast();
    this.game.ui.setFishingActionState('casting');

    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (_) {}
    }
  }

  castDefault() {
    // Cast forward into hot spot with some slight randomness
    const rx = (Math.random() - 0.5) * 6;
    const rz = 4.5 + Math.random() * 5.5;
    this.castTo(rx, rz);
  }

  update(dt) {
    if (this.state === 'IDLE') return;

    // Update fishing line from rod tip to bobber
    this.updateLine();

    if (this.state === 'CASTING') {
      this.castProgress += dt / this.castDuration;
      const p = Math.min(1, this.castProgress);

      // Arc trajectory
      this.bobber.position.x = THREE.MathUtils.lerp(this.castStartPos.x, this.targetPos.x, p);
      this.bobber.position.z = THREE.MathUtils.lerp(this.castStartPos.z, this.targetPos.z, p);
      // Parabolic jump arc for bobber
      this.bobber.position.y = THREE.MathUtils.lerp(this.castStartPos.y, 0, p) + 4 * 2.0 * p * (1 - p);

      if (this.castProgress >= 1) {
        this.onBobberLanded();
      }
    } else if (this.state === 'WAITING_BITE') {
      // Floating bobber motion
      this.bobber.position.y = Math.sin(performance.now() * 0.007) * 0.04;

      this.biteTimer -= dt;
      if (this.biteTimer <= 0) {
        this.triggerStrike();
      }
    } else if (this.state === 'STRIKE_WINDOW') {
      // Bobber dips vigorously!
      this.bobber.position.y = -0.12 + Math.sin(performance.now() * 0.03) * 0.08;

      this.strikeWindowTimer -= dt;
      this.game.ui.updateStrikeGauge(this.strikeWindowTimer / 1.8);

      if (this.strikeWindowTimer <= 0) {
        // Missed strike!
        this.game.ui.showTemporaryAlert('물고기가 미끼만 물고 도망쳤습니다! 💨');
        this.reset();
      }
    } else if (this.state === 'REELING') {
      this.updateReelingFight(dt);
    }
  }

  onBobberLanded() {
    this.state = 'WAITING_BITE';
    this.bobber.position.y = 0;
    this.game.audio.playSplash();

    // Trigger splash ring
    this.splashRing.position.set(this.bobber.position.x, 0.02, this.bobber.position.z);
    this.splashRing.scale.set(1, 1, 1);
    this.splashRing.visible = true;
    setTimeout(() => { this.splashRing.visible = false; }, 400);

    // Weather bonus: Rain increases bite speed
    const weather = this.game.weatherSystem.currentWeather;
    const biteDelay = weather === 'rain' ? 1.0 + Math.random() * 1.5 : 1.8 + Math.random() * 2.5;
    this.biteTimer = biteDelay;

    // Pick closest fish or random fish from current spot
    const spot = this.game.currentSpot;
    this.hookedFish = spot.fishList[0]?.species || spot.biome.fishSpecies[0];

    this.game.ui.setFishingActionState('waiting');
  }

  triggerStrike() {
    this.state = 'STRIKE_WINDOW';
    this.strikeWindowTimer = 1.8; // 1.8 seconds to hook!
    this.game.audio.playBite();

    if (navigator.vibrate) {
      try { navigator.vibrate([50, 80, 50]); } catch (_) {}
    }

    this.game.ui.showStrikeAlert();
    this.game.ui.setFishingActionState('strike');
  }

  hook() {
    if (this.state !== 'STRIKE_WINDOW') return;

    // Successfully hooked! Enter Reeling Mini-Game!
    this.state = 'REELING';
    this.tension = 50;
    this.catchProgress = 15;
    this.dangerTimer = 0;
    this.looseTimer = 0;

    this.game.audio.playBite();
    this.game.ui.hideStrikeAlert();
    this.game.ui.showReelModal(true);
    this.game.ui.setFishingActionState('reeling');
  }

  setReeling(isReeling) {
    this.isReelingInput = isReeling;
  }

  updateReelingFight(dt) {
    // Fish struggles & pulls line
    this.fishFightTimer += dt;
    const fishStruggle = Math.sin(this.fishFightTimer * 5) * 18 + (Math.random() - 0.5) * 15;

    if (this.isReelingInput) {
      this.tension += (65 + fishStruggle) * dt;
    } else {
      this.tension -= (50 - fishStruggle * 0.5) * dt;
    }

    this.tension = Math.max(0, Math.min(100, this.tension));

    // Sweet Spot is between 35% and 75%
    const inSweetSpot = this.tension >= 35 && this.tension <= 75;

    if (inSweetSpot) {
      this.catchProgress += 28 * dt;
      this.dangerTimer = Math.max(0, this.dangerTimer - dt * 2);
      this.looseTimer = Math.max(0, this.looseTimer - dt * 2);
    } else if (this.tension > 85) {
      // Tension too high: danger of snapping
      this.dangerTimer += dt;
      if (this.dangerTimer > 1.2) {
        this.game.ui.showTemporaryAlert('팽팽하던 낚싯줄이 끊어졌습니다! 💥');
        this.reset();
        return;
      }
    } else if (this.tension < 15) {
      // Line too slack: fish slips away
      this.looseTimer += dt;
      if (this.looseTimer > 1.5) {
        this.game.ui.showTemporaryAlert('줄이 헐거워져 물고기가 바늘을 털고 도망쳤습니다! 💨');
        this.reset();
        return;
      }
    }

    this.catchProgress = Math.max(0, Math.min(100, this.catchProgress));

    // Update UI tension and progress
    this.game.ui.updateTensionGauge(this.tension, this.catchProgress, inSweetSpot);

    // Bobber and fish splash struggle
    this.bobber.position.x += (Math.random() - 0.5) * 0.08;
    this.bobber.position.z += (Math.random() - 0.5) * 0.08;

    // Check Victory
    if (this.catchProgress >= 100) {
      this.onFishCaughtSuccess();
    }
  }

  onFishCaughtSuccess() {
    this.state = 'CAUGHT';
    const fish = this.hookedFish;

    // Calculate length in cm
    const [minCm, maxCm] = fish.sizeRange || [20, 45];
    const size = parseFloat((minCm + Math.random() * (maxCm - minCm)).toFixed(1));
    const weightKg = parseFloat((size * size * 0.00045 + Math.random() * 0.2).toFixed(2));

    this.game.audio.playCatch(fish.rarity);
    this.game.onFishCaught(fish, size, weightKg);

    this.reset();
  }

  reset() {
    this.state = 'IDLE';
    this.bobber.visible = false;
    this.fishingLine.visible = false;
    this.hookedFish = null;
    this.isReelingInput = false;

    this.game.ui.hideStrikeAlert();
    this.game.ui.showReelModal(false);
    this.game.ui.setFishingActionState('idle');
  }

  getRodTipPosition() {
    const tip = new THREE.Vector3();
    const fisherman = this.game.fisherman;
    if (fisherman && fisherman.userData.bobberPivot) {
      fisherman.userData.bobberPivot.getWorldPosition(tip);
    } else {
      tip.set(0.3, 1.4, -0.6);
    }
    return tip;
  }

  updateLine() {
    if (!this.fishingLine.visible) return;
    const rodTip = this.getRodTipPosition();
    const bobberPos = this.bobber.position;
    this.lineGeo.setFromPoints([rodTip, bobberPos]);
  }
}
