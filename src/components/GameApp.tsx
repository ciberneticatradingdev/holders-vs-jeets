import { useEffect } from 'react'
import { useGame } from '../store/gameStore'
import { GameCanvas } from './GameCanvas'
import { LandingScreen } from './LandingScreen'
import { GameOverScreen } from './GameOverScreen'
import { VictoryScreen } from './VictoryScreen'
import { LeaderboardScreen } from './LeaderboardScreen'
import { HowToScreen } from './HowToScreen'

export function GameApp() {
  const { phase, init, engine } = useGame()

  useEffect(() => {
    init()
  }, [init])

  if (!engine) return <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'monospace' }}>Loading...</div>

  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden', background: '#0a0e0a', position: 'relative' }}>
      {phase === 'landing' && <LandingScreen />}
      {phase === 'playing' && <GameCanvas />}
      {phase === 'paused' && <GameCanvas />}
      {phase === 'gameover' && <GameOverScreen />}
      {phase === 'victory' && <VictoryScreen />}
      {phase === 'leaderboard' && <LeaderboardScreen />}
      {phase === 'howto' && <HowToScreen />}
    </div>
  )
}
