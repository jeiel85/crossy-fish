import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { AudioManager } from './AudioManager.js';
import { BIOMES, getBiomeByIndex } from '../world/Biomes.js';
import { FishingSpot } from '../world/FishingSpot.js';
import { createFishermanModel } from '../entities/VoxelModels.js';
import { FishingMechanic } from '../systems/FishingMechanic.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { AutoPlayAI } from '../systems/AutoPlayAI.js';
import { Fishdex } from '../systems/Fishdex.js';
import { Leaderboard } from '../systems/Leaderboard.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
  constructor() {
    const container = document.getElementById('canvas-container');

    // 1. Core Systems
    this.renderer = new Renderer(container);
    this.scene = this.renderer.scene;
    this.camera = this.renderer.camera;

    this.audio = new AudioManager();
    this.fishdex = new Fishdex();
    this.leaderboard = new Leaderboard();

    // 2. Stage & Fisherman Setup
    this.currentStageIndex = 0;
    this.currentBiome = BIOMES[0];
    this.currentSpot = null;

    // Fisherman on the pier
    this.fisherman = createFishermanModel();
    this.fisherman.position.set(0, 0.15, -1.0);
    this.scene.add(this.fisherman);

    // 3. Mechanics & Systems
    this.fishingMechanic = new FishingMechanic(this);
    this.weatherSystem = new WeatherSystem(this);
    this.autoPlayAI = new AutoPlayAI(this);

    // 4. UI Manager
    this.ui = new UIManager(this);

    // 5. Game State
    this.state = 'START'; // 'START', 'PLAYING'
    this.score = 0;
    this.fishCaught = 0;
    this.clock = new THREE.Clock();

    // Raycaster for water casting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  start() {
    this.audio.init();
    this.state = 'PLAYING';
    this.loadStage(0);
  }

  loadStage(index) {
    this.currentStageIndex = index;
    this.currentBiome = getBiomeByIndex(index);

    if (this.currentSpot) {
      this.currentSpot.destroy();
    }

    this.currentSpot = new FishingSpot(this.currentBiome, this);
    this.fishingMechanic.reset();

    // Adjust camera & lighting for the scenic diorama
    this.weatherSystem.applyLightingAndFog();
    this.ui.updateStage(this.currentBiome, this.currentStageIndex + 1);
  }

  nextStage() {
    const nextIdx = (this.currentStageIndex + 1) % BIOMES.length;
    this.loadStage(nextIdx);
  }

  prevStage() {
    const prevIdx = (this.currentStageIndex - 1 + BIOMES.length) % BIOMES.length;
    this.loadStage(prevIdx);
  }

  onWaterClicked(event) {
    if (this.state !== 'PLAYING') return;
    if (this.fishingMechanic.state !== 'IDLE') {
      if (this.fishingMechanic.state === 'STRIKE_WINDOW') {
        this.fishingMechanic.hook();
      }
      return;
    }

    // Convert mouse/touch to normalized device coordinates (-1 to +1)
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return;

    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (!this.currentSpot?.waterRaycastPlane) return;

    const intersects = this.raycaster.intersectObject(this.currentSpot.waterRaycastPlane);
    if (intersects.length > 0) {
      const hit = intersects[0].point;
      this.fishingMechanic.castTo(hit.x, hit.z);
    } else {
      this.fishingMechanic.castDefault();
    }
  }

  onFishCaught(fish, sizeCm, weightKg) {
    this.fishCaught++;
    this.score += fish.points;

    // Record in Fishdex
    const { isNewSpecies, isNewRecord } = this.fishdex.recordCatch(fish, sizeCm);

    this.ui.updateScore(this.score, this.fishCaught);
    this.ui.showCatchPopup(fish, sizeCm, weightKg, isNewRecord, isNewSpecies);

    // Refresh fish population in spot
    setTimeout(() => {
      if (this.currentSpot) {
        this.currentSpot.spawnFish(6);
      }
    }, 1200);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING') {
      // 1. Update spot & swimming fish
      const isBobberInWater = this.fishingMechanic.state === 'WAITING_BITE' || this.fishingMechanic.state === 'STRIKE_WINDOW';
      const bobberPos = isBobberInWater ? this.fishingMechanic.bobber.position : null;

      if (this.currentSpot) {
        this.currentSpot.update(dt, bobberPos, isBobberInWater);
      }

      // 2. Update Fishing Mechanic
      this.fishingMechanic.update(dt);

      // 3. Update Weather
      const fakePlayer = { mesh: this.fisherman };
      this.weatherSystem.update(dt, fakePlayer);

      // 4. Update Auto-Fishing AI
      this.autoPlayAI.update(dt);

      // 5. Idle breathing for fisherman
      const time = performance.now() * 0.003;
      if (this.fisherman.userData.rodPivot && this.fishingMechanic.state === 'IDLE') {
        this.fisherman.userData.rodPivot.rotation.x = Math.sin(time) * 0.05;
      }
    }

    // Camera centered on scenic pier
    this.renderer.updateCamera({ x: 0, z: 4.5 }, dt);
    this.renderer.render();
  }
}
