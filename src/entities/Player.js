import * as THREE from 'three';
import { createFishermanModel } from './VoxelModels.js';

export class Player {
  constructor(game) {
    this.game = game;
    this.mesh = createFishermanModel();
    this.game.scene.add(this.mesh);

    // Grid Coordinates on Fishing Spot
    this.gridX = 0;
    this.gridZ = -1; // Center of dock

    // Facing Direction: 'UP', 'DOWN', 'LEFT', 'RIGHT'
    this.facingDir = 'UP';
    this.facingAngle = 0;

    // Hop Animation
    this.isHopping = false;
    this.hopProgress = 0;
    this.hopDuration = 0.18;
    this.jumpHeight = 0.45;
    this.startPos = new THREE.Vector3(0, 0.15, -1);
    this.targetPos = new THREE.Vector3(0, 0.15, -1);

    // In-place turn pivot animation
    this.isTurning = false;
    this.turnProgress = 0;
    this.turnDuration = 0.12;
    this.startAngle = 0;
    this.targetAngle = 0;

    this.reset();
  }

  reset() {
    this.gridX = 0;
    this.gridZ = -1;
    this.facingDir = 'UP';
    this.facingAngle = 0;
    this.mesh.position.set(0, 0.15, -1);
    this.mesh.rotation.y = 0;
    this.mesh.scale.set(1, 1, 1);
    this.isHopping = false;
    this.isTurning = false;
  }

  // Handle directional input (Up, Down, Left, Right)
  // Implements the authentic Crossy Road mechanic:
  // "방향을 반대로 하거나 꺾으면 처음에는 한칸을 진행하지 않고 방향만 전환"
  handleDirection(dir) {
    if (this.isHopping || this.isTurning) return;
    const mechanic = this.game.fishingMechanic;
    if (mechanic && (mechanic.state === 'REELING' || mechanic.state === 'STRIKE_WINDOW')) {
      return; // In active fish fight
    }

    // Cancel casting if player moves
    if (mechanic && mechanic.state !== 'IDLE') {
      mechanic.reset();
    }

    // 1. If changing direction: TURN IN PLACE ONLY!
    if (this.facingDir !== dir) {
      this.turnTo(dir);
      return;
    }

    // 2. If already facing this direction: HOP 1 TILE FORWARD!
    let dirX = 0;
    let dirZ = 0;
    if (dir === 'UP') dirZ = 1;
    else if (dir === 'DOWN') dirZ = -1;
    else if (dir === 'LEFT') dirX = -1;
    else if (dir === 'RIGHT') dirX = 1;

    this.hop(dirX, dirZ);
  }

  turnTo(newDir) {
    this.facingDir = newDir;
    this.startAngle = this.mesh.rotation.y;

    // Angle mapping for screen-accurate direction:
    // UP (Forward) = 0
    // RIGHT = Math.PI / 2
    // DOWN (Backward) = Math.PI
    // LEFT = -Math.PI / 2
    if (newDir === 'UP') this.targetAngle = 0;
    else if (newDir === 'RIGHT') this.targetAngle = Math.PI / 2;
    else if (newDir === 'DOWN') this.targetAngle = Math.PI;
    else if (newDir === 'LEFT') this.targetAngle = -Math.PI / 2;

    // Ensure shortest angular interpolation
    let diff = this.targetAngle - this.startAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.targetAngle = this.startAngle + diff;

    this.isTurning = true;
    this.turnProgress = 0;

    // Cute tiny pivot jump & sound
    this.game.audio.playHop();

    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
  }

  hop(dirX, dirZ) {
    const nextX = this.gridX + dirX;
    const nextZ = this.gridZ + dirZ;

    // Check walkable bounds on dock / shore
    // Walkable zone on dock: X: -3 to 3, Z: -5 to 1
    // Walkable shore bank: X: -9 to 9, Z: -5 to -2
    const onDock = Math.abs(nextX) <= 3 && nextZ >= -5 && nextZ <= 1;
    const onBank = Math.abs(nextX) <= 9 && nextZ >= -6 && nextZ <= -2;

    // Floating platforms in water (Z: 2 to 8)
    const onLilyPad = (nextX === -4 && nextZ === 3) || (nextX === 4 && nextZ === 4);

    if (!onDock && !onBank && !onLilyPad) {
      // Trying to step into deep water: Prevent falling or auto-cast!
      this.game.ui.showTemporaryAlert('앞은 물가입니다! [CAST]를 눌러 낚시를 던져보세요! 🎣');
      return;
    }

    this.gridX = nextX;
    this.gridZ = nextZ;

    this.startPos.copy(this.mesh.position);
    this.targetPos.set(this.gridX, 0.15, this.gridZ);
    this.hopProgress = 0;
    this.isHopping = true;

    this.game.audio.playHop();

    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch (_) {}
    }
  }

  update(dt) {
    // 1. Turn in place animation
    if (this.isTurning) {
      this.turnProgress += dt / this.turnDuration;
      if (this.turnProgress >= 1) {
        this.turnProgress = 1;
        this.isTurning = false;
        this.mesh.rotation.y = this.targetAngle % (Math.PI * 2);
        this.mesh.position.y = 0.15;
      } else {
        const p = this.turnProgress;
        this.mesh.rotation.y = THREE.MathUtils.lerp(this.startAngle, this.targetAngle, p);
        // Small in-place pivot bounce
        this.mesh.position.y = 0.15 + Math.sin(p * Math.PI) * 0.15;
      }
      return;
    }

    // 2. Hop forward animation
    if (this.isHopping) {
      this.hopProgress += dt / this.hopDuration;
      if (this.hopProgress >= 1) {
        this.hopProgress = 1;
        this.isHopping = false;
        this.mesh.position.copy(this.targetPos);
        this.mesh.scale.set(1, 1, 1);
      } else {
        const p = this.hopProgress;
        const currentY = 0.15 + 4 * this.jumpHeight * p * (1 - p);
        this.mesh.position.x = THREE.MathUtils.lerp(this.startPos.x, this.targetPos.x, p);
        this.mesh.position.z = THREE.MathUtils.lerp(this.startPos.z, this.targetPos.z, p);
        this.mesh.position.y = currentY;

        // Squash & Stretch
        const stretch = 1 + 0.25 * Math.sin(p * Math.PI);
        const squash = 1 / Math.sqrt(stretch);
        this.mesh.scale.set(squash, stretch, squash);
      }
    }
  }

  // Get position where rod casts based on current facing direction
  getForwardWaterTarget() {
    let castX = this.mesh.position.x;
    let castZ = this.mesh.position.z;

    if (this.facingDir === 'UP') {
      castZ += 4.5;
    } else if (this.facingDir === 'DOWN') {
      castZ -= 2.0;
    } else if (this.facingDir === 'LEFT') {
      castX -= 4.0;
      castZ += 1.5;
    } else if (this.facingDir === 'RIGHT') {
      castX += 4.0;
      castZ += 1.5;
    }

    return { x: castX, z: Math.max(2.2, castZ) };
  }
}
