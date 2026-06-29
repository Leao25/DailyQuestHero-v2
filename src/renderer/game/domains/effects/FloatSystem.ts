import Phaser from 'phaser'
import { CANVAS_CONFIG } from '../../../config/canvas.config'
import { HERO_CONFIG } from '../../../config/hero.config'
import type { GameScene } from '../../scenes/GameScene'

interface FloatItem {
  text: Phaser.GameObjects.Text
  life: number
  vy: number
}

export class FloatSystem {
  private scene: GameScene
  private items: FloatItem[] = []

  constructor(scene: GameScene) {
    this.scene = scene
  }

  spawnMob(x: number, dmg: number): void {
    const { groundY } = CANVAS_CONFIG
    const { spriteH } = HERO_CONFIG
    this.spawn(x, groundY - spriteH - 8, `-${dmg}`, '#fff176')
  }

  spawnHero(text: string, color = '#ff5252'): void {
    const { groundY } = CANVAS_CONFIG
    const { screenX, spriteH, groundOffset } = HERO_CONFIG
    const gOff = Math.round(spriteH * groundOffset)
    this.spawn(screenX, groundY - spriteH + gOff - 14, text, color)
  }

  private spawn(x: number, y: number, text: string, color: string): void {
    const obj = this.scene.add.text(x, y, text, {
      fontFamily: '"Courier New"',
      fontSize: '10px',
      color,
      stroke: '#000',
      strokeThickness: 1,
    }).setOrigin(0.5, 1).setDepth(10)

    this.items.push({ text: obj, life: 900, vy: -0.04 })
  }

  update(deltaMs: number): void {
    this.items = this.items.filter((f) => {
      f.life -= deltaMs
      f.text.y += f.vy * deltaMs
      f.text.setAlpha(Math.min(1, f.life / 300))
      if (f.life <= 0) { f.text.destroy(); return false }
      return true
    })
  }

  reset(): void {
    this.items.forEach((f) => f.text.destroy())
    this.items = []
  }
}
