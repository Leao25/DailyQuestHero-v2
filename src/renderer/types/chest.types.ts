export type ChestRarity = 'normal' | 'rare' | 'mythic' | 'legendary'

export interface ChestDefinition {
  id: ChestRarity
  name: string
  icon: string
  color: string
  lootTable: LootEntry[]
}

export interface LootEntry {
  itemId: string
  weight: number
  minQty: number
  maxQty: number
}

export type ChestStacks = Record<ChestRarity, number>
