import Phaser from 'phaser'

// Eventos internos entre sistemas Phaser
export type GameEvents = {
  'mob:killed': (mobId: string, x: number) => void
  'hero:died': () => void
  'hero:levelUp': (level: number) => void
  'game:restart': () => void
  'chest:open': (rarity: string) => void
  'log:push': (text: string, color: string) => void
}

class TypedEventBus extends Phaser.Events.EventEmitter {
  emit<K extends keyof GameEvents>(event: K, ...args: Parameters<GameEvents[K]>): boolean {
    return super.emit(event as string, ...args)
  }
  on<K extends keyof GameEvents>(event: K, fn: GameEvents[K], context?: unknown): this {
    return super.on(event as string, fn as (...a: unknown[]) => void, context)
  }
  off<K extends keyof GameEvents>(event: K, fn?: GameEvents[K], context?: unknown): this {
    return super.off(event as string, fn as ((...a: unknown[]) => void) | undefined, context)
  }
}

export const EventBus = new TypedEventBus()
