import { useGame } from '../store/gameStore'
import { useGameSession } from '../hooks/useGameSession'
import { NFT_HOLDERS, RARITY_COLORS, RARITY_GLOW, FREE_HOLDERS } from '../game/nftSystem'
import { LEVELS } from '../game/levels'
import type { HolderType } from '../game/types'

export function LandingScreen() {
  const { startGame, setPhase } = useGame()
  const session = useGameSession()

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'radial-gradient(ellipse at 50% 0%, #0f2a1a 0%, #0a0e0a 60%)', color: '#fff', fontFamily: 'monospace', overflow: 'auto' }}>
      
      {/* Top bar with wallet */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#4ade80' }}>H</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#fbbf24' }}>v</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#ef4444' }}>J</span>
        </div>
        {session.hasWallet ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {session.player && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
                <span style={{ color: '#fbbf24' }}>LVL {session.player.level}</span>
                <span style={{ color: '#64748b' }}>|</span>
                <span style={{ color: '#4ade80' }}>{session.player.total_score.toLocaleString()} pts</span>
              </div>
            )}
            <button onClick={session.disconnect} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '6px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {session.shortAddr}
            </button>
          </div>
        ) : (
          <button onClick={session.connect} disabled={session.connecting} style={{ background: session.connecting ? '#333' : 'linear-gradient(135deg, #9945FF, #14F195)', border: 'none', color: '#000', borderRadius: 8, padding: '8px 20px', fontFamily: 'monospace', fontSize: 12, fontWeight: 800, cursor: session.connecting ? 'wait' : 'pointer', boxShadow: '0 0 20px rgba(153,69,255,0.3)' }}>
            {session.connecting ? 'CONNECTING...' : '🪙 CONNECT WALLET'}
          </button>
        )}
      </div>

      {/* Hero section */}
      <div style={{ textAlign: 'center', padding: '60px 20px 40px', maxWidth: 600 }}>
        <div style={{ fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', color: '#fbbf24', letterSpacing: '0.3em', marginBottom: 12, textTransform: 'uppercase' }}>
          Defend Your Bag
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900, lineHeight: 1, marginBottom: 0 }}>
          <span style={{ color: '#4ade80', textShadow: '0 0 40px rgba(74,222,128,0.5)' }}>HOLDERS</span>
        </h1>
        <div style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', color: '#fbbf24', fontWeight: 700, margin: '4px 0' }}>VS</div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900, lineHeight: 1, margin: 0 }}>
          <span style={{ color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.5)' }}>JEETS</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2vw, 1rem)', marginTop: 24, lineHeight: 1.6, maxWidth: 450, margin: '24px auto 0' }}>
          Deploy staking pools, DCA bots, and diamond hands. Survive waves of paper-handed jeets. Earn NFTs. Climb the leaderboard.
        </p>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 50, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => startGame()} style={ctaBtn('#22c55e', '#16a34a', '#000')}>▶ PLAY NOW</button>
        <button onClick={() => setPhase('howto')} style={ctaBtn('transparent', 'transparent', '#4ade80', '#4ade80')}>HOW TO PLAY</button>
        <button onClick={() => setPhase('leaderboard')} style={ctaBtn('transparent', 'transparent', '#fbbf24', '#fbbf24')}>🏆 LEADERBOARD</button>
      </div>

      {/* NFT Showcase */}
      <div style={{ width: '90%', maxWidth: 700, marginBottom: 50 }}>
        <h2 style={{ fontSize: 14, color: '#a855f7', textAlign: 'center', marginBottom: 6, letterSpacing: '0.1em' }}>🎮 HOLDER NFTs</h2>
        <p style={{ fontSize: 10, color: '#64748b', textAlign: 'center', marginBottom: 20 }}>Unlock powerful holders as NFTs by completing levels</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {/* Free holders */}
          {FREE_HOLDERS.map((type) => (
            <NFTCard key={type} type={type} owned={true} rarity="common" name={type === 'staking_pool' ? 'Staking Pool' : 'DCA Bot'} desc="Free starter" emoji="✅" />
          ))}
          {/* NFT holders */}
          {(Object.keys(NFT_HOLDERS) as HolderType[]).map((type) => {
            const nft = NFT_HOLDERS[type]
            if (!nft) return null
            const owned = session.ownedHolders.includes(type)
            return <NFTCard key={type} type={type} owned={owned} rarity={nft.rarity} name={nft.nftName.replace(' NFT', '')} desc={nft.description} emoji={nft.emoji} />
          })}
        </div>
      </div>

      {/* Roadmap */}
      <div style={{ width: '90%', maxWidth: 700, marginBottom: 50 }}>
        <h2 style={{ fontSize: 14, color: '#4ade80', textAlign: 'center', marginBottom: 20, letterSpacing: '0.1em' }}>🗺️ ROADMAP</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <RoadmapItem done text="Game Launch" desc="Core tower defense gameplay" color="#4ade80" />
          <RoadmapItem done={session.completedLevels.length > 0} text="Level Progression" desc="9 levels with increasing difficulty" color="#22c55e" />
          <RoadmapItem done={session.ownedNFTs.length > 0} text="NFT Holder System" desc="Unlock plants as on-chain NFTs" color="#a855f7" />
          <RoadmapItem done={session.dailyMissionsLoaded} text="Daily Missions" desc="Earn XP and tendies daily" color="#fbbf24" />
          <RoadmapItem done={false} text="Multiplayer PvP" desc="Compete against other holders live" color="#ef4444" />
          <RoadmapItem done={false} text="On-Chain Rewards" desc="Earn real tokens for top scores" color="#06b6d4" />
        </div>
      </div>

      {/* Level preview */}
      <div style={{ width: '90%', maxWidth: 700, marginBottom: 50 }}>
        <h2 style={{ fontSize: 14, color: '#f97316', textAlign: 'center', marginBottom: 20, letterSpacing: '0.1em' }}>⚔️ BATTLE LEVELS</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {LEVELS.slice(0, 5).map(l => (
            <div key={l.num} style={{ background: 'rgba(15,20,15,0.6)', border: `1px solid ${l.bossLevel ? '#ef4444' : '#333'}`, borderRadius: 8, padding: '10px 14px', minWidth: 120 }}>
              <div style={{ fontSize: 9, color: '#64748b' }}>LEVEL {l.num}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: l.bossLevel ? '#ef4444' : '#e2e8f0' }}>{l.name}</div>
              {l.bossLevel && <div style={{ fontSize: 7, color: '#ef4444', marginTop: 2 }}>⚠ BOSS</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ color: '#334155', fontSize: 9, paddingBottom: 30, textAlign: 'center' }}>
        HOLDERS VS JEETS · BUILT ON SOLANA · 2026
      </div>
    </div>
  )
}

