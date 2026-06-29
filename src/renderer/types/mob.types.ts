export type MobId = 'wolf'

export type MobState = 'walking' | 'attacking' | 'dead'

export interface ChestDrop {
  rarity: string
  chance: number
}

export interface MobDefinition {
  id: MobId
  name: string
  attackType: 'melee' | 'range'
  fase: number
  hp: number
  attack: number
  attackRange: number
  attackCooldownMs: number
  approachSpeed: number
  spawnIntervalMs: [number, number]
  xpReward: number
  goldReward: number
  chestDrops: ChestDrop[]
  spriteW: number
  spriteH: number
  groundOffset: number
  walkFrames: number
  frameDuration: number
  atkFrames: number
  atkFrameDuration: number
}

export interface MobInstance {
  def: MobDefinition
  x: number
  hp: number
  maxHp: number
  dead: boolean
  deathTimer: number
  state: MobState
  frame: number
  frameTimer: number
  attackTimer: number
}
