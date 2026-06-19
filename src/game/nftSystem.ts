// ============================================================
// NFT System — Holders as NFTs
// ============================================================
import type { HolderType } from './types'

export interface HolderNFT {
  holderType: HolderType
  nftName: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  mintAddress: string | null
  owned: boolean
  unlockMethod: 'tutorial' | 'level_reward' | 'mint' | 'airdrop'
  description: string
  power: number // multiplier for stats
  color: string
  emoji: string
}

// Free holders (no NFT needed)
export const FREE_HOLDERS: HolderType[] = ['staking_pool' as HolderType, 'dca_bot' as HolderType]

// NFT-gated holders with rarity tiers
export const NFT_HOLDERS: Partial<Record<HolderType, Omit<HolderNFT, "owned" | "mintAddress">>> = {
  diamond_hands: {
    holderType: 'diamond_hands', nftName: 'Diamond Hands NFT', rarity: 'common',
    unlockMethod: 'level_reward', description: 'Unbreakable diamond grip. Wall with 400 HP.',
    power: 1.0, color: '#60a5fa', emoji: '💎',
  },
  ape_sniper: {
    holderType: 'ape_sniper', nftName: 'Ape Sniper NFT', rarity: 'rare',
    unlockMethod: 'level_reward', description: 'Precision ice sniper. Slows jeets.',
    power: 1.2, color: '#67e8f9', emoji: '🎯',
  },
  rocket_apes: {
    holderType: 'rocket_apes', nftName: 'Rocket Apes NFT', rarity: 'epic',
    unlockMethod: 'level_reward', description: 'Explosive apes. One-time nuke.',
    power: 1.5, color: '#ef4444', emoji: '🚀',
  },
  max_buyer: {
    holderType: 'max_buyer', nftName: 'Max Buyer NFT', rarity: 'epic',
    unlockMethod: 'level_reward', description: 'Double-barrel candle launcher.',
    power: 1.4, color: '#f97316', emoji: '🔥',
  },
  pump_squad: {
    holderType: 'pump_squad', nftName: 'Pump Squad NFT', rarity: 'legendary',
    unlockMethod: 'level_reward', description: 'Three-headed pump machine. Fires in 3 lanes.',
    power: 1.6, color: '#a855f7', emoji: '💜',
  },
  fud_shield: {
    holderType: 'fud_shield', nftName: 'FUD Shield NFT', rarity: 'legendary',
    unlockMethod: 'level_reward', description: 'Unbreakable FUD shield. 800 HP fortress.',
    power: 1.5, color: '#94a3b8', emoji: '🛡️',
  },
}

export function getOwnedHolders(
  freeHolders: HolderType[],
  ownedNFTs: string[] // holder types from NFTs
): HolderType[] {
  const result: HolderType[] = [...freeHolders]
  for (const t of ownedNFTs) {
    if (NFT_HOLDERS[t as HolderType]) result.push(t as HolderType)
  }
  return result
}

export function isHolderLocked(
  type: HolderType,
  ownedNFTs: string[]
): boolean {
  if (FREE_HOLDERS.includes(type)) return false
  return !ownedNFTs.includes(type)
}

export function getHolderNFTInfo(type: HolderType): Omit<HolderNFT, 'owned' | 'mintAddress'> | null {
  return NFT_HOLDERS[type] || null
}

// Simulated mint (in production, this would call Solana program)
export function simulateMint(holderType: HolderType): string {
  // Generate a fake Solana address for demo
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let addr = ''
  for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)]
  return addr
}

export const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#fbbf24',
}

export const RARITY_GLOW = {
  common: 'rgba(148, 163, 184, 0.3)',
  rare: 'rgba(59, 130, 246, 0.4)',
  epic: 'rgba(168, 85, 247, 0.5)',
  legendary: 'rgba(251, 191, 36, 0.6)',
}
