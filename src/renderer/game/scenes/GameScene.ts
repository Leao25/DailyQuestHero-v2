import Phaser from 'phaser'
import { Hero } from '../domains/hero/Hero'
import { MobSystem } from '../domains/mob/MobSystem'
import { CombatSystem } from '../domains/combat/CombatSystem'
import { BackgroundSystem } from '../domains/world/BackgroundSystem'
import { CloudSystem } from '../domains/world/CloudSystem'
import { DayCycleSystem } from '../domains/world/DayCycleSystem'
import { ProgressionSystem } from '../domains/progression/ProgressionSystem'
import { InventorySystem } from '../domains/inventory/InventorySystem'
import { ChestSystem } from '../domains/chest/ChestSystem'
import { FloatSystem } from '../domains/effects/FloatSystem'
import { ParticleSystem } from '../domains/effects/ParticleSystem'
import { LogSystem } from '../domains/effects/LogSystem'
import { EventBus } from '../EventBus'
import { useGameStore } from '../../store/gameStore'

export class GameScene extends Phaser.Scene {
  hero!: Hero
  mobSystem!: MobSystem
  combat!: CombatSystem
  background!: BackgroundSystem
  clouds!: CloudSystem
  dayCycle!: DayCycleSystem
  progression!: ProgressionSystem
  inventory!: InventorySystem
  chestSystem!: ChestSystem
  floats!: FloatSystem
  particles!: ParticleSystem
  log!: LogSystem

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.background = new BackgroundSystem(this)
    this.clouds = new CloudSystem(this)
    this.dayCycle = new DayCycleSystem(this)
    this.floats = new FloatSystem(this)
    this.particles = new ParticleSystem(this)
    this.log = new LogSystem(this)
    this.progression = new ProgressionSystem(this)
    this.inventory = new InventorySystem(this)
    this.chestSystem = new ChestSystem(this)
    this.hero = new Hero(this)
    this.mobSystem = new MobSystem(this)
    this.combat = new CombatSystem(this)

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    EventBus.on('game:restart', () => this.restartRun())
    EventBus.on('chest:open', (rarity) => this.chestSystem.open(rarity as import('../../types/chest.types').ChestRarity))
  }

  update(_time: number, delta: number): void {
    if (useGameStore.getState().isGameOver) return

    this.background.update(this.hero.worldX)
    this.dayCycle.update(delta)
    this.mobSystem.update(delta)
    this.combat.update(delta)
    this.floats.update(delta)
    this.particles.update(delta)
    this.log.update(delta)
    this.hero.update(delta)
    this.clouds.update(delta)
  }

  restartRun(): void {
    useGameStore.getState().resetRun()
    this.hero.reset()
    this.mobSystem.reset()
    this.combat.reset()
    this.inventory.reset()
    this.chestSystem.reset()
    this.floats.reset()
    this.particles.reset()
    this.log.reset()
  }
}
