import { useGame } from '../store/gameStore'
import { HOLDER_ORDER, HOLDER_DEFS, JEET_DEFS, TOTAL_WAVES } from '../game/config'
import type { JeetType } from '../game/types'

export function LandingScreen() {
  const { startGame, setPhase } = useGame()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #0f1f0f 0%, #0a0e0a 70%)', color: '#fff', fontFamily: 'monospace', overflow: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 0, color: '#4ade80', textShadow: '0 0 30px rgba(74,222,128,0.5)' }}>HOLDERS</h1>
        <div style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', color: '#fbbf24', fontWeight: 700, margin: '4px 0' }}>VS</div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#ef4444', textShadow: '0 0 30px rgba(239,68,68,0.5)', margin: 0 }}>JEETS</h1>
      </div>
      <p style={{ color: '#94a3b8', fontSize: 'clamp(0.7rem, 2vw, 1rem)', marginBottom: 30, textAlign: 'center', maxWidth: 500, lineHeight: 1.5 }}>
        Defend your bag against the paper-handed horde. Deploy staking pools, DCA bots, and diamond hands. Survive 30 waves of jeets. Climb the leaderboard.
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={startGame} style={btn('#22c55e', '#16a34a')}>▶ PLAY</button>
        <button onClick={() => setPhase('howto')} style={btn('#3b82f6', '#2563eb')}>HOW TO PLAY</button>
        <button onClick={() => setPhase('leaderboard')} style={btn('#fbbf24', '#f59e0b')}>LEADERBOARD</button>
      </div>
      <div style={{ maxWidth: 700, width: '90%', marginBottom: 30 }}>
        <h3 style={{ color: '#4ade80', fontSize: 12, textAlign: 'center', marginBottom: 10, letterSpacing: '0.1em' }}>YOUR ARSENAL</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {HOLDER_ORDER.map((type) => { const def = HOLDER_DEFS[type]; return (
            <div key={type} style={{ background: '#0f140f', border: `1px solid ${def.accent}`, borderRadius: 6, padding: 8, width: 140 }}>
              <div style={{ color: def.color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{def.name}</div>
              <div style={{ color: '#666', fontSize: 8, lineHeight: 1.3 }}>{def.description}</div>
              <div style={{ color: '#fbbf24', fontSize: 9, marginTop: 4 }}>${def.cost}</div>
            </div>
          )})}
        </div>
      </div>
      <div style={{ maxWidth: 700, width: '90%' }}>
        <h3 style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', marginBottom: 10, letterSpacing: '0.1em' }}>ENEMIES</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {(Object.keys(JEET_DEFS) as JeetType[]).map((type) => { const def = JEET_DEFS[type]; return (
            <div key={type} style={{ background: '#0f0a0a', border: `1px solid ${def.accent}`, borderRadius: 6, padding: 8, width: 140 }}>
              <div style={{ color: def.color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{def.name}</div>
              <div style={{ color: '#666', fontSize: 8, lineHeight: 1.3 }}>{def.description}</div>
            </div>
          )})}
        </div>
      </div>
      <div style={{ color: '#334155', fontSize: 9, marginTop: 30, textAlign: 'center' }}>{TOTAL_WAVES} WAVES · BOSS BATTLES EVERY 10 WAVES</div>
    </div>
  )
}

function btn(bg: string, hover: string): React.CSSProperties {
  return { background: bg, color: '#000', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 800, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: `0 4px 0 ${hover}, 0 6px 20px rgba(0,0,0,0.3)`, transition: 'transform 0.05s', textTransform: 'uppercase' }
}
