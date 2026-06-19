import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store/gameStore'
import { CANVAS_W, CANVAS_H, HOLDER_ORDER, HOLDER_DEFS } from '../game/config'
import type { HolderType } from '../game/types'
import { gameAudio } from '../audio/music'
import { TutorialSystem } from '../tutorial/TutorialSystem'

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const tutorialRef = useRef<TutorialSystem | null>(null)
  const [muted, setMuted] = useState(false)
  const { engine, phase } = useGame()

  useEffect(() => {
    if (!engine || phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Wire SFX
    engine.onSfx = (type: string) => {
      gameAudio.playSfx(type as any)
    }

    // Start battle music
    gameAudio.startMusic('battle')

    // Init tutorial for first-time players
    if (!tutorialRef.current) {
      const seen = localStorage.getItem('hvj_tutorial_done')
      if (!seen) {
        tutorialRef.current = new TutorialSystem()
      }
    }
    const tutorial = tutorialRef.current

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
      if (tutorial && tutorial.active) {
        tutorial.update(engine, dt)
        tutorial.render(ctx)
        if (tutorial.isComplete) {
          localStorage.setItem('hvj_tutorial_done', '1')
          tutorialRef.current = null
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      gameAudio.stopMusic()
      engine.onSfx = null
    }
  }, [engine, phase])

  const toggleMute = () => {
    gameAudio.toggleMute()
    setMuted(gameAudio.isMuted)
    if (!gameAudio.isMuted) gameAudio.startMusic('battle')
  }

  const getPos = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: (clientX - rect.left) * (CANVAS_W / rect.width), y: (clientY - rect.top) * (CANVAS_H / rect.height) }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!engine) return
    const { x, y } = getPos(e.clientX, e.clientY)
    // Check tutorial skip button first
    if (tutorialRef.current?.active) {
      if (tutorialRef.current.handleClick(x, y)) return
    }
    engine.handleClick(x, y)
    useGame.getState().forceUpdate()
  }

  const handleMove = (e: React.MouseEvent) => {
    if (!engine) return
    const { x, y } = getPos(e.clientX, e.clientY)
    engine.updateMouse(x, y)
  }

  const handleTouch = (e: React.TouchEvent) => {
    if (!engine) return
    e.preventDefault()
    const touch = e.touches[0] || e.changedTouches[0]
    const { x, y } = getPos(touch.clientX, touch.clientY)
    engine.updateMouse(x, y)
    if (e.type === 'touchend' || e.type === 'touchstart') {
      if (tutorialRef.current?.active && tutorialRef.current.handleClick(x, y)) return
      engine.handleClick(x, y)
      useGame.getState().forceUpdate()
    }
  }

  const handleCardClick = (type: HolderType) => {
    if (!engine) return
    engine.selectHolder(type)
    gameAudio.playSfx('button')
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
          style={{ imageRendering: 'pixelated', cursor: 'pointer', borderRadius: 8, boxShadow: '0 0 40px rgba(74, 222, 128, 0.1)', maxWidth: '100vw', maxHeight: '100dvh', objectFit: 'contain' }}
        />
        {/* Mute button */}
        <button onClick={toggleMute} style={{
          position: 'absolute', top: 10, right: 10, width: 36, height: 36,
          background: 'rgba(0,0,0,0.6)', border: '1px solid #333', borderRadius: 8,
          color: '#4ade80', fontSize: 16, cursor: 'pointer', zIndex: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {muted ? '🔇' : '🔊'}
        </button>
        {/* Card click overlay */}
        <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, pointerEvents: 'none' }}>
          {HOLDER_ORDER.map((type) => {
            const def = HOLDER_DEFS[type]
            const available = engine ? (engine.tendies >= def.cost && engine.cardCooldowns[type] <= 0) : false
            const selected = engine ? engine.selectedHolder === type : false
            return (
              <button key={type} onClick={() => handleCardClick(type)} disabled={!available}
                style={{
                  pointerEvents: 'auto', width: 64, height: 80, background: 'transparent',
                  border: selected ? '3px solid #fbbf24' : '1px solid transparent',
                  cursor: available ? 'pointer' : 'not-allowed', opacity: available ? 1 : 0.7,
                  borderRadius: 4, padding: 0, outline: 'none',
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
