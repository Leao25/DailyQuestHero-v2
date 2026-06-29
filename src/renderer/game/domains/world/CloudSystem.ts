import Phaser from 'phaser'
import type { GameScene } from '../../scenes/GameScene'

interface Cloud {
  x: number; y: number; speed: number; scale: number; alpha: number
}

export class CloudSystem {
  private scene: GameScene
  private gfx: Phaser.GameObjects.Graphics
  private clouds: Cloud[] = []
  private count = 12

  constructor(scene: GameScene) {
    this.scene = scene
    // Cloud canvas is handled externally (React/HTML), so this draws in Phaser canvas
    // We draw directly in the scene's camera/world at depth -1
    this.gfx = scene.add.graphics().setDepth(-1).setScrollFactor(0)

    for (let i = 0; i < this.count; i++) {
      this.clouds.push(this.makeCloud(true))
    }
  }

  private makeCloud(randomX = false): Cloud {
    const W = this.scene.scale.width
    const H = this.scene.scale.height
    return {
      x: randomX ? Math.random() * W : W + 200,
      y: Math.random() * H * 0.7,
      speed: 0.12 + Math.random() * 0.16,
      scale: 0.6 + Math.random() * 1.0,
      alpha: 0.08 + Math.random() * 0.07,
    }
  }

  update(_delta: number): void {
    const W = this.scene.scale.width
    this.gfx.clear()

    for (const c of this.clouds) {
      c.x -= c.speed
      if (c.x < -300) Object.assign(c, this.makeCloud(false))

      this.gfx.fillStyle(0xffffff, c.alpha)
      this.drawCloud(c.x, c.y, c.scale)
    }
  }

  private drawCloud(x: number, y: number, scale: number): void {
    const r = 18 * scale
    this.gfx.fillCircle(x, y, r)
    this.gfx.fillCircle(x + r * 1.2, y - r * 0.3, r * 0.8)
    this.gfx.fillCircle(x + r * 2.2, y, r * 0.9)
    this.gfx.fillCircle(x + r * 1.1, y + r * 0.4, r * 0.7)
  }
}
