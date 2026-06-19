// ============================================================
// Holders vs Jeets — Sprite Rendering (Canvas 2D)
// ============================================================
import type { HolderType, JeetType, ProjectileType } from './types'

type Ctx = CanvasRenderingContext2D

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const S = 64

export function drawHolder(ctx: Ctx, type: HolderType, cx: number, cy: number, frame: number, hp: number, maxHp: number) {
  ctx.save()
  ctx.translate(cx, cy)
  const t = frame * 0.15
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(0, S * 0.38, S * 0.35, S * 0.08, 0, 0, Math.PI * 2); ctx.fill()
  switch (type) {
    case 'staking_pool': drawStakingPool(ctx, t); break
    case 'dca_bot': drawDcaBot(ctx, t); break
    case 'diamond_hands': drawDiamondHands(ctx, t); break
    case 'ape_sniper': drawApeSniper(ctx, t); break
    case 'rocket_apes': drawRocketApes(ctx, t); break
    case 'max_buyer': drawMaxBuyer(ctx, t); break
    case 'pump_squad': drawPumpSquad(ctx, t); break
    case 'fud_shield': drawFudShield(ctx, t); break
  }
  if (hp < maxHp) {
    const w = S * 0.5, h2 = 4, y2 = -S * 0.45
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-w / 2 - 1, y2 - 1, w + 2, h2 + 2)
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-w / 2, y2, w, h2)
    const pct = Math.max(0, hp / maxHp)
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#fbbf24' : '#ef4444'
    ctx.fillRect(-w / 2, y2, w * pct, h2)
  }
  ctx.restore()
}

// ============================================================
// HOLDER SPRITES — bullish palette (gold/green/blue/cyan)
// ============================================================

