import type { ChestRarity, ChestStacks } from '../../../types/chest.types'
import { CHEST_DEFINITIONS, CHEST_MAX_STACK } from '../../../config/chest.config'
import { useGameStore } from '../../../store/gameStore'
import type { GameScene } from '../../scenes/GameScene'

export class ChestSystem {
  private stacks: ChestStacks = { normal: 0, rare: 0, mythic: 0, legendary: 0 }

  constructor(private scene: GameScene) {}

  add(rarity: ChestRarity): boolean {
    if (this.stacks[rarity] >= CHEST_MAX_STACK) return false
    this.stacks[rarity]++
    const def = CHEST_DEFINITIONS[rarity]
    this.scene.log.push(`${def.icon} ${def.name}!`, def.color)
    this.syncStore()
    return true
  }

  open(rarity: ChestRarity): void {
    if (this.stacks[rarity] <= 0) return
    this.stacks[rarity]--
    this.scene.log.push('Itens em Breve', 'rgba(255,255,255,0.4)')
    this.syncStore()
  }

  reset(): void {
    this.stacks = { normal: 0, rare: 0, mythic: 0, legendary: 0 }
    this.syncStore()
  }

  private syncStore(): void {
    useGameStore.getState().setChests({ ...this.stacks })
  }
}
