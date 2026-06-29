import Phaser from 'phaser'
import { MOB_DEFINITIONS, SPAWN_ROTATION } from '../../../config/mob.config'
import { CANVAS_CONFIG } from '../../../config/canvas.config'
import { GAME_SPEED } from '../../../config/hero.config'
import type { MobInstance } from '../../../types/mob.types'
import type { ChestRarity } from '../../../types/chest.types'
import { useGameStore } from '../../../store/gameStore'
import type { GameScene } from '../../scenes/GameScene'

export class MobSystem {
  private scene: GameScene
  private mobs: MobInstance[] = []
  private images: Map<MobInstance, Phaser.GameObjects.Image> = new Map()
  private hpBars: Map<MobInstance, Phaser.GameObjects.Graphics> = new Map()
  private nameTexts: Map<MobInstance, Phaser.GameObjects.Text> = new Map()
  private spawnTimer = 0
  private spawnRotationIdx = 0

  constructor(scene: GameScene) {
    this.scene = scene
  }

  get activeMobs(): MobInstance[] {
    return this.mobs
  }

  update(deltaMs: number): void {
    // Spawn logic
    this.spawnTimer += deltaMs
    const mobId = SPAWN_ROTATION[this.spawnRotationIdx % SPAWN_ROTATION.length]
    const def = MOB_DEFINITIONS[mobId]
    const [minMs, maxMs] = def.spawnIntervalMs
    const interval = minMs + Math.random() * (maxMs - minMs)

    if (this.spawnTimer >= interval) {
      this.spawn(mobId)
      this.spawnTimer = 0
      this.spawnRotationIdx++
    }

    const heroX = this.scene.hero.x

    for (const mob of this.mobs) {
      if (mob.dead) {
        mob.deathTimer -= deltaMs
        const alpha = Math.max(0, mob.deathTimer / 400)
        this.images.get(mob)?.setAlpha(alpha)
        this.hpBars.get(mob)?.setAlpha(alpha)
        this.nameTexts.get(mob)?.setAlpha(alpha)
        continue
      }

      mob.frameTimer += deltaMs
      const dx = heroX - mob.x
      const inRange = Math.abs(dx) <= mob.def.attackRange

      if (!inRange) {
        mob.state = 'walking'
        mob.x += Math.sign(dx) * mob.def.approachSpeed * GAME_SPEED
        if (mob.frameTimer >= mob.def.frameDuration) {
          mob.frameTimer = 0
          mob.frame = (mob.frame + 1) % mob.def.walkFrames
        }
      } else {
        mob.state = 'attacking'
        if (mob.frameTimer >= mob.def.atkFrameDuration) {
          mob.frameTimer = 0
          mob.frame = (mob.frame + 1) % mob.def.atkFrames
        }
        mob.attackTimer += deltaMs
        if (mob.attackTimer >= mob.def.attackCooldownMs) {
          mob.attackTimer = 0
          mob.frame = 0
          mob.frameTimer = 0
          this.scene.hero.takeDamage(mob.def.attack)
          this.scene.floats.spawnHero(`-${mob.def.attack}`)
        }
      }

      // Update visuals
      this.updateMobVisuals(mob)
    }

    // Remove dead mobs with expired timers
    this.mobs = this.mobs.filter((m) => {
      if (m.dead && m.deathTimer <= 0) {
        this.destroyMobObjects(m)
        return false
      }
      return true
    })
  }

  private spawn(mobId: typeof SPAWN_ROTATION[number]): void {
    const def = MOB_DEFINITIONS[mobId]
    const mob: MobInstance = {
      def,
      x: CANVAS_CONFIG.width + def.spriteW / 2,
      hp: def.hp,
      maxHp: def.hp,
      dead: false,
      deathTimer: 400,
      state: 'walking',
      frame: 0,
      frameTimer: 0,
      attackTimer: 0,
    }

    const { groundY } = CANVAS_CONFIG
    const { spriteW, spriteH, groundOffset } = def
    const gOff = Math.round(spriteH * groundOffset)
    const dy = groundY - spriteH + gOff

    const img = this.scene.add.image(mob.x, dy + spriteH / 2, `${mobId}-walk-0`)
      .setDisplaySize(spriteW, spriteH)
      .setDepth(3)

    const bar = this.scene.add.graphics().setDepth(4)
    const nameText = this.scene.add.text(mob.x, dy - 10, def.name, {
      fontFamily: '"Courier New"',
      fontSize: '7px',
      color: 'rgba(255,255,255,0.6)',
    }).setOrigin(0.5, 1).setDepth(4)

    this.images.set(mob, img)
    this.hpBars.set(mob, bar)
    this.nameTexts.set(mob, nameText)
    this.mobs.push(mob)
  }

  private updateMobVisuals(mob: MobInstance): void {
    const def = mob.def
    const { groundY } = CANVAS_CONFIG
    const gOff = Math.round(def.spriteH * def.groundOffset)
    const dy = groundY - def.spriteH + gOff

    const img = this.images.get(mob)
    if (img) {
      const frameType = mob.state === 'attacking' ? 'atk' : 'walk'
      img.setTexture(`${def.id}-${frameType}-${mob.frame}`)
      img.setPosition(mob.x, dy + def.spriteH / 2)
    }

    const bar = this.hpBars.get(mob)
    if (bar) {
      bar.clear()
      const barW = (def.hp / 10) * 8
      const barY = dy - 6
      bar.fillStyle(0x333333, 1)
      bar.fillRect(mob.x - barW / 2, barY, barW, 3)
      bar.fillStyle(0xe74c3c, 1)
      bar.fillRect(mob.x - barW / 2, barY, barW * (mob.hp / mob.maxHp), 3)
    }

    this.nameTexts.get(mob)?.setPosition(mob.x, dy - 8)
  }

  hit(mob: MobInstance, damage: number): void {
    if (mob.dead) return
    mob.hp -= damage
    this.scene.floats.spawnMob(mob.x, damage)
    if (mob.hp <= 0) {
      mob.dead = true
      this.scene.particles.burst(mob.x, mob.def)
      this.scene.hero.gainXp(mob.def.xpReward)
      this.scene.hero.gainGold(mob.def.goldReward)
      useGameStore.getState().incrementMobsKilled()

      for (const drop of mob.def.chestDrops) {
        if (Math.random() < drop.chance) {
          this.scene.chestSystem.add(drop.rarity as ChestRarity)
        }
      }
    }
  }

  private destroyMobObjects(mob: MobInstance): void {
    this.images.get(mob)?.destroy()
    this.hpBars.get(mob)?.destroy()
    this.nameTexts.get(mob)?.destroy()
    this.images.delete(mob)
    this.hpBars.delete(mob)
    this.nameTexts.delete(mob)
  }

  reset(): void {
    for (const mob of this.mobs) this.destroyMobObjects(mob)
    this.mobs = []
    this.spawnTimer = 0
  }
}
