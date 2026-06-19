// ============================================================
// Holders vs Jeets — Game Engine
// ============================================================
import {
  GRID_COLS, GRID_ROWS, CELL_W, CELL_H, GRID_OFFSET_X, GRID_OFFSET_Y,
  CANVAS_W, CANVAS_H, STARTING_TENDIES, TENDIE_VALUE,
  SKY_TENDIE_INTERVAL_MIN, SKY_TENDIE_INTERVAL_MAX, TENDIE_LIFE,
  HOLDER_DEFS, JEET_DEFS, TOTAL_WAVES, generateWaves, HOLDER_ORDER,
} from './config'
import type {
  Holder, Jeet, Projectile, Tendie, Particle, LiquidationBot,
  HolderType, JeetType, GamePhase, GameStats, Wave, LeaderboardEntry,
  ParticleType, ProjectileType,
} from './types'
import {
  drawHolder, drawJeet, drawProjectile, drawTendie, drawLiquidationBot, drawHolderCard,
} from './sprites'

export class GameEngine {
  phase: GamePhase = 'playing'
  tendies: number = STARTING_TENDIES
  holders: Holder[] = []
  jeets: Jeet[] = []
  projectiles: Projectile[] = []
  tendieCoins: Tendie[] = []
  particles: Particle[] = []
  liquidationBots: LiquidationBot[] = []
  waves: Wave[] = []
  currentWaveIndex: number = 0
  waveTimer: number = 0
  waveActive: boolean = false
  waveSpawnIndex: number = 0
  skyTendieTimer: number = 3
  selectedHolder: HolderType | null = null
  cardCooldowns: Record<string, number> = {}
  stats: GameStats = { score: 0, wave: 0, jeetsKilled: 0, holdersPlaced: 0, tendiesCollected: STARTING_TENDIES, combo: 0, comboTimer: 0, maxCombo: 0 }
  grid: (number | null)[][] = []
  private nextId = 1
  gameTime = 0
  onGameOver: (() => void) | null = null
  onVictory: (() => void) | null = null
  onWaveChange: ((wave: number) => void) | null = null
  onStateChange: (() => void) | null = null
  leaderboard: LeaderboardEntry[] = []
  mouseX = 0; mouseY = 0
  hoverRow = -1; hoverCol = -1

  constructor() { this.init() }

