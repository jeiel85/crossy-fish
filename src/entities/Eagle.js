import * as THREE from 'three';
import { createEagleModel } from './VoxelModels.js';

export class Eagle {
  constructor(game) {
    this.game = game;
    this.mesh = createEagleModel();
    this.game.scene.add(this.mesh);
    this.mesh.visible = false;

    // Shadow on ground
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.game.scene.add(this.shadow);
    this.shadow.visible = false;

    this.isAttacking = false;
    this.attackProgress = 0;
    this.attackDuration = 0.8;
    this.targetPos = new THREE.Vector3();
    this.startPos = new THREE.Vector3();
    this.endPos = new THREE.Vector3();
  }

  trigger(playerPos) {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.attackProgress = 0;

    this.targetPos.copy(playerPos);
    // Eagle approaches from high behind (+Z) and swoops through to (-Z)
    this.startPos.set(playerPos.x, 14, playerPos.z + 18);
    this.endPos.set(playerPos.x, 14, playerPos.z - 20);

    this.mesh.position.copy(this.startPos);
    this.mesh.lookAt(this.targetPos);
    this.mesh.visible = true;

    this.shadow.position.set(playerPos.x, 0.02, playerPos.z);
    this.shadow.visible = true;
  }

  update(dt, player) {
    if (!this.isAttacking) return;

    this.attackProgress += dt / this.attackDuration;
    const p = this.attackProgress;

    // Wing flap animation
    const { leftWing, rightWing } = this.mesh.userData;
    if (leftWing && rightWing) {
      const flap = Math.sin(performance.now() * 0.03) * 0.5;
      leftWing.rotation.z = flap;
      rightWing.rotation.z = -flap;
    }

    if (p < 0.5) {
      // Swooping down to target
      const subP = p / 0.5;
      this.mesh.position.lerpVectors(this.startPos, this.targetPos, subP);
      this.shadow.scale.set(1 + subP * 0.5, 1 + subP * 0.5, 1);
    } else if (p < 1.0) {
      // Swooping up and carrying player
      if (player.state !== 'DEAD') {
        player.die('독수리에게 낚아채였습니다! 🦅');
      }
      const subP = (p - 0.5) / 0.5;
      this.mesh.position.lerpVectors(this.targetPos, this.endPos, subP);

      // Carry player with eagle
      player.mesh.position.copy(this.mesh.position).add(new THREE.Vector3(0, -0.8, 0));
      this.shadow.position.set(this.mesh.position.x, 0.02, this.mesh.position.z);
    } else {
      // Finished swoop
      this.isAttacking = false;
      this.mesh.visible = false;
      this.shadow.visible = false;
    }
  }

  reset() {
    this.isAttacking = false;
    this.mesh.visible = false;
    this.shadow.visible = false;
  }
}
