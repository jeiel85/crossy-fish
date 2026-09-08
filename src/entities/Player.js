import * as THREE from 'three';
import { createFishermanModel } from './VoxelModels.js';

export class Player {
  constructor(game) {
    this.game = game;
    this.mesh = createFishermanModel();
    
    // Grid Coordinates
    this.gridX = 0;
    this.gridZ = 0;
    
    // Hop Physics
    this.isHopping = false;
    this.hopProgress = 0;
    this.hopDuration = 0.18; // Fast, snappy Crossy Road hop
    this.jumpHeight = 0.55;
    
    this.startPos = new THREE.Vector3(0, 0, 0);
    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.facingAngle = 0; // 0 = forward (+Z)
    
    // Platform riding
    this.currentPlatform = null;
    
    // Fishing State
    this.state = 'IDLE'; // IDLE, HOPPING, CASTING, BITING, REELING, DEAD
    this.castTimer = 0;
    this.biteTimer = 0;
    this.hookedFish = null;
    this.targetWaterLane = null;
    
    // Fishing Bobber 3D object in water
    this.waterBobber = this.createWaterBobber();
    this.game.scene.add(this.waterBobber);
    this.waterBobber.visible = false;
    
    // Fishing Line
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    this.fishingLine = new THREE.Line(this.lineGeometry, this.lineMaterial);
    this.game.scene.add(this.fishingLine);
    this.fishingLine.visible = false;

    this.init();
  }

