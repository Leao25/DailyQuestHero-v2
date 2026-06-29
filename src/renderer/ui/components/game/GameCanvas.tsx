import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from '../../../game/GameConfig'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    gameRef.current = new Phaser.Game(createPhaserConfig(containerRef.current))

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="rounded-[10px] border border-white/15"
      style={{ width: 720, height: 180, imageRendering: 'pixelated' }}
    />
  )
}
