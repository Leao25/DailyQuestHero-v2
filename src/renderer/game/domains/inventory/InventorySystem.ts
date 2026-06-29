import type { ItemId, InventoryMap } from '../../../types/item.types'
import { useGameStore } from '../../../store/gameStore'
import type { GameScene } from '../../scenes/GameScene'

export class InventorySystem {
  private items: InventoryMap = {}

  constructor(_scene: GameScene) {}

  add(itemId: ItemId): void {
    this.items[itemId] = (this.items[itemId] ?? 0) + 1
    useGameStore.getState().setInventory({ ...this.items })
  }

  remove(itemId: ItemId, qty = 1): boolean {
    const current = this.items[itemId] ?? 0
    if (current < qty) return false
    this.items[itemId] = current - qty
    if (this.items[itemId] === 0) delete this.items[itemId]
    useGameStore.getState().setInventory({ ...this.items })
    return true
  }

  reset(): void {
    this.items = {}
    useGameStore.getState().setInventory({})
  }
}