function NFTCard({ type, owned, rarity, name, desc, emoji }: { type: string; owned: boolean; rarity: string; name: string; desc: string; emoji: string }) {
  const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#666'
  const glow = RARITY_GLOW[rarity as keyof typeof RARITY_GLOW] || 'transparent'
  return (
    <div style={{
      background: owned ? `linear-gradient(135deg, ${color}11, ${color}05)` : 'rgba(10,10,10,0.5)',
      border: `1px solid ${owned ? color : '#1a1a1a'}`,
      borderRadius: 10, padding: 12, position: 'relative',
      boxShadow: owned ? `0 0 15px ${glow}` : 'none',
    }}>
      <div style={{ fontSize: 24, marginBottom: 6, filter: owned ? 'none' : 'grayscale(1) opacity(0.3)' }}>{owned ? emoji : '🔒'}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: owned ? color : '#475569', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 8, color: '#64748b', lineHeight: 1.3 }}>{desc}</div>
      <div style={{ fontSize: 7, color, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{rarity}</div>
    </div>
  )
}

function RoadmapItem({ done, text, desc, color }: { done: boolean; text: string; desc: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(15,20,15,0.4)', border: `1px solid ${done ? color + '44' : '#1a1a1a'}`, borderRadius: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? color : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#000', fontWeight: 700 }}>
        {done ? '✓' : '○'}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: done ? color : '#64748b' }}>{text}</div>
        <div style={{ fontSize: 9, color: '#475569' }}>{desc}</div>
      </div>
    </div>
  )
}

function ctaBtn(bg: string, shadow: string, color: string, border?: string): React.CSSProperties {
  return {
    background: bg, color, border: border ? `2px solid ${border}` : 'none',
    borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 800,
    fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.05em',
    boxShadow: shadow !== 'transparent' ? `0 4px 0 ${shadow}, 0 6px 20px rgba(0,0,0,0.3)` : 'none',
    textTransform: 'uppercase', transition: 'transform 0.1s',
  }
}
