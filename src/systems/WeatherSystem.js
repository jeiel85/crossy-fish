import * as THREE from 'three';
import { SkySystem } from './SkySystem.js';

export const WEATHER_TYPES = [
  { id: 'sunny', name: '쾌청한 맑음', icon: '☀️', buff: '기본 상태' },
  { id: 'drizzle', name: '보슬비', icon: '🌧️', buff: '입질 속도 +15%' },
  { id: 'storm', name: '폭풍우 & 번개', icon: '⛈️', buff: '입질 +40% & 대어 확률 UP!' },
  { id: 'snow', name: '함박눈', icon: '❄️', buff: '겨울 정취 & 차분한 수면' },
  { id: 'fog', name: '짙은 해무', icon: '🌫️', buff: '신비로운 몽환 안개' },
  { id: 'sunset', name: '황혼 노을', icon: '🌅', buff: '따스한 골든아워 감성' },
  { id: 'night', name: '은하수 밤하늘', icon: '🌌', buff: '야행성 발광 어종 출현' },
  { id: 'cherry', name: '벚꽃비', icon: '🌸', buff: '봄날의 흩날리는 꽃잎' }
];

export class WeatherSystem {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    this.currentWeather = 'sunny';
    this.isNight = false;

    // 1. Rain Particles
    this.rainCount = 1400;
    this.rainParticles = this.createRainSystem();
    this.scene.add(this.rainParticles);
    this.rainParticles.visible = false;

    // 2. Snow Particles
    this.snowCount = 900;
    this.snowParticles = this.createSnowSystem();
    this.scene.add(this.snowParticles);
    this.snowParticles.visible = false;

    // 3. Cherry Blossom Petals Particles
    this.petalCount = 350;
    this.petalParticles = this.createPetalSystem();
    this.scene.add(this.petalParticles);
    this.petalParticles.visible = false;

    // 4. Night Fireflies / Glowing Motes
    this.moteCount = 180;
    this.moteParticles = this.createMoteSystem();
    this.scene.add(this.moteParticles);
    this.moteParticles.visible = false;

    // 5. Lightning Flash Light
    this.lightningLight = new THREE.DirectionalLight(0xffffff, 0);
    this.lightningLight.position.set(0, 50, 0);
    this.scene.add(this.lightningLight);
    this.lightningTimer = 0;

    // 6. Fisherman Night Lantern Light
    this.lanternLight = new THREE.PointLight(0xf59e0b, 0, 10, 2);
    this.scene.add(this.lanternLight);

