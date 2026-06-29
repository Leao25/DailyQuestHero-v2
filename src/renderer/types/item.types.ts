export type ItemId = 'wolf_pelt' | 'wolf_fang'

export interface ItemDefinition {
  id: ItemId
  name: string
  icon: string
}

export type InventoryMap = Partial<Record<ItemId, number>>