export function drawStakingPool(ctx: Ctx, t: number) {
  // Golden cauldron/pool with bubbling $ coins
  const r = S * 0.34
  ctx.save()
  ctx.shadowColor = 'rgba(251,191,36,0.5)'; ctx.shadowBlur = 14
  // Cauldron body
  const g = ctx.createLinearGradient(0, -r, 0, r)
  g.addColorStop(0, '#fde68a'); g.addColorStop(0.5, '#f59e0b'); g.addColorStop(1, '#78350f')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 1.15, r * 0.85, 0, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0
  // Pool rim
  ctx.fillStyle = '#92400e'
  ctx.beginPath(); ctx.ellipse(0, -r * 0.15, r * 1.1, r * 0.32, 0, 0, Math.PI * 2); ctx.fill()
  // Liquid surface
  const lg = ctx.createRadialGradient(0, -r * 0.1, 2, 0, -r * 0.1, r)
  lg.addColorStop(0, '#fef3c7'); lg.addColorStop(0.6, '#fbbf24'); lg.addColorStop(1, '#d97706')
  ctx.fillStyle = lg
  ctx.beginPath(); ctx.ellipse(0, -r * 0.18, r * 0.92, r * 0.24, 0, 0, Math.PI * 2); ctx.fill()
  // Bubbling $ coins (animated bobbing)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + t * 0.8
    const bx = Math.cos(a) * r * 0.5
    const by = -r * 0.18 + Math.sin(t * 2 + i) * 2.5
    ctx.fillStyle = '#fde68a'
    ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#b45309'
    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('$', bx, by)
  }
  // Bubbles
  for (let i = 0; i < 3; i++) {
    const bb = (t * 1.5 + i * 0.7) % 1
    const by = -r * 0.18 - bb * r * 0.4
    ctx.fillStyle = `rgba(254,243,199,${1 - bb})`
    ctx.beginPath(); ctx.arc(Math.sin(t + i) * r * 0.4, by, 1.5 + bb * 2, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'
  ctx.fillText('STAKE', 0, r * 0.6)
  ctx.restore()
}

export function drawDcaBot(ctx: Ctx, t: number) {
  // Green candle-shaped robot with LED eyes and recoiling barrel
  ctx.save()
  const recoil = Math.sin(t * 3) * 3
  // Green candle body (bullish)
  const g = ctx.createLinearGradient(-12, -22, -12, 18)
  g.addColorStop(0, '#4ade80'); g.addColorStop(0.5, '#16a34a'); g.addColorStop(1, '#14532d')
  ctx.fillStyle = g
  ctx.shadowColor = 'rgba(74,222,128,0.5)'; ctx.shadowBlur = 10
  rr(ctx, -12, -22, 24, 40, 4); ctx.fill()
  ctx.shadowBlur = 0
  // Wick on top
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, -30); ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, -30, 2.5, 0, Math.PI * 2); ctx.fill()
  // Face panel
  ctx.fillStyle = '#052e16'
  rr(ctx, -8, -14, 16, 12, 2); ctx.fill()
  // LED eyes (blink)
  const blink = (Math.sin(t * 1.5) > 0.95) ? 0.3 : 1
  ctx.fillStyle = `rgba(74,222,128,${blink})`
  ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 6
  ctx.beginPath(); ctx.arc(-3.5, -8, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(3.5, -8, 2, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0
  // Barrel (recoils)
  ctx.fillStyle = '#022c1a'
  rr(ctx, -4, -4 + recoil, 8, 16, 2); ctx.fill()
  ctx.fillStyle = '#166534'; ctx.fillRect(-2, 8 + recoil, 4, 4)
  // DCA label
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'
  ctx.fillText('DCA', 0, 14)
  ctx.restore()
}

export function drawDiamondHands(ctx: Ctx, t: number) {
  // Two diamond fists with sparkles, blue gradient
  ctx.save()
  ctx.shadowColor = 'rgba(96,165,250,0.6)'; ctx.shadowBlur = 12
  const sway = Math.sin(t * 1.2) * 2
  // Left fist
  drawFist(ctx, -12 + sway, 2, t, -1)
  // Right fist
  drawFist(ctx, 12 - sway, 2, t, 1)
  ctx.shadowBlur = 0
  // Sparkles orbiting
  for (let i = 0; i < 5; i++) {
    const a = t * 1.5 + i * 1.25
    const sx = Math.cos(a) * 18, sy = Math.sin(a) * 14 - 4
    const tw = (Math.sin(t * 4 + i) + 1) * 0.5
    ctx.fillStyle = `rgba(255,255,255,${tw})`
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

function drawFist(ctx: Ctx, x: number, y: number, t: number, dir: number) {
  const g = ctx.createLinearGradient(x - 8, y - 10, x + 8, y + 10)
  g.addColorStop(0, '#bfdbfe'); g.addColorStop(0.5, '#3b82f6'); g.addColorStop(1, '#1e3a8a')
  ctx.fillStyle = g
  // Fist block
  rr(ctx, x - 8, y - 10, 16, 16, 3); ctx.fill()
  // Knuckle lines
  ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 1
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(x - 6 + i * 4, y - 8); ctx.lineTo(x - 6 + i * 4, y - 4); ctx.stroke()
  }
  // Thumb
  ctx.fillStyle = '#60a5fa'
  ctx.beginPath(); ctx.arc(x + dir * 7, y - 2, 3, 0, Math.PI * 2); ctx.fill()
  // Diamond on top of fist
  drawDiamond(ctx, x, y - 16, 7, t)
}

export function drawDiamond(ctx: Ctx, cx: number, cy: number, size: number, t: number) {
  ctx.save()
  ctx.translate(cx, cy)
  const pulse = 1 + Math.sin(t * 3) * 0.08
  ctx.scale(pulse, pulse)
  const g = ctx.createLinearGradient(0, -size, 0, size)
  g.addColorStop(0, '#e0f2fe'); g.addColorStop(0.5, '#38bdf8'); g.addColorStop(1, '#0c4a6e')
  ctx.fillStyle = g
  ctx.shadowColor = 'rgba(56,189,248,0.7)'; ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(0, -size); ctx.lineTo(size * 0.7, 0); ctx.lineTo(0, size); ctx.lineTo(-size * 0.7, 0)
  ctx.closePath(); ctx.fill()
  ctx.shadowBlur = 0
  // Facet lines
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, -size); ctx.lineTo(0, size)
  ctx.moveTo(-size * 0.7, 0); ctx.lineTo(size * 0.7, 0)
  ctx.stroke()
  // Sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath(); ctx.arc(-size * 0.2, -size * 0.3, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function drawApeSniper(ctx: Ctx, t: number) {
  // Cyan ape with ice cannon and ice aura
  ctx.save()
  // Ice aura
  const aura = 0.4 + Math.sin(t * 2) * 0.2
  ctx.fillStyle = `rgba(56,189,248,${aura * 0.25})`
  ctx.beginPath(); ctx.arc(0, 0, S * 0.42, 0, Math.PI * 2); ctx.fill()
  // Body
  const g = ctx.createLinearGradient(0, -18, 0, 18)
  g.addColorStop(0, '#a5f3fc'); g.addColorStop(0.5, '#22d3ee'); g.addColorStop(1, '#0e7490')
  ctx.fillStyle = g
  ctx.shadowColor = 'rgba(34,211,238,0.5)'; ctx.shadowBlur = 10
  rr(ctx, -14, -6, 28, 22, 4); ctx.fill()
  ctx.shadowBlur = 0
  // Head
  ctx.fillStyle = '#67e8f9'
  ctx.beginPath(); ctx.arc(0, -14, 11, 0, Math.PI * 2); ctx.fill()
  // Ears
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath(); ctx.arc(-11, -14, 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(11, -14, 4, 0, Math.PI * 2); ctx.fill()
  // Ice cannon
  ctx.fillStyle = '#0891b2'
  rr(ctx, 8, -4, 14, 8, 2); ctx.fill()
  ctx.fillStyle = '#155e75'; ctx.fillRect(20, -3, 4, 6)
  // Ice breath muzzle
  const mb = (Math.sin(t * 3) + 1) * 0.5
  ctx.fillStyle = `rgba(186,240,255,${mb})`
  ctx.beginPath(); ctx.arc(24, 0, 2 + mb * 3, 0, Math.PI * 2); ctx.fill()
  // Sniping eye
  ctx.fillStyle = '#0c4a6e'
  ctx.beginPath(); ctx.arc(-2, -16, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath(); ctx.arc(-1.5, -16.5, 1, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function drawRocketApes(ctx: Ctx, t: number) {
  // Red rocket with ape face, flame trail, warning pulse
  ctx.save()
  const pulse = 0.5 + Math.sin(t * 4) * 0.5
  // Warning pulse halo
  ctx.fillStyle = `rgba(239,68,68,${pulse * 0.3})`
  ctx.beginPath(); ctx.arc(0, 0, S * 0.45, 0, Math.PI * 2); ctx.fill()
  // Rocket body
  const g = ctx.createLinearGradient(-10, -20, 10, 14)
  g.addColorStop(0, '#fecaca'); g.addColorStop(0.5, '#ef4444'); g.addColorStop(1, '#7f1d1d')
  ctx.fillStyle = g
  ctx.shadowColor = 'rgba(239,68,68,0.5)'; ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(0, -22); ctx.lineTo(10, -8); ctx.lineTo(10, 10); ctx.lineTo(-10, 10); ctx.lineTo(-10, -8)
  ctx.closePath(); ctx.fill()
  ctx.shadowBlur = 0
  // Fins
  ctx.fillStyle = '#991b1b'
  ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(-16, 12); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(10, 4); ctx.lineTo(16, 12); ctx.lineTo(10, 12); ctx.closePath(); ctx.fill()
  // Window with ape face
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath(); ctx.arc(0, -6, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fde68a'
  ctx.beginPath(); ctx.arc(0, -6, 4.5, 0, Math.PI * 2); ctx.fill()
  // Ape grin
  ctx.fillStyle = '#7f1d1d'
  ctx.beginPath(); ctx.arc(0, -4, 2, 0, Math.PI); ctx.fill()
  // Flame trail (animated)
  const fl = 4 + Math.sin(t * 6) * 3
  const fg = ctx.createLinearGradient(0, 12, 0, 26)
  fg.addColorStop(0, '#fbbf24'); fg.addColorStop(0.5, '#ef4444'); fg.addColorStop(1, 'rgba(127,29,29,0)')
  ctx.fillStyle = fg
  ctx.beginPath()
  ctx.moveTo(-6, 12); ctx.lineTo(0, 14 + fl * 2); ctx.lineTo(6, 12); ctx.closePath(); ctx.fill()
  // Warning label
  ctx.fillStyle = `rgba(254,202,202,${pulse})`
  ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'
  ctx.fillText('!', 0, 8)
  ctx.restore()
}

export function drawMaxBuyer(ctx: Ctx, t: number) {
  // Orange double-barrel robot with MAX BUY label
  ctx.save()
  const r = Math.sin(t * 4) * 2
  // Body
  const g = ctx.createLinearGradient(-14, -16, 14, 12)
  g.addColorStop(0, '#fed7aa'); g.addColorStop(0.5, '#f97316'); g.addColorStop(1, '#7c2d12')
  ctx.fillStyle = g
  ctx.shadowColor = 'rgba(249,115,22,0.5)'; ctx.shadowBlur = 10
  rr(ctx, -14, -14, 28, 22, 4); ctx.fill()
  ctx.shadowBlur = 0
  // Head
  ctx.fillStyle = '#fb923c'
  rr(ctx, -8, -20, 16, 10, 3); ctx.fill()
  // Eyes
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath(); ctx.arc(-4, -15, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(4, -15, 1.5, 0, Math.PI * 2); ctx.fill()
  // Double barrels (alternate recoil)
  ctx.fillStyle = '#7c2d12'
  rr(ctx, -12, -4 + r, 6, 14, 1); ctx.fill()
  rr(ctx, 6, -4 - r, 6, 14, 1); ctx.fill()
  ctx.fillStyle = '#c2611a'
  ctx.fillRect(-11, 8 + r, 4, 4); ctx.fillRect(7, 8 - r, 4, 4)
  // MAX BUY label
  ctx.fillStyle = '#fed7aa'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'
  ctx.fillText('MAX BUY', 0, 4)
  ctx.restore()
}

export function drawPumpSquad(ctx: Ctx, t: number) {
  // Purple three-headed ape squad
  ctx.save()
  ctx.shadowColor = 'rgba(168,85,247,0.5)'; ctx.shadowBlur = 10
  const g = ctx.createLinearGradient(0, -16, 0, 16)
  g.addColorStop(0, '#e9d5ff'); g.addColorStop(0.5, '#a855f7'); g.addColorStop(1, '#3b0764')
  ctx.fillStyle = g
  // Shared body
  rr(ctx, -18, -2, 36, 18, 4); ctx.fill()
  ctx.shadowBlur = 0
  // Three heads (different bob phases)
  const heads = [-14, 0, 14]
  heads.forEach((hx, i) => {
    const bob = Math.sin(t * 2 + i * 1.2) * 2
    ctx.fillStyle = '#c084fc'
    ctx.beginPath(); ctx.arc(hx, -10 + bob, 7, 0, Math.PI * 2); ctx.fill()
    // Face
    ctx.fillStyle = '#3b0764'
    ctx.beginPath(); ctx.arc(hx - 2, -11 + bob, 1.2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(hx + 2, -11 + bob, 1.2, 0, Math.PI * 2); ctx.fill()
    // Grin
    ctx.fillStyle = '#581c87'
    ctx.beginPath(); ctx.arc(hx, -8 + bob, 2, 0, Math.PI); ctx.fill()
  })
  // PUMP label
  ctx.fillStyle = '#e9d5ff'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'
  ctx.fillText('PUMP', 0, 10)
  ctx.restore()
}

export function drawFudShield(ctx: Ctx, t: number) {
  // Tall gray shield with rivets and FUD label
  ctx.save()
  const glow = 0.3 + Math.sin(t * 1.5) * 0.2
  ctx.shadowColor = `rgba(192,132,252,${glow})`; ctx.shadowBlur = 10
  // Shield outline
  const g = ctx.createLinearGradient(-14, -26, 14, 26)
  g.addColorStop(0, '#e5e7eb'); g.addColorStop(0.5, '#9ca3af'); g.addColorStop(1, '#374151')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, -28); ctx.lineTo(14, -18); ctx.lineTo(14, 14); ctx.lineTo(0, 28); ctx.lineTo(-14, 14); ctx.lineTo(-14, -18)
  ctx.closePath(); ctx.fill()
  ctx.shadowBlur = 0
  // Inner shield face
  ctx.fillStyle = '#4b5563'
  ctx.beginPath()
  ctx.moveTo(0, -22); ctx.lineTo(10, -14); ctx.lineTo(10, 10); ctx.lineTo(0, 22); ctx.lineTo(-10, 10); ctx.lineTo(-10, -14)
  ctx.closePath(); ctx.fill()
  // Rivets
  ctx.fillStyle = '#d1d5db'
  const rivets = [[-9, -15], [9, -15], [0, -22], [-9, 10], [9, 10], [0, 22]]
  rivets.forEach(([rx, ry]) => {
    ctx.beginPath(); ctx.arc(rx, ry, 1.5, 0, Math.PI * 2); ctx.fill()
  })
  // FUD label
  ctx.fillStyle = '#fde68a'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('FUD', 0, -2)
  // Cross detail
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 8); ctx.moveTo(-7, -3); ctx.lineTo(7, -3); ctx.stroke()
  ctx.restore()
}

// ============================================================
// JEET SPRITES — bearish palette (gray/red/purple)
// ============================================================

export function drawJeet(
  ctx: Ctx, type: JeetType, cx: number, cy: number, frame: number,
  hp: number, maxHp: number, armorHp: number, flash: number, eating: boolean, angered: boolean
) {
  ctx.save()
  ctx.translate(cx, cy)
  const t = frame * 0.15
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath(); ctx.ellipse(0, S * 0.4, S * 0.3, S * 0.06, 0, 0, Math.PI * 2); ctx.fill()
  switch (type) {
    case 'paper_hand': drawPaperHand(ctx, t, eating); break
    case 'fudster': drawFudster(ctx, t, eating); break
    case 'whale_jeet': drawWhaleJeet(ctx, t, eating); break
    case 'rug_puller': drawRugPuller(ctx, t, eating); break
    case 'mev_bot': drawMevBot(ctx, t, eating); break
    case 'bot_jeet': drawBotJeet(ctx, t, eating, angered); break
    case 'whale_dumper': drawWhaleDumper(ctx, t, eating); break
  }
  // Armor bar
  if (armorHp > 0) {
    const w = S * 0.4
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-w / 2 - 1, -S * 0.5 - 6, w + 2, 3 + 2)
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(-w / 2, -S * 0.5 - 6, w * Math.min(1, armorHp / 4), 3)
  }
  // HP bar
  if (hp < maxHp) {
    const w = S * 0.4, h2 = 4, y2 = -S * 0.5
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-w / 2 - 1, y2 - 1, w + 2, h2 + 2)
    const pct = Math.max(0, hp / maxHp)
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#fbbf24' : '#ef4444'
    ctx.fillRect(-w / 2, y2, w * pct, h2)
  }
  // Flash overlay when hit
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.7, flash * 0.15)})`
    ctx.beginPath(); ctx.ellipse(0, 0, S * 0.35, S * 0.4, 0, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

export function drawJeetBase(ctx: Ctx, t: number, eating: boolean, bodyColor: string, accentColor: string) {
  // Body + arms + legs with walk animation
  const walk = eating ? 0 : Math.sin(t * 4) * 2
  const lean = eating ? Math.sin(t * 6) * 1.5 : 0
  // Body
  const g = ctx.createLinearGradient(0, -14, 0, 10)
  g.addColorStop(0, bodyColor); g.addColorStop(1, accentColor)
  ctx.fillStyle = g
  rr(ctx, -10 + lean, -12, 20, 20, 3); ctx.fill()
  // Arms — reach forward when eating
  ctx.fillStyle = accentColor
  const armFwd = eating ? 6 : 2
  rr(ctx, 8 + lean, -8, 4 + armFwd, 4, 1.5); ctx.fill()
  rr(ctx, -12 + lean, -8, 4, 4, 1.5); ctx.fill()
  // Hands
  ctx.fillStyle = bodyColor
  ctx.beginPath(); ctx.arc(12 + armFwd + lean, -6, 2, 0, Math.PI * 2); ctx.fill()
  // Legs (walk cycle)
  ctx.fillStyle = accentColor
  rr(ctx, -7, 8, 5, 6 + walk, 1.5); ctx.fill()
  rr(ctx, 2, 8, 5, 6 - walk, 1.5); ctx.fill()
  // Feet
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(-8, 13 + walk, 6, 2); ctx.fillRect(1, 13 - walk, 6, 2)
}

export function drawJeetHead(
  ctx: Ctx, cx: number, cy: number, skinColor: string, darkColor: string, t: number, eating: boolean
) {
  // Head with panicked eyes
  ctx.save()
  ctx.translate(cx, cy)
  const jaw = eating ? Math.sin(t * 8) * 2 : 0
  // Head
  const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 10)
  g.addColorStop(0, skinColor); g.addColorStop(1, darkColor)
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill()
  // Ears
  ctx.fillStyle = darkColor
  ctx.beginPath(); ctx.arc(-9, -1, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(9, -1, 2.5, 0, Math.PI * 2); ctx.fill()
  // Panicked eyes (wide, darting)
  const dart = Math.sin(t * 3) * 1.5
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-3, -1, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(3, -1, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath(); ctx.arc(-3 + dart, -1, 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(3 + dart, -1, 1.2, 0, Math.PI * 2); ctx.fill()
  // Sweaty brow
  ctx.fillStyle = 'rgba(125,211,252,0.6)'
  ctx.beginPath(); ctx.arc(5, -5, 1.2, 0, Math.PI * 2); ctx.fill()
  // Mouth (chomp when eating)
  ctx.fillStyle = '#1a1a1a'
  if (eating) {
    rr(ctx, -3, 3 - jaw, 6, 3 + jaw, 1); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.fillRect(-2, 3 - jaw, 1, 1); ctx.fillRect(1, 3 - jaw, 1, 1)
  } else {
    // Panicked frown
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(-3, 5); ctx.quadraticCurveTo(0, 3, 3, 5); ctx.stroke()
  }
  ctx.restore()
}

export function drawPaperHand(ctx: Ctx, t: number, eating: boolean) {
  // Gray jeet clutching paper money
  drawJeetBase(ctx, t, eating, '#9ca3af', '#374151')
  drawJeetHead(ctx, 0, -16, '#d1d5db', '#4b5563', t, eating)
  // Paper money in hand
  ctx.fillStyle = '#dcfce7'
  rr(ctx, 9, -7, 7, 5, 1); ctx.fill()
  ctx.fillStyle = '#16a34a'
  ctx.font = 'bold 4px monospace'; ctx.textAlign = 'center'
  ctx.fillText('$', 12.5, -4.5)
  // Crumpled edges
  ctx.strokeStyle = '#86efac'; ctx.lineWidth = 0.5
  ctx.strokeRect(9.5, -6.5, 6, 4)
}

export function drawFudster(ctx: Ctx, t: number, eating: boolean) {
  // Tinfoil hat armor jeet
  drawJeetBase(ctx, t, eating, '#6b7280', '#1f2937')
  drawJeetHead(ctx, 0, -16, '#9ca3af', '#374151', t, eating)
  // Tinfoil hat (crinkly, shiny)
  ctx.save()
  const g = ctx.createLinearGradient(-8, -26, 8, -20)
  g.addColorStop(0, '#f3f4f6'); g.addColorStop(0.5, '#9ca3af'); g.addColorStop(1, '#d1d5db')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-7, -20); ctx.lineTo(0, -26); ctx.lineTo(7, -20); ctx.lineTo(6, -18); ctx.lineTo(-6, -18)
  ctx.closePath(); ctx.fill()
  // Crinkle highlights
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.5
  for (let i = -2; i <= 2; i += 2) {
    ctx.beginPath(); ctx.moveTo(i, -20); ctx.lineTo(i * 0.3, -25); ctx.stroke()
  }
  ctx.restore()
  // Bullhorn
  ctx.fillStyle = '#374151'
  rr(ctx, -14, -8, 4, 6, 1); ctx.fill()
  ctx.fillStyle = '#9ca3af'
  ctx.fillRect(-13, -7, 1, 4)
}

export function drawWhaleJeet(ctx: Ctx, t: number, eating: boolean) {
  // Big jeet with diamond skull helmet
  ctx.save()
  ctx.scale(1.25, 1.25)
  drawJeetBase(ctx, t, eating, '#4b5563', '#111827')
  drawJeetHead(ctx, 0, -16, '#6b7280', '#1f2937', t, eating)
  // Diamond skull helmet
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath(); ctx.arc(0, -19, 7, Math.PI, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#e5e7eb'
  // Skull eyesockets
  ctx.fillStyle = '#0f172a'
  ctx.beginPath(); ctx.arc(-3, -19, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(3, -19, 1.5, 0, Math.PI * 2); ctx.fill()
  // Diamond on forehead
  drawDiamond(ctx, 0, -23, 4, t)
  ctx.restore()
}

export function drawRugPuller(ctx: Ctx, t: number, eating: boolean) {
  // Red fast jeet with speed lines and lock icon
  ctx.save()
  // Speed lines trailing
  const sg = ctx.createLinearGradient(-22, 0, -2, 0)
  sg.addColorStop(0, 'rgba(239,68,68,0)'); sg.addColorStop(1, 'rgba(239,68,68,0.5)')
  ctx.fillStyle = sg
  for (let i = 0; i < 4; i++) {
    const ly = -8 + i * 5 + Math.sin(t * 8 + i) * 1
    ctx.fillRect(-22 + i * 2, ly, 18 - i * 3, 1.5)
  }
  // Body (red, leaning forward)
  const lean = -3
  drawJeetBase(ctx, t, false, '#ef4444', '#7f1d1d')
  // Lock icon on chest
  ctx.fillStyle = '#fde68a'
  rr(ctx, -3, -6, 6, 5, 1); ctx.fill()
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(0, -8, 2, Math.PI, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = '#7f1d1d'
  ctx.beginPath(); ctx.arc(0, -3.5, 0.8, 0, Math.PI * 2); ctx.fill()
  drawJeetHead(ctx, lean, -16, '#fca5a5', '#7f1d1d', t, eating)
  ctx.restore()
}

export function drawMevBot(ctx: Ctx, t: number, eating: boolean) {
  // Purple robot jeet with scanning eyes and antenna
  drawJeetBase(ctx, t, eating, '#7c3aed', '#3b0764')
  // Robot head (rectangular)
  ctx.fillStyle = '#a855f7'
  rr(ctx, -8, -22, 16, 14, 2); ctx.fill()
  ctx.fillStyle = '#3b0764'
  rr(ctx, -6, -20, 12, 8, 1); ctx.fill()
  // Scanning eyes (sweep)
  const sweep = Math.sin(t * 4) * 4
  ctx.fillStyle = '#e9d5ff'
  ctx.fillRect(-5 + sweep, -18, 2, 2)
  ctx.fillStyle = '#7c3aed'
  ctx.fillRect(-6, -15, 12, 1)
  // Antenna
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, -28); ctx.stroke()
  const blink = (Math.sin(t * 6) + 1) * 0.5
  ctx.fillStyle = `rgba(236,72,153,${0.5 + blink * 0.5})`
  ctx.beginPath(); ctx.arc(0, -28, 2, 0, Math.PI * 2); ctx.fill()
  // MEV label
  ctx.fillStyle = '#e9d5ff'; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center'
  ctx.fillText('MEV', 0, -2)
}

export function drawBotJeet(ctx: Ctx, t: number, eating: boolean, angered: boolean) {
  // Green jeet with newspaper; turns red when angered
  const body = angered ? '#ef4444' : '#16a34a'
  const accent = angered ? '#7f1d1d' : '#14532d'
  drawJeetBase(ctx, t, eating, body, accent)
  drawJeetHead(ctx, 0, -16, angered ? '#fca5a5' : '#86efac', angered ? '#7f1d1d' : '#14532d', t, eating)
  // Newspaper
  ctx.fillStyle = '#f9fafb'
  rr(ctx, 8, -9, 8, 8, 1); ctx.fill()
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 4px monospace'; ctx.textAlign = 'center'
  ctx.fillText('FUD', 12, -5)
  // Red headline bar
  ctx.fillStyle = angered ? '#ef4444' : '#16a34a'
  ctx.fillRect(8.5, -8.5, 7, 1)
}

export function drawWhaleDumper(ctx: Ctx, t: number, eating: boolean) {
  // BOSS — huge whale with red eye, teeth, DUMP label
  ctx.save()
  ctx.scale(1.6, 1.6)
  ctx.shadowColor = 'rgba(239,68,68,0.5)'; ctx.shadowBlur = 14
  // Whale body
  const g = ctx.createLinearGradient(-20, -12, 20, 14)
  g.addColorStop(0, '#1e3a8a'); g.addColorStop(0.5, '#1d4ed8'); g.addColorStop(1, '#0c4a6e')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-20, -16, 0, -16)
  ctx.quadraticCurveTo(18, -14, 22, 2); ctx.quadraticCurveTo(18, 14, 0, 14)
  ctx.quadraticCurveTo(-18, 14, -22, 0); ctx.closePath(); ctx.fill()
  ctx.shadowBlur = 0
  // Tail flukes
  ctx.fillStyle = '#1e3a8a'
  ctx.beginPath()
  ctx.moveTo(20, 2); ctx.lineTo(28, -6); ctx.lineTo(26, 2); ctx.lineTo(28, 10); ctx.closePath(); ctx.fill()
  // Belly
  ctx.fillStyle = '#bfdbfe'
  ctx.beginPath(); ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2); ctx.fill()
  // Red eye (angry)
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath(); ctx.arc(-10, -4, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ef4444'
  ctx.beginPath(); ctx.arc(-10, -4, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(-10.5, -4.5, 1, 0, Math.PI * 2); ctx.fill()
  // Teeth
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 5; i++) {
    const tx = -6 + i * 3
    ctx.beginPath()
    ctx.moveTo(tx, 4); ctx.lineTo(tx + 1.5, 4); ctx.lineTo(tx + 0.75, 6 + Math.sin(t * 4 + i) * 0.5)
    ctx.closePath(); ctx.fill()
  }
  // Blowhole spray
  const sp = (t * 2) % 1
  ctx.fillStyle = `rgba(186,230,253,${1 - sp})`
  ctx.beginPath(); ctx.arc(-2, -18 - sp * 6, 1.5 + sp * 2, 0, Math.PI * 2); ctx.fill()
  // DUMP label
  ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'
  ctx.fillText('DUMP', 2, 4)
  ctx.restore()
}

// ============================================================
// UTILITY SPRITES
// ============================================================

export function drawProjectile(
  ctx: Ctx, type: ProjectileType, x: number, y: number, trail: number[], frame: number
) {
  ctx.save()
  ctx.translate(x, y)
  const t = frame * 0.1
  const colorMap: Record<ProjectileType, [string, string, string]> = {
    green_candle: ['#4ade80', '#16a34a', '#0c4a6e'],
    ice_candle: ['#a5f3fc', '#22d3ee', '#0e7490'],
    red_candle: ['#fca5a5', '#ef4444', '#7f1d1d'],
  }
  const [c0, c1, c2] = colorMap[type]
  // Trail glow
  ctx.shadowColor = c0; ctx.shadowBlur = 8
  if (trail.length > 1) {
    ctx.strokeStyle = c1; ctx.lineWidth = 2
    ctx.beginPath()
    trail.forEach((ty, i) => {
      const tx = -(i + 1) * 3
      if (i === 0) ctx.moveTo(tx, ty - y); else ctx.lineTo(tx, ty - y)
    })
    ctx.stroke()
  }
  // Candlestick body
  const g = ctx.createLinearGradient(-3, -10, 3, 6)
  g.addColorStop(0, c0); g.addColorStop(0.6, c1); g.addColorStop(1, c2)
  ctx.fillStyle = g
  rr(ctx, -2.5, -8, 5, 14, 1); ctx.fill()
  ctx.shadowBlur = 0
  // Wicks
  ctx.strokeStyle = c2; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -12); ctx.moveTo(0, 6); ctx.lineTo(0, 10); ctx.stroke()
  // Glow tip
  const glow = 0.5 + Math.sin(t * 4) * 0.5
  ctx.fillStyle = `rgba(255,255,255,${glow})`
  ctx.beginPath(); ctx.arc(0, -8, 1.5, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function drawTendie(ctx: Ctx, x: number, y: number, pulse: number, value: number) {
  ctx.save()
  ctx.translate(x, y)
  const r = 6 + Math.sin(pulse * 0.3) * 1.5
  // Glow
  ctx.shadowColor = 'rgba(251,191,36,0.8)'; ctx.shadowBlur = 12 + Math.sin(pulse * 0.2) * 4
  // Coin body
  const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, r)
  g.addColorStop(0, '#fef3c7'); g.addColorStop(0.5, '#f59e0b'); g.addColorStop(1, '#78350f')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill()
  ctx.shadowBlur = 0
  // Rim
  ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke()
  // $ symbol
  ctx.fillStyle = '#7c2d12'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('$', 0, 0.5)
  // Sparkle
  const sp = (Math.sin(pulse * 0.5) + 1) * 0.5
  ctx.fillStyle = `rgba(255,255,255,${sp})`
  ctx.beginPath(); ctx.arc(-r * 0.4, -r * 0.4, 1, 0, Math.PI * 2); ctx.fill()
  // Value label
  if (value >= 10) {
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 6px monospace'
    ctx.fillText(`+${value}`, 0, r + 6)
  }
  ctx.restore()
}

export function drawLiquidationBot(ctx: Ctx, x: number, y: number, active: boolean, t: number) {
  ctx.save()
  ctx.translate(x, y)
  if (active) {
    // Active: spinning blades, red, motion
    const spin = t * 20
    ctx.shadowColor = 'rgba(239,68,68,0.7)'; ctx.shadowBlur = 12
    // Body
    ctx.fillStyle = '#7f1d1d'
    rr(ctx, -10, -6, 20, 12, 2); ctx.fill()
    ctx.shadowBlur = 0
    // Spinning blade
    ctx.save()
    ctx.rotate(spin)
    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate(i * 2.094)
      rr(ctx, -1, -12, 2, 12, 0.5); ctx.fill()
      ctx.restore()
    }
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    // Red status LED
    const blink = (Math.sin(t * 8) + 1) * 0.5
    ctx.fillStyle = `rgba(239,68,68,${blink})`
    ctx.beginPath(); ctx.arc(-6, -3, 1.5, 0, Math.PI * 2); ctx.fill()
    // LIQ label
    ctx.fillStyle = '#fecaca'; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center'
    ctx.fillText('LIQ', 0, 10)
  } else {
    // Idle: gray lawnmower bot, dormant
    ctx.fillStyle = '#6b7280'
    rr(ctx, -10, -6, 20, 12, 2); ctx.fill()
    ctx.fillStyle = '#374151'
    ctx.beginPath(); ctx.arc(-6, -3, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(6, -3, 1.5, 0, Math.PI * 2); ctx.fill()
    // Dormant blade outline
    ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = '#9ca3af'; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center'
    ctx.fillText('IDLE', 0, 10)
  }
  ctx.restore()
}

export function drawHolderCard(
  ctx: Ctx, type: HolderType, x: number, y: number, w: number, h: number, available: boolean, cooldown: number
) {
  ctx.save()
  // Card background
  const g = ctx.createLinearGradient(x, y, x, y + h)
  if (available) { g.addColorStop(0, '#1e293b'); g.addColorStop(1, '#0f172a') }
  else { g.addColorStop(0, '#374151'); g.addColorStop(1, '#1f2937') }
  ctx.fillStyle = g
  ctx.shadowColor = available ? 'rgba(251,191,36,0.4)' : 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = available ? 8 : 2
  rr(ctx, x, y, w, h, 4); ctx.fill()
  ctx.shadowBlur = 0
  // Border
  ctx.strokeStyle = available ? '#fbbf24' : '#4b5563'; ctx.lineWidth = 1.5
  ctx.stroke()
  // Holder preview (scaled sprite in card)
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.scale((h / S) * 0.85, (h / S) * 0.85)
  drawHolder(ctx, type, 0, 0, 0, 1, 1)
  ctx.restore()
  // Cooldown overlay
  if (cooldown > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(x, y, w, h * cooldown)
    // Sweep edge
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(x, y + h * cooldown - 1, w, 1)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.ceil(cooldown * 100)}%`, x + w / 2, y + h / 2)
  }
  ctx.restore()
}
