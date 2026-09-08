// Biome configurations and stage definitions for Crossy Angler

export const BIOMES = [
  {
    id: 'emerald_creek',
    stageIndex: 0,
    name: '평화로운 에메랄드 호수',
    nameEn: 'Emerald Lake Pier',
    icon: '🌲',
    targetCatches: 4,
    description: '버드나무와 연꽃이 피어있는 평화로운 호숫가 목재 선착장',
    colors: {
      dock: 0x854d0e,
      ground: 0x48bb78,
      groundDark: 0x38a169,
      water: 0x38bdf8,
      waterDeep: 0x0284c7,
      waterFoam: 0xe0f2fe,
      rock: 0x94a3b8,
      treeLeaf: 0x22c55e,
      treeTrunk: 0x78350f,
      ambient: 0xffffff,
      fog: 0xdbeafe
    },
    fishSpecies: [
      { id: 'minnow', name: '피라미', nameEn: 'Minnow', emoji: '🐟', rarity: 'common', points: 40, sizeRange: [8, 16], weight: 45 },
      { id: 'carp', name: '붕어', nameEn: 'Crucian Carp', emoji: '🐡', rarity: 'common', points: 80, sizeRange: [18, 32], weight: 30 },
      { id: 'trout', name: '무지개 송어', nameEn: 'Rainbow Trout', emoji: '🐠', rarity: 'rare', points: 180, sizeRange: [30, 55], weight: 18 },
      { id: 'golden_carp', name: '대왕 황금 잉어', nameEn: 'Golden Carp', emoji: '✨', rarity: 'legendary', points: 500, sizeRange: [60, 95], weight: 7 }
    ]
  },
  {
    id: 'tropical_reef',
    stageIndex: 1,
    name: '트로피컬 산호초 라군',
    nameEn: 'Tropical Lagoon',
    icon: '🏝️',
    targetCatches: 8,
    description: '새하얀 모래사장과 에메랄드빛 산호초가 펼쳐진 남태평양 라군',
    colors: {
      dock: 0xd97706, // Driftwood dock
      ground: 0xfef08a, // Sand
      groundDark: 0xfde047,
      water: 0x06b6d4, // Turquoise
      waterDeep: 0x0891b2,
      waterFoam: 0xcffafe,
      rock: 0xfb923c, // Coral
      treeLeaf: 0x10b981,
      treeTrunk: 0xb45309,
      ambient: 0xffedd5,
      fog: 0xcffafe
    },
    fishSpecies: [
      { id: 'clownfish', name: '흰동가리', nameEn: 'Clownfish', emoji: '🐠', rarity: 'common', points: 60, sizeRange: [7, 14], weight: 40 },
      { id: 'blue_tang', name: '블루탱', nameEn: 'Blue Tang', emoji: '🐟', rarity: 'common', points: 100, sizeRange: [15, 28], weight: 30 },
      { id: 'manta', name: '만타 가오리', nameEn: 'Manta Ray', emoji: '🌟', rarity: 'rare', points: 260, sizeRange: [80, 160], weight: 20 },
      { id: 'marlin', name: '전설의 청새치', nameEn: 'Blue Marlin', emoji: '🐬', rarity: 'legendary', points: 650, sizeRange: [180, 320], weight: 10 }
    ]
  },
  {
    id: 'frozen_glacier',
    stageIndex: 2,
    name: '북극 빙하 얼음 낚시',
    nameEn: 'Glacier Ice Fishing',
    icon: '❄️',
    targetCatches: 12,
    description: '두껍게 얼어붙은 얼음판을 뚫고 즐기는 영하 30도 극한의 손맛',
    colors: {
      dock: 0xbae6fd, // Ice platform
      ground: 0xf1f5f9, // Snow
      groundDark: 0xe2e8f0,
      water: 0x0284c7, // Freezing deep blue
      waterDeep: 0x0369a1,
      waterFoam: 0xffffff,
      rock: 0x93c5fd,
      treeLeaf: 0xe0f2fe,
      treeTrunk: 0x475569,
      ambient: 0xf0f9ff,
      fog: 0xe0f2fe
    },
    fishSpecies: [
      { id: 'smelt', name: '빙어', nameEn: 'Smelt', emoji: '🐟', rarity: 'common', points: 80, sizeRange: [10, 18], weight: 40 },
      { id: 'char', name: '북극 곤들매기', nameEn: 'Arctic Char', emoji: '🐠', rarity: 'rare', points: 220, sizeRange: [35, 65], weight: 30 },
      { id: 'kingcrab', name: '대왕 킹크랩', nameEn: 'Giant King Crab', emoji: '🦀', rarity: 'rare', points: 350, sizeRange: [50, 90], weight: 20 },
      { id: 'glacier_whale', name: '빙하 수호 고래', nameEn: 'Glacier Leviathan', emoji: '🐋', rarity: 'legendary', points: 800, sizeRange: [300, 550], weight: 10 }
    ]
  },
  {
    id: 'magma_inferno',
    stageIndex: 3,
    name: '화산 칼데라 용암 낚시',
    nameEn: 'Magma Caldera',
    icon: '🌋',
    targetCatches: 16,
    description: '흑요석 바위 위에서 끓어오르는 용암 속 화염 생명체를 낚는 화산지대',
    colors: {
      dock: 0x3f3f46, // Obsidian rock pier
      ground: 0x27272a, // Basalt
      groundDark: 0x18181b,
      water: 0xf97316, // Glowing Lava
      waterDeep: 0xea580c,
      waterFoam: 0xfef08a,
      rock: 0x71717a,
      treeLeaf: 0xd97706,
      treeTrunk: 0x27272a,
      ambient: 0xffedd5,
      fog: 0x451a03
    },
    fishSpecies: [
      { id: 'fire_minnow', name: '불 피라미', nameEn: 'Fire Minnow', emoji: '🔥', rarity: 'common', points: 120, sizeRange: [12, 22], weight: 40 },
      { id: 'magma_catfish', name: '용암 메기', nameEn: 'Magma Catfish', emoji: '🐡', rarity: 'rare', points: 300, sizeRange: [40, 75], weight: 30 },
      { id: 'obsidian_angler', name: '흑요석 아귀', nameEn: 'Obsidian Angler', emoji: '🐙', rarity: 'rare', points: 450, sizeRange: [55, 95], weight: 20 },
      { id: 'phoenix_fish', name: '불사조 용어', nameEn: 'Phoenix Dragonfish', emoji: '🐉', rarity: 'legendary', points: 1000, sizeRange: [120, 240], weight: 10 }
    ]
  },
  {
    id: 'cyber_river',
    stageIndex: 4,
    name: '사이버 2077 네온 운하',
    nameEn: 'Cyber Neon Canal',
    icon: '🏙️',
    targetCatches: 20,
    description: '신스웨이브 네온 불빛과 홀로그램이 반사되는 2077년 미래 사이버 도시',
    colors: {
      dock: 0x0f172a, // Cyber metal pier
      ground: 0x020617,
      groundDark: 0x0f172a,
      water: 0xa855f7, // Digital stream
      waterDeep: 0x7e22ce,
      waterFoam: 0x06b6d4,
      rock: 0xec4899,
      treeLeaf: 0x06b6d4,
      treeTrunk: 0x334155,
      ambient: 0xfdf4ff,
      fog: 0x3b0764
    },
    fishSpecies: [
      { id: 'glitch_tetra', name: '글리치 테트라', nameEn: 'Glitch Tetra', emoji: '👾', rarity: 'common', points: 160, sizeRange: [10, 20], weight: 40 },
      { id: 'holo_bass', name: '홀로그램 농어', nameEn: 'Holo Bass', emoji: '✨', rarity: 'rare', points: 400, sizeRange: [40, 70], weight: 30 },
      { id: 'cyber_shark', name: '사이버네틱 샤크', nameEn: 'Cyber Shark', emoji: '🦈', rarity: 'rare', points: 600, sizeRange: [90, 170], weight: 20 },
      { id: 'mega_whale', name: '2077 메가 네온 웨일', nameEn: '2077 Mega Whale', emoji: '🛸', rarity: 'legendary', points: 1500, sizeRange: [250, 600], weight: 10 }
    ]
  }
];

export function getBiomeByIndex(index) {
  const safeIdx = ((index % BIOMES.length) + BIOMES.length) % BIOMES.length;
  return BIOMES[safeIdx];
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
