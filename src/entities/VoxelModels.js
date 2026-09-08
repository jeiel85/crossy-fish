import * as THREE from 'three';

// Shared materials cache for high performance
const matCache = new Map();

function getLambertMaterial(color, options = {}) {
  const key = `${color}_${JSON.stringify(options)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshLambertMaterial({ color, ...options }));
  }
  return matCache.get(key);
}

// 1. Voxel Fisherman Character
export function createFishermanModel() {
  const root = new THREE.Group();

  // Colors
  const skinMat = getLambertMaterial(0xffdbac);
  const clothesMat = getLambertMaterial(0x0284c7); // Blue angler overalls
  const bootsMat = getLambertMaterial(0x334155);
  const hatMat = getLambertMaterial(0xd97706); // Straw/Yellow fisherman hat
  const hatBandMat = getLambertMaterial(0xef4444);
  const rodMat = getLambertMaterial(0x78350f);
  const bobberMat = getLambertMaterial(0xef4444);
  const eyeMat = getLambertMaterial(0x0f172a);
  const hairMat = getLambertMaterial(0x451a03);

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.4);
  const body = new THREE.Mesh(bodyGeo, clothesMat);
  body.position.y = 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 0.9, 0);
  head.castShadow = true;
  root.add(head);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.44, 0.16, 0.44);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 1.05, 0);
  root.add(hair);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 0.92, 0.22);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 0.92, 0.22);
  root.add(leftEye);
  root.add(rightEye);

  // Fisherman Hat (Brim + Top)
  const brimGeo = new THREE.BoxGeometry(0.75, 0.06, 0.75);
  const brim = new THREE.Mesh(brimGeo, hatMat);
  brim.position.set(0, 1.12, 0);
  brim.castShadow = true;
  root.add(brim);

  const hatTopGeo = new THREE.BoxGeometry(0.46, 0.22, 0.46);
  const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
  hatTop.position.set(0, 1.25, 0);
  hatTop.castShadow = true;
  root.add(hatTop);

  const hatBandGeo = new THREE.BoxGeometry(0.48, 0.06, 0.48);
  const hatBand = new THREE.Mesh(hatBandGeo, hatBandMat);
  hatBand.position.set(0, 1.18, 0);
  root.add(hatBand);

  // Legs & Boots
  const legGeo = new THREE.BoxGeometry(0.18, 0.3, 0.22);
  const leftLeg = new THREE.Mesh(legGeo, bootsMat);
  leftLeg.position.set(-0.15, 0.15, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, bootsMat);
  rightLeg.position.set(0.15, 0.15, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  // Tackle Box on back
  const boxGeo = new THREE.BoxGeometry(0.35, 0.25, 0.18);
  const boxMat = getLambertMaterial(0x10b981);
  const tackleBox = new THREE.Mesh(boxGeo, boxMat);
  tackleBox.position.set(0, 0.52, -0.25);
  tackleBox.castShadow = true;
  root.add(tackleBox);

  // Right Arm holding Fishing Rod
  const armGeo = new THREE.BoxGeometry(0.14, 0.35, 0.14);
  const rightArm = new THREE.Mesh(armGeo, clothesMat);
  rightArm.position.set(0.32, 0.55, 0.1);
  rightArm.rotation.x = -Math.PI / 4;
  root.add(rightArm);

  // Fishing Rod
  const rodPivot = new THREE.Group();
  rodPivot.position.set(0.32, 0.65, 0.22);

  const poleGeo = new THREE.BoxGeometry(0.04, 0.9, 0.04);
  const pole = new THREE.Mesh(poleGeo, rodMat);
  pole.position.set(0, 0.4, 0.2);
  pole.rotation.x = Math.PI / 6;
  pole.castShadow = true;
  rodPivot.add(pole);

  // Fishing Bobber (dangles from rod tip)
  const bobberPivot = new THREE.Group();
  bobberPivot.position.set(0, 0.8, 0.5);

  const bobberGeo = new THREE.BoxGeometry(0.09, 0.12, 0.09);
  const bobber = new THREE.Mesh(bobberGeo, bobberMat);
  bobber.position.y = -0.3;
  bobber.castShadow = true;
  bobberPivot.add(bobber);

  // Tiny line
  const lineGeo = new THREE.BoxGeometry(0.01, 0.3, 0.01);
  const lineMat = getLambertMaterial(0xffffff, { transparent: true, opacity: 0.8 });
  const line = new THREE.Mesh(lineGeo, lineMat);
  line.position.y = -0.15;
  bobberPivot.add(line);

  rodPivot.add(bobberPivot);
  root.add(rodPivot);

  root.userData = {
    body,
    head,
    leftLeg,
    rightLeg,
    rightArm,
    rodPivot,
    bobberPivot
  };

  return root;
}

// 2. Voxel Swimming Fish
export function createFishModel(species, biome) {
  const root = new THREE.Group();
  const fishColor = species.rarity === 'legendary' 
    ? 0xfbbf24 
    : (species.rarity === 'rare' ? 0x38bdf8 : 0xf97316);

  const mat = getLambertMaterial(fishColor, {
    emissive: biome.id === 'cyber_river' ? fishColor : (species.rarity === 'legendary' ? 0x854d0e : 0x000000),
    emissiveIntensity: biome.id === 'cyber_river' ? 0.6 : 0.2
  });

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.4, 0.18, 0.16);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.castShadow = true;
  root.add(body);

  // Tail
  const tailGeo = new THREE.BoxGeometry(0.16, 0.24, 0.04);
  const tail = new THREE.Mesh(tailGeo, mat);
  tail.position.set(-0.25, 0, 0);
  root.add(tail);

  // Fin
  const finGeo = new THREE.BoxGeometry(0.12, 0.12, 0.04);
  const fin = new THREE.Mesh(finGeo, mat);
  fin.position.set(0.05, 0.12, 0);
  root.add(fin);

  // Eyes
  const eyeMat = getLambertMaterial(0xffffff);
  const eyePupilMat = getLambertMaterial(0x0f172a);
  const eyeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.02);

  const eye1 = new THREE.Mesh(eyeGeo, eyePupilMat);
  eye1.position.set(0.12, 0.04, 0.09);
  const eye2 = new THREE.Mesh(eyeGeo, eyePupilMat);
  eye2.position.set(0.12, 0.04, -0.09);
  root.add(eye1);
  root.add(eye2);

  root.userData = { tail, body, species };
  return root;
}

// 3. Voxel Trees
export function createTreeModel(biome) {
  const root = new THREE.Group();

  if (biome.id === 'tropical_reef') {
    // Palm Tree
    const trunkMat = getLambertMaterial(biome.colors.treeTrunk);
    const leafMat = getLambertMaterial(biome.colors.treeLeaf);

    // Segmented curved trunk
    for (let i = 0; i < 4; i++) {
      const segGeo = new THREE.BoxGeometry(0.24 - i * 0.02, 0.5, 0.24 - i * 0.02);
      const seg = new THREE.Mesh(segGeo, trunkMat);
      seg.position.set(Math.sin(i * 0.3) * 0.1, 0.25 + i * 0.45, 0);
      seg.rotation.z = -i * 0.08;
      seg.castShadow = true;
      root.add(seg);
    }

    // Palm Leaves (cross fan)
    const leafGeo = new THREE.BoxGeometry(1.2, 0.08, 0.3);
    for (let j = 0; j < 4; j++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.15, 2.0, 0);
      leaf.rotation.y = (j * Math.PI) / 2;
      leaf.rotation.z = -0.2;
      leaf.castShadow = true;
      root.add(leaf);
    }
  } else if (biome.id === 'frozen_glacier') {
    // Snowy Pine Tree
    const trunkMat = getLambertMaterial(biome.colors.treeTrunk);
    const trunkGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.4;
    trunk.castShadow = true;
    root.add(trunk);

    const snowMat = getLambertMaterial(0xffffff);
    const pineMat = getLambertMaterial(0x1e3a5f);

    const tiers = [
      { size: 1.1, y: 0.9, height: 0.5 },
      { size: 0.8, y: 1.3, height: 0.45 },
      { size: 0.5, y: 1.65, height: 0.4 }
    ];

    tiers.forEach((t) => {
      const pine = new THREE.Mesh(new THREE.BoxGeometry(t.size, t.height, t.size), pineMat);
      pine.position.y = t.y;
      pine.castShadow = true;
      root.add(pine);

      // Snow cap
      const snow = new THREE.Mesh(new THREE.BoxGeometry(t.size * 0.95, 0.1, t.size * 0.95), snowMat);
      snow.position.y = t.y + t.height / 2 + 0.05;
      root.add(snow);
    });
  } else if (biome.id === 'magma_inferno') {
    // Volcanic Basalt Pillar / Burning crystal
    const rockMat = getLambertMaterial(0x27272a);
    const lavaMat = getLambertMaterial(0xf97316, { emissive: 0xea580c, emissiveIntensity: 0.6 });

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.4), rockMat);
    pillar.position.y = 0.7;
    pillar.castShadow = true;
    root.add(pillar);

    const topShard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.28), lavaMat);
    topShard.position.set(0.04, 1.5, -0.04);
    topShard.rotation.y = Math.PI / 4;
    topShard.castShadow = true;
    root.add(topShard);
  } else if (biome.id === 'cyber_river') {
    // Cyber Neon Pylon
    const pylonMat = getLambertMaterial(0x1e1b4b);
    const neonMat = getLambertMaterial(0x06b6d4, { emissive: 0x06b6d4, emissiveIntensity: 0.9 });

    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.8, 0.3), pylonMat);
    pylon.position.y = 0.9;
    pylon.castShadow = true;
    root.add(pylon);

    // Glowing rings
    [0.6, 1.2, 1.7].forEach(y => {
      const ring = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.4), neonMat);
      ring.position.y = y;
      root.add(ring);
    });
  } else {
    // Standard Forest Tree (Emerald Creek)
    const trunkMat = getLambertMaterial(biome.colors.treeTrunk);
    const leafMat = getLambertMaterial(biome.colors.treeLeaf);
    const leafDarkMat = getLambertMaterial(0x15803d);

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.28), trunkMat);
    trunk.position.y = 0.4;
    trunk.castShadow = true;
    root.add(trunk);

    const foliage1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 1.0), leafDarkMat);
    foliage1.position.y = 1.0;
    foliage1.castShadow = true;
    root.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), leafMat);
    foliage2.position.y = 1.45;
    foliage2.castShadow = true;
    root.add(foliage2);
  }

  return root;
}

// 4. Voxel Floating Logs / Lily Pads / Ice Floes
export function createLogModel(length = 2.5, biome) {
  const root = new THREE.Group();

  if (biome.id === 'frozen_glacier') {
    // Floating Ice Sheet
    const iceMat = getLambertMaterial(0xbae6fd, { transparent: true, opacity: 0.9 });
    const snowMat = getLambertMaterial(0xffffff);

    const ice = new THREE.Mesh(new THREE.BoxGeometry(length, 0.28, 0.85), iceMat);
    ice.position.y = 0.08;
    ice.castShadow = true;
    ice.receiveShadow = true;
    root.add(ice);

    const snowTop = new THREE.Mesh(new THREE.BoxGeometry(length * 0.85, 0.05, 0.65), snowMat);
    snowTop.position.y = 0.23;
    root.add(snowTop);
  } else if (biome.id === 'magma_inferno') {
    // Hardened Obsidian Floating Raft
    const slabMat = getLambertMaterial(0x3f3f46);
    const glowMat = getLambertMaterial(0xf97316, { emissive: 0xf97316, emissiveIntensity: 0.5 });

    const slab = new THREE.Mesh(new THREE.BoxGeometry(length, 0.25, 0.85), slabMat);
    slab.position.y = 0.08;
    slab.castShadow = true;
    slab.receiveShadow = true;
    root.add(slab);

    const rune = new THREE.Mesh(new THREE.BoxGeometry(length * 0.7, 0.04, 0.15), glowMat);
    rune.position.y = 0.21;
    root.add(rune);
  } else if (biome.id === 'cyber_river') {
    // Neon Hover Platform
    const baseMat = getLambertMaterial(0x0f172a);
    const neonMat = getLambertMaterial(0x06b6d4, { emissive: 0x06b6d4, emissiveIntensity: 0.8 });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, 0.85), baseMat);
    platform.position.y = 0.08;
    platform.castShadow = true;
    root.add(platform);

    const strip = new THREE.Mesh(new THREE.BoxGeometry(length * 0.92, 0.04, 0.08), neonMat);
    strip.position.set(0, 0.19, 0.35);
    const strip2 = new THREE.Mesh(new THREE.BoxGeometry(length * 0.92, 0.04, 0.08), neonMat);
    strip2.position.set(0, 0.19, -0.35);
    root.add(strip);
    root.add(strip2);
  } else {
    // Natural Wooden Log
    const barkMat = getLambertMaterial(biome.colors.log);
    const woodCoreMat = getLambertMaterial(0xd97706);

    const log = new THREE.Mesh(new THREE.BoxGeometry(length, 0.35, 0.8), barkMat);
    log.position.y = 0.1;
    log.castShadow = true;
    log.receiveShadow = true;
    root.add(log);

    // End rings
    const endGeo = new THREE.BoxGeometry(0.04, 0.26, 0.65);
    const end1 = new THREE.Mesh(endGeo, woodCoreMat);
    end1.position.set(length / 2 + 0.01, 0.1, 0);
    const end2 = new THREE.Mesh(endGeo, woodCoreMat);
    end2.position.set(-length / 2 - 0.01, 0.1, 0);
    root.add(end1);
    root.add(end2);
  }

  return root;
}

// 5. Voxel Lily Pad
export function createLilyPadModel() {
  const root = new THREE.Group();
  const padMat = getLambertMaterial(0x22c55e);
  const flowerMat = getLambertMaterial(0xf472b6);
  const centerMat = getLambertMaterial(0xfde047);

  // Circular-ish octagon pad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.85), padMat);
  pad.position.y = 0.02;
  pad.castShadow = true;
  pad.receiveShadow = true;
  root.add(pad);

  // Tiny Lotus Flower
  const petal = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.2), flowerMat);
  petal.position.set(0.18, 0.08, 0.18);
  root.add(petal);

  const center = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), centerMat);
  center.position.set(0.18, 0.1, 0.18);
  root.add(center);

  return root;
}

// 6. Voxel Speedboats & Water Hazards
export function createBoatModel(biome) {
  const root = new THREE.Group();

  const hullColor = biome.id === 'tropical_reef' ? 0x0284c7 : (biome.id === 'cyber_river' ? 0x9333ea : 0xef4444);
  const hullMat = getLambertMaterial(hullColor);
  const deckMat = getLambertMaterial(0xffffff);
  const glassMat = getLambertMaterial(0x38bdf8, { transparent: true, opacity: 0.7 });
  const lampMat = getLambertMaterial(0xfef08a, { emissive: 0xfef08a, emissiveIntensity: 0.8 });

  // Main Hull
  const hullGeo = new THREE.BoxGeometry(2.0, 0.45, 0.85);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.22;
  hull.castShadow = true;
  root.add(hull);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(0.8, 0.4, 0.7);
  const cabin = new THREE.Mesh(cabinGeo, deckMat);
  cabin.position.set(-0.2, 0.6, 0);
  cabin.castShadow = true;
  root.add(cabin);

  // Windshield
  const windshieldGeo = new THREE.BoxGeometry(0.1, 0.3, 0.65);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0.22, 0.62, 0);
  root.add(windshield);

  // Headlights
  const headGeo = new THREE.BoxGeometry(0.05, 0.1, 0.1);
  const headL = new THREE.Mesh(headGeo, lampMat);
  headL.position.set(1.02, 0.25, 0.25);
  const headR = new THREE.Mesh(headGeo, lampMat);
  headR.position.set(1.02, 0.25, -0.25);
  root.add(headL);
  root.add(headR);

  return root;
}

// 7. Voxel Impatience Eagle / Pelican
export function createEagleModel() {
  const root = new THREE.Group();

  const featherMat = getLambertMaterial(0x451a03);
  const headMat = getLambertMaterial(0xffffff);
  const beakMat = getLambertMaterial(0xf59e0b);

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.5, 1.0);
  const body = new THREE.Mesh(bodyGeo, featherMat);
  body.castShadow = true;
  root.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.45);
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 0.2, 0.65);
  root.add(head);

  // Beak
  const beakGeo = new THREE.BoxGeometry(0.2, 0.18, 0.35);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.12, 0.98);
  root.add(beak);

  // Left Wing
  const wingGeo = new THREE.BoxGeometry(1.4, 0.1, 0.7);
  const leftWing = new THREE.Mesh(wingGeo, featherMat);
  leftWing.position.set(-1.0, 0.1, 0);
  root.add(leftWing);

  // Right Wing
  const rightWing = new THREE.Mesh(wingGeo, featherMat);
  rightWing.position.set(1.0, 0.1, 0);
  root.add(rightWing);

  root.userData = { leftWing, rightWing };
  return root;
}
