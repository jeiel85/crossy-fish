import * as THREE from 'three';

export const CAMERA_MODES = [
  { id: 'isometric', name: '클래식 (아이소)', icon: '📐' },
  { id: 'shoulder', name: '3인칭 숄더뷰', icon: '🎬' },
  { id: 'focus', name: '찌 집중 뷰', icon: '🔍' },
  { id: 'topdown', name: '탑다운 조감뷰', icon: '🦅' }
];

export class Renderer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    // Scene fog & background
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.015);
    this.scene.background = new THREE.Color(0xdbeafe);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    // 1. Orthographic Camera (for Isometric & Top-down)
    this.frustumSize = 15;
    const aspect = window.innerWidth / window.innerHeight;
    this.orthoCamera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      -50,
      100
    );

    // 2. Perspective Camera (for Shoulder 3rd-person & Focus View)
    this.perspCamera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);

    // Camera Mode State
    this.cameraModeIndex = 0;
    this.cameraMode = CAMERA_MODES[0].id; // 'isometric'
    this.camera = this.orthoCamera;

    // Smooth Lerp targets
    this.cameraTarget = new THREE.Vector3(0, 0, 1.5);
    this.currentCamPos = new THREE.Vector3(-1.8, 16, -11.5);
    this.targetCamPos = new THREE.Vector3(-1.8, 16, -11.5);
    this.currentLookAt = new THREE.Vector3(0, 0, 1.5);
    this.targetLookAt = new THREE.Vector3(0, 0, 1.5);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffae0, 1.6);
    this.dirLight.position.set(-18, 28, -12);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 70;
    this.dirLight.shadow.camera.left = -16;
    this.dirLight.shadow.camera.right = 16;
    this.dirLight.shadow.camera.top = 16;
    this.dirLight.shadow.camera.bottom = -16;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    this.dirLightTarget = new THREE.Object3D();
    this.scene.add(this.dirLightTarget);
    this.dirLight.target = this.dirLightTarget;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  cycleCameraMode() {
    this.cameraModeIndex = (this.cameraModeIndex + 1) % CAMERA_MODES.length;
    const mode = CAMERA_MODES[this.cameraModeIndex];
    this.setCameraMode(mode.id);
    return mode;
  }

  setCameraMode(modeId) {
    const idx = CAMERA_MODES.findIndex(m => m.id === modeId);
    if (idx !== -1) {
      this.cameraModeIndex = idx;
      this.cameraMode = modeId;
    }

    if (this.cameraMode === 'shoulder' || this.cameraMode === 'focus') {
      this.camera = this.perspCamera;
    } else {
      this.camera = this.orthoCamera;
    }
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = aspect < 1 ? this.frustumSize * 1.25 : this.frustumSize;

    // Update Ortho
    this.orthoCamera.left = (-viewSize * aspect) / 2;
    this.orthoCamera.right = (viewSize * aspect) / 2;
    this.orthoCamera.top = viewSize / 2;
    this.orthoCamera.bottom = -viewSize / 2;
    this.orthoCamera.updateProjectionMatrix();

    // Update Persp
    this.perspCamera.aspect = aspect;
    this.perspCamera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  updateCamera(playerPos, dt, bobberPos = null) {
    const px = playerPos.x;
    const pz = playerPos.z;

    if (this.cameraMode === 'isometric') {
      // 1. Classic Isometric Orthographic View
      this.targetCamPos.set(px * 0.45 - 1.8, 16, pz + 4.5 - 11.5);
      this.targetLookAt.set(px * 0.45, 0, pz + 4.5);
    } else if (this.cameraMode === 'shoulder') {
      // 2. Immersive 3rd-Person Over-the-Shoulder View
      this.targetCamPos.set(px + 0.35, 1.85, pz - 2.8);
      this.targetLookAt.set(px, 0.6, pz + 6.0);
    } else if (this.cameraMode === 'focus') {
      // 3. Bobber Close-up Fishing Focus View
      const bx = bobberPos ? bobberPos.x : px;
      const bz = bobberPos ? bobberPos.z : pz + 4.5;
      this.targetCamPos.set(px * 0.5, 1.6, Math.max(-0.5, bz - 3.8));
      this.targetLookAt.set(bx, 0.1, bz);
    } else if (this.cameraMode === 'topdown') {
      // 4. Tactical Top-Down Bird's Eye View
      this.targetCamPos.set(px * 0.3, 20, pz + 3.5);
      this.targetLookAt.set(px * 0.3, 0, pz + 3.5);
    }

    // Smooth lerp
    this.currentCamPos.lerp(this.targetCamPos, dt * 6.5);
    this.currentLookAt.lerp(this.targetLookAt, dt * 6.5);

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

    // Keep sunlight centered
    this.dirLight.position.x = this.currentLookAt.x - 18;
    this.dirLight.position.z = this.currentLookAt.z - 12;
    this.dirLightTarget.position.copy(this.currentLookAt);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
