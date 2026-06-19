import { useState } from 'react'
import { useGame } from '../store/gameStore'
import { TOTAL_WAVES } from '../game/config'

export function VictoryScreen() {
  const { engine, startGame, setPhase } = useGame()
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const stats = engine?.stats

  const handleSave = () => { if (name.trim() && !saved) { engine?.saveScore(name.trim()); setSaved(true) } }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #0a1f0a 0%, #0a0e0a 70%)', color: '#fff', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#4ade80', textShadow: '0 0 40px rgba(74,222,128,0.6)', marginBottom: 8, textAlign: 'center' }}>🎉 DIAMOND HANDS! 🎉</h1>
      <p style={{ color: '#fbbf24', fontSize: 16, marginBottom: 30 }}>You survived all {TOTAL_WAVES} waves. Your bag is intact!</p>
      {stats && (
        <div style={{ background: '#0f140f', border: '1px solid #333', borderRadius: 12, padding: 24, marginBottom: 24, minWidth: 280 }}>
          <Stat label="FINAL SCORE" value={stats.score.toLocaleString()} color="#4ade80" />
          <Stat label="WAVES CLEARED" value={`${TOTAL_WAVES}`} color="#f97316" />
          <Stat label="JEETS LIQUIDATED" value={`${stats.jeetsKilled}`} color="#ef4444" />
          <Stat label="MAX COMBO" value={`${stats.maxCombo}x`} color="#fbbf24" />
        </div>
      )}
      {!saved ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="YOUR NAME" maxLength={12} style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, padding: '10px 16px', color: '#fff', fontFamily: 'monospace', fontSize: 14, textAlign: 'center', width: 160, outline: 'none' }} />
          <button onClick={handleSave} disabled={!name.trim()} style={{ background: name.trim() ? '#fbbf24' : '#333', color: '#000', border: 'none', borderRadius: 6, padding: '10px 20px', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>SAVE</button>
        </div>
      ) : (<p style={{ color: '#4ade80', fontSize: 12, marginBottom: 16 }}>✓ Score saved!</p>)}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => startGame()} style={btn('#22c55e', '#16a34a')}>PLAY AGAIN</button>
        <button onClick={() => setPhase('leaderboard')} style={btn('#fbbf24', '#f59e0b')}>LEADERBOARD</button>
        <button onClick={() => setPhase('landing')} style={btn('#64748b', '#475569')}>MENU</button>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}><span style={{ color: '#94a3b8', fontSize: 11, letterSpacing: '0.05em' }}>{label}</span><span style={{ color, fontSize: 18, fontWeight: 700 }}>{value}</span></div>)
}
function btn(bg: string, hover: string): React.CSSProperties { return { background: bg, color: '#000', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 800, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: `0 3px 0 ${hover}` } }
