import * as THREE from 'three';
import { createFishModel } from './VoxelModels.js';

export class Fish {
  constructor(species, biome, scene) {
    this.species = species;
    this.biome = biome;
    this.scene = scene;

    this.mesh = createFishModel(species, biome);
    this.scene.add(this.mesh);

    // Initial random position in water area (X: -9 to 9, Z: 1 to 13)
    this.x = (Math.random() - 0.5) * 16;
    this.z = 2 + Math.random() * 10;
    this.y = -0.18 - Math.random() * 0.15;

    this.mesh.position.set(this.x, this.y, this.z);

    this.speed = 0.8 + Math.random() * 0.7;
    this.angle = Math.random() * Math.PI * 2;
    this.targetAngle = this.angle;

    this.targetPos = new THREE.Vector3(this.x, this.y, this.z);
    this.state = 'SWIMMING'; // 'SWIMMING', 'ATTRACTED', 'NIBBLING', 'HOOKED'

    this.nibbleTimer = 0;
    this.patrolTimer = 0;

    // Ripple effect on surface
    this.rippleMesh = this.createRipple();
    this.scene.add(this.rippleMesh);
    this.rippleMesh.position.set(this.x, 0.01, this.z);
    this.rippleTime = Math.random() * 2;
  }

  createRipple() {
    const geo = new THREE.RingGeometry(0.1, 0.22, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    return ring;
  }

  update(dt, bobberPos, isBobberInWater) {
    // Tail wagging animation
    const { tail } = this.mesh.userData;
    if (tail) {
      tail.rotation.y = Math.sin(performance.now() * 0.012 * (this.speed + 0.5)) * 0.45;
    }

    // Ripple animation
    this.rippleTime += dt * 1.5;
    const rippleScale = 1 + (this.rippleTime % 2.0) * 1.8;
    this.rippleMesh.scale.set(rippleScale, rippleScale, 1);
    this.rippleMesh.material.opacity = Math.max(0, 0.45 - (this.rippleTime % 2.0) * 0.22);
    this.rippleMesh.position.set(this.mesh.position.x, 0.01, this.mesh.position.z);

    if (this.state === 'HOOKED') {
      // Fighting hook! Dart back and forth
      const dartAngle = Math.sin(performance.now() * 0.01) * 1.2;
      this.mesh.rotation.y = dartAngle;
      return;
    }

    if (this.state === 'ATTRACTED' && isBobberInWater && bobberPos) {
      // Swim towards bobber!
      const dx = bobberPos.x - this.x;
      const dz = bobberPos.z - this.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.3) {
        this.targetAngle = Math.atan2(dx, dz);
        this.angle = THREE.MathUtils.lerp(this.angle, this.targetAngle, dt * 4);
        this.speed = 1.4; // Swim faster towards bait
      } else {
        // Reached bobber!
        this.state = 'NIBBLING';
        this.nibbleTimer = 0;
      }
    } else if (this.state === 'NIBBLING') {
      if (!isBobberInWater || !bobberPos) {
        this.state = 'SWIMMING';
        return;
      }
      this.nibbleTimer += dt;
      // Nudge around bobber
      this.x = bobberPos.x + Math.sin(performance.now() * 0.008) * 0.15;
      this.z = bobberPos.z + Math.cos(performance.now() * 0.008) * 0.15;
    } else {
      // Normal Swimming Patrol
      this.patrolTimer -= dt;
      if (this.patrolTimer <= 0) {
        this.patrolTimer = 2 + Math.random() * 3;
        this.targetAngle += (Math.random() - 0.5) * 1.8;
      }

      // Check boundary bounce
      if (this.x < -8.5) this.targetAngle = Math.PI / 2;
      if (this.x > 8.5) this.targetAngle = -Math.PI / 2;
      if (this.z < 1.8) this.targetAngle = 0;
      if (this.z > 13.5) this.targetAngle = Math.PI;

      this.angle = THREE.MathUtils.lerp(this.angle, this.targetAngle, dt * 2.5);
      this.speed = 0.7 + Math.random() * 0.5;

      // Check if bobber is close enough to be attracted
      if (isBobberInWater && bobberPos) {
        const dx = bobberPos.x - this.x;
        const dz = bobberPos.z - this.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 4.0) {
          this.state = 'ATTRACTED';
        }
      }
    }

    // Move forward
    if (this.state !== 'NIBBLING' && this.state !== 'HOOKED') {
      this.x += Math.sin(this.angle) * this.speed * dt;
      this.z += Math.cos(this.angle) * this.speed * dt;
    }

    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.y = this.angle;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.scene.remove(this.rippleMesh);
    if (this.rippleMesh.geometry) this.rippleMesh.geometry.dispose();
    if (this.rippleMesh.material) this.rippleMesh.material.dispose();
  }
}
