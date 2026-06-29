import type { HeroState } from './game.types'

export interface HeroConfig {
  screenX: number
  spriteW: number
  spriteH: number
  groundOffset: number
  walkSpeed: number
  baseMaxHp: number
  baseAttack: number
  attackType: 'range' | 'melee'
  attackRange: number
  attackCooldownMs: number
  arrowOffsetX: number
  arrowOffsetY: number
  xpToLevelBase: number
  xpToLevelGrowth: number
  walkFrames: number
  atkFrames: number
  walkFrameDuration: number
  atkFrameDuration: number
}

export interface HeroRuntimeState {
  name: string
  hp: number
  maxHp: number
  xp: number
  xpNext: number
  level: number
  gold: number
  state: HeroState
  worldX: number
  dead: boolean
}
