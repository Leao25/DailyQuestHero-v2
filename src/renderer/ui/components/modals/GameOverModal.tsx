import { useEffect, useState } from 'react'
import { useGameStore } from '../../../store/gameStore'
import { EventBus } from '../../../game/EventBus'

export function GameOverModal() {
  const { isGameOver, autoRestart, mobsKilled, runStartTime, level, gold } = useGameStore()
  const [countdown, setCountdown] = useState(5)

  const elapsed = Date.now() - runStartTime
  const mins = Math.floor(elapsed / 60000)
  const secs = Math.floor((elapsed % 60000) / 1000)
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  function handleRestart() {
    EventBus.emit('game:restart')
  }

  useEffect(() => {
    if (!isGameOver || !autoRestart) { setCountdown(5); return }
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); handleRestart(); return 5 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isGameOver, autoRestart])

  if (!isGameOver) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="text-center text-white"
        style={{
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '28px 36px',
          fontFamily: '"Courier New", monospace',
          minWidth: 260,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            color: '#e74c3c',
            letterSpacing: 2,
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          Game Over
        </h2>

        <div className="flex flex-col gap-2 mb-[22px]">
          {[
            ['Nível',  `Lv. ${level}`],
            ['Mobs',   mobsKilled],
            ['Ouro',   `${gold}g`],
            ['Tempo',  timeStr],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="flex justify-between"
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: 6,
              }}
            >
              <span>{label}</span>
              <span style={{ color: '#f0c040', fontWeight: 'bold' }}>{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: 12,
            padding: '8px 24px',
            background: 'rgba(231,76,60,0.2)',
            color: '#e74c3c',
            border: '1px solid #e74c3c',
            borderRadius: 6,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          Reiniciar
        </button>

        {autoRestart && (
          <p style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
            reiniciando em {countdown}s...
          </p>
        )}
      </div>
    </div>
  )
}
