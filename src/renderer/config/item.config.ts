import type { ItemDefinition, ItemId } from '../types/item.types'

export const ITEM_DEFINITIONS: Record<ItemId, ItemDefinition> = {
  wolf_pelt: { id: 'wolf_pelt', name: 'Pele de Lobo',  icon: '🐾' },
  wolf_fang: { id: 'wolf_fang', name: 'Presa de Lobo', icon: '🦷' },
}
