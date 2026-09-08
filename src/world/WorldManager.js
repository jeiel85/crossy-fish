import { Lane } from './Lane.js';
import { getBiomeForLane } from './Biomes.js';

export class WorldManager {
  constructor(game) {
    this.game = game;
    this.lanes = new Map(); // z -> Lane
    this.minZ = -6;
    this.maxZ = 35;
    this.currentBiome = null;
  }

  init() {
    this.clear();
    // Starting safe platform: lanes -6 to 3 are always grass
    for (let z = this.minZ; z <= 3; z++) {
      const biome = getBiomeForLane(z);
      const lane = new Lane(z, 'grass', biome, this);
      this.lanes.set(z, lane);
    }

    // Generate upcoming procedural lanes
    for (let z = 4; z <= this.maxZ; z++) {
      this.generateLane(z);
    }

    this.currentBiome = getBiomeForLane(0);
  }

  generateLane(z) {
    const biome = getBiomeForLane(z);
    
    // Check if new biome reached
    if (this.currentBiome && biome.id !== this.currentBiome.id) {
      this.currentBiome = biome;
      this.game.onBiomeChanged(biome);
    }

    // Lane type distribution:
    // Every few lanes, guarantee grass bank for safety & fishing spots
    let type = 'grass';
    const prevLane = this.lanes.get(z - 1);
    const prevPrevLane = this.lanes.get(z - 2);

    if (prevLane && prevLane.type === 'water') {
      // 55% chance water cluster (multi-lane river), 45% grass bank
      if (prevPrevLane && prevPrevLane.type === 'water') {
        type = Math.random() < 0.35 ? 'water' : 'grass';
      } else {
        type = Math.random() < 0.6 ? 'water' : 'grass';
      }
    } else {
      // After grass, 50% chance water, 20% boat road, 30% grass
      const rand = Math.random();
      if (rand < 0.45) type = 'water';
      else if (rand < 0.70) type = 'boat_road';
      else type = 'grass';
    }

    const lane = new Lane(z, type, biome, this);
    this.lanes.set(z, lane);
    return lane;
  }

  update(dt, player) {
    // Generate ahead as player advances
    const targetAhead = player.gridZ + 35;
    while (this.maxZ < targetAhead) {
      this.maxZ++;
      this.generateLane(this.maxZ);
    }

    // Recycle old lanes far behind
    const cleanupThreshold = player.gridZ - 10;
    for (const [z, lane] of this.lanes.entries()) {
      if (z < cleanupThreshold) {
        lane.destroy();
        this.lanes.delete(z);
      } else {
        lane.update(dt, player);
      }
    }
  }

  getLane(z) {
    return this.lanes.get(z);
  }

  hasStaticObstacle(x, z) {
    const lane = this.lanes.get(z);
    if (!lane) return false;
    return lane.staticObstacles.has(x);
  }

  clear() {
    for (const lane of this.lanes.values()) {
      lane.destroy();
    }
    this.lanes.clear();
    this.minZ = -6;
    this.maxZ = 35;
  }
}
