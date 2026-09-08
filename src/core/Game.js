import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { AudioManager } from './AudioManager.js';
import { WorldManager } from '../world/WorldManager.js';
import { Player } from '../entities/Player.js';
import { Eagle } from '../entities/Eagle.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { AutoPlayAI } from '../systems/AutoPlayAI.js';
import { Leaderboard } from '../systems/Leaderboard.js';
import { UIManager } from '../ui/UIManager.js';
import { BIOMES } from '../world/Biomes.js';

export class Game {
  constructor() {
    const container = document.getElementById('canvas-container');

    // 1. Core Systems
    this.renderer = new Renderer(container);
    this.scene = this.renderer.scene;
    this.camera = this.renderer.camera;

    this.audio = new AudioManager();
    this.leaderboard = new Leaderboard();

    // 2. Game Entities & World
    this.worldManager = new WorldManager(this);
    this.player = new Player(this);
    this.scene.add(this.player.mesh);

    this.eagle = new Eagle(this);
    this.weatherSystem = new WeatherSystem(this);
    this.autoPlayAI = new AutoPlayAI(this);

    // 3. UI Manager
    this.ui = new UIManager(this);

    // 4. Game State
    this.state = 'START'; // 'START', 'PLAYING', 'GAMEOVER'
    this.score = 0;
    this.fishCaught = 0;
    this.maxZ = 0;
    this.clock = new THREE.Clock();

    // Impatience / Eagle timer
    this.inactivityTimer = 0;
    this.maxInactivity = 8.5; // Seconds before eagle swoops

    // Natural weather change timer
    this.weatherCycleTimer = 0;

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  start() {
    this.audio.init();
    this.state = 'PLAYING';
    this.score = 0;
    this.fishCaught = 0;
    this.maxZ = 0;
    this.inactivityTimer = 0;

    this.worldManager.init();
    this.player.reset();
    this.eagle.reset();
    this.weatherSystem.setWeather('clear');

    this.ui.updateScore(this.score, this.fishCaught);
    this.ui.updateStage(this.worldManager.currentBiome, 1);
  }

  restart() {
    this.start();
  }

  onPlayerAdvanced(z) {
    if (z > this.maxZ) {
      const delta = z - this.maxZ;
      this.maxZ = z;
      this.score += delta * 10;
      this.ui.updateScore(this.score, this.fishCaught);
    }
    // Reset impatience timer on advancing
    this.inactivityTimer = 0;
    this.ui.updateDangerBar(0);
  }

  onFishCaught(fish) {
    this.fishCaught++;
    this.score += fish.points;
    this.inactivityTimer = Math.max(0, this.inactivityTimer - 4.0); // Reward extra time for fishing

    this.ui.updateScore(this.score, this.fishCaught);
    this.ui.showCatchPopup(fish);
  }

  onBiomeChanged(biome) {
    const stageIdx = BIOMES.findIndex(b => b.id === biome.id) + 1;
    this.ui.updateStage(biome, stageIdx);
    this.weatherSystem.applyLightingAndFog();
    this.ui.showTemporaryAlert(`🚩 ${biome.name} (STAGE ${stageIdx}) 진입!`);
  }

  onGameOver(reason) {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.audio.playGameOver();

    const stageIdx = BIOMES.findIndex(b => b.id === this.worldManager.currentBiome.id) + 1;
    const stageStr = `STAGE ${stageIdx} (${this.worldManager.currentBiome.name})`;

    setTimeout(() => {
      this.ui.showGameOver(reason, this.score, stageStr, this.fishCaught);
    }, 600);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING') {
      // 1. Update Inactivity & Eagle Timer
      this.inactivityTimer += dt;
      const progress = this.inactivityTimer / this.maxInactivity;
      this.ui.updateDangerBar(progress);

      if (this.inactivityTimer >= this.maxInactivity && !this.eagle.isAttacking) {
        this.eagle.trigger(this.player.mesh.position);
      }

      // 2. Natural Weather Cycle (every 45s)
      this.weatherCycleTimer += dt;
      if (this.weatherCycleTimer > 45) {
        this.weatherCycleTimer = 0;
        const weathers = ['clear', 'rain', 'snow', 'fog'];
        const next = weathers[Math.floor(Math.random() * weathers.length)];
        this.weatherSystem.setWeather(next);
      }

      // 3. Update Entities & World
      this.player.update(dt);
      this.worldManager.update(dt, this.player);
      this.eagle.update(dt, this.player);
      this.weatherSystem.update(dt, this.player);
      this.autoPlayAI.update(dt);
    }

    // Always smooth update camera & render
    this.renderer.updateCamera(this.player.mesh.position, dt);
    this.renderer.render();
  }
}
