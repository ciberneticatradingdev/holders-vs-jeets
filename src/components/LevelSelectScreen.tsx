import { useGame } from '../store/gameStore'
import { LEVELS, isLevelUnlocked, getStarsForWave } from '../game/levels'
import { useGameSession } from '../hooks/useGameSession'

export function LevelSelectScreen() {
  const { setPhase, startGame } = useGame()
  const session = useGameSession()

  const handleLevelClick = (num: number) => {
    if (!isLevelUnlocked(num, session.completedLevels)) return
    // Start game at this level
    startGame()
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'radial-gradient(ellipse at center, #0f1f0f 0%, #0a0e0a 70%)', color: '#fff', fontFamily: 'monospace', paddingTop: 40, overflow: 'auto', paddingBottom: 40 }}>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#4ade80', marginBottom: 6, textShadow: '0 0 20px rgba(74,222,128,0.4)' }}>SELECT LEVEL</h1>
      <p style={{ color: '#64748b', fontSize: 11, marginBottom: 30 }}>
        {session.hasWallet ? `Connected: ${session.shortAddr}` : 'Connect wallet to save progress'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, width: '90%', maxWidth: 700 }}>
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(level.num, session.completedLevels)
          const completed = session.completedLevels.includes(level.num)
          const stars = getStarsForWave(level.waves, level.waves)
          return (
            <div key={level.num} onClick={() => handleLevelClick(level.num)} style={{
              background: unlocked ? (level.bossLevel ? 'rgba(239,68,68,0.1)' : 'rgba(15,20,15,0.8)') : 'rgba(10,10,10,0.5)',
              border: `1px solid ${unlocked ? (level.bossLevel ? '#ef4444' : '#4ade80') : '#1a1a1a'}`,
              borderRadius: 12, padding: 16, cursor: unlocked ? 'pointer' : 'not-allowed',
              opacity: unlocked ? 1 : 0.4, position: 'relative', transition: 'transform 0.1s',
              
            }}>
              {/* Boss badge */}
              {level.bossLevel && <div style={{ position: 'absolute', top: -8, right: 8, background: '#ef4444', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>BOSS</div>}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: unlocked ? '#4ade80' : '#333' }}>{level.num}</span>
                {completed && <span style={{ fontSize: 10, color: '#fbbf24' }}>✓</span>}
                {!unlocked && <span style={{ fontSize: 14 }}>🔒</span>}
              </div>
              
              <div style={{ fontSize: 12, fontWeight: 700, color: unlocked ? '#e2e8f0' : '#475569', marginBottom: 4 }}>{level.name}</div>
              <div style={{ fontSize: 9, color: '#64748b', marginBottom: 8, lineHeight: 1.4 }}>{level.description}</div>
              
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                {[1,2,3].map(s => <span key={s} style={{ fontSize: 10, color: completed && s <= stars ? '#fbbf24' : '#334155' }}>★</span>)}
              </div>
              
              {/* Reward preview */}
              <div style={{ fontSize: 8, color: '#64748b' }}>
                {level.reward.nft ? `🎁 Unlocks: ${level.reward.nft.replace(/_/g, ' ')}` : `+${level.reward.xp} XP`}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={() => setPhase('landing')} style={{ marginTop: 24, background: '#64748b', color: '#000', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'monospace', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 0 #475569' }}>← BACK</button>
    </div>
  )
}
