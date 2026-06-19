import { useGame } from '../store/gameStore'

export function HowToScreen() {
  const { setPhase } = useGame()

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      background: 'radial-gradient(ellipse at center, #0f1f0f 0%, #0a0e0a 70%)', color: '#fff', fontFamily: 'monospace',
      paddingTop: 30, overflow: 'auto', paddingBottom: 40,
    }}>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#4ade80', marginBottom: 20 }}>HOW TO PLAY</h1>

      <div style={{ width: '90%', maxWidth: 550 }}>
        <Section title="OBJECTIVE" color="#4ade80">
          Stop the jeets from reaching the left side of the screen. If even one jeet gets past your defenses, your portfolio gets liquidated.
        </Section>

        <Section title="ECONOMY" color="#fbbf24">
          You earn $TENDIES by deploying <b style={{color:'#fbbf24'}}>Staking Pools</b> (they generate tendies every 8s) and from sky-drops that appear randomly. Collect sky-dropped tendies by clicking/tapping them before they disappear.
        </Section>

        <Section title="DEPLOYING HOLDERS" color="#3b82f6">
          Click a holder card at the bottom of the screen to select it, then click an empty grid cell to place it. Each holder has a cost and cooldown. You can't place holders on occupied cells.
        </Section>

        <Section title="COMBAT" color="#22c55e">
          <b style={{color:'#22c55e'}}>DCA Bots</b> and <b style={{color:'#f97316'}}>Max Buyers</b> shoot candles at jeets in their lane. <b style={{color:'#67e8f9'}}>Ape Snipers</b> fire ice candles that slow jeets down. <b style={{color:'#a855f7'}}>Pump Squads</b> fire in three lanes simultaneously.
        </Section>

        <Section title="DEFENSE" color="#60a5fa">
          <b style={{color:'#60a5fa'}}>Diamond Hands</b> are tough walls. <b style={{color:'#94a3b8'}}>FUD Shields</b> are even tougher. Place them to block jeets and protect your shooters.
        </Section>

        <Section title="SPECIAL" color="#ef4444">
          <b style={{color:'#ef4444'}}>Rocket Apes</b> explode on a 1-second fuse, dealing massive damage in an area. Use them for emergencies!
        </Section>

        <Section title="JEET TYPES" color="#dc2626">
          <b>Paper Hands</b> — basic. <b>FUDsters</b> — tinfoil armor. <b>Whale Jeets</b> — heavy armor. <b>Rug Pullers</b> — fast. <b>MEV Bots</b> — vault over your first holder. <b>Bot Jeets</b> — go berserk when hit. <b style={{color:'#1e293b'}}>Whale Dumpers</b> — BOSS, massive HP.
        </Section>

        <Section title="LIQUIDATION BOTS" color="#94a3b8">
          One per lane. When a jeet reaches the left edge, the liquidation bot activates and clears the lane. If a lane's bot is already used and another jeet reaches the edge — game over.
        </Section>

        <Section title="COMBO SYSTEM" color="#fbbf24">
          Kill jeets in quick succession to build combos. Each combo multiplier increases your score. Chain kills for maximum points!
        </Section>

        <Section title="WAVES" color="#f97316">
          30 waves total. Every 10th wave is a boss wave featuring the Whale Dumper. Waves get progressively harder with more and tougher jeets.
        </Section>
      </div>

      <button onClick={() => setPhase('landing')} style={{
        marginTop: 24, background: '#22c55e', color: '#000', border: 'none', borderRadius: 8,
        padding: '12px 32px', fontFamily: 'monospace', fontSize: 14, fontWeight: 800, cursor: 'pointer',
        boxShadow: '0 4px 0 #16a34a', letterSpacing: '0.05em',
      }}>
        GOT IT
      </button>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16, background: 'rgba(15,20,15,0.6)', border: `1px solid ${color}33`, borderRadius: 8, padding: 14 }}>
      <h3 style={{ color, fontSize: 11, letterSpacing: '0.1em', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#cbd5e1', fontSize: 11, lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}
