// ============================================================
// Holders vs Jeets — Level System
// ============================================================

export interface LevelDef {
  num: number
  name: string
  description: string
  waves: number
  difficulty: number // multiplier
  startingTendies: number
  skyTendieRate: number // seconds between drops
  unlockRequirement: number // level num that must be completed first
  reward: { xp: number; tendies: number; nft?: string }
  availableHolders: string[] // which holders can be used (by type)
  bossLevel: boolean
}

export const LEVELS: LevelDef[] = [
  {
    num: 1, name: 'Paper Hand Panic', description: 'Defend against your first paper hands',
    waves: 3, difficulty: 0.8, startingTendies: 200, skyTendieRate: 6,
    unlockRequirement: 0, reward: { xp: 50, tendies: 100 },
    availableHolders: ['staking_pool', 'dca_bot'], // Tutorial: only 2 plants
    bossLevel: false,
  },
  {
    num: 2, name: 'FUD Spreads', description: 'FUDsters with tinfoil hats incoming',
    waves: 5, difficulty: 1.0, startingTendies: 175, skyTendieRate: 7,
    unlockRequirement: 1, reward: { xp: 75, tendies: 150 },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands'],
    bossLevel: false,
  },
  {
    num: 3, name: 'Diamond Wall', description: 'Time to build a fortress',
    waves: 6, difficulty: 1.1, startingTendies: 175, skyTendieRate: 7,
    unlockRequirement: 2, reward: { xp: 100, tendies: 200, nft: 'ape_sniper' },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper'],
    bossLevel: false,
  },
  {
    num: 4, name: 'Rug Pull Rush', description: 'Fast jeets are coming. Lock the doors!',
    waves: 8, difficulty: 1.2, startingTendies: 175, skyTendieRate: 8,
    unlockRequirement: 3, reward: { xp: 100, tendies: 200 },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper'],
    bossLevel: false,
  },
  {
    num: 5, name: 'MEV Mayhem', description: 'MEV bots are front-running your defenses',
    waves: 10, difficulty: 1.3, startingTendies: 175, skyTendieRate: 8,
    unlockRequirement: 4, reward: { xp: 150, tendies: 300, nft: 'rocket_apes' },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper', 'rocket_apes'],
    bossLevel: true, // Mini boss
  },
  {
    num: 6, name: 'Bot Swarm', description: 'Bot jeets everywhere, they go BERSERK!',
    waves: 10, difficulty: 1.4, startingTendies: 175, skyTendieRate: 9,
    unlockRequirement: 5, reward: { xp: 150, tendies: 300, nft: 'max_buyer' },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper', 'rocket_apes', 'max_buyer'],
    bossLevel: false,
  },
  {
    num: 7, name: 'Whale Warning', description: 'Big bags are incoming',
    waves: 12, difficulty: 1.5, startingTendies: 175, skyTendieRate: 9,
    unlockRequirement: 6, reward: { xp: 200, tendies: 400, nft: 'pump_squad' },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper', 'rocket_apes', 'max_buyer', 'pump_squad'],
    bossLevel: false,
  },
  {
    num: 8, name: 'The Big Dump', description: 'The Whale Dumper has arrived',
    waves: 15, difficulty: 1.6, startingTendies: 175, skyTendieRate: 10,
    unlockRequirement: 7, reward: { xp: 300, tendies: 500, nft: 'fud_shield' },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper', 'rocket_apes', 'max_buyer', 'pump_squad', 'fud_shield'],
    bossLevel: true,
  },
  {
    num: 9, name: 'Endless Dump', description: 'How long can you hold?',
    waves: 30, difficulty: 2.0, startingTendies: 150, skyTendieRate: 10,
    unlockRequirement: 8, reward: { xp: 500, tendies: 1000 },
    availableHolders: ['staking_pool', 'dca_bot', 'diamond_hands', 'ape_sniper', 'rocket_apes', 'max_buyer', 'pump_squad', 'fud_shield'],
    bossLevel: true,
  },
]

export function getLevel(num: number): LevelDef | null {
  return LEVELS.find(l => l.num === num) || null
}

export function isLevelUnlocked(num: number, completedLevels: number[]): boolean {
  const level = getLevel(num)
  if (!level) return false
  if (level.unlockRequirement === 0) return true
  return completedLevels.includes(level.unlockRequirement)
}

export function getStarsForWave(wave: number, totalWaves: number): number {
  const pct = wave / totalWaves
  if (pct >= 1) return 3
  if (pct >= 0.66) return 2
  if (pct >= 0.33) return 1
  return 0
}