  init() {
    this.grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null))
    this.cardCooldowns = {}
    for (const type of Object.keys(HOLDER_DEFS) as HolderType[]) this.cardCooldowns[type] = 0
    this.liquidationBots = []
    for (let r = 0; r < GRID_ROWS; r++) {
      this.liquidationBots.push({ row: r, x: GRID_OFFSET_X - 20, active: false, triggered: false, vx: 0 })
    }
    this.waves = generateWaves(TOTAL_WAVES)
    this.loadLeaderboard()
    this.phase = 'playing'
    this.tendies = STARTING_TENDIES
  }

  reset() {
    this.holders = []; this.jeets = []; this.projectiles = []
    this.tendieCoins = []; this.particles = []
    this.currentWaveIndex = 0; this.waveTimer = 0; this.waveActive = false
    this.waveSpawnIndex = 0; this.skyTendieTimer = 3; this.gameTime = 0
    this.selectedHolder = null
    this.stats = { score: 0, wave: 0, jeetsKilled: 0, holdersPlaced: 0, tendiesCollected: STARTING_TENDIES, combo: 0, comboTimer: 0, maxCombo: 0 }
    this.tendies = STARTING_TENDIES
    this.init()
  }

  loadLeaderboard() {
    try { const d = localStorage.getItem('hvj_leaderboard'); if (d) this.leaderboard = JSON.parse(d) } catch { this.leaderboard = [] }
  }

  saveScore(name: string) {
    const entry: LeaderboardEntry = { name: name.slice(0, 12).toUpperCase(), score: this.stats.score, wave: this.stats.wave, date: Date.now() }
    this.leaderboard.push(entry)
    this.leaderboard.sort((a, b) => b.score - a.score)
    this.leaderboard = this.leaderboard.slice(0, 50)
    try { localStorage.setItem('hvj_leaderboard', JSON.stringify(this.leaderboard)) } catch {}
  }

  selectHolder(type: HolderType) {
    const def = HOLDER_DEFS[type]
    if (this.tendies < def.cost) return
    if (this.cardCooldowns[type] > 0) return
    this.selectedHolder = type
  }

  handleClick(x: number, y: number) {
    for (const t of this.tendieCoins) {
      const dx = x - t.x, dy = y - t.y
      if (dx * dx + dy * dy < 400) { this.collectTendie(t); return }
    }
    if (this.selectedHolder) {
      const col = Math.floor((x - GRID_OFFSET_X) / CELL_W)
      const row = Math.floor((y - GRID_OFFSET_Y) / CELL_H)
      if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS && this.grid[row][col] === null) {
        this.placeHolder(this.selectedHolder, row, col)
      }
    }
  }

  updateMouse(x: number, y: number) {
    this.mouseX = x; this.mouseY = y
    const col = Math.floor((x - GRID_OFFSET_X) / CELL_W)
    const row = Math.floor((y - GRID_OFFSET_Y) / CELL_H)
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) { this.hoverRow = row; this.hoverCol = col }
    else { this.hoverRow = -1; this.hoverCol = -1 }
  }

  placeHolder(type: HolderType, row: number, col: number) {
    const def = HOLDER_DEFS[type]
    if (this.tendies < def.cost || this.cardCooldowns[type] > 0 || this.grid[row][col] !== null) return
    this.tendies -= def.cost
    const h: Holder = { id: this.nextId++, type, row, col, hp: def.hp, maxHp: def.hp, shootTimer: 0, produceTimer: 0, animFrame: 0, animTimer: 0, placedAt: this.gameTime, fuseTimer: def.fuseTime }
    this.holders.push(h)
    this.grid[row][col] = h.id
    this.cardCooldowns[type] = def.cooldown
    this.selectedHolder = null
    this.stats.holdersPlaced++
    this.spawnParticles(GRID_OFFSET_X + col * CELL_W + CELL_W / 2, GRID_OFFSET_Y + row * CELL_H + CELL_H / 2, 8, 'sparkle', def.color)
    this.onStateChange?.()
  }

  collectTendie(t: Tendie) {
    this.tendies += t.value; this.stats.tendiesCollected += t.value
    this.spawnParticles(t.x, t.y, 6, 'collect', '#fbbf24')
    this.tendieCoins = this.tendieCoins.filter(x => x.id !== t.id)
    this.onStateChange?.()
  }

  spawnSkyTendie() {
    const x = GRID_OFFSET_X + Math.random() * (GRID_COLS * CELL_W)
    this.tendieCoins.push({ id: this.nextId++, x, y: -20, vy: 0, targetY: GRID_OFFSET_Y + Math.random() * (GRID_ROWS * CELL_H), value: TENDIE_VALUE, landed: false, life: TENDIE_LIFE, pulse: 0 })
  }

  startWave() {
    if (this.currentWaveIndex >= this.waves.length) return
    this.waveActive = true; this.waveTimer = 0; this.waveSpawnIndex = 0
    this.stats.wave = this.waves[this.currentWaveIndex].number
    this.onWaveChange?.(this.stats.wave); this.onStateChange?.()
  }

  spawnJeet(type: JeetType, row: number) {
    const def = JEET_DEFS[type]
    this.jeets.push({ id: this.nextId++, type, row, x: CANVAS_W + 20, hp: def.hp, maxHp: def.hp, speed: def.speed, baseSpeed: def.speed, eating: false, eatTimer: 0, armorHp: def.armorHp, animFrame: 0, animTimer: 0, walkPhase: 0, flashTimer: 0 })
  }

  spawnParticles(x: number, y: number, count: number, type: ParticleType, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 30 + Math.random() * 80
      this.particles.push({ id: this.nextId++, type, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.5 + Math.random() * 0.5, maxLife: 1, size: 2 + Math.random() * 4, color, rotation: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 10 })
    }
  }

  spawnExplosion(x: number, y: number) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 50 + Math.random() * 200
      this.particles.push({ id: this.nextId++, type: 'explosion', x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.3 + Math.random() * 0.7, maxLife: 1, size: 3 + Math.random() * 6, color: i < 15 ? '#ef4444' : '#f97316', rotation: 0, vr: 0 })
    }
    this.particles.push({ id: this.nextId++, type: 'explosion', x, y, vx: 0, vy: 0, life: 0.2, maxLife: 0.2, size: 60, color: '#fbbf24', rotation: 0, vr: 0 })
  }

  fireProjectile(h: Holder, def: typeof HOLDER_DEFS[HolderType]) {
    const cx = GRID_OFFSET_X + h.col * CELL_W + CELL_W / 2 + 10
    const cy = GRID_OFFSET_Y + h.row * CELL_H + CELL_H / 2
    if (h.type === 'pump_squad' && def.lanes === 3) {
      for (let dr = -1; dr <= 1; dr++) {
        const r = h.row + dr
        if (r >= 0 && r < GRID_ROWS) {
          this.projectiles.push({ id: this.nextId++, type: 'green_candle', row: r, x: cx, y: GRID_OFFSET_Y + r * CELL_H + CELL_H / 2, vx: 300, damage: def.damage!, alive: true, trailY: [] })
        }
      }
    } else if (h.type === 'max_buyer') {
      this.projectiles.push({ id: this.nextId++, type: 'red_candle', row: h.row, x: cx, y: cy - 8, vx: 300, damage: def.damage!, alive: true, trailY: [] })
      this.projectiles.push({ id: this.nextId++, type: 'red_candle', row: h.row, x: cx + 8, y: cy + 8, vx: 300, damage: def.damage!, alive: true, trailY: [] })
    } else {
      const pt = def.projectileType as ProjectileType
      this.projectiles.push({ id: this.nextId++, type: pt, row: h.row, x: cx, y: cy, vx: 300, damage: def.damage!, alive: true, trailY: [] })
    }
  }

  damageJeet(j: Jeet, dmg: number, armorPiercing: boolean) {
    j.flashTimer = 0.15
    if (!armorPiercing && j.armorHp > 0) {
      const armorDmg = Math.min(j.armorHp, dmg)
      j.armorHp -= armorDmg; dmg -= armorDmg
      if (dmg <= 0) return
    }
    j.hp -= dmg
    if (j.hp <= 0) {
      this.stats.jeetsKilled++
      const def = JEET_DEFS[j.type]
      let points = def.reward
      this.stats.combo++; this.stats.comboTimer = 3
      if (this.stats.combo > this.stats.maxCombo) this.stats.maxCombo = this.stats.combo
      if (this.stats.combo > 1) points = Math.floor(points * (1 + this.stats.combo * 0.1))
      this.stats.score += points
      this.spawnParticles(j.x, GRID_OFFSET_Y + j.row * CELL_H + CELL_H / 2, 10, 'death', def.color)
    }
  }

  findHolderAt(row: number, x: number): Holder | null {
    const col = Math.floor((x - GRID_OFFSET_X) / CELL_W)
    if (col < 0 || col >= GRID_COLS) return null
    const id = this.grid[row][col]
    if (id === null) return null
    return this.holders.find(h => h.id === id) || null
  }

  findHolderAhead(row: number, x: number): Holder | null {
    for (let c = Math.floor((x - GRID_OFFSET_X) / CELL_W); c >= 0; c--) {
      const id = this.grid[row][c]
      if (id !== null) { const h = this.holders.find(h => h.id === id); if (h) return h }
    }
    return null
  }

  // ============================================================
  // UPDATE
  // ============================================================
  update(dt: number) {
    if (this.phase !== 'playing') return
    this.gameTime += dt

    for (const type of Object.keys(this.cardCooldowns) as HolderType[]) {
      if (this.cardCooldowns[type] > 0) this.cardCooldowns[type] = Math.max(0, this.cardCooldowns[type] - dt)
    }

    this.skyTendieTimer -= dt
    if (this.skyTendieTimer <= 0) {
      this.spawnSkyTendie()
      this.skyTendieTimer = SKY_TENDIE_INTERVAL_MIN + Math.random() * (SKY_TENDIE_INTERVAL_MAX - SKY_TENDIE_INTERVAL_MIN)
    }

    for (const t of this.tendieCoins) {
      if (!t.landed) {
        t.vy += 200 * dt; t.y += t.vy * dt
        if (t.y >= t.targetY) { t.y = t.targetY; t.landed = true; t.vy = 0 }
      } else { t.life -= dt; t.pulse += dt * 3 }
    }
    this.tendieCoins = this.tendieCoins.filter(t => t.life > 0)

    if (!this.waveActive && this.jeets.length === 0 && this.currentWaveIndex < this.waves.length) {
      this.waveTimer += dt
      if (this.waveTimer > 3) this.startWave()
    }

    if (this.waveActive) {
      this.waveTimer += dt
      const wave = this.waves[this.currentWaveIndex]
      while (this.waveSpawnIndex < wave.spawns.length && wave.spawns[this.waveSpawnIndex].delay <= this.waveTimer) {
        const s = wave.spawns[this.waveSpawnIndex]; this.spawnJeet(s.type, s.row); this.waveSpawnIndex++
      }
      if (this.waveSpawnIndex >= wave.spawns.length && this.jeets.length === 0) {
        this.waveActive = false; this.currentWaveIndex++; this.waveTimer = 0
        this.stats.score += wave.reward
        if (this.currentWaveIndex >= this.waves.length) {
          this.phase = 'victory'; this.onVictory?.(); this.onStateChange?.(); return
        }
      }
    }

    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt
      if (this.stats.comboTimer <= 0) this.stats.combo = 0
    }

    // Holders
    for (const h of this.holders) {
      const def = HOLDER_DEFS[h.type]
      h.animTimer += dt; h.animFrame += dt * 10
      if (h.type === 'staking_pool' && def.produceInterval) {
        h.produceTimer += dt
        if (h.produceTimer >= def.produceInterval!) {
          h.produceTimer = 0
          const cx = GRID_OFFSET_X + h.col * CELL_W + CELL_W / 2
          const cy = GRID_OFFSET_Y + h.row * CELL_H + CELL_H / 2
          this.tendieCoins.push({ id: this.nextId++, x: cx, y: cy - 20, vy: -80, targetY: cy + 10, value: def.produceAmount!, landed: false, life: TENDIE_LIFE, pulse: 0 })
          this.spawnParticles(cx, cy, 4, 'sparkle', '#fbbf24')
        }
      }
      if (def.shootInterval && def.damage) {
        let shouldShoot = false
        if (h.type === 'pump_squad' && def.lanes === 3) {
          for (const j of this.jeets) { if (j.row >= h.row - 1 && j.row <= h.row + 1 && j.x > GRID_OFFSET_X + h.col * CELL_W) { shouldShoot = true; break } }
        } else {
          for (const j of this.jeets) { if (j.row === h.row && j.x > GRID_OFFSET_X + h.col * CELL_W + CELL_W / 2) { shouldShoot = true; break } }
        }
        if (shouldShoot) {
          h.shootTimer += dt
          if (h.shootTimer >= def.shootInterval!) { h.shootTimer = 0; this.fireProjectile(h, def) }
        } else { h.shootTimer = 0 }
      }
      if (h.type === 'rocket_apes' && h.fuseTimer !== undefined) {
        h.fuseTimer -= dt
        if (h.fuseTimer <= 0 && !h.exploded) {
          h.exploded = true
          const cx = GRID_OFFSET_X + h.col * CELL_W + CELL_W / 2
          const cy = GRID_OFFSET_Y + h.row * CELL_H + CELL_H / 2
          this.spawnExplosion(cx, cy)
          const radius = def.explosionRadius! * CELL_W
          for (const j of this.jeets) {
            const dx = j.x - cx; const dy = (GRID_OFFSET_Y + j.row * CELL_H + CELL_H / 2) - cy
            if (dx * dx + dy * dy < radius * radius) this.damageJeet(j, def.explosionDamage!, true)
          }
          this.grid[h.row][h.col] = null
          this.holders = this.holders.filter(x => x.id !== h.id)
        }
      }
    }

    // Jeets
    for (const j of this.jeets) {
      j.animTimer += dt; j.animFrame += dt * 10
      if (j.flashTimer > 0) j.flashTimer -= dt
      if (j.slowed && j.slowed > 0) {
        j.slowed -= dt; j.speed = j.baseSpeed * (j.slowedAmount || 0.5)
        if (j.slowed <= 0) j.speed = j.baseSpeed
      } else if (j.angered && JEET_DEFS[j.type].enragedSpeed) {
        j.speed = JEET_DEFS[j.type].enragedSpeed!
      }

      const holderAtPos = this.findHolderAt(j.row, j.x)
      if (holderAtPos) {
        j.eating = true; j.eatTimer += dt
        if (j.eatTimer >= 0.5) {
          j.eatTimer = 0
          const dmg = JEET_DEFS[j.type].damage * 0.5
          holderAtPos.hp -= dmg
          this.spawnParticles(GRID_OFFSET_X + holderAtPos.col * CELL_W + CELL_W / 2, GRID_OFFSET_Y + holderAtPos.row * CELL_H + CELL_H / 2, 3, 'impact', '#ef4444')
          if (j.type === 'bot_jeet' && !j.angered) j.angered = true
          if (holderAtPos.hp <= 0) {
            this.grid[holderAtPos.row][holderAtPos.col] = null
            this.holders = this.holders.filter(x => x.id !== holderAtPos.id)
            this.spawnParticles(GRID_OFFSET_X + holderAtPos.col * CELL_W + CELL_W / 2, GRID_OFFSET_Y + holderAtPos.row * CELL_H + CELL_H / 2, 8, 'death', HOLDER_DEFS[holderAtPos.type].color)
          }
        }
      } else {
        j.eating = false; j.eatTimer = 0
        j.x -= j.speed * dt
      }

      if (j.type === 'mev_bot' && !j.vaulted) {
        const ahead = this.findHolderAhead(j.row, j.x)
        if (ahead) {
          j.vaulted = true; j.x -= CELL_W * 1.5
          this.spawnParticles(j.x + CELL_W, GRID_OFFSET_Y + j.row * CELL_H + CELL_H / 2, 6, 'sparkle', '#7c3aed')
        }
      }

      if (j.x < GRID_OFFSET_X) {
        const bot = this.liquidationBots.find(b => b.row === j.row && !b.triggered)
        if (bot) { bot.triggered = true; bot.active = true; bot.vx = 200 }
        else { this.phase = 'gameover'; this.onGameOver?.(); this.onStateChange?.(); return }
      }
    }

    // Liquidation bots
    for (const bot of this.liquidationBots) {
      if (bot.active) {
        bot.x += bot.vx * dt
        for (const j of this.jeets) {
          if (j.row === bot.row && j.x < bot.x + 20 && j.x > bot.x - 20) this.damageJeet(j, 9999, false)
        }
        if (bot.x > CANVAS_W) bot.active = false
      }
    }

    // Projectiles
    for (const p of this.projectiles) {
      p.x += p.vx * dt
      p.trailY.push(p.y)
      if (p.trailY.length > 5) p.trailY.shift()
      for (const j of this.jeets) {
        if (j.row === p.row && Math.abs(j.x - p.x) < 20 && j.x < p.x + 40) {
          this.damageJeet(j, p.damage, false)
          if (p.type === 'ice_candle') {
            j.slowed = 3; j.slowedAmount = 0.5
            this.spawnParticles(j.x, GRID_OFFSET_Y + j.row * CELL_H + CELL_H / 2, 4, 'slow', '#67e8f9')
          }
          p.alive = false
          this.spawnParticles(p.x, p.y, 3, 'impact', '#22c55e')
          break
        }
      }
      if (p.x > CANVAS_W || p.x < 0) p.alive = false
    }
    this.projectiles = this.projectiles.filter(p => p.alive)

    // Particles
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt
      p.vy += 100 * dt; p.life -= dt; p.rotation += p.vr * dt
    }
    this.particles = this.particles.filter(p => p.life > 0)
    this.jeets = this.jeets.filter(j => j.hp > 0 || j.armorHp > 0)
    this.onStateChange?.()
  }

  // ============================================================
  // RENDER
  // ============================================================
  render(ctx: CanvasRenderingContext2D) {
    this.renderBackground(ctx)
    this.renderGrid(ctx)
    for (const h of this.holders) {
      const cx = GRID_OFFSET_X + h.col * CELL_W + CELL_W / 2
      const cy = GRID_OFFSET_Y + h.row * CELL_H + CELL_H / 2
      drawHolder(ctx, h.type, cx, cy, h.animFrame, h.hp, h.maxHp)
    }
    for (const bot of this.liquidationBots) {
      const y = GRID_OFFSET_Y + bot.row * CELL_H + CELL_H / 2
      drawLiquidationBot(ctx, bot.x, y, bot.active, this.gameTime)
    }
    for (const p of this.projectiles) drawProjectile(ctx, p.type, p.x, p.y, p.trailY, this.gameTime * 10)
    for (const j of this.jeets) {
      const cy = GRID_OFFSET_Y + j.row * CELL_H + CELL_H / 2
      drawJeet(ctx, j.type, j.x, cy, j.animFrame, j.hp, j.maxHp, j.armorHp, j.flashTimer, j.eating, !!j.angered)
    }
    for (const t of this.tendieCoins) drawTendie(ctx, t.x, t.y, t.pulse, t.value)
    this.renderParticles(ctx)
    if (this.selectedHolder && this.hoverRow >= 0 && this.hoverCol >= 0) {
      const cx = GRID_OFFSET_X + this.hoverCol * CELL_W + CELL_W / 2
      const cy = GRID_OFFSET_Y + this.hoverRow * CELL_H + CELL_H / 2
      ctx.save(); ctx.globalAlpha = 0.5
      const def = HOLDER_DEFS[this.selectedHolder]
      if (this.grid[this.hoverRow][this.hoverCol] === null && this.tendies >= def.cost) {
        drawHolder(ctx, this.selectedHolder, cx, cy, this.gameTime * 10, def.hp, def.hp)
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
        ctx.strokeRect(cx - CELL_W / 2, cy - CELL_H / 2, CELL_W, CELL_H)
      } else {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
        ctx.strokeRect(cx - CELL_W / 2, cy - CELL_H / 2, CELL_W, CELL_H)
      }
      ctx.restore()
    }
    this.renderCanvasHUD(ctx)
  }

  renderBackground(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    g.addColorStop(0, '#0a1a0a'); g.addColorStop(0.5, '#0f1f0f'); g.addColorStop(1, '#0a0e0a')
    ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.05)'; ctx.lineWidth = 1
    for (let x = 0; x < CANVAS_W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke() }
    for (let y = 0; y < CANVAS_H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke() }
    ctx.save(); ctx.globalAlpha = 0.08
    for (let i = 0; i < 40; i++) {
      const x = (i * 40 + this.gameTime * 5) % CANVAS_W
      const baseY = 50 + (i % 7) * 60
      const h = 10 + (i % 3) * 8
      ctx.fillStyle = i % 3 !== 0 ? '#22c55e' : '#ef4444'
      ctx.fillRect(x, baseY - h / 2, 4, h)
    }
    ctx.restore()
  }

  renderGrid(ctx: CanvasRenderingContext2D) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const x = GRID_OFFSET_X + c * CELL_W, y = GRID_OFFSET_Y + r * CELL_H
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(34, 197, 94, 0.06)' : 'rgba(34, 197, 94, 0.03)'
        ctx.fillRect(x, y, CELL_W, CELL_H)
      }
    }
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)'; ctx.lineWidth = 1
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = GRID_OFFSET_Y + r * CELL_H
      ctx.beginPath(); ctx.moveTo(GRID_OFFSET_X, y); ctx.lineTo(GRID_OFFSET_X + GRID_COLS * CELL_W, y); ctx.stroke()
    }
    ctx.fillStyle = 'rgba(239, 68, 68, 0.05)'
    ctx.fillRect(GRID_OFFSET_X - 20, GRID_OFFSET_Y, 20, GRID_ROWS * CELL_H)
  }

  renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
      if (p.type === 'explosion' && p.size > 20) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
        g.addColorStop(0, p.color); g.addColorStop(0.5, p.color + '88'); g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g; ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2)
      } else {
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      }
      ctx.restore()
    }
  }

  renderCanvasHUD(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, CANVAS_W, 110)
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`$${Math.floor(this.tendies)}`, 20, 35)
    ctx.fillStyle = '#4ade80'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'
    ctx.fillText(`SCORE: ${this.stats.score}`, CANVAS_W / 2, 20)
    ctx.fillStyle = '#f97316'; ctx.font = 'bold 14px monospace'
    const waveText = this.waveActive ? `WAVE ${this.stats.wave} / ${TOTAL_WAVES}` : `PREPARE FOR WAVE ${this.currentWaveIndex + 1} / ${TOTAL_WAVES}`
    ctx.fillText(waveText, CANVAS_W / 2, 45)
    if (this.waveActive) {
      const wave = this.waves[this.currentWaveIndex]
      const pct = this.waveSpawnIndex / wave.spawns.length
      const barW = 200, barH = 6, barX = CANVAS_W / 2 - barW / 2, barY = 62
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2)
      ctx.fillStyle = '#f97316'; ctx.fillRect(barX, barY, barW * pct, barH)
    }
    if (this.stats.combo > 1) {
      ctx.fillStyle = `rgba(251, 191, 36, ${Math.min(1, this.stats.comboTimer / 3)})`
      ctx.font = 'bold 18px monospace'; ctx.textAlign = 'right'
      ctx.fillText(`${this.stats.combo}x COMBO!`, CANVAS_W - 20, 35)
    }

    const cardW = 64, cardH = 80, cardGap = 4
    const totalW = HOLDER_ORDER.length * (cardW + cardGap) - cardGap
    const startX = (CANVAS_W - totalW) / 2
    const cardY = CANVAS_H - cardH - 10
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(0, cardY - 6, CANVAS_W, cardH + 16)
    for (let i = 0; i < HOLDER_ORDER.length; i++) {
      const type = HOLDER_ORDER[i]
      const def = HOLDER_DEFS[type]
      const x = startX + i * (cardW + cardGap)
      const available = this.tendies >= def.cost && this.cardCooldowns[type] <= 0
      const cdPct = this.cardCooldowns[type] / def.cooldown
      drawHolderCard(ctx, type, x, cardY, cardW, cardH, available, cdPct)
      ctx.fillStyle = available ? '#fbbf24' : '#666'; ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${def.cost}`, x + cardW / 2, cardY + cardH + 8)
      if (this.selectedHolder === type) {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3
        ctx.strokeRect(x - 2, cardY - 2, cardW + 4, cardH + 4)
      }
      ctx.fillStyle = available ? '#4ade80' : '#444'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'
      const shortName = def.name.split(' ').map(w => w.slice(0, 3)).join(' ')
      ctx.fillText(shortName, x + cardW / 2, cardY - 8)
    }
  }
}
