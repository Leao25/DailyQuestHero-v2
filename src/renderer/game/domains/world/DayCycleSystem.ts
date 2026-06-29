import type { GamePeriod } from '../../../types/game.types'
import { useGameStore } from '../../../store/gameStore'
import type { GameScene } from '../../scenes/GameScene'

const PERIODS: GamePeriod[] = ['morning', 'afternoon', 'night']
const PERIOD_DURATION_MS = 20_000

export class DayCycleSystem {
  private timer = 0
  private periodIdx = 0

  constructor(_scene: GameScene) {
    useGameStore.getState().setPeriod(PERIODS[0])
  }

  update(deltaMs: number): void {
    this.timer += deltaMs
    if (this.timer >= PERIOD_DURATION_MS) {
      this.timer = 0
      this.periodIdx = (this.periodIdx + 1) % PERIODS.length
      useGameStore.getState().setPeriod(PERIODS[this.periodIdx])
    }
  }
}
