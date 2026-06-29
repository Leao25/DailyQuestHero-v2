import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { GameCanvas } from './ui/components/game/GameCanvas'
import { HudBar } from './ui/components/hud/HudBar'
import { InventoryPanel } from './ui/components/panels/InventoryPanel'
import { ChestPanel } from './ui/components/panels/ChestPanel'
import { GameOverModal } from './ui/components/modals/GameOverModal'
import { initStars } from './game/domains/world/StarSystem'
import { EventBus } from './game/EventBus'
import type { ChestRarity } from './types/chest.types'

const LOGOS: Record<string, string> = {
  morning:   'assets/logo/dqh_logo_morning.png',
  afternoon: 'assets/logo/dqh_logo_afternoon.png',
  night:     'assets/logo/dqh_logo_night.png',
}

export default function App() {
  const period = useGameStore((s) => s.period)

  useEffect(() => {
    const cleanup = initStars(120)
    return cleanup
  }, [])

  function handleOpenChest(rarity: ChestRarity) {
    EventBus.emit('chest:open', rarity)
  }

  return (
    <div className={`period-${period} min-h-screen flex items-center justify-center`}>
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Logo — muda conforme o período */}
        <img
          src={LOGOS[period]}
          alt="DailyQuestHero"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-10 w-[300px]"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Layout 3 painéis */}
        <div className="flex flex-row items-start gap-2 mt-20">
          <InventoryPanel />

          <div className="flex flex-col">
            <GameCanvas />
            <HudBar />
          </div>

          <ChestPanel onOpen={handleOpenChest} />
        </div>
      </div>

      <GameOverModal />
    </div>
  )
}
