import Phaser from 'phaser'
import { CANVAS_CONFIG } from '../config/canvas.config'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

export const createPhaserConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.CANVAS,
  width: CANVAS_CONFIG.width,
  height: CANVAS_CONFIG.height,
  parent,
  backgroundColor: 'transparent',
  transparent: true,
  render: {
    antialias: false,
    pixelArt: true,
  },
  scene: [BootScene, GameScene],
})
