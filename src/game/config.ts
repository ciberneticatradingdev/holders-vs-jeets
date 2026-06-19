// ============================================================
// Holders vs Jeets — Game Configuration
// ============================================================
import type { HolderType, JeetType, Wave, WaveSpawn } from './types'

// Grid
export const GRID_COLS = 9
export const GRID_ROWS = 5
export const CELL_W = 80
export const CELL_H = 96
export const GRID_OFFSET_X = 40
export const GRID_OFFSET_Y = 120

// Canvas
export const CANVAS_W = GRID_OFFSET_X + GRID_COLS * CELL_W + 40
export const CANVAS_H = GRID_OFFSET_Y + GRID_ROWS * CELL_H + 40

// Resource
export const STARTING_TENDIES = 150
export const TENDIE_VALUE = 25
export const SKY_TENDIE_INTERVAL_MIN = 5
export const SKY_TENDIE_INTERVAL_MAX = 10
export const TENDIE_LIFE = 8

// ============================================================
// HOLDER DEFINITIONS (Plants equivalent)
// ============================================================
export interface HolderDef {
  type: HolderType; name: string; cost: number; hp: number
  cooldown: number; recharge: number; description: string
  color: string; accent: string
  damage?: number; shootInterval?: number; projectileType?: string
  produceAmount?: number; produceInterval?: number
  explosionDamage?: number; explosionRadius?: number
  fuseTime?: number; lanes?: number
}

export const HOLDER_DEFS: Record<HolderType, HolderDef> = {
  staking_pool: {
    type: 'staking_pool', name: 'Staking Pool', cost: 50, hp: 100,
    cooldown: 5, recharge: 0, description: 'Generates $TENDIES over time',
    color: '#fbbf24', accent: '#f59e0b',
    produceAmount: 25, produceInterval: 8,
  },
  dca_bot: {
    type: 'dca_bot', name: 'DCA Bot', cost: 100, hp: 100,
    cooldown: 5, recharge: 0, description: 'Shoots green candles at jeets',
    color: '#22c55e', accent: '#16a34a',
    damage: 20, shootInterval: 1.4, projectileType: 'green_candle',
  },
  diamond_hands: {
    type: 'diamond_hands', name: 'Diamond Hands', cost: 50, hp: 400,
    cooldown: 10, recharge: 0, description: 'Tough defensive wall',
    color: '#60a5fa', accent: '#3b82f6',
  },
  ape_sniper: {
    type: 'ape_sniper', name: 'Ape Sniper', cost: 175, hp: 100,
    cooldown: 7.5, recharge: 0, description: 'Ice candles slow jeets down',
    color: '#67e8f9', accent: '#06b6d4',
    damage: 20, shootInterval: 1.4, projectileType: 'ice_candle',
  },
  rocket_apes: {
    type: 'rocket_apes', name: 'Rocket Apes', cost: 150, hp: 100,
    cooldown: 20, recharge: 10, description: 'Massive explosion, one-time use',
    color: '#ef4444', accent: '#dc2626',
    explosionDamage: 1800, explosionRadius: 1.5, fuseTime: 1.0,
  },
  max_buyer: {
    type: 'max_buyer', name: 'Max Buyer', cost: 200, hp: 100,
    cooldown: 7.5, recharge: 0, description: 'Fires two candles per shot',
    color: '#f97316', accent: '#ea580c',
    damage: 20, shootInterval: 1.4, projectileType: 'red_candle',
  },
  pump_squad: {
    type: 'pump_squad', name: 'Pump Squad', cost: 325, hp: 100,
    cooldown: 15, recharge: 5, description: 'Shoots in three lanes at once',
    color: '#a855f7', accent: '#9333ea',
    damage: 20, shootInterval: 1.4, projectileType: 'green_candle', lanes: 3,
  },
  fud_shield: {
    type: 'fud_shield', name: 'FUD Shield', cost: 125, hp: 800,
    cooldown: 15, recharge: 5, description: 'Extra-tall wall blocks all jeets',
    color: '#94a3b8', accent: '#64748b',
  },
}

export const HOLDER_ORDER: HolderType[] = [
  'staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper',
  'rocket_apes', 'max_buyer', 'pump_squad', 'fud_shield',
]

