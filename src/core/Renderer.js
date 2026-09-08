import * as THREE from 'three';

export class Renderer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    // Crossy Road style fog
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

    // Camera setup: Orthographic Camera for classic Crossy Road perspective
    this.frustumSize = 15;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      -50,
      100
    );

    // Standard Crossy Road 45-degree angle
    this.cameraOffset = new THREE.Vector3(-14, 18, -14);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    this.camera.position.copy(this.cameraOffset);
    this.camera.lookAt(this.cameraTarget);

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

    // Target for directional light to follow
    this.dirLightTarget = new THREE.Object3D();
    this.scene.add(this.dirLightTarget);
    this.dirLight.target = this.dirLightTarget;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    // Adapt frustum on narrow mobile screens so player has good view
    const viewSize = aspect < 1 ? this.frustumSize * 1.25 : this.frustumSize;

    this.camera.left = (-viewSize * aspect) / 2;
    this.camera.right = (viewSize * aspect) / 2;
    this.camera.top = viewSize / 2;
    this.camera.bottom = -viewSize / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  updateCamera(targetPos, dt) {
    // Camera smooth follow (lerp)
    this.cameraTarget.x = THREE.MathUtils.lerp(this.cameraTarget.x, targetPos.x * 0.4, dt * 5);
    this.cameraTarget.z = THREE.MathUtils.lerp(this.cameraTarget.z, targetPos.z, dt * 5);

    this.camera.position.x = this.cameraTarget.x + this.cameraOffset.x;
    this.camera.position.y = this.cameraOffset.y;
    this.camera.position.z = this.cameraTarget.z + this.cameraOffset.z;

    this.camera.lookAt(this.cameraTarget);

    // Keep sunlight centered near player
    this.dirLight.position.x = this.cameraTarget.x - 18;
    this.dirLight.position.z = this.cameraTarget.z - 12;
    this.dirLightTarget.position.copy(this.cameraTarget);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
