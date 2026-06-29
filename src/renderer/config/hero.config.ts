import type { HeroConfig } from '../types/hero.types'

export const GAME_SPEED = 1.0

export const HERO_CONFIG: HeroConfig = {
  screenX: 140,
  spriteW: 105,
  spriteH: 105,
  groundOffset: 0.35,
  walkSpeed: 1.0,
  baseMaxHp: 100,
  baseAttack: 10,
  attackType: 'range',
  attackRange: 320,
  attackCooldownMs: 900,
  arrowOffsetX: 0.2,
  arrowOffsetY: 0.5,
  xpToLevelBase: 100,
  xpToLevelGrowth: 1.35,
  walkFrames: 7,
  atkFrames: 5,
  walkFrameDuration: 120,
  atkFrameDuration: 80,
}