// ============================================================
// JEET DEFINITIONS (Zombies equivalent)
// ============================================================
export interface JeetDef {
  type: JeetType; name: string; hp: number; armorHp: number
  speed: number; damage: number; reward: number
  description: string; color: string; accent: string
  enragedSpeed?: number
}

export const JEET_DEFS: Record<JeetType, JeetDef> = {
  paper_hand: {
    type: 'paper_hand', name: 'Paper Hand', hp: 100, armorHp: 0,
    speed: 18, damage: 40, reward: 10,
    description: 'Your average jeet. Sells at a 5% loss.',
    color: '#94a3b8', accent: '#64748b',
  },
  fudster: {
    type: 'fudster', name: 'FUDster', hp: 100, armorHp: 180,
    speed: 18, damage: 40, reward: 20,
    description: 'Spreads FUD with tinfoil hat armor',
    color: '#a3a3a3', accent: '#737373',
  },
  whale_jeet: {
    type: 'whale_jeet', name: 'Whale Jeet', hp: 100, armorHp: 360,
    speed: 18, damage: 40, reward: 30,
    description: 'Big bag, dumps on retail',
    color: '#64748b', accent: '#475569',
  },
  rug_puller: {
    type: 'rug_puller', name: 'Rug Puller', hp: 100, armorHp: 0,
    speed: 38, damage: 40, reward: 25,
    description: 'Fast and dangerous. Locks liquidity.',
    color: '#dc2626', accent: '#b91c1c',
  },
  mev_bot: {
    type: 'mev_bot', name: 'MEV Bot', hp: 100, armorHp: 100,
    speed: 26, damage: 40, reward: 35,
    description: 'Front-runs your holders, vaults over the first one',
    color: '#7c3aed', accent: '#6d28d9',
  },
  bot_jeet: {
    type: 'bot_jeet', name: 'Bot Jeet', hp: 100, armorHp: 100,
    speed: 18, damage: 40, reward: 30,
    description: 'Calm until hit — then goes BERSERK',
    color: '#059669', accent: '#047857', enragedSpeed: 42,
  },
  whale_dumper: {
    type: 'whale_dumper', name: 'Whale Dumper', hp: 1800, armorHp: 0,
    speed: 14, damage: 100, reward: 200,
    description: 'BOSS. Massive HP. Crushes everything.',
    color: '#1e293b', accent: '#0f172a',
  },
}

// ============================================================
// WAVE SYSTEM
// ============================================================
function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function generateWave(num: number): Wave {
  const spawns: WaveSpawn[] = []
  let delay = 0
  const isBossWave = num % 10 === 0 && num > 0

  if (isBossWave) {
    spawns.push({ type: 'whale_dumper', delay: 2, row: Math.floor(rand(0, GRID_ROWS)) })
    const support = Math.min(3 + Math.floor(num / 10), 8)
    for (let i = 0; i < support; i++) {
      delay += rand(3, 6)
      spawns.push({
        type: pick(['fudster', 'whale_jeet', 'rug_puller', 'mev_bot'] as JeetType[]),
        delay, row: Math.floor(rand(0, GRID_ROWS)),
      })
    }
  } else {
    const count = Math.min(3 + Math.floor(num * 1.5), 20)
    const availableTypes: JeetType[] = ['paper_hand']
    if (num >= 2) availableTypes.push('paper_hand', 'paper_hand', 'rug_puller')
    if (num >= 3) availableTypes.push('fudster')
    if (num >= 5) availableTypes.push('whale_jeet')
    if (num >= 6) availableTypes.push('mev_bot')
    if (num >= 7) availableTypes.push('bot_jeet')
    if (num >= 8) availableTypes.push('rug_puller', 'rug_puller')
    for (let i = 0; i < count; i++) {
      delay += rand(2, 5) * Math.max(0.5, 1 - num * 0.03)
      spawns.push({ type: pick(availableTypes), delay, row: Math.floor(rand(0, GRID_ROWS)) })
    }
  }

  return { number: num, spawns, isBossWave, reward: isBossWave ? 500 : 50 + num * 10 }
}

export function generateWaves(count: number): Wave[] {
  const waves: Wave[] = []
  for (let i = 1; i <= count; i++) waves.push(generateWave(i))
  return waves
}

export const TOTAL_WAVES = 30
