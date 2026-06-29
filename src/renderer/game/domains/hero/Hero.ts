import Phaser from 'phaser'
import { HERO_CONFIG, GAME_SPEED } from '../../../config/hero.config'
import { CANVAS_CONFIG } from '../../../config/canvas.config'
import { useGameStore } from '../../../store/gameStore'
import { EventBus } from '../../EventBus'
import type { GameScene } from '../../scenes/GameScene'

export class Hero {
  scene: GameScene
  worldX = 0
  state: 'walking' | 'attacking' | 'idle' | 'dead' = 'walking'
  fireArrow = false

  private hp: number
  private maxHp: number
  private xp = 0
  private xpNext: number
  private level = 1
  private gold = 0
  private dead = false
  private flashTimer = 0

  private frame = 0
  private frameTimer = 0

  private image: Phaser.GameObjects.Image
  private shadow: Phaser.GameObjects.Graphics

  constructor(scene: GameScene) {
    this.scene = scene
    this.hp = HERO_CONFIG.baseMaxHp
    this.maxHp = HERO_CONFIG.baseMaxHp
    this.xpNext = HERO_CONFIG.xpToLevelBase

    const { screenX, spriteW, spriteH, groundOffset } = HERO_CONFIG
    const { groundY } = CANVAS_CONFIG
    const dy = groundY - spriteH + Math.round(spriteH * groundOffset)

    this.shadow = scene.add.graphics()
    this.image = scene.add.image(screenX, dy + spriteH / 2, 'hunter-walk-0').setOrigin(0.5, 0.5)
    this.image.setDisplaySize(spriteW, spriteH)

    this.syncStore()
  }

  get x(): number {
    return HERO_CONFIG.screenX
  }

  update(deltaMs: number): void {
    if (this.dead) return
    if (this.hp <= 0) { this.die(); return }

    this.flashTimer = Math.max(0, this.flashTimer - deltaMs)
    this.frameTimer += deltaMs

    const cfg = HERO_CONFIG

    if (this.state === 'attacking') {
      if (this.frameTimer >= cfg.atkFrameDuration) {
        this.frameTimer = 0
        this.frame++
        if (this.frame === cfg.atkFrames - 1) this.fireArrow = true
        if (this.frame >= cfg.atkFrames) {
          this.frame = 0
          this.state = 'idle'
          this.fireArrow = false
        }
      }
    } else if (this.state === 'walking') {
      if (this.frameTimer >= cfg.walkFrameDuration) {
        this.frameTimer = 0
        this.frame = (this.frame + 1) % cfg.walkFrames
      }
      this.worldX += cfg.walkSpeed * GAME_SPEED
    }

    this.draw()
  }

  private draw(): void {
    const { screenX, spriteW, spriteH, groundOffset } = HERO_CONFIG
    const { groundY } = CANVAS_CONFIG
    const gOff = Math.round(spriteH * groundOffset)
    const dy = groundY - spriteH + gOff

    // shadow
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 200)
    const shadowW = spriteW * 0.4 * pulse
    const shadowH = 4 * pulse
    this.shadow.clear()
    this.shadow.fillStyle(0x000000, 0.25 * pulse)
    this.shadow.fillEllipse(screenX, groundY + 10, shadowW, shadowH)

    // texture
    const frameList = this.state === 'attacking' ? 'hunter-atk' : 'hunter-walk'
    const key = `${frameList}-${this.frame}`
    this.image.setTexture(key)
    this.image.setPosition(screenX, dy + spriteH / 2)
    this.image.setDisplaySize(spriteW, spriteH)

    // flash red on damage
    const tint = this.flashTimer > 0 ? 0xff5252 : 0xffffff
    this.image.setTint(tint)
  }

  playAttack(): void {
    if (this.state === 'attacking') return
    this.state = 'attacking'
    this.frame = 0
    this.frameTimer = 0
    this.fireArrow = false
  }

  takeDamage(amount: number): void {
    if (this.dead) return
    this.hp = Math.max(0, this.hp - amount)
    this.flashTimer = 150
    this.syncStore()
  }

  gainXp(amount: number): void {
    this.xp += amount
    this.scene.log.push(`+${amount} XP`, '#a5d6a7')

    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext
      this.level++
      this.xpNext = Math.round(
        HERO_CONFIG.xpToLevelBase * Math.pow(HERO_CONFIG.xpToLevelGrowth, this.level - 1),
      )
      this.maxHp += 20
      this.hp = this.maxHp
      this.scene.floats.spawnHero(`LVL ${this.level}!`, '#ffd700')
      this.scene.log.push(`LEVEL UP! Lv.${this.level}`, '#ffd700')
      EventBus.emit('hero:levelUp', this.level)
    }
    this.syncStore()
  }

  gainGold(amount: number): void {
    this.gold += amount
    this.scene.log.push(`+${amount} ouro`, '#f0c040')
    this.syncStore()
  }

  die(): void {
    if (this.dead) return
    this.dead = true
    EventBus.emit('hero:died')
    useGameStore.getState().setGameOver(true)
  }

  reset(): void {
    const cfg = HERO_CONFIG
    this.hp = cfg.baseMaxHp
    this.maxHp = cfg.baseMaxHp
    this.xp = 0
    this.xpNext = cfg.xpToLevelBase
    this.level = 1
    this.gold = 0
    this.dead = false
    this.flashTimer = 0
    this.frame = 0
    this.frameTimer = 0
    this.state = 'walking'
    this.worldX = 0
    this.fireArrow = false
    this.syncStore()
  }

  private syncStore(): void {
    useGameStore.getState().setHeroStats({
      hp: this.hp,
      maxHp: this.maxHp,
      xp: this.xp,
      xpNext: this.xpNext,
      level: this.level,
      gold: this.gold,
    })
  }
}
