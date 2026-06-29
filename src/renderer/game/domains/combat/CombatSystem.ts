import Phaser from 'phaser'
import { HERO_CONFIG, GAME_SPEED } from '../../../config/hero.config'
import { CANVAS_CONFIG } from '../../../config/canvas.config'
import type { Arrow } from '../../../types/game.types'
import type { MobInstance } from '../../../types/mob.types'
import type { GameScene } from '../../scenes/GameScene'

export class CombatSystem {
  private scene: GameScene
  private arrows: Array<Arrow & { gfx: Phaser.GameObjects.Rectangle }> = []
  private attackTimer = 0
  private arrowSpeed = 10

  constructor(scene: GameScene) {
    this.scene = scene
  }

  update(deltaMs: number): void {
    this.attackTimer += deltaMs
    const hero = this.scene.hero
    const mobs = this.scene.mobSystem.activeMobs

    const target = this.nearestMob(mobs)

    if (target) {
      if (this.attackTimer >= HERO_CONFIG.attackCooldownMs) {
        hero.playAttack()
        this.attackTimer = 0
      }
      if (hero.fireArrow) {
        hero.fireArrow = false
        const meleeThreshold = hero.x + target.def.attackRange + 5
        if (target.x < meleeThreshold) {
          this.scene.mobSystem.hit(target, HERO_CONFIG.baseAttack)
        } else {
          this.shoot()
        }
      }
    } else {
      if (hero.state === 'idle') hero.state = 'walking'
    }

    // Move arrows
    for (const arrow of this.arrows) {
      arrow.x += this.arrowSpeed * GAME_SPEED
      arrow.gfx.setPosition(arrow.x, arrow.y)
    }

    // Collision
    for (const arrow of this.arrows) {
      if (arrow.hit) continue
      for (const mob of mobs) {
        if (mob.dead) continue
        const hitRadius = mob.x - hero.x <= mob.def.attackRange + 10
          ? mob.def.spriteW
          : mob.def.spriteW / 2
        if (Math.abs(arrow.x - mob.x) < hitRadius) {
          this.scene.mobSystem.hit(mob, HERO_CONFIG.baseAttack)
          arrow.hit = true
          break
        }
      }
    }

    // Remove
    this.arrows = this.arrows.filter((a) => {
      if (a.hit || a.x >= CANVAS_CONFIG.width + 20) {
        a.gfx.destroy()
        return false
      }
      return true
    })
  }

  private nearestMob(mobs: MobInstance[]): MobInstance | null {
    let nearest: MobInstance | null = null
    let minDist = Infinity
    const heroX = this.scene.hero.x
    for (const mob of mobs) {
      if (mob.dead) continue
      const dist = mob.x - heroX
      if (dist > 0 && dist <= HERO_CONFIG.attackRange && dist < minDist) {
        minDist = dist
        nearest = mob
      }
    }
    return nearest
  }

  private shoot(): void {
    const { screenX, spriteW, spriteH, groundOffset, arrowOffsetX, arrowOffsetY } = HERO_CONFIG
    const { groundY } = CANVAS_CONFIG
    const gOff = Math.round(spriteH * groundOffset)
    const ax = screenX + spriteW * arrowOffsetX
    const ay = groundY - spriteH + gOff + spriteH * arrowOffsetY

    const gfx = this.scene.add.rectangle(ax, ay, 8, 2, 0xf0c040).setDepth(5)
    this.arrows.push({ x: ax, y: ay, hit: false, gfx })
  }

  reset(): void {
    this.arrows.forEach((a) => a.gfx.destroy())
    this.arrows = []
    this.attackTimer = 0
  }
}
