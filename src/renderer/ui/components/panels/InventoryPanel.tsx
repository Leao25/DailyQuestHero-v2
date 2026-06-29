import { useGameStore } from '../../../store/gameStore'
import { ITEM_DEFINITIONS } from '../../../config/item.config'
import type { ItemId } from '../../../types/item.types'

export function InventoryPanel() {
  const { inventory } = useGameStore()
  const entries = Object.entries(inventory) as [ItemId, number][]
  const slotCount = Math.max(entries.length, 9)

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
        Inventário
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {Array.from({ length: slotCount }).map((_, i) => {
          const entry = entries[i]
          const itemId = entry?.[0]
          const qty = entry?.[1]
          const def = itemId ? ITEM_DEFINITIONS[itemId] : null

          return (
            <div
              key={i}
              className="relative flex items-center justify-center rounded cursor-default"
              style={{
                width: 36,
                height: 36,
                fontSize: 16,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 5,
              }}
              title={def?.name ?? ''}
            >
              {def && (
                <>
                  <span>{def.icon}</span>
                  <span
                    className="absolute"
                    style={{
                      bottom: 2,
                      right: 3,
                      fontSize: 7,
                      color: '#f0c040',
                      lineHeight: 1,
                    }}
                  >
                    {qty}
                  </span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
