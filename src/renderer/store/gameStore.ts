import { create } from 'zustand'
import type { GamePeriod } from '../types/game.types'
import type { InventoryMap } from '../types/item.types'
import type { ChestStacks } from '../types/chest.types'

export interface GameState {
  // Hero stats (lidos pelo React UI)
  heroName: string
  hp: number
  maxHp: number
  xp: number
  xpNext: number
  level: number
  gold: number

  // Jogo
  isGameOver: boolean
  autoRestart: boolean
  mobsKilled: number
  runStartTime: number
  period: GamePeriod

  // Inventário e baús
  inventory: InventoryMap
  chests: ChestStacks

  // Ações chamadas pelo Phaser
  setHeroStats: (stats: Partial<Pick<GameState, 'hp' | 'maxHp' | 'xp' | 'xpNext' | 'level' | 'gold'>>) => void
  setPeriod: (period: GamePeriod) => void
  setGameOver: (over: boolean) => void
  toggleAutoRestart: () => void
  incrementMobsKilled: () => void
  setInventory: (inv: InventoryMap) => void
  setChests: (chests: ChestStacks) => void
  resetRun: () => void
}

const INITIAL_CHESTS: ChestStacks = { normal: 0, rare: 0, mythic: 0, legendary: 0 }

export const useGameStore = create<GameState>((set) => ({
  heroName: 'Caçadora',
  hp: 100,
  maxHp: 100,
  xp: 0,
  xpNext: 100,
  level: 1,
  gold: 0,

  isGameOver: false,
  autoRestart: false,
  mobsKilled: 0,
  runStartTime: Date.now(),
  period: 'morning',

  inventory: {},
  chests: { ...INITIAL_CHESTS },

  setHeroStats: (stats) => set((s) => ({ ...s, ...stats })),
  setPeriod: (period) => set({ period }),
  setGameOver: (isGameOver) => set({ isGameOver }),
  toggleAutoRestart: () => set((s) => ({ autoRestart: !s.autoRestart })),
  incrementMobsKilled: () => set((s) => ({ mobsKilled: s.mobsKilled + 1 })),
  setInventory: (inventory) => set({ inventory }),
  setChests: (chests) => set({ chests }),
  resetRun: () =>
    set({
      hp: 100,
      maxHp: 100,
      xp: 0,
      xpNext: 100,
      level: 1,
      gold: 0,
      isGameOver: false,
      mobsKilled: 0,
      runStartTime: Date.now(),
      inventory: {},
      chests: { ...INITIAL_CHESTS },
    }),
}))
