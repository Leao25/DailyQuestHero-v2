import type { ChestDefinition, ChestRarity } from '../types/chest.types'

export const CHEST_MAX_STACK = 5

export const CHEST_DEFINITIONS: Record<ChestRarity, ChestDefinition> = {
  normal:    { id: 'normal',    name: 'Baú Normal',   icon: '📦', color: '#a0856c', lootTable: [] },
  rare:      { id: 'rare',      name: 'Baú Raro',     icon: '💎', color: '#5b8dd9', lootTable: [] },
  mythic:    { id: 'mythic',    name: 'Baú Mítico',   icon: '🔮', color: '#b06cd4', lootTable: [] },
  legendary: { id: 'legendary', name: 'Baú Lendário', icon: '👑', color: '#e8a020', lootTable: [] },
}

export const CHEST_RARITIES: ChestRarity[] = ['normal', 'rare', 'mythic', 'legendary']
