import * as THREE from 'three';

export class SkySystem {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Weather palette definitions (Top Zenith, Bottom Horizon, Sun color, Moon color, Cloud color)
    this.palettes = {
      sunny: {
        top: new THREE.Color(0x0284c7),      // Deep crisp sky blue
        bottom: new THREE.Color(0xbae6fd),   // Hazy azure horizon
        sunColor: new THREE.Color(0xfacc15), // Vibrant bright solar yellow (distinct from clouds!)
        sunGlowColor: new THREE.Color(0xf59e0b), // Warm amber corona glow
        sunVisible: true,
        sunElevation: 22,
        moonVisible: false,
        starsVisible: false,
        cloudColor: new THREE.Color(0xffffff),
        cloudOpacity: 0.95
      },
      sunset: {
        top: new THREE.Color(0x4c0519),      // Deep sunset crimson-purple
        bottom: new THREE.Color(0xf97316),   // Fiery amber sunset horizon
        sunColor: new THREE.Color(0xf97316), // Sinking warm orange-gold sun
        sunGlowColor: new THREE.Color(0xd97706),
        sunVisible: true,
        sunElevation: 9,
        moonVisible: true,
        moonElevation: 20,
        starsVisible: true,
        starAlpha: 0.45,
        cloudColor: new THREE.Color(0xfed7aa), // Peach-apricot golden hour
        cloudOpacity: 0.95
      },
      night: {
        top: new THREE.Color(0x020617),      // Pitch dark midnight navy
        bottom: new THREE.Color(0x1e1b4b),   // Deep indigo horizon
        sunVisible: false,
        moonVisible: true,
        moonColor: new THREE.Color(0xe0f2fe),
        moonElevation: 22,
        starsVisible: true,
        starAlpha: 1.0,
        cloudColor: new THREE.Color(0x1e293b), // Silhouetted night clouds
        cloudOpacity: 0.75
      },
      cherry: {
        top: new THREE.Color(0xbe185d),      // Cherry blossom rose
        bottom: new THREE.Color(0xfce7f3),   // Blush petal mist
        sunColor: new THREE.Color(0xfde047), // Sunny spring yellow
        sunGlowColor: new THREE.Color(0xfbbf24),
        sunVisible: true,
        sunElevation: 22,
        moonVisible: false,
        starsVisible: false,
        cloudColor: new THREE.Color(0xfdf2f8), // Soft pink cloud
        cloudOpacity: 0.92
      },
      storm: {
        top: new THREE.Color(0x0f172a),      // Brooding thunderhead slate
        bottom: new THREE.Color(0x334155),   // Ominous stormy horizon
        sunVisible: false,
        moonVisible: false,
        starsVisible: false,
        cloudColor: new THREE.Color(0x1e293b), // Menacing dark stormclouds
        cloudOpacity: 0.98
      },
      drizzle: {
        top: new THREE.Color(0x334155),      // Overcast charcoal
        bottom: new THREE.Color(0x94a3b8),   // Silvery rain fog
        sunVisible: false,
        moonVisible: false,
        starsVisible: false,
        cloudColor: new THREE.Color(0x64748b),
        cloudOpacity: 0.90
      },
      snow: {
        top: new THREE.Color(0x38bdf8),      // Frosty arctic cyan
        bottom: new THREE.Color(0xf0f9ff),   // Frosted snow-white haze
        sunColor: new THREE.Color(0xfef08a), // Pale winter yellow
        sunGlowColor: new THREE.Color(0xfacc15),
        sunVisible: true,
        sunElevation: 20,
        moonVisible: false,
        starsVisible: false,
        cloudColor: new THREE.Color(0xf8fafc),
        cloudOpacity: 0.92
      },
      fog: {
        top: new THREE.Color(0x64748b),      // Muted foggy gray
        bottom: new THREE.Color(0xcbd5e1),   // Whiteout horizon mist
        sunVisible: false,
        moonVisible: false,
        starsVisible: false,
        cloudColor: new THREE.Color(0x94a3b8),
        cloudOpacity: 0.80
      }
    };

    this.currentWeather = 'sunny';

    // Lerp colors
    this.currentTopColor = new THREE.Color(0x0284c7);
    this.targetTopColor = new THREE.Color(0x0284c7);
    this.currentBottomColor = new THREE.Color(0xbae6fd);
    this.targetBottomColor = new THREE.Color(0xbae6fd);
    this.currentCloudColor = new THREE.Color(0xffffff);
    this.targetCloudColor = new THREE.Color(0xffffff);

    // 1. Atmospheric Gradient Sky Dome
    this.createSkyDome();

    // 2. Voxel Sun & Moon
    this.createSunAndMoon();

    // 3. Twinkling Voxel Stars
    this.createStarField();

    // 4. Drifting 3D Voxel Clouds
    this.clouds = [];
    this.createVoxelClouds();

