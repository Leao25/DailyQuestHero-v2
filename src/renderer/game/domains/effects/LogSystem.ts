import Phaser from 'phaser'
import type { GameScene } from '../../scenes/GameScene'

interface LogEntry {
  obj: Phaser.GameObjects.Text
  life: number
}

export class LogSystem {
  private items: LogEntry[] = []
  private maxEntries = 5
  private entryLife = 4000

  constructor(private scene: GameScene) {}

  push(text: string, color = '#ffffff'): void {
    const obj = this.scene.add.text(6, 14 + this.items.length * 11, text, {
      fontFamily: '"Courier New"',
      fontSize: '8px',
      color,
    }).setDepth(8)

    this.items.unshift({ obj, life: this.entryLife })
    if (this.items.length > this.maxEntries) {
      const removed = this.items.pop()!
      removed.obj.destroy()
    }
    this.repositionAll()
  }

  private repositionAll(): void {
    this.items.forEach((e, i) => e.obj.setPosition(6, 14 + i * 11))
  }

  update(deltaMs: number): void {
    this.items = this.items.filter((e) => {
      e.life -= deltaMs
      e.obj.setAlpha(Math.min(1, e.life / 600))
      if (e.life <= 0) { e.obj.destroy(); return false }
      return true
    })
    this.repositionAll()
  }

  reset(): void {
    this.items.forEach((e) => e.obj.destroy())
    this.items = []
  }
}
