// Biome configurations and stage definitions for Crossy Fish

export const BIOMES = [
  {
    id: 'emerald_creek',
    name: '에메랄드 시냇가',
    nameEn: 'Emerald Creek',
    icon: '🌲',
    stepThreshold: 0,
    colors: {
      grass: 0x48bb78,
      grassDark: 0x38a169,
      water: 0x38bdf8,
      waterDeep: 0x0284c7,
      log: 0x854d0e,
      rock: 0x94a3b8,
      treeLeaf: 0x22c55e,
      treeTrunk: 0x78350f,
      ambient: 0xffffff,
      fog: 0xdbeafe
    },
    fishSpecies: [
      { name: '피라미', nameEn: 'Minnow', emoji: '🐟', rarity: 'common', points: 30, weight: 45 },
      { name: '붕어', nameEn: 'Crucian Carp', emoji: '🐡', rarity: 'common', points: 60, weight: 30 },
      { name: '무지개 송어', nameEn: 'Rainbow Trout', emoji: '🐠', rarity: 'rare', points: 150, weight: 18 },
      { name: '황금 잉어', nameEn: 'Golden Carp', emoji: '✨', rarity: 'legendary', points: 400, weight: 7 }
    ]
  },
  {
    id: 'tropical_reef',
    name: '트로피컬 산호초',
    nameEn: 'Tropical Reef',
    icon: '🏝️',
    stepThreshold: 25,
    colors: {
      grass: 0xfef08a, // Sand
      grassDark: 0xfde047,
      water: 0x06b6d4, // Turquoise
      waterDeep: 0x0891b2,
      log: 0xd97706, // Bamboo / Driftwood
      rock: 0xfb923c, // Coral rock
      treeLeaf: 0x10b981, // Palm frond
      treeTrunk: 0xb45309,
      ambient: 0xffedd5,
      fog: 0xcffafe
    },
    fishSpecies: [
      { name: '흰동가리', nameEn: 'Clownfish', emoji: '🐠', rarity: 'common', points: 50, weight: 40 },
      { name: '블루탱', nameEn: 'Blue Tang', emoji: '🐟', rarity: 'common', points: 80, weight: 30 },
      { name: '청새치', nameEn: 'Blue Marlin', emoji: '🐬', rarity: 'rare', points: 200, weight: 20 },
      { name: '황금 가오리', nameEn: 'Golden Manta', emoji: '🌟', rarity: 'legendary', points: 500, weight: 10 }
    ]
  },
  {
    id: 'frozen_glacier',
    name: '빙하 설원',
    nameEn: 'Frozen Glacier',
    icon: '❄️',
    stepThreshold: 55,
    colors: {
      grass: 0xf1f5f9, // Snow
      grassDark: 0xe2e8f0,
      water: 0x0284c7, // Freezing deep blue
      waterDeep: 0x0369a1,
      log: 0xbae6fd, // Ice floe
      rock: 0x93c5fd,
      treeLeaf: 0xe0f2fe, // Frosted pine
      treeTrunk: 0x475569,
      ambient: 0xf0f9ff,
      fog: 0xe0f2fe
    },
    fishSpecies: [
      { name: '빙어', nameEn: 'Smelt', emoji: '🐟', rarity: 'common', points: 70, weight: 40 },
      { name: '북극 송어', nameEn: 'Arctic Char', emoji: '🐠', rarity: 'rare', points: 180, weight: 30 },
      { name: '대왕 킹크랩', nameEn: 'King Crab', emoji: '🦀', rarity: 'rare', points: 280, weight: 20 },
      { name: '빙하 수호 고래', nameEn: 'Glacier Leviathan', emoji: '🐋', rarity: 'legendary', points: 650, weight: 10 }
    ]
  },
  {
    id: 'magma_inferno',
    name: '마그마 협곡',
    nameEn: 'Magma Inferno',
    icon: '🌋',
    stepThreshold: 90,
    colors: {
      grass: 0x27272a, // Basalt obsidian
      grassDark: 0x18181b,
      water: 0xf97316, // Glowing Lava
      waterDeep: 0xea580c,
      log: 0x3f3f46, // Hardened obsidian slab
      rock: 0x71717a,
      treeLeaf: 0xd97706, // Fire embers
      treeTrunk: 0x27272a,
      ambient: 0xffedd5,
      fog: 0x451a03
    },
    fishSpecies: [
      { name: '불 피라미', nameEn: 'Fire Minnow', emoji: '🔥', rarity: 'common', points: 100, weight: 40 },
      { name: '용암 메기', nameEn: 'Magma Catfish', emoji: '🐡', rarity: 'rare', points: 250, weight: 30 },
      { name: '흑요석 아귀', nameEn: 'Obsidian Angler', emoji: '🐙', rarity: 'rare', points: 380, weight: 20 },
      { name: '불사조 용어', nameEn: 'Phoenix Dragonfish', emoji: '🐉', rarity: 'legendary', points: 800, weight: 10 }
    ]
  },
  {
    id: 'cyber_river',
    name: '사이버 2077 네온',
    nameEn: 'Cyber River 2077',
    icon: '🏙️',
    stepThreshold: 130,
    colors: {
      grass: 0x0f172a, // Dark synthwave road
      grassDark: 0x020617,
      water: 0xa855f7, // Digital purple/cyan stream
      waterDeep: 0x7e22ce,
      log: 0x06b6d4, // Neon hover platform
      rock: 0xec4899,
      treeLeaf: 0x06b6d4, // Holographic polygon foliage
      treeTrunk: 0x334155,
      ambient: 0xfdf4ff,
      fog: 0x3b0764
    },
    fishSpecies: [
      { name: '글리치 테트라', nameEn: 'Glitch Tetra', emoji: '👾', rarity: 'common', points: 150, weight: 40 },
      { name: '홀로그램 농어', nameEn: 'Holo Bass', emoji: '✨', rarity: 'rare', points: 350, weight: 30 },
      { name: '사이버 샤크', nameEn: 'Cybernetic Shark', emoji: '🦈', rarity: 'rare', points: 500, weight: 20 },
      { name: '2077 메가 네온 웨일', nameEn: '2077 Mega Whale', emoji: '🛸', rarity: 'legendary', points: 1000, weight: 10 }
    ]
  }
];

export function getBiomeForLane(laneIndex) {
  for (let i = BIOMES.length - 1; i >= 0; i--) {
    if (laneIndex >= BIOMES[i].stepThreshold) {
      return BIOMES[i];
    }
  }
  return BIOMES[0];
}

export function getRandomFishForBiome(biome) {
  const species = biome.fishSpecies;
  const totalWeight = species.reduce((acc, cur) => acc + cur.weight, 0);
  let random = Math.random() * totalWeight;

  for (const s of species) {
    if (random < s.weight) {
      return s;
    }
    random -= s.weight;
  }
  return species[0];
}
