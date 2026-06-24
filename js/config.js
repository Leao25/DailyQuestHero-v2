const CONFIG = {
  // gameSpeed: multiplica walkSpeed, approachSpeed e reduz cooldowns
  // 1.0 = normal, 1.5 = 50% mais rápido, 2.0 = dobro
  gameSpeed: 1.0,

  canvas: {
    width:   1152,
    height:  648,
    groundY: 600,
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

  waves: {
    // ondas por fase — aumenta com o número da fase
    // fase 1 = 5 ondas, fase 2 = 6, fase 3 = 7... (wavesBase + faseAtual)
    wavesBase:      4,
    wavesPerPhase:  1,    // +1 onda por fase
    wavesMax:       20,   // cap máximo de ondas por fase

    // distribuição dos períodos (porcentagem do total de ondas)
    morningUntil:   0.40, // 0–40%   = manhã
    afternoonUntil: 0.80, // 40–80%  = tarde
                          // 80–100% = noite + boss

    // mobs por onda — aumenta com o número da onda
    mobsPerWave:    5,
    mobsGrowth:     1,    // +1 mob por onda dentro da fase
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
