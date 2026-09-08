import * as THREE from 'three';
import { createTreeModel, createLilyPadModel } from '../entities/VoxelModels.js';
import { Fish } from '../entities/Fish.js';
import { getRandomFishForBiome } from './Biomes.js';

export class FishingSpot {
  constructor(biome, game) {
    this.biome = biome;
    this.game = game;
    this.scene = game.scene;

    this.group = new THREE.Group();
    this.fishList = [];

    // Invisible water interaction plane for mouse/touch raycasting
    const rayGeo = new THREE.PlaneGeometry(30, 20);
    const rayMat = new THREE.MeshBasicMaterial({ visible: false });
    this.waterRaycastPlane = new THREE.Mesh(rayGeo, rayMat);
    this.waterRaycastPlane.rotation.x = -Math.PI / 2;
    this.waterRaycastPlane.position.set(0, 0, 7.5);
    this.group.add(this.waterRaycastPlane);

    this.build();
    this.scene.add(this.group);
  }

  build() {
    this.buildGroundAndPier();
    this.buildWaterBody();
    this.buildDecorations();
    this.buildHorizonVista();
    this.spawnFish(6);
  }

  buildGroundAndPier() {
    const { dock, ground, groundDark } = this.biome.colors;

    // 1. Main Shore / Bank (Z: -7 to -1.5)
    const bankGeo = new THREE.BoxGeometry(26, 1.2, 7);
    const bankMat = new THREE.MeshLambertMaterial({ color: ground });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(0, -0.6, -4.5);
    bank.receiveShadow = true;
    this.group.add(bank);

    // Darker soil/rock sublayer
    const subGeo = new THREE.BoxGeometry(26.2, 0.4, 7.2);
    const subMat = new THREE.MeshLambertMaterial({ color: groundDark });
    const sub = new THREE.Mesh(subGeo, subMat);
    sub.position.set(0, -1.2, -4.5);
    this.group.add(sub);

    // 2. Fishing Wooden Pier / Dock extending over the water (Z: -3.5 to 0.5, X: -2.2 to 2.2)
    const pierGeo = new THREE.BoxGeometry(5.0, 0.25, 4.5);
    const pierMat = new THREE.MeshLambertMaterial({ color: dock });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(0, 0.05, -1.2);
    pier.castShadow = true;
    pier.receiveShadow = true;
    this.group.add(pier);

    // Pier wooden support pillars in water
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
    const pillarPositions = [
      [-2.2, -0.6, 0.6],
      [2.2, -0.6, 0.6],
      [-2.2, -0.6, -1.5],
      [2.2, -0.6, -1.5]
    ];
    pillarPositions.forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), pillarMat);
      pillar.position.set(px, py, pz);
      pillar.castShadow = true;
      this.group.add(pillar);
    });

    // Pier Planks Lines
    for (let pz = -3.2; pz <= 0.8; pz += 0.45) {
      const plankSeam = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.02, 0.04),
        new THREE.MeshLambertMaterial({ color: 0x1c1917 })
      );
      plankSeam.position.set(0, 0.18, pz);
      this.group.add(plankSeam);
    }

    // Pier Railings on left & right
    const railMat = new THREE.MeshLambertMaterial({ color: dock });
    [-2.3, 2.3].forEach(rx => {
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.8), railMat);
      railTop.position.set(rx, 0.6, -1.5);
      this.group.add(railTop);

      [-3.0, -1.5, 0.0].forEach(rz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), railMat);
        post.position.set(rx, 0.35, rz);
        this.group.add(post);
      });
    });

    // Fishing Props: Stool & Bucket
    const bucketGeo = new THREE.BoxGeometry(0.4, 0.45, 0.4);
    const bucketMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(-1.4, 0.35, -0.8);
    bucket.castShadow = true;
    this.group.add(bucket);

    const stoolGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);
    const stoolMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const stool = new THREE.Mesh(stoolGeo, stoolMat);
    stool.position.set(1.4, 0.28, -1.8);
    stool.castShadow = true;
    this.group.add(stool);
  }

  buildWaterBody() {
    const { water, waterDeep, waterFoam } = this.biome.colors;

    // Water Surface (Z: 0 to 16, X: -14 to 14)
    const waterGeo = new THREE.BoxGeometry(28, 0.6, 16);
    const waterMat = new THREE.MeshLambertMaterial({
      color: water,
      transparent: true,
      opacity: 0.86
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(0, -0.3, 8.0);
    this.waterMesh.receiveShadow = true;
    this.group.add(this.waterMesh);

    // Deep water bed
    const bedGeo = new THREE.BoxGeometry(28, 0.4, 16);
    const bedMat = new THREE.MeshLambertMaterial({ color: waterDeep });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, -0.8, 8.0);
    this.group.add(bed);

    // Gentle shoreline foam strip along bank
    const foamGeo = new THREE.BoxGeometry(26, 0.05, 0.35);
    const foamMat = new THREE.MeshBasicMaterial({ color: waterFoam, transparent: true, opacity: 0.6 });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(0, 0.02, 0.15);
    this.group.add(foam);
  }

  buildDecorations() {
    // Trees on left & right shores
    const treePositions = [
      [-6, 0, -4.5],
      [-9, 0, -3.5],
      [-7.5, 0, -6],
      [6, 0, -4.5],
      [9, 0, -3.5],
      [7.5, 0, -6]
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      const tree = createTreeModel(this.biome);
      tree.position.set(tx, ty, tz);
      const scale = 0.9 + Math.random() * 0.35;
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.group.add(tree);
    });

    // Floating Lily Pads or Coral in water
    if (this.biome.id === 'emerald_creek' || this.biome.id === 'tropical_reef') {
      const padPositions = [
        [-4.5, 0.01, 3.5],
        [-6.0, 0.01, 7.0],
        [4.8, 0.01, 4.2],
        [6.5, 0.01, 8.5]
      ];
      padPositions.forEach(([px, py, pz]) => {
        const pad = createLilyPadModel();
        pad.position.set(px, py, pz);
        this.group.add(pad);
      });
    }

    // Shoreline Rocks
    const rockMat = new THREE.MeshLambertMaterial({ color: this.biome.colors.rock });
    [-4.0, 4.0, -8.0, 8.0].forEach(rx => {
      const rock = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.8), rockMat);
      rock.position.set(rx, 0.2, -0.3);
      rock.rotation.y = Math.random() * Math.PI;
      rock.castShadow = true;
      this.group.add(rock);
    });
  }

  buildHorizonVista() {
    const { water, ground, groundDark } = this.biome.colors;

    // 1. Extended deep background water plane (Z: 15 to 55, X: -60 to 60)
    const extWaterGeo = new THREE.PlaneGeometry(130, 44);
    const extWaterMat = new THREE.MeshLambertMaterial({
      color: water,
      transparent: true,
      opacity: 0.78
    });
    const extWater = new THREE.Mesh(extWaterGeo, extWaterMat);
    extWater.rotation.x = -Math.PI / 2;
    extWater.position.set(0, -0.05, 36);
    this.group.add(extWater);

    // 2. Distant Low-Profile Voxel Mountain Ridges on the far horizon (Z: 48 to 60)
    const baseMat = new THREE.MeshLambertMaterial({ color: groundDark });
    const peakColor = this.biome.id === 'frozen_fjord' ? 0xffffff : ground;
    const topMat = new THREE.MeshLambertMaterial({ color: peakColor });

    const mountainPeaks = [
      { x: -45, z: 54, w: 24, h: 5.5, d: 14 },
      { x: -26, z: 56, w: 26, h: 7.0, d: 16 },
      { x: -8,  z: 52, w: 22, h: 5.0, d: 14 },
      { x: 10,  z: 55, w: 24, h: 6.5, d: 15 },
      { x: 28,  z: 53, w: 22, h: 5.2, d: 14 },
      { x: 46,  z: 56, w: 26, h: 6.0, d: 16 }
    ];

    mountainPeaks.forEach(p => {
      // Lower tiered mountain block
      const bGeo = new THREE.BoxGeometry(p.w, p.h, p.d);
      const bMesh = new THREE.Mesh(bGeo, baseMat);
      bMesh.position.set(p.x, p.h / 2 - 1.2, p.z);
      this.group.add(bMesh);

      // Upper snow/rock tier peak
      const tGeo = new THREE.BoxGeometry(p.w * 0.55, p.h * 0.5, p.d * 0.55);
      const tMesh = new THREE.Mesh(tGeo, topMat);
      tMesh.position.set(p.x, p.h - 0.8, p.z);
      this.group.add(tMesh);
    });

    // 3. Far shore treeline silhouettes (Z: 44 to 48)
    const farTreePositions = [
      [-24, 0, 46],
      [-15, 0, 47],
      [-4,  0, 45],
      [6,   0, 46],
      [18,  0, 47],
      [27,  0, 45]
    ];
    farTreePositions.forEach(([fx, fy, fz]) => {
      const tree = createTreeModel(this.biome);
      tree.position.set(fx, fy, fz);
      tree.scale.set(0.9, 0.9, 0.9);
      this.group.add(tree);
    });
  }

  spawnFish(count = 6) {
    this.clearFish();
    for (let i = 0; i < count; i++) {
      const species = getRandomFishForBiome(this.biome);
      const fish = new Fish(species, this.biome, this.scene);
      this.fishList.push(fish);
    }
  }

  update(dt, bobberPos, isBobberInWater) {
    // Water surface gentle breath
    if (this.waterMesh) {
      this.waterMesh.position.y = -0.3 + Math.sin(performance.now() * 0.002) * 0.02;
    }

    // Update all swimming fish
    for (const fish of this.fishList) {
      fish.update(dt, bobberPos, isBobberInWater);
    }
  }

  clearFish() {
    for (const fish of this.fishList) {
      fish.destroy();
    }
    this.fishList = [];
  }

  destroy() {
    this.clearFish();
    this.scene.remove(this.group);
  }
}
