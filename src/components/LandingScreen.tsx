import { useEffect } from 'react'
import { useGame } from '../store/gameStore'
import { useGameSession } from '../hooks/useGameSession'
import { NFT_HOLDERS, RARITY_COLORS, FREE_HOLDERS } from '../game/nftSystem'
import { LEVELS } from '../game/levels'
import type { HolderType } from '../game/types'
import { gameAudio } from '../audio/music'

export function LandingScreen() {
  const { startGame, setPhase } = useGame()
  const session = useGameSession()

  useEffect(() => { gameAudio.startMusic('menu'); return () => {} }, [])

  return (
    <div style={{ width: '100%', minHeight: '100%', background: '#0a0a14', color: '#fff', fontFamily: 'monospace', overflow: 'auto' }}>
      
      {/* Animated cyberpunk background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, #0a0a1a 0%, #12101f 30%, #0f0a18 60%, #08060f 100%)' }}>
        {/* City buildings silhouette */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40%',
          background: 'linear-gradient(0deg, rgba(10,5,20,0.9) 0%, transparent 100%)' }} />
        {/* Lightning glow */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '5%', right: '15%', width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'rgba(10,5,20,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(168,85,247,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>👑</span>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.05em' }}>
            <span style={{ color: '#4ade80' }}>H</span><span style={{ color: '#fbbf24' }}>v</span><span style={{ color: '#ef4444' }}>J</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {['Home', 'Game', 'Tokenomics', 'Leaderboard', 'FAQ', 'Roadmap'].map(item => (
            <span key={item} style={{ fontSize: 11, color: '#94a3b8', cursor: 'pointer' }}>{item}</span>
          ))}
          {session.hasWallet ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {session.player && <span style={{ fontSize: 10, color: '#fbbf24' }}>LVL {session.player.level}</span>}
              <button onClick={session.disconnect} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '6px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{session.shortAddr}</button>
            </div>
          ) : (
            <button onClick={session.connect} disabled={session.connecting} style={{ background: session.connecting ? '#333' : 'linear-gradient(135deg, #9945FF, #14F195)', border: 'none', color: '#000', borderRadius: 8, padding: '8px 18px', fontFamily: 'monospace', fontSize: 11, fontWeight: 800, cursor: session.connecting ? 'wait' : 'pointer', boxShadow: '0 0 15px rgba(153,69,255,0.3)' }}>
              {session.connecting ? '...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50, paddingBottom: 30 }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <span style={{ fontSize: 28 }}>👑</span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 900, margin: 0, lineHeight: 1 }}>
              <span style={{ color: '#4ade80', textShadow: '0 0 40px rgba(74,222,128,0.6)' }}>HOLDERS</span>
            </h1>
          </div>
          <div style={{ fontSize: 'clamp(1rem, 3vw, 1.8rem)', fontWeight: 700, margin: '2px 0', color: '#fbbf24' }}>VS</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 900, margin: 0, lineHeight: 1 }}>
              <span style={{ color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.6)' }}>JEETS</span>
            </h1>
            <span style={{ fontSize: 28 }}>💀</span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 'clamp(0.8rem, 2vw, 1.2rem)', color: '#fbbf24', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 30, fontWeight: 600 }}>
          THE MEMECOIN BATTLE BEGINS
        </div>

        {/* Character silhouettes — left (HODL) and right (JEET) */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '5%', width: '90%', maxWidth: 800, marginBottom: 30 }}>
          {/* Left: HODL team */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, filter: 'drop-shadow(0 0 15px rgba(74,222,128,0.4))' }}>🦍</div>
            <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 700, letterSpacing: '0.1em' }}>HODL</div>
          </div>
          {/* Center: VS */}
          <div style={{ fontSize: 40, color: '#fbbf24', fontWeight: 900, textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>⚔️</div>
          {/* Right: JEET team */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.4))' }}>🤡</div>
            <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 700, letterSpacing: '0.1em' }}>JEET</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <button onClick={() => startGame()} style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000', border: 'none', borderRadius: 12,
            padding: '16px 48px', fontSize: 18, fontWeight: 900, fontFamily: 'monospace', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(74,222,128,0.3), 0 4px 0 #15803d', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>▶ Play Now</button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setPhase('howto')} style={secondaryBtn('#3b82f6')}>How to Play</button>
            <button onClick={() => setPhase('leaderboard')} style={secondaryBtn('#fbbf24')}>Leaderboard</button>
          </div>
        </div>

        {/* Rewards Pool */}
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 12, padding: '12px 24px', marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#94a3b8', letterSpacing: '0.15em' }}>SEASON 1 REWARDS POOL</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.3)' }}>$250,000</div>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, maxWidth: 700, margin: '0 auto 50px', padding: '0 20px' }}>
        {[
          { icon: '⚔️', title: 'Real-Time PVP', desc: 'Battle other holders live' },
          { icon: '🧠', title: 'Strategy & Skill', desc: 'Outsmart the jeets' },
          { icon: '💰', title: 'Earn Rewards', desc: 'Win tokens & NFTs' },
          { icon: '🌐', title: 'Play Anywhere', desc: 'Browser-based, no download' },
        ].map(f => (
          <div key={f.title} style={{ background: 'rgba(15,10,25,0.6)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 9, color: '#64748b' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* NFT Showcase */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto 50px', padding: '0 20px' }}>
        <h2 style={{ fontSize: 14, color: '#a855f7', textAlign: 'center', marginBottom: 6, letterSpacing: '0.1em' }}>🎮 HOLDER NFTs</h2>
        <p style={{ fontSize: 10, color: '#64748b', textAlign: 'center', marginBottom: 20 }}>Unlock powerful holders as NFTs by completing levels</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {FREE_HOLDERS.map((type) => (
            <NFTCardMini key={type} owned={true} rarity="common" name={type === 'staking_pool' ? 'Staking Pool' : 'DCA Bot'} desc="Free starter" emoji="✅" />
          ))}
          {(Object.keys(NFT_HOLDERS) as HolderType[]).map((type) => {
            const nft = NFT_HOLDERS[type]
            if (!nft) return null
            const owned = session.ownedHolders.includes(type)
            return <NFTCardMini key={type} owned={owned} rarity={nft.rarity} name={nft.nftName.replace(' NFT', '')} desc={nft.description} emoji={nft.emoji} />
          })}
        </div>
      </div>

      {/* Roadmap */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto 50px', padding: '0 20px' }}>
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

      {/* Levels preview */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto 50px', padding: '0 20px' }}>
        <h2 style={{ fontSize: 14, color: '#f97316', textAlign: 'center', marginBottom: 20, letterSpacing: '0.1em' }}>⚔️ BATTLE LEVELS</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {LEVELS.slice(0, 5).map(l => (
            <div key={l.num} style={{ background: 'rgba(15,10,25,0.6)', border: `1px solid ${l.bossLevel ? '#ef4444' : 'rgba(168,85,247,0.2)'}`, borderRadius: 8, padding: '10px 14px', minWidth: 110 }}>
              <div style={{ fontSize: 8, color: '#64748b' }}>LEVEL {l.num}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: l.bossLevel ? '#ef4444' : '#e2e8f0' }}>{l.name}</div>
              {l.bossLevel && <div style={{ fontSize: 7, color: '#ef4444', marginTop: 2 }}>⚠ BOSS</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '30px 20px', borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          {['𝕏', '📱', '🎮'].map((icon, i) => <span key={i} style={{ fontSize: 18, cursor: 'pointer', opacity: 0.6 }}>{icon}</span>)}
        </div>
        <div style={{ fontSize: 8, color: '#334155' }}>HOLDERS VS JEETS · BUILT ON SOLANA · 2026</div>
        <div style={{ fontSize: 7, color: '#1e293b', marginTop: 4 }}>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span> · <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  )
}

function NFTCardMini({ owned, rarity, name, desc, emoji }: { owned: boolean; rarity: string; name: string; desc: string; emoji: string }) {
  const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#666'
  return (
    <div style={{ background: owned ? `linear-gradient(135deg, ${color}15, ${color}05)` : 'rgba(10,5,15,0.5)', border: `1px solid ${owned ? color : '#1a1a2a'}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 6, filter: owned ? 'none' : 'grayscale(1) opacity(0.3)' }}>{owned ? emoji : '🔒'}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: owned ? color : '#475569', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 8, color: '#64748b', lineHeight: 1.3 }}>{desc}</div>
      <div style={{ fontSize: 7, color, marginTop: 6, textTransform: 'uppercase' }}>{rarity}</div>
    </div>
  )
}

function RoadmapItem({ done, text, desc, color }: { done: boolean; text: string; desc: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(15,10,25,0.4)', border: `1px solid ${done ? color + '44' : 'rgba(30,30,50,0.5)'}`, borderRadius: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? color : '#1a1a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#000', fontWeight: 700 }}>{done ? '✓' : '○'}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: done ? color : '#64748b' }}>{text}</div>
        <div style={{ fontSize: 9, color: '#475569' }}>{desc}</div>
      </div>
    </div>
  )
}

function secondaryBtn(color: string): React.CSSProperties {
  return {
    background: 'transparent', color, border: `1px solid ${color}66`, borderRadius: 10,
    padding: '10px 20px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
    cursor: 'pointer', letterSpacing: '0.05em',
  }
}
