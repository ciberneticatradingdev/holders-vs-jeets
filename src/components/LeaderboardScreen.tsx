import { useGame } from '../store/gameStore'
import type { LeaderboardEntry } from '../game/types'

export function LeaderboardScreen() {
  const { engine, setPhase } = useGame()
  const entries: LeaderboardEntry[] = engine?.leaderboard || []
  const medals = ['#fbbf24', '#94a3b8', '#d97706']

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'radial-gradient(ellipse at center, #0f1f0f 0%, #0a0e0a 70%)', color: '#fff', fontFamily: 'monospace', paddingTop: 40, overflow: 'auto' }}>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.4)', marginBottom: 6 }}>🏆 LEADERBOARD</h1>
      <p style={{ color: '#64748b', fontSize: 11, marginBottom: 24 }}>Top 50 Diamond Hands</p>
      <div style={{ width: '90%', maxWidth: 500 }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: 14, padding: 40 }}>No scores yet. Be the first!</div>
        ) : (
          entries.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 4, background: i < 3 ? `rgba(${i === 0 ? '251,191,36' : i === 1 ? '148,163,184' : '217,119,6'},0.1)` : 'rgba(255,255,255,0.02)', border: `1px solid ${i < 3 ? medals[i] + '44' : '#1a2e1a'}`, borderRadius: 8 }}>
              <span style={{ width: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, color: i < 3 ? medals[i] : '#475569' }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#e2e8f0', fontWeight: 700, letterSpacing: '0.05em' }}>{e.name}</span>
              <span style={{ fontSize: 10, color: '#64748b' }}>W{e.wave}</span>
              <span style={{ fontSize: 15, color: '#4ade80', fontWeight: 700, minWidth: 80, textAlign: 'right' }}>{e.score.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
      <button onClick={() => setPhase('landing')} style={{ marginTop: 24, marginBottom: 24, background: '#64748b', color: '#000', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'monospace', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 0 #475569' }}>← BACK</button>
    </div>
  )
}
