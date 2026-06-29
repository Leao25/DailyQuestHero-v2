import { useGameStore } from '../../../store/gameStore'
import { CHEST_DEFINITIONS, CHEST_RARITIES, CHEST_MAX_STACK } from '../../../config/chest.config'
import type { ChestRarity } from '../../../types/chest.types'

interface ChestPanelProps {
  onOpen: (rarity: ChestRarity) => void
}

export function ChestPanel({ onOpen }: ChestPanelProps) {
  const { chests } = useGameStore()

  return (
    <div
      className="flex flex-col gap-[6px] flex-shrink-0"
      style={{
        width: 130,
        minHeight: 212,
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: 8,
        fontFamily: '"Courier New", monospace',
      }}
    >
      <div
        className="text-center pb-1"
        style={{
          fontSize: 8,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        Baús
      </div>

      <div className="flex flex-col gap-[6px]">
        {CHEST_RARITIES.map((rarity) => {
          const def = CHEST_DEFINITIONS[rarity]
          const count = chests[rarity]
          const haschest = count > 0

          return (
            <div
              key={rarity}
              onClick={() => haschest && onOpen(rarity)}
              className="relative flex items-center justify-center transition-all duration-150"
              style={{
                width: '100%',
                height: 38,
                fontSize: haschest ? 18 : 16,
                background: haschest ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${haschest ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 6,
                cursor: haschest ? 'pointer' : 'default',
                boxSizing: 'border-box',
              }}
              title={def.name}
            >
              <span style={{ opacity: haschest ? 1 : 0.2 }}>{def.icon}</span>
              {haschest && (
                <span
                  className="absolute"
                  style={{ bottom: 3, right: 5, fontSize: 7, color: '#f0c040', lineHeight: 1 }}
                >
                  {count}/{CHEST_MAX_STACK}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
