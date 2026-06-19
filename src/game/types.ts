// ============================================================
// Holders vs Jeets — Type Definitions
// ============================================================

export type GamePhase = 'landing' | 'playing' | 'paused' | 'gameover' | 'victory' | 'leaderboard' | 'howto'

export type HolderType =
  | 'staking_pool' | 'dca_bot' | 'diamond_hands' | 'ape_sniper'
  | 'rocket_apes' | 'max_buyer' | 'pump_squad' | 'fud_shield'

export type JeetType =
  | 'paper_hand' | 'fudster' | 'whale_jeet' | 'rug_puller'
  | 'mev_bot' | 'bot_jeet' | 'whale_dumper'

export type ProjectileType = 'green_candle' | 'ice_candle' | 'red_candle'
export type ParticleType = 'explosion' | 'impact' | 'collect' | 'death' | 'slow' | 'sparkle'

export interface Vec2 { x: number; y: number }

export interface Holder {
  id: number; type: HolderType; row: number; col: number
  hp: number; maxHp: number
  shootTimer: number; produceTimer: number
  animFrame: number; animTimer: number
  placedAt: number
  fuseTimer?: number; exploded?: boolean
}

export interface Jeet {
  id: number; type: JeetType; row: number; x: number
  hp: number; maxHp: number
  speed: number; baseSpeed: number
  eating: boolean; eatTimer: number
  armorHp: number
  animFrame: number; animTimer: number; walkPhase: number
  angered?: boolean; vaulted?: boolean
  slowed?: number; slowedAmount?: number
  flashTimer: number
}

export interface Projectile {
  id: number; type: ProjectileType; row: number
  x: number; y: number; vx: number; damage: number
  alive: boolean; trailY: number[]
}

export interface Tendie {
  id: number; x: number; y: number; vy: number
  targetY: number; value: number
  landed: boolean; life: number; pulse: number
}

export interface Particle {
  id: number; type: ParticleType
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; size: number
  color: string; rotation: number; vr: number
}

export interface LiquidationBot {
  row: number; x: number; active: boolean
  triggered: boolean; vx: number
}

export interface WaveSpawn {
  type: JeetType; delay: number; row: number
}

export interface Wave {
  number: number; spawns: WaveSpawn[]
  isBossWave: boolean; reward: number
}

export interface GameStats {
  score: number; wave: number
  jeetsKilled: number; holdersPlaced: number
  tendiesCollected: number
  combo: number; comboTimer: number; maxCombo: number
}

export interface LeaderboardEntry {
  name: string; score: number; wave: number; date: number
}
