const CONFIG = {
  canvas: {
    width:   1152,
    height:  648,
    groundY: 480,
  },

  hero: {
    screenX:         280,
    spriteW:         48,
    spriteH:         68,
    walkSpeed:       2.0,
    baseMaxHp:       100,
    baseAttack:      10,
    attackRange:     60,
    attackCooldownMs:900,
    xpToLevelBase:   100,
    xpToLevelGrowth: 1.35,
  },

  mob: {
    spawnIntervalMs:    [1500, 2500],
    approachSpeed:      0.8,
    baseHp:             30,
    baseAttack:         5,
    attackRange:        50,
    attackCooldownMs:   1200,
    baseXpReward:       18,
    spawnAheadDistance: 900,
  },
};