  createWaterBobber() {
    const group = new THREE.Group();
    const matTop = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const matBot = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), matTop);
    top.position.y = 0.05;
    const bot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), matBot);
    bot.position.y = -0.05;
    
    group.add(top);
    group.add(bot);
    return group;
  }

  init() {
    this.reset();
  }

  reset() {
    this.gridX = 0;
    this.gridZ = 0;
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.y = 0;
    this.mesh.scale.set(1, 1, 1);
    this.isHopping = false;
    this.state = 'IDLE';
    this.currentPlatform = null;
    this.hookedFish = null;
    this.waterBobber.visible = false;
    this.fishingLine.visible = false;
  }

  hop(dirX, dirZ) {
    if (this.isHopping || this.state === 'DEAD') return false;

    // Interrupt fishing if hopping
    if (this.state === 'CASTING' || this.state === 'BITING' || this.state === 'REELING') {
      this.cancelFishing();
    }

    const nextX = this.gridX + dirX;
    const nextZ = this.gridZ + dirZ;

    // Check lateral boundary (keep player within -8 to +8)
    if (Math.abs(nextX) > 8) return false;
    // Don't allow going backwards beyond -2 of highest progress
    if (nextZ < this.game.maxZ - 4) return false;

    // Check tree or rock obstacle at target grid
    if (this.game.worldManager.hasStaticObstacle(nextX, nextZ)) {
      return false;
    }

    this.gridX = nextX;
    this.gridZ = nextZ;

    this.startPos.copy(this.mesh.position);
    this.targetPos.set(this.gridX, 0, this.gridZ);
    this.hopProgress = 0;
    this.isHopping = true;
    this.currentPlatform = null;

    // Calculate facing angle
    if (dirZ > 0) this.facingAngle = 0;
    else if (dirZ < 0) this.facingAngle = Math.PI;
    else if (dirX > 0) this.facingAngle = Math.PI / 2;
    else if (dirX < 0) this.facingAngle = -Math.PI / 2;

    this.mesh.rotation.y = this.facingAngle;
    this.game.audio.playHop();

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch (_) {}
    }

    return true;
  }

  update(dt) {
    if (this.state === 'DEAD') return;

    // 1. Hop Animation
    if (this.isHopping) {
      this.hopProgress += dt / this.hopDuration;

      if (this.hopProgress >= 1) {
        this.hopProgress = 1;
        this.isHopping = false;
        this.mesh.position.copy(this.targetPos);
        this.mesh.scale.set(1, 1, 1);

        // Landed! Check ground status
        this.onLand();
      } else {
        const p = this.hopProgress;
        // Parabolic arc for Y
        const currentY = 4 * this.jumpHeight * p * (1 - p);
        this.mesh.position.x = THREE.MathUtils.lerp(this.startPos.x, this.targetPos.x, p);
        this.mesh.position.z = THREE.MathUtils.lerp(this.startPos.z, this.targetPos.z, p);
        this.mesh.position.y = currentY;

        // Squash & Stretch
        const stretch = 1 + 0.3 * Math.sin(p * Math.PI);
        const squash = 1 / Math.sqrt(stretch);
        this.mesh.scale.set(squash, stretch, squash);
      }
    } else if (this.currentPlatform) {
      // 2. Ride moving platform (log or lily pad)
      this.mesh.position.x += this.currentPlatform.speed * dt;
      this.gridX = Math.round(this.mesh.position.x);

      // Check if carried off screen bounds
      if (Math.abs(this.mesh.position.x) > 9.5) {
        this.die('물살에 휩쓸려 강 밖으로 밀려났습니다! 🌊');
      }
    }

    // 3. Update Fishing Cycle
    this.updateFishing(dt);

    // 4. Arm & Bobber subtle breathing animation when idle
    if (!this.isHopping && this.state === 'IDLE') {
      const time = performance.now() * 0.003;
      const { rodPivot } = this.mesh.userData;
      if (rodPivot) {
        rodPivot.rotation.x = Math.sin(time) * 0.05;
      }
    }
  }

  onLand() {
    this.game.onPlayerAdvanced(this.gridZ);

    // Check lane type at landed tile
    const lane = this.game.worldManager.getLane(this.gridZ);
    if (!lane) return;

    if (lane.type === 'water') {
      // Must be on a platform (log or lily pad)
      const platform = lane.getPlatformAt(this.mesh.position.x);
      if (platform) {
        this.currentPlatform = platform;
        // Adjust player Y to sit neatly on log
        this.mesh.position.y = platform.height || 0.15;
      } else {
        // Splashed into water!
        this.game.audio.playSplash();
        this.die(lane.biome.id === 'magma_inferno' 
          ? '뜨거운 용암에 빠져버렸습니다! 🔥' 
          : '시원한(?) 강물에 풍덩 빠졌습니다! 💦');
      }
    } else {
      this.currentPlatform = null;
      this.mesh.position.y = 0;
    }
  }

  // Cast fishing rod
  startFishing() {
    if (this.isHopping || this.state === 'DEAD') return;
    if (this.state === 'BITING') {
      // Reel in!
      this.reelIn();
      return;
    }
    if (this.state === 'CASTING') {
      this.cancelFishing();
      return;
    }

    // Check if adjacent to or in water lane
    const aheadLane = this.game.worldManager.getLane(this.gridZ + 1);
    const currLane = this.game.worldManager.getLane(this.gridZ);
    const behindLane = this.game.worldManager.getLane(this.gridZ - 1);

    let targetZ = null;
    let targetLane = null;

    if (aheadLane && aheadLane.type === 'water') {
      targetZ = this.gridZ + 1;
      targetLane = aheadLane;
    } else if (currLane && currLane.type === 'water') {
      targetZ = this.gridZ;
      targetLane = currLane;
    } else if (behindLane && behindLane.type === 'water') {
      targetZ = this.gridZ - 1;
      targetLane = behindLane;
    }

    if (!targetLane) {
      this.game.ui.showTemporaryAlert('주변에 낚시할 수 있는 물가가 없습니다! 💧');
      return;
    }

    this.state = 'CASTING';
    this.targetWaterLane = targetLane;
    this.game.audio.playCast();

    // Bobber landing position in water
    const bobberX = this.mesh.position.x + (Math.random() * 0.4 - 0.2);
    const bobberZ = targetZ;
    this.waterBobber.position.set(bobberX, 0.05, bobberZ);
    this.waterBobber.visible = true;
    this.fishingLine.visible = true;

    this.castTimer = 0;
    // Bite occurs between 1.2 to 2.8 seconds
    this.biteTimer = 1.2 + Math.random() * 1.6;

    this.game.ui.setActionButtonState('casting');
  }

  updateFishing(dt) {
    if (this.state === 'CASTING') {
      this.castTimer += dt;

      // Bobber floating oscillation
      this.waterBobber.position.y = 0.05 + Math.sin(performance.now() * 0.008) * 0.04;
      this.updateLine();

      if (this.castTimer >= this.biteTimer) {
        // Bite triggered!
        this.triggerBite();
      }
    } else if (this.state === 'BITING') {
      // Bobber dips vigorously
      this.waterBobber.position.y = -0.08 + Math.sin(performance.now() * 0.03) * 0.06;
      this.updateLine();

      this.biteWindowTimer -= dt;
      if (this.biteWindowTimer <= 0) {
        // Fish got away!
        this.game.ui.showTemporaryAlert('물고기가 도망쳤습니다! 💨');
        this.cancelFishing();
      }
    }
  }

  triggerBite() {
    this.state = 'BITING';
    this.biteWindowTimer = 1.6; // 1.6s reaction window
    this.hookedFish = this.targetWaterLane.getRandomFish();
    this.game.audio.playBite();

    if (navigator.vibrate) {
      try { navigator.vibrate([40, 60, 40]); } catch (_) {}
    }

    this.game.ui.showBiteAlert(this.biteWindowTimer);
    this.game.ui.setActionButtonState('biting');
  }

  reelIn() {
    if (this.state !== 'BITING' || !this.hookedFish) return;

    this.state = 'REELING';
    const fish = this.hookedFish;

    // Score & Reward
    this.game.onFishCaught(fish);
    this.game.audio.playCatch(fish.rarity);

    // Cancel fishing visuals
    this.waterBobber.visible = false;
    this.fishingLine.visible = false;
    this.state = 'IDLE';
    this.game.ui.setActionButtonState('idle');
    this.game.ui.hideBiteAlert();
  }

  cancelFishing() {
    this.state = 'IDLE';
    this.waterBobber.visible = false;
    this.fishingLine.visible = false;
    this.hookedFish = null;
    this.game.ui.setActionButtonState('idle');
    this.game.ui.hideBiteAlert();
  }

  updateLine() {
    if (!this.fishingLine.visible) return;

    // Rod tip position
    const rodTip = new THREE.Vector3();
    const { bobberPivot } = this.mesh.userData;
    if (bobberPivot) {
      bobberPivot.getWorldPosition(rodTip);
    } else {
      rodTip.copy(this.mesh.position).add(new THREE.Vector3(0.2, 1.2, 0.2));
    }

    const bobberPos = this.waterBobber.position;
    const points = [rodTip, bobberPos];
    this.lineGeometry.setFromPoints(points);
  }

  die(reason) {
    if (this.state === 'DEAD') return;
    this.state = 'DEAD';
    this.cancelFishing();
    this.game.onGameOver(reason);

    // Death animation
    const isCrushed = reason.includes('보트') || reason.includes('부딪');
    if (isCrushed) {
      // Flatten
      this.mesh.scale.set(1.4, 0.1, 1.4);
    } else {
      // Sink
      this.mesh.position.y = -0.5;
    }
  }
}
