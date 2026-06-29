import type { MobDefinition, MobId } from '../types/mob.types'

export const MOB_DEFINITIONS: Record<MobId, MobDefinition> = {
  wolf: {
    id: 'wolf',
    name: 'Lobo',
    attackType: 'melee',
    fase: 1,
    hp: 30,
    attack: 5,
    attackRange: 25,
    attackCooldownMs: 300,
    approachSpeed: 1.5,
    spawnIntervalMs: [3000, 5000],
    xpReward: 18,
    goldReward: 5,
    chestDrops: [
      { rarity: 'normal', chance: 0.10 },
      { rarity: 'rare',   chance: 0.04 },
    ],
    spriteW: 105,
    spriteH: 105,
    groundOffset: 0.35,
    walkFrames: 7,
    frameDuration: 40,
    atkFrames: 5,
    atkFrameDuration: 80,
  },
}

// Ordem de spawn (fácil estender para fases futuras)
export const SPAWN_ROTATION: MobId[] = ['wolf']
