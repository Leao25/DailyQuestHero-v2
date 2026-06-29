import { useGameStore } from '../../../store/gameStore'
import { EventBus } from '../../../game/EventBus'

export function HudBar() {
  const { heroName, hp, maxHp, xp, xpNext, level, gold, autoRestart, toggleAutoRestart } =
    useGameStore()

  const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 0
  const xpPct = xpNext > 0 ? (xp / xpNext) * 100 : 0

  return (
    <div
      className="flex items-center gap-3 px-3 py-[6px]"
      style={{
        width: 720,
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: 'none',
        borderRadius: '0 0 10px 10px',
        fontFamily: '"Courier New", monospace',
      }}
    >
      {/* Left */}
      <div className="flex flex-col gap-[2px] min-w-[80px]">
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{heroName}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Lv.{level}</span>
      </div>

      {/* Bars */}
      <div className="flex-1 flex flex-col gap-1">
        {/* HP */}
        <div className="flex items-center gap-[6px]">
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', width: 16 }}>HP</span>
          <div className="flex-1 h-[5px] rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-sm transition-[width] duration-200"
              style={{ width: `${hpPct}%`, background: '#e74c3c' }}
            />
          </div>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', minWidth: 48 }}>
            {hp}/{maxHp}
          </span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-[6px]">
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', width: 16 }}>XP</span>
          <div className="flex-1 h-[5px] rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-sm transition-[width] duration-200"
              style={{ width: `${xpPct}%`, background: '#2ecc71' }}
            />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2" style={{ fontSize: 10, color: '#f0c040', minWidth: 40 }}>
        <span>{gold}g</span>
        <button
          onClick={toggleAutoRestart}
          className="text-[9px] px-[7px] py-[2px] rounded cursor-pointer transition-all duration-150"
          style={{
            fontFamily: '"Courier New", monospace',
            background: autoRestart ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.07)',
            color: autoRestart ? '#2ecc71' : 'rgba(255,255,255,0.35)',
            border: `1px solid ${autoRestart ? '#2ecc71' : 'rgba(255,255,255,0.15)'}`,
            letterSpacing: '0.5px',
          }}
        >
          Auto
        </button>
      </div>
    </div>
  )
}
