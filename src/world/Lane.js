import * as THREE from 'three';
import { createTreeModel, createLogModel, createLilyPadModel, createBoatModel, createFishModel } from '../entities/VoxelModels.js';
import { getRandomFishForBiome } from './Biomes.js';

export class Lane {
  constructor(z, type, biome, worldManager) {
    this.z = z;
    this.type = type; // 'grass', 'water', 'boat_road'
    this.biome = biome;
    this.worldManager = worldManager;
    this.scene = worldManager.game.scene;

    this.group = new THREE.Group();
    this.group.position.set(0, 0, z);

    // Static obstacles on grass (trees, rocks)
    this.staticObstacles = new Map(); // gridX -> Mesh

    // Moving obstacles (logs, boats)
    this.movingObstacles = [];
    this.speed = 0;
    this.direction = Math.random() > 0.5 ? 1 : -1;

    // Swimming fish in water lanes
    this.fishList = [];

    this.build();
  }

  build() {
    if (this.type === 'grass') {
      this.buildGrassLane();
    } else if (this.type === 'water') {
      this.buildWaterLane();
    } else if (this.type === 'boat_road') {
      this.buildBoatRoadLane();
    }
    this.scene.add(this.group);
  }

  buildGrassLane() {
    const geo = new THREE.BoxGeometry(32, 0.4, 1.0);
    const mat = new THREE.MeshLambertMaterial({
      color: this.z % 2 === 0 ? this.biome.colors.grass : this.biome.colors.grassDark
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Spawn decorative trees / obstacles
    // Don't block middle tile (x=0) on start lanes (z <= 3)
    for (let x = -8; x <= 8; x++) {
      if (this.z <= 2 && Math.abs(x) <= 1) continue;

      // Tree spawn probability
      const isSideBorder = Math.abs(x) >= 7;
      const randomSpawn = Math.random() < 0.22;

      if (isSideBorder || randomSpawn) {
        const tree = createTreeModel(this.biome);
        tree.position.set(x, 0, 0);
        // Random scale variation
        const scale = 0.85 + Math.random() * 0.3;
        tree.scale.set(scale, scale, scale);
        tree.rotation.y = (Math.floor(Math.random() * 4) * Math.PI) / 2;

        this.group.add(tree);
        this.staticObstacles.set(x, tree);
      }
    }
  }

  buildWaterLane() {
    // Water ground surface
    const geo = new THREE.BoxGeometry(32, 0.3, 1.0);
    const mat = new THREE.MeshLambertMaterial({
      color: this.biome.colors.water,
      transparent: true,
      opacity: 0.88
    });
    const water = new THREE.Mesh(geo, mat);
    water.position.y = -0.25;
    water.receiveShadow = true;
    this.group.add(water);

    // River speed
    this.speed = (1.5 + Math.random() * 1.5) * this.direction;

    // Decide platform type: wooden logs or lily pads
    const isLilyPadLane = Math.random() < 0.35 && this.biome.id !== 'magma_inferno';
    const count = 3 + Math.floor(Math.random() * 2);
    const spacing = 28 / count;

    for (let i = 0; i < count; i++) {
      const startX = -14 + i * spacing + (Math.random() * 2 - 1);
      const platform = isLilyPadLane 
        ? this.createLilyPadPlatform(startX) 
        : this.createLogPlatform(startX);
      this.movingObstacles.push(platform);
      this.group.add(platform.mesh);
    }

    // Add swimming fish shadow/model
    this.spawnSwimmingFish();
  }

  buildBoatRoadLane() {
    // Fast water rapids for speedboats / sharks
    const geo = new THREE.BoxGeometry(32, 0.3, 1.0);
    const mat = new THREE.MeshLambertMaterial({
      color: this.biome.colors.waterDeep,
      transparent: true,
      opacity: 0.95
    });
    const water = new THREE.Mesh(geo, mat);
    water.position.y = -0.25;
    water.receiveShadow = true;
    this.group.add(water);

    // High speed
    this.speed = (3.5 + Math.random() * 2.5) * this.direction;

    // Spawn 2 or 3 boats
    const boatCount = 2;
    const spacing = 16;
    for (let i = 0; i < boatCount; i++) {
      const startX = -12 + i * spacing + (Math.random() * 3 - 1.5);
      const boat = createBoatModel(this.biome);
      boat.position.set(startX, 0, 0);

      // Face direction of movement
      if (this.direction < 0) {
        boat.rotation.y = Math.PI;
      }

      this.movingObstacles.push({
        mesh: boat,
        width: 2.0,
        height: 0.5,
        isHazard: true,
        speed: this.speed
      });
      this.group.add(boat);
    }
  }

  createLogPlatform(x) {
    const length = 2.2 + Math.random() * 0.8;
    const mesh = createLogModel(length, this.biome);
    mesh.position.set(x, 0, 0);

    return {
      mesh,
      width: length,
      height: 0.12,
      isHazard: false,
      speed: this.speed
    };
  }

  createLilyPadPlatform(x) {
    const mesh = createLilyPadModel();
    mesh.position.set(x, 0, 0);

    return {
      mesh,
      width: 1.1,
      height: 0.05,
      isHazard: false,
      speed: this.speed
    };
  }

  spawnSwimmingFish() {
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const species = getRandomFishForBiome(this.biome);
      const fishModel = createFishModel(species, this.biome);
      fishModel.position.set(
        Math.random() * 16 - 8,
        -0.08,
        (Math.random() * 0.4 - 0.2)
      );

      const fishSpeed = (0.8 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1);
      if (fishSpeed < 0) fishModel.rotation.y = Math.PI;

      this.fishList.push({
        mesh: fishModel,
        speed: fishSpeed,
        species
      });
      this.group.add(fishModel);
    }
  }

  update(dt, player) {
    // 1. Update moving platforms and boats
    for (const obs of this.movingObstacles) {
      obs.mesh.position.x += obs.speed * dt;

      // Wrap around seamlessly
      if (obs.speed > 0 && obs.mesh.position.x > 16) {
        obs.mesh.position.x = -16;
      } else if (obs.speed < 0 && obs.mesh.position.x < -16) {
        obs.mesh.position.x = 16;
      }

      // Check collision with player if boat/hazard
      if (obs.isHazard && !player.isHopping && player.gridZ === this.z) {
        const dx = Math.abs(player.mesh.position.x - obs.mesh.position.x);
        if (dx < (obs.width / 2 + 0.3)) {
          this.worldManager.game.audio.playSplash();
          player.die(this.biome.id === 'cyber_river' 
            ? '사이버 스피더에 충돌했습니다! 💥' 
            : '돌진하는 쾌속선에 부딪혔습니다! 🚤');
        }
      }
    }

    // 2. Update swimming fish
    for (const fish of this.fishList) {
      fish.mesh.position.x += fish.speed * dt;
      if (fish.speed > 0 && fish.mesh.position.x > 14) {
        fish.mesh.position.x = -14;
      } else if (fish.speed < 0 && fish.mesh.position.x < -14) {
        fish.mesh.position.x = 14;
      }

      // Tail wagging animation
      const { tail } = fish.mesh.userData;
      if (tail) {
        tail.rotation.y = Math.sin(performance.now() * 0.01) * 0.35;
      }
    }
  }

  // Returns platform under given X coordinate if valid
  getPlatformAt(playerX) {
    for (const obs of this.movingObstacles) {
      if (obs.isHazard) continue;
      const halfWidth = obs.width / 2;
      if (playerX >= obs.mesh.position.x - halfWidth - 0.25 &&
          playerX <= obs.mesh.position.x + halfWidth + 0.25) {
        return obs;
      }
    }
    return null;
  }

  getRandomFish() {
    if (this.fishList.length > 0) {
      const idx = Math.floor(Math.random() * this.fishList.length);
      return this.fishList[idx].species;
    }
    return getRandomFishForBiome(this.biome);
  }

  destroy() {
    this.scene.remove(this.group);
    this.staticObstacles.clear();
    this.movingObstacles = [];
    this.fishList = [];
  }
}
