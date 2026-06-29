const CONFIG = {
  canvas: {
    width:   720,
    height:  180,
    groundY: 148,
  },

  hero: {
    screenX:         140,
    spriteW:         105,
    spriteH:         105,
    groundOffset:    0.35,
    walkSpeed:       1.0,
    baseMaxHp:       100,
    baseAttack:        10,
    attackType:       'range',
    attackRange:      320,
    attackCooldownMs: 900,
    arrowOffsetX:     0.2,
    arrowOffsetY:     0.5,
    xpToLevelBase:   100,
    xpToLevelGrowth: 1.35,
  },

  gameSpeed: 1.0,
  hpBarPer10: 8,  // px de barra por cada 10 pontos de HP
};

const ITEMS = {
  wolf_pelt: { id: 'wolf_pelt', name: 'Pele de Lobo',  icon: '🐾' },
  wolf_fang: { id: 'wolf_fang', name: 'Presa de Lobo', icon: '🦷' },
};

const CHESTS = {
  normal:    { id: 'normal',    name: 'Baú Normal',   icon: '📦', color: '#a0856c', lootTable: [] },
  rare:      { id: 'rare',      name: 'Baú Raro',     icon: '💎', color: '#5b8dd9', lootTable: [] },
  mythic:    { id: 'mythic',    name: 'Baú Mítico',   icon: '🔮', color: '#b06cd4', lootTable: [] },
  legendary: { id: 'legendary', name: 'Baú Lendário', icon: '👑', color: '#e8a020', lootTable: [] },
};

const MOBS = {
  wolf: {
    id:              'wolf',
    name:            'Lobo',
    attackType:      'melee',
    fase:            1,
    hp:              30,
    attack:          5,
    attackRange:     25,
    attackCooldownMs: 300,
    approachSpeed:   1.5,
    spawnIntervalMs: [3000, 5000],
    xpReward:        18,
    goldReward:      5,
    chestDrops: [
      { rarity: 'normal', chance: 0.10 },
      { rarity: 'rare',   chance: 0.04 },
    ],
    spriteW:       105,
    spriteH:       105,
    groundOffset:  0.35,
    frameDuration:    40,
    walkFrames:       7,
    spritePath:       'assets/sprites/mob/wolf/walk_frame_',
    atkFrames:        5,
    atkFrameDuration: 80,
    atkSpritePath:    'assets/sprites/mob/wolf/atk_frame_',
  },
};
