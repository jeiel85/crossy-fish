import * as THREE from 'three';

export class WeatherSystem {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    this.currentWeather = 'clear'; // 'clear', 'rain', 'snow', 'fog'
    this.isNight = false;
    this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 0.8 = sunset

    // Rain Particles
    this.rainCount = 1200;
    this.rainParticles = this.createRainSystem();
    this.scene.add(this.rainParticles);
    this.rainParticles.visible = false;

    // Snow Particles
    this.snowCount = 800;
    this.snowParticles = this.createSnowSystem();
    this.scene.add(this.snowParticles);
    this.snowParticles.visible = false;

    // Lightning Flash
    this.lightningLight = new THREE.DirectionalLight(0xffffff, 0);
    this.lightningLight.position.set(0, 50, 0);
    this.scene.add(this.lightningLight);
    this.lightningTimer = 0;

    // Fisherman Night Lantern
    this.lanternLight = new THREE.PointLight(0xf59e0b, 0, 8, 2);
    this.scene.add(this.lanternLight);
  }

  createRainSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      velocities[i] = 18 + Math.random() * 8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.75
    });

    return new THREE.Points(geo, mat);
  }

  createSnowSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);
    const velocities = new Float32Array(this.snowCount * 2); // y speed, x drift

    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      velocities[i * 2 + 0] = 2.5 + Math.random() * 2.0; // Y
      velocities[i * 2 + 1] = (Math.random() - 0.5) * 1.5; // X drift
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.85
    });

    return new THREE.Points(geo, mat);
  }

  setWeather(type) {
    this.currentWeather = type;

    this.rainParticles.visible = type === 'rain';
    this.snowParticles.visible = type === 'snow';

    this.applyLightingAndFog();
    this.game.ui.updateWeatherIndicator(type, this.isNight);
  }

  toggleDayNight() {
    this.isNight = !this.isNight;
    this.applyLightingAndFog();
    this.game.ui.updateWeatherIndicator(this.currentWeather, this.isNight);
    return this.isNight;
  }

  applyLightingAndFog() {
    const biome = this.game.worldManager ? this.game.worldManager.currentBiome : null;
    const baseFog = biome ? biome.colors.fog : 0xdbeafe;

    const { dirLight, ambientLight } = this.game.renderer;

    if (this.isNight) {
      // Night Mode
      ambientLight.color.setHex(0x1e1b4b);
      ambientLight.intensity = 0.45;
      dirLight.color.setHex(0x60a5fa);
      dirLight.intensity = 0.6;
      this.scene.fog.color.setHex(0x0f172a);
      this.scene.fog.density = 0.028;
      this.scene.background.setHex(0x020617);
      this.lanternLight.intensity = 2.5;
    } else {
      // Day Mode
      this.lanternLight.intensity = 0;
      if (this.currentWeather === 'rain') {
        ambientLight.color.setHex(0x64748b);
        ambientLight.intensity = 0.8;
        dirLight.color.setHex(0x94a3b8);
        dirLight.intensity = 1.0;
        this.scene.fog.color.setHex(0x475569);
        this.scene.fog.density = 0.024;
        this.scene.background.setHex(0x334155);
      } else if (this.currentWeather === 'snow') {
        ambientLight.color.setHex(0xe0f2fe);
        ambientLight.intensity = 1.1;
        dirLight.color.setHex(0xffffff);
        dirLight.intensity = 1.4;
        this.scene.fog.color.setHex(0xe0f2fe);
        this.scene.fog.density = 0.022;
        this.scene.background.setHex(0xbae6fd);
      } else if (this.currentWeather === 'fog') {
        ambientLight.color.setHex(0x94a3b8);
        ambientLight.intensity = 0.9;
        dirLight.color.setHex(0xcbd5e1);
        dirLight.intensity = 0.8;
        this.scene.fog.color.setHex(0x94a3b8);
        this.scene.fog.density = 0.045; // Thick fog
        this.scene.background.setHex(0x94a3b8);
      } else {
        // Clear / Sunny
        ambientLight.color.setHex(0xffffff);
        ambientLight.intensity = 1.0;
        dirLight.color.setHex(0xfffae0);
        dirLight.intensity = 1.6;
        this.scene.fog.color.setHex(baseFog);
        this.scene.fog.density = 0.015;
        this.scene.background.setHex(baseFog);
      }
    }
  }

  update(dt, player) {
    const playerPos = player.mesh.position;

    // Follow player with particles
    if (this.currentWeather === 'rain' && this.rainParticles.visible) {
      this.updateRain(dt, playerPos);
      this.updateLightning(dt);
    } else if (this.currentWeather === 'snow' && this.snowParticles.visible) {
      this.updateSnow(dt, playerPos);
    }

    // Follow player with night lantern
    if (this.isNight) {
      this.lanternLight.position.set(playerPos.x + 0.3, playerPos.y + 1.2, playerPos.z + 0.3);
    }
  }

  updateRain(dt, centerPos) {
    const pos = this.rainParticles.geometry.attributes.position.array;
    const vels = this.rainParticles.geometry.userData.velocities;

    for (let i = 0; i < this.rainCount; i++) {
      const idx = i * 3;
      pos[idx + 1] -= vels[i] * dt;

      // Wrap around Y
      if (pos[idx + 1] < 0) {
        pos[idx + 1] = 18 + Math.random() * 4;
        pos[idx + 0] = centerPos.x + (Math.random() - 0.5) * 35;
        pos[idx + 2] = centerPos.z + (Math.random() - 0.5) * 35;
      }
    }
    this.rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  updateSnow(dt, centerPos) {
    const pos = this.snowParticles.geometry.attributes.position.array;
    const vels = this.snowParticles.geometry.userData.velocities;

    const time = performance.now() * 0.002;
    for (let i = 0; i < this.snowCount; i++) {
      const idx = i * 3;
      pos[idx + 1] -= vels[i * 2 + 0] * dt;
      // Gentle horizontal sway
      pos[idx + 0] += Math.sin(time + i) * 0.02;

      if (pos[idx + 1] < 0) {
        pos[idx + 1] = 18 + Math.random() * 3;
        pos[idx + 0] = centerPos.x + (Math.random() - 0.5) * 35;
        pos[idx + 2] = centerPos.z + (Math.random() - 0.5) * 35;
      }
    }
    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  updateLightning(dt) {
    this.lightningTimer += dt;
    if (this.lightningTimer > 8 + Math.random() * 12) {
      this.lightningTimer = 0;
      // Flash!
      this.lightningLight.intensity = 3.5;
      this.game.audio.playThunder();

      setTimeout(() => {
        this.lightningLight.intensity = 0.5;
        setTimeout(() => {
          this.lightningLight.intensity = 2.0;
          setTimeout(() => {
            this.lightningLight.intensity = 0;
          }, 60);
        }, 80);
      }, 100);
    }
  }
}
