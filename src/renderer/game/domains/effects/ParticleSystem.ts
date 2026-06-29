import Phaser from 'phaser'
import { CANVAS_CONFIG } from '../../../config/canvas.config'
import { GAME_SPEED } from '../../../config/hero.config'
import type { MobDefinition } from '../../../types/mob.types'
import type { GameScene } from '../../scenes/GameScene'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; color: number; life: number; maxLife: number
}

export class ParticleSystem {
  private scene: GameScene
  private gfx: Phaser.GameObjects.Graphics
  private items: Particle[] = []

  constructor(scene: GameScene) {
    this.scene = scene
    this.gfx = scene.add.graphics().setDepth(9)
  }

  burst(x: number, def: MobDefinition): void {
    const { groundY } = CANVAS_CONFIG
    const gOff = Math.round(def.spriteH * def.groundOffset)
    const cy = groundY - def.spriteH / 2 + gOff
    const colors = [0xe4dede, 0xffffff, 0xc0392b, 0xf0c040]

    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3
      const speed = 1.5 + Math.random() * 2.5
      this.items.push({
        x, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 400 + Math.random() * 300,
        maxLife: 700,
      })
    }
  }

  update(deltaMs: number): void {
    this.gfx.clear()
    this.items = this.items.filter((p) => {
      p.x += p.vx * GAME_SPEED
      p.y += p.vy * GAME_SPEED
      p.vy += 0.08
      p.life -= deltaMs
      if (p.life <= 0) return false

      const alpha = Math.max(0, p.life / p.maxLife)
      this.gfx.fillStyle(p.color, alpha)
      this.gfx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      return true
    })
  }

  reset(): void {
    this.items = []
    this.gfx.clear()
  }
}