    // 5. Lightning flash state
    this.flashIntensity = 0;
  }

  createSkyDome() {
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        float factor = max(pow(max(h, 0.0), exponent), 0.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, factor), 1.0);
      }
    `;

    this.skyUniforms = {
      topColor: { value: this.currentTopColor },
      bottomColor: { value: this.currentBottomColor },
      offset: { value: 10.0 },
      exponent: { value: 0.65 }
    };

    const skyGeo = new THREE.SphereGeometry(140, 32, 18);
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.skyUniforms,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, this.skyMat);
    this.group.add(this.skyDome);
  }

  createSunAndMoon() {
    // A. 3D Voxel Sun (Positioned in open upper-left sky, avoiding top HUD)
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(22, 19, 45);

    const sunCoreGeo = new THREE.BoxGeometry(5.2, 5.2, 2.2);
    this.sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Warm golden yellow
    this.sunCore = new THREE.Mesh(sunCoreGeo, this.sunCoreMat);
    this.sunGroup.add(this.sunCore);

    const sunGlowGeo = new THREE.BoxGeometry(7.2, 7.2, 2.5);
    this.sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber corona glow
      transparent: true,
      opacity: 0.52
    });
    this.sunGlow = new THREE.Mesh(sunGlowGeo, this.sunGlowMat);
    this.sunGroup.add(this.sunGlow);

    this.group.add(this.sunGroup);

    // B. 3D Voxel Crescent Moon
    this.moonGroup = new THREE.Group();
    this.moonGroup.position.set(16, 36, 50);

    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const moonGlowMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35
    });

    // Build stepped voxel crescent blocks
    const crescentBlocks = [
      [-0.4, 0, 0, 1.2, 4.4, 1.5],
      [0.6, 1.4, 0, 1.2, 1.6, 1.5],
      [0.6, -1.4, 0, 1.2, 1.6, 1.5],
      [1.4, 1.8, 0, 1.0, 1.0, 1.5],
      [1.4, -1.8, 0, 1.0, 1.0, 1.5]
    ];

    crescentBlocks.forEach(([bx, by, bz, bw, bh, bd]) => {
      const block = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), moonMat);
      block.position.set(bx, by, bz);
      this.moonGroup.add(block);
    });

    const moonAura = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6.5, 2.0), moonGlowMat);
    this.moonGroup.add(moonAura);

    this.moonGroup.visible = false;
    this.group.add(this.moonGroup);
  }

  createStarField() {
    this.starCount = 200;
    const starGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    this.starMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });

    this.starsMesh = new THREE.InstancedMesh(starGeo, this.starMat, this.starCount);
    const dummy = new THREE.Object3D();

    this.starOffsets = [];

    for (let i = 0; i < this.starCount; i++) {
      // Scatter in upper hemisphere dome
      const theta = Math.random() * Math.PI * 2;
      const phi = 0.2 + Math.random() * 1.1; // elevation angle
      const radius = 95 + Math.random() * 25;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = Math.max(12, radius * Math.cos(phi));
      const z = radius * Math.sin(phi) * Math.sin(theta);

      dummy.position.set(x, y, z);
      const s = 0.6 + Math.random() * 0.9;
      dummy.scale.set(s, s, s);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.updateMatrix();

      this.starsMesh.setMatrixAt(i, dummy.matrix);
      this.starOffsets.push(Math.random() * Math.PI * 2);
    }

    this.starsMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.starsMesh);
  }

  createVoxelClouds() {
    this.cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });

    const cloudCount = 18;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.buildSingleCloud();
      // Scatter across sky (lower altitude so visible in shoulder & focus views)
      cloud.position.x = -65 + (i * 135 / cloudCount) + (Math.random() * 6 - 3);
      cloud.position.y = 8 + Math.random() * 14;
      cloud.position.z = 10 + Math.random() * 50;

      cloud.userData = {
        speed: 1.2 + Math.random() * 1.8,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: 0.6 + Math.random() * 0.8,
        baseY: cloud.position.y
      };

      this.clouds.push(cloud);
      this.group.add(cloud);
    }
  }

  buildSingleCloud() {
    const group = new THREE.Group();
    const scale = 0.8 + Math.random() * 0.7;

    // Crossy Road chunky block composition
    const blocks = [
      // Core base block
      { w: 5.4 * scale, h: 1.6 * scale, d: 2.8 * scale, x: 0, y: 0, z: 0 },
      // Top puff
      { w: 3.2 * scale, h: 1.4 * scale, d: 2.2 * scale, x: -0.4 * scale, y: 1.1 * scale, z: 0.2 * scale },
      // Side block 1
      { w: 2.4 * scale, h: 1.2 * scale, d: 2.2 * scale, x: -2.8 * scale, y: -0.1 * scale, z: -0.2 * scale },
      // Side block 2
      { w: 2.2 * scale, h: 1.1 * scale, d: 2.0 * scale, x: 2.7 * scale, y: -0.2 * scale, z: 0.3 * scale }
    ];

    blocks.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, this.cloudMaterial);
      mesh.position.set(b.x, b.y, b.z);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      group.add(mesh);
    });

    return group;
  }

  setWeather(weatherType) {
    this.currentWeather = weatherType;
    const p = this.palettes[weatherType] || this.palettes.sunny;

    this.targetTopColor.copy(p.top);
    this.targetBottomColor.copy(p.bottom);
    this.targetCloudColor.copy(p.cloudColor);

    if (p.sunColor) this.sunCoreMat.color.copy(p.sunColor);
    if (p.sunGlowColor) this.sunGlowMat.color.copy(p.sunGlowColor);
    if (p.moonColor) this.moonGroup.children[0].material.color.copy(p.moonColor);
  }

  triggerLightningFlash() {
    this.flashIntensity = 1.0;
  }

  update(dt, camera) {
    const time = performance.now() * 0.001;

    // 1. Follow camera in X/Z to keep horizon centered
    if (camera) {
      this.group.position.x = camera.position.x;
      this.group.position.z = camera.position.z * 0.4;
    }

    // 2. Smoothly lerp sky gradient colors
    const lerpSpeed = Math.min(1, dt * 3.5);
    this.currentTopColor.lerp(this.targetTopColor, lerpSpeed);
    this.currentBottomColor.lerp(this.targetBottomColor, lerpSpeed);
    this.currentCloudColor.lerp(this.targetCloudColor, lerpSpeed);
    this.cloudMaterial.color.copy(this.currentCloudColor);

    // 3. Handle Lightning Flash in Storm
    if (this.flashIntensity > 0) {
      this.flashIntensity -= dt * 4.5;
      const flashColor = new THREE.Color(0xf0fdf4).lerp(this.currentBottomColor, 1 - Math.max(0, this.flashIntensity));
      this.skyUniforms.bottomColor.value.copy(flashColor);
      this.cloudMaterial.color.setHex(0xe2e8f0);
    } else {
      this.skyUniforms.topColor.value.copy(this.currentTopColor);
      this.skyUniforms.bottomColor.value.copy(this.currentBottomColor);
    }

    // 4. Sun & Moon position and breathing
    const p = this.palettes[this.currentWeather] || this.palettes.sunny;

    // Sun
    if (p.sunVisible) {
      this.sunGroup.visible = true;
      this.sunGroup.position.y = THREE.MathUtils.lerp(this.sunGroup.position.y, p.sunElevation, lerpSpeed);
      const sunPulse = 1 + Math.sin(time * 2) * 0.04;
      this.sunGlow.scale.set(sunPulse, sunPulse, 1);
    } else {
      this.sunGroup.position.y = THREE.MathUtils.lerp(this.sunGroup.position.y, -10, lerpSpeed);
      if (this.sunGroup.position.y < -5) this.sunGroup.visible = false;
    }

    // Moon
    if (p.moonVisible) {
      this.moonGroup.visible = true;
      this.moonGroup.position.y = THREE.MathUtils.lerp(this.moonGroup.position.y, p.moonElevation || 34, lerpSpeed);
      const moonPulse = 1 + Math.sin(time * 1.5) * 0.03;
      this.moonGroup.scale.set(moonPulse, moonPulse, moonPulse);
    } else {
      this.moonGroup.position.y = THREE.MathUtils.lerp(this.moonGroup.position.y, -10, lerpSpeed);
      if (this.moonGroup.position.y < -5) this.moonGroup.visible = false;
    }

    // Stars
    if (p.starsVisible) {
      const targetOpacity = p.starAlpha || 1.0;
      this.starMat.opacity = THREE.MathUtils.lerp(this.starMat.opacity, targetOpacity, lerpSpeed);
      this.starsMesh.visible = this.starMat.opacity > 0.05;
      // Twinkle pulsation
      this.starMat.opacity = targetOpacity * (0.8 + Math.sin(time * 2.5) * 0.2);
    } else {
      this.starMat.opacity = THREE.MathUtils.lerp(this.starMat.opacity, 0, lerpSpeed);
      if (this.starMat.opacity < 0.02) this.starsMesh.visible = false;
    }

    // 5. Drifting Clouds animation
    const stormMult = this.currentWeather === 'storm' ? 2.4 : 1.0;
    this.clouds.forEach((cloud) => {
      const { speed, bobPhase, bobSpeed, baseY } = cloud.userData;
      cloud.position.x += speed * stormMult * dt;
      cloud.position.y = baseY + Math.sin(time * bobSpeed + bobPhase) * 0.4;

      // Wrap around when past boundary
      if (cloud.position.x > 75) {
        cloud.position.x = -75;
        cloud.userData.baseY = 8 + Math.random() * 14;
        cloud.position.z = 10 + Math.random() * 50;
      }
    });
  }
}