    // 7. Dynamic Atmospheric Sky System (Gradient Dome, Voxel Clouds, Sun, Moon, Stars)
    this.skySystem = new SkySystem(this.game);
  }

  createRainSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      velocities[i] = 18 + Math.random() * 8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.16,
      transparent: true,
      opacity: 0.8
    });

    return new THREE.Points(geo, mat);
  }

  createSnowSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);
    const velocities = new Float32Array(this.snowCount * 2);

    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      velocities[i * 2 + 0] = 2.5 + Math.random() * 2.0; // Y speed
      velocities[i * 2 + 1] = (Math.random() - 0.5) * 1.5; // X wind
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.24,
      transparent: true,
      opacity: 0.88
    });

    return new THREE.Points(geo, mat);
  }

  createPetalSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.petalCount * 3);
    const velocities = new Float32Array(this.petalCount * 2);

    for (let i = 0; i < this.petalCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities[i * 2 + 0] = 1.4 + Math.random() * 1.2; // Fall speed
      velocities[i * 2 + 1] = 1.0 + Math.random() * 1.0; // Breeze drift
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: 0xf472b6, // Soft pink petals
      size: 0.22,
      transparent: true,
      opacity: 0.85
    });

    return new THREE.Points(geo, mat);
  }

  createMoteSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.moteCount * 3);

    for (let i = 0; i < this.moteCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xfef08a, // Firefly glowing yellow-green
      size: 0.2,
      transparent: true,
      opacity: 0.9
    });

    return new THREE.Points(geo, mat);
  }

  setWeather(type) {
    this.currentWeather = type;

    // Toggle particle visibilities
    this.rainParticles.visible = type === 'drizzle' || type === 'storm';
    this.snowParticles.visible = type === 'snow';
    this.petalParticles.visible = type === 'cherry';
    this.moteParticles.visible = type === 'night' || type === 'sunset';

    // In storm, double the rain particle density
    if (type === 'storm') {
      this.rainParticles.material.size = 0.22;
      this.rainParticles.material.opacity = 0.95;
    } else if (type === 'drizzle') {
      this.rainParticles.material.size = 0.13;
      this.rainParticles.material.opacity = 0.65;
    }

    this.isNight = (type === 'night');

    this.applyLightingAndFog();
    if (this.skySystem) {
      this.skySystem.setWeather(type);
    }
    this.game.ui.updateWeatherIndicator(type, this.isNight);
  }

  toggleDayNight() {
    if (this.currentWeather === 'night') {
      this.setWeather('sunny');
    } else {
      this.setWeather('night');
    }
    return this.isNight;
  }

  applyLightingAndFog() {
    const biome = this.game.currentBiome || (this.game.worldManager ? this.game.worldManager.currentBiome : null);
    const baseFog = biome ? biome.colors.fog : 0xdbeafe;

    const { dirLight, ambientLight } = this.game.renderer;
    const type = this.currentWeather;

    if (type === 'night') {
      // 🌌 Starlit Night
      ambientLight.color.setHex(0x1e1b4b);
      ambientLight.intensity = 0.45;
      dirLight.color.setHex(0x60a5fa);
      dirLight.intensity = 0.55;
      this.scene.fog.color.setHex(0x0f172a);
      this.scene.fog.density = 0.026;
      this.scene.background.setHex(0x020617);
      this.lanternLight.intensity = 2.8;
    } else if (type === 'sunset') {
      // 🌅 Golden Sunset
      ambientLight.color.setHex(0xf97316);
      ambientLight.intensity = 0.95;
      dirLight.color.setHex(0xfbbf24);
      dirLight.intensity = 1.45;
      this.scene.fog.color.setHex(0xc2410c);
      this.scene.fog.density = 0.012;
      this.scene.background.setHex(0x7c2d12);
      this.lanternLight.intensity = 1.2;
    } else if (type === 'storm') {
      // ⛈️ Thunderstorm
      ambientLight.color.setHex(0x334155);
      ambientLight.intensity = 0.6;
      dirLight.color.setHex(0x475569);
      dirLight.intensity = 0.7;
      this.scene.fog.color.setHex(0x1e293b);
      this.scene.fog.density = 0.032;
      this.scene.background.setHex(0x0f172a);
      this.lanternLight.intensity = 1.5;
    } else if (type === 'drizzle') {
      // 🌧️ Gentle Drizzle
      ambientLight.color.setHex(0x64748b);
      ambientLight.intensity = 0.85;
      dirLight.color.setHex(0x94a3b8);
      dirLight.intensity = 1.1;
      this.scene.fog.color.setHex(0x475569);
      this.scene.fog.density = 0.022;
      this.scene.background.setHex(0x334155);
      this.lanternLight.intensity = 0;
    } else if (type === 'snow') {
      // ❄️ Fluffy Snow
      ambientLight.color.setHex(0xe0f2fe);
      ambientLight.intensity = 1.15;
      dirLight.color.setHex(0xffffff);
      dirLight.intensity = 1.45;
      this.scene.fog.color.setHex(0xe0f2fe);
      this.scene.fog.density = 0.022;
      this.scene.background.setHex(0xbae6fd);
      this.lanternLight.intensity = 0;
    } else if (type === 'fog') {
      // 🌫️ Dense Mist
      ambientLight.color.setHex(0x94a3b8);
      ambientLight.intensity = 0.95;
      dirLight.color.setHex(0xcbd5e1);
      dirLight.intensity = 0.85;
      this.scene.fog.color.setHex(0x94a3b8);
      this.scene.fog.density = 0.046; // Heavy rolling fog
      this.scene.background.setHex(0x94a3b8);
      this.lanternLight.intensity = 1.8;
    } else if (type === 'cherry') {
      // 🌸 Cherry Blossom Breeze
      ambientLight.color.setHex(0xfdf2f8);
      ambientLight.intensity = 1.1;
      dirLight.color.setHex(0xfbcfe8);
      dirLight.intensity = 1.4;
      this.scene.fog.color.setHex(0xfce7f3);
      this.scene.fog.density = 0.016;
      this.scene.background.setHex(0xfce7f3);
      this.lanternLight.intensity = 0;
    } else {
      // ☀️ Sunny / Clear
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 1.05;
      dirLight.color.setHex(0xfffae0);
      dirLight.intensity = 1.65;
      this.scene.fog.color.setHex(baseFog);
      this.scene.fog.density = 0.015;
      this.scene.background.setHex(baseFog);
      this.lanternLight.intensity = 0;
    }
  }

  update(dt, player) {
    const playerPos = player ? player.mesh.position : new THREE.Vector3(0, 0, 0);

    // Follow player with particles
    if (this.rainParticles.visible) {
      this.updateRain(dt, playerPos);
      if (this.currentWeather === 'storm') {
        this.updateLightning(dt);
      }
    }
    if (this.snowParticles.visible) {
      this.updateSnow(dt, playerPos);
    }
    if (this.petalParticles.visible) {
      this.updatePetals(dt, playerPos);
    }
    if (this.moteParticles.visible) {
      this.updateMotes(dt, playerPos);
    }

    // Follow player with night lantern
    if (this.lanternLight.intensity > 0) {
      this.lanternLight.position.set(playerPos.x + 0.3, playerPos.y + 1.2, playerPos.z + 0.3);
    }

    // 5. Update Dynamic Atmospheric Sky (Dome, Voxel Clouds, Sun, Moon, Stars)
    if (this.skySystem) {
      this.skySystem.update(dt, this.game.renderer.camera);
    }
  }

  updateRain(dt, centerPos) {
    const pos = this.rainParticles.geometry.attributes.position.array;
    const vels = this.rainParticles.geometry.userData.velocities;
    const speedMult = this.currentWeather === 'storm' ? 1.4 : 1.0;

    for (let i = 0; i < this.rainCount; i++) {
      const idx = i * 3;
      pos[idx + 1] -= vels[i] * dt * speedMult;
      if (this.currentWeather === 'storm') {
        pos[idx + 0] += 5 * dt; // Storm wind slant
      }

      if (pos[idx + 1] < 0) {
        pos[idx + 1] = 20 + Math.random() * 4;
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
      pos[idx + 0] += Math.sin(time + i) * 0.02 + vels[i * 2 + 1] * dt * 0.3;

      if (pos[idx + 1] < 0) {
        pos[idx + 1] = 20 + Math.random() * 3;
        pos[idx + 0] = centerPos.x + (Math.random() - 0.5) * 35;
        pos[idx + 2] = centerPos.z + (Math.random() - 0.5) * 35;
      }
    }
    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  updatePetals(dt, centerPos) {
    const pos = this.petalParticles.geometry.attributes.position.array;
    const vels = this.petalParticles.geometry.userData.velocities;
    const time = performance.now() * 0.0015;

    for (let i = 0; i < this.petalCount; i++) {
      const idx = i * 3;
      pos[idx + 1] -= vels[i * 2 + 0] * dt;
      pos[idx + 0] += vels[i * 2 + 1] * dt + Math.sin(time + i) * 0.03;
      pos[idx + 2] += Math.cos(time + i) * 0.02;

      if (pos[idx + 1] < 0) {
        pos[idx + 1] = 16 + Math.random() * 3;
        pos[idx + 0] = centerPos.x + (Math.random() - 0.5) * 30 - 8;
        pos[idx + 2] = centerPos.z + (Math.random() - 0.5) * 30;
      }
    }
    this.petalParticles.geometry.attributes.position.needsUpdate = true;
  }

  updateMotes(dt, centerPos) {
    const pos = this.moteParticles.geometry.attributes.position.array;
    const time = performance.now() * 0.001;

    for (let i = 0; i < this.moteCount; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(time * 2 + i) * 0.01;
      pos[idx + 0] += Math.cos(time + i) * 0.01;
    }
    this.moteParticles.geometry.attributes.position.needsUpdate = true;
  }

  updateLightning(dt) {
    this.lightningTimer += dt;
    if (this.lightningTimer > 5 + Math.random() * 8) {
      this.lightningTimer = 0;
      this.lightningLight.intensity = 4.0;
      if (this.skySystem) {
        this.skySystem.triggerLightningFlash();
      }
      this.game.audio.playThunder();

      setTimeout(() => {
        this.lightningLight.intensity = 0.8;
        setTimeout(() => {
          this.lightningLight.intensity = 3.0;
          setTimeout(() => {
            this.lightningLight.intensity = 0;
          }, 60);
        }, 70);
      }, 90);
    }
  }
}
