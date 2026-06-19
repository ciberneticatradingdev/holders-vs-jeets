import { useState } from 'react'
import { useGame } from '../store/gameStore'
import { useGameSession } from '../hooks/useGameSession'
import { claimMission } from '../backend/supabase'

const MISSION_INFO: Record<string, { name: string; desc: string; icon: string }> = {
  kill_jeets: { name: 'Jeet Slayer', desc: 'Liquidate jeets', icon: '💀' },
  reach_wave: { name: 'Wave Survivor', desc: 'Reach wave', icon: '🌊' },
  use_holder: { name: 'Strategist', desc: 'Deploy holders', icon: '🏗️' },
  win_level: { name: 'Victory', desc: 'Win levels', icon: '🏆' },
}

export function MissionsScreen() {
  const { setPhase } = useGame()
  const session = useGameSession()
  const [claiming, setClaiming] = useState<string | null>(null)

  const handleClaim = async (missionId: string) => {
    if (!session.player) return
    setClaiming(missionId)
    const reward = await claimMission(session.player.id, missionId)
    if (reward) {
      // Force refresh
      session.connect()
    }
    setClaiming(null)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'radial-gradient(ellipse at center, #0f1f0f 0%, #0a0e0a 70%)', color: '#fff', fontFamily: 'monospace', paddingTop: 40, overflow: 'auto', paddingBottom: 40 }}>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#fbbf24', marginBottom: 6 }}>📋 DAILY MISSIONS</h1>
      <p style={{ color: '#64748b', fontSize: 11, marginBottom: 30 }}>Reset in 24h · Complete to earn rewards</p>

      {!session.hasWallet ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#475569', fontSize: 14, marginBottom: 20 }}>Connect your wallet to track missions</p>
          <button onClick={session.connect} style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)', border: 'none', color: '#000', borderRadius: 8, padding: '12px 24px', fontFamily: 'monospace', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>🪙 CONNECT WALLET</button>
        </div>
      ) : (
        <div style={{ width: '90%', maxWidth: 500 }}>
          {session.missions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', fontSize: 14, padding: 40 }}>Loading missions...</div>
          ) : (
            session.missions.map((m) => {
              const info = MISSION_INFO[m.mission_type] || { name: m.mission_type, desc: '', icon: '⭐' }
              const pct = Math.min(100, (m.progress / m.target) * 100)
              return (
                <div key={m.id} style={{ background: 'rgba(15,20,15,0.6)', border: `1px solid ${m.completed ? '#4ade80' : '#333'}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{info.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{info.name}</div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>{info.desc} · {m.progress}/{m.target}</div>
                    </div>
                    {m.completed && !m.claimed && (
                      <button onClick={() => handleClaim(m.id)} disabled={claiming === m.id} style={{ background: '#fbbf24', color: '#000', border: 'none', borderRadius: 6, padding: '6px 12px', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                        {claiming === m.id ? '...' : 'CLAIM'}
                      </button>
                    )}
                    {m.claimed && <span style={{ fontSize: 10, color: '#4ade80' }}>✓ CLAIMED</span>}
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: '#0a0a0a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: m.completed ? '#4ade80' : '#f97316', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  {/* Reward */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {m.reward?.xp && <span style={{ fontSize: 8, color: '#a855f7' }}>+{m.reward.xp} XP</span>}
                    {m.reward?.tendies && <span style={{ fontSize: 8, color: '#fbbf24' }}>+{m.reward.tendies} $TENDY</span>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <button onClick={() => setPhase('landing')} style={{ marginTop: 24, background: '#64748b', color: '#000', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'monospace', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 0 #475569' }}>← BACK</button>
    </div>
  )
}
