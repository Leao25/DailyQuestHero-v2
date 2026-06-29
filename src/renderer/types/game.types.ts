export type GamePeriod = 'morning' | 'afternoon' | 'night'

export type HeroState = 'walking' | 'attacking' | 'idle' | 'dead'

export interface Arrow {
  x: number
  y: number
  hit: boolean
}
