import Phaser from 'phaser'
import { CANVAS_CONFIG } from '../../../config/canvas.config'
import type { GameScene } from '../../scenes/GameScene'

interface LayerConfig {
  parallax: number
  minGap: number
  maxGap: number
}

interface PropInstance {
  key: string
  scale: number
  worldX: number
  image: Phaser.GameObjects.Image
}

interface LayerEntry {
  config: LayerConfig
  pool: Array<{ key: string; scale: number }>
  props: PropInstance[]
  nextWorldX: number
}

const LAYER_CONFIGS: Record<string, LayerConfig> = {
  far:  { parallax: 0.05, minGap: 600,  maxGap: 1200 },
  mid:  { parallax: 0.18, minGap: 400,  maxGap: 900  },
  near: { parallax: 0.35, minGap: 300,  maxGap: 700  },
}

export class BackgroundSystem {
  private scene: GameScene
  private layers: Record<string, LayerEntry> = {}
  private groundImages: Phaser.GameObjects.Image[] = []
  private groundTileW = 147
  private groundTileH = 38
  private groundY = 150

  constructor(scene: GameScene) {
    this.scene = scene

    for (const [name, config] of Object.entries(LAYER_CONFIGS)) {
      this.layers[name] = { config, pool: [], props: [], nextWorldX: config.minGap }
    }

    // Ground tiles (enough to cover canvas + 1 extra each side)
    const count = Math.ceil(CANVAS_CONFIG.width / this.groundTileW) + 3
    for (let i = 0; i < count; i++) {
      const img = scene.add.image(0, this.groundY, 'grass-tile')
        .setOrigin(0, 0)
        .setDisplaySize(this.groundTileW + 1, this.groundTileH)
        .setDepth(1)
      this.groundImages.push(img)
    }
  }

  update(heroWorldX: number): void {
    // Update ground scroll
    const offset = Math.floor(heroWorldX * 0.3) % this.groundTileW
    this.groundImages.forEach((img, i) => {
      img.setX((i - 1) * this.groundTileW - offset)
    })

    // Update parallax layers
    const { width: CW } = CANVAS_CONFIG
    for (const [name, layer] of Object.entries(this.layers)) {
      if (layer.pool.length === 0) continue

      // Spawn
      while (heroWorldX + 800 > layer.nextWorldX) {
        const def = layer.pool[Math.floor(Math.random() * layer.pool.length)]
        const img = this.scene.add.image(0, CANVAS_CONFIG.groundY, def.key)
          .setOrigin(0.5, 1)
          .setScale(def.scale)
          .setDepth(name === 'far' ? 0 : name === 'mid' ? 1 : 2)

        layer.props.push({ key: def.key, scale: def.scale, worldX: layer.nextWorldX, image: img })
        const gap = layer.config.minGap + Math.random() * (layer.config.maxGap - layer.config.minGap)
        layer.nextWorldX += gap
      }

      // Update positions and cull
      layer.props = layer.props.filter((p) => {
        const sx = p.worldX - heroWorldX * layer.config.parallax
        if (sx < -300 || sx > CW + 300) {
          p.image.destroy()
          return false
        }
        p.image.setX(sx)
        return true
      })
    }
  }

  addToPool(layerName: string, key: string, scale = 1.0): void {
    this.layers[layerName]?.pool.push({ key, scale })
  }
}
