import Phaser from 'phaser'
import { HERO_CONFIG } from '../../config/hero.config'
import { MOB_DEFINITIONS } from '../../config/mob.config'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // Hunter walk frames
    for (let i = 0; i < HERO_CONFIG.walkFrames; i++) {
      const key = `hunter-walk-${i}`
      const idx = String(i).padStart(3, '0')
      this.load.image(key, `assets/sprites/hunter/walk_frame_${idx}.png`)
    }
    // Hunter attack frames
    for (let i = 0; i < HERO_CONFIG.atkFrames; i++) {
      const key = `hunter-atk-${i}`
      const idx = String(i).padStart(3, '0')
      this.load.image(key, `assets/sprites/hunter/basic_atk_frame_${idx}.png`)
    }

    // Mob frames
    for (const def of Object.values(MOB_DEFINITIONS)) {
      for (let i = 0; i < def.walkFrames; i++) {
        const key = `${def.id}-walk-${i}`
        const idx = String(i).padStart(3, '0')
        this.load.image(key, `assets/sprites/mob/${def.id}/walk_frame_${idx}.png`)
      }
      for (let i = 0; i < def.atkFrames; i++) {
        const key = `${def.id}-atk-${i}`
        const idx = String(i).padStart(3, '0')
        this.load.image(key, `assets/sprites/mob/${def.id}/atk_frame_${idx}.png`)
      }
    }

    // Background
    this.load.image('grass-tile', 'assets/bgs/grounds/tile_grass.png')
  }

  create(): void {
    this.scene.start('GameScene')
  }
}
