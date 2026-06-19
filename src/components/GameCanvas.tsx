import { useEffect, useRef } from 'react'
import { useGame } from '../store/gameStore'
import { CANVAS_W, CANVAS_H, HOLDER_ORDER, HOLDER_DEFS } from '../game/config'
import type { HolderType } from '../game/types'

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const { engine, phase, tick } = useGame()

  useEffect(() => {
    if (!engine || phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup hi-DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = CANVAS_W * dpr
    canvas.height = CANVAS_H * dpr
    canvas.style.width = `${CANVAS_W}px`
    canvas.style.height = `${CANVAS_H}px`
    ctx.scale(dpr, dpr)

    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      engine.update(dt)
      engine.render(ctx)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, phase, tick])

  // Mouse handlers
  const handleMove = (e: React.MouseEvent) => {
    if (!engine) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    engine.updateMouse(x, y)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!engine) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    engine.handleClick(x, y)
    useGame.getState().forceUpdate()
  }

  // Touch
  const handleTouch = (e: React.TouchEvent) => {
    if (!engine) return
    e.preventDefault()
    const touch = e.touches[0] || e.changedTouches[0]
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const x = (touch.clientX - rect.left) * scaleX
    const y = (touch.clientY - rect.top) * scaleY
    engine.updateMouse(x, y)
    if (e.type === 'touchend' || e.type === 'touchstart') {
      engine.handleClick(x, y)
      useGame.getState().forceUpdate()
    }
  }

  // Card click
  const handleCardClick = (type: HolderType) => {
    if (!engine) return
    engine.selectHolder(type)
    useGame.getState().forceUpdate()
  }

  if (phase !== 'playing') return null

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e0a' }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          onClick={handleClick}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={handleTouch}
          style={{
            imageRendering: 'pixelated',
            cursor: 'pointer',
            borderRadius: 8,
            boxShadow: '0 0 40px rgba(74, 222, 128, 0.1)',
            maxWidth: '100vw',
            maxHeight: '100dvh',
            objectFit: 'contain',
          }}
        />
        {/* Card click overlay (invisible buttons on top of canvas card area) */}
        <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, pointerEvents: 'none' }}>
          {HOLDER_ORDER.map((type) => {
            const def = HOLDER_DEFS[type]
            const available = engine.tendies >= def.cost && engine.cardCooldowns[type] <= 0
            const selected = engine.selectedHolder === type
            return (
              <button
                key={type}
                onClick={() => handleCardClick(type)}
                disabled={!available}
                style={{
                  pointerEvents: 'auto',
                  width: 64, height: 80,
                  background: 'transparent',
                  border: selected ? '3px solid #fbbf24' : '1px solid transparent',
                  cursor: available ? 'pointer' : 'not-allowed',
                  opacity: available ? 1 : 0.7,
                  borderRadius: 4,
                  padding: 0,
                  outline: 'none',
                }}
                title={def.description}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
