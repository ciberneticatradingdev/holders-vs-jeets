// ============================================================
// useGameSession — manages wallet, player, NFTs, progress
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { connectWallet, disconnectWallet, getPhantomProvider, shortAddress, onWalletChange } from '../backend/wallet'
import { getOrCreatePlayer, getPlayerProgress, getPlayerNFTs, getDailyMissions, updatePlayerStats, saveLevelProgress, submitLeaderboardScore, updateMissionProgress, type Player, type PlayerProgress, type PlayerNFT, type Mission } from '../backend/supabase'
import { FREE_HOLDERS } from '../game/nftSystem'
import type { HolderType } from '../game/types'

interface SessionState {
  wallet: string | null
  player: Player | null
  connecting: boolean
  ownedHolders: HolderType[]
  ownedNFTs: PlayerNFT[]
  completedLevels: number[]
  missions: Mission[]
  dailyMissionsLoaded: boolean
}

export function useGameSession() {
  const [state, setState] = useState<SessionState>({
    wallet: null,
    player: null,
    connecting: false,
    ownedHolders: [...FREE_HOLDERS],
    ownedNFTs: [],
    completedLevels: [],
    missions: [],
    dailyMissionsLoaded: false,
  })

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true }))
    const addr = await connectWallet()
    if (addr) {
      try {
        const player = await getOrCreatePlayer(addr)
        const [progress, nfts, missions] = await Promise.all([
          getPlayerProgress(player.id),
          getPlayerNFTs(player.id),
          getDailyMissions(player.id),
        ])
        const ownedNFTTypes = nfts.map(n => n.holder_type as HolderType)
        const completed = progress.filter(p => p.completed).map(p => p.level_num)
        setState({
          wallet: addr,
          player,
          connecting: false,
          ownedHolders: [...FREE_HOLDERS, ...ownedNFTTypes],
          ownedNFTs: nfts,
          completedLevels: completed,
          missions,
          dailyMissionsLoaded: true,
        })
      } catch (err) {
        console.error('Session init error:', err)
        setState(s => ({ ...s, connecting: false }))
      }
    } else {
      setState(s => ({ ...s, connecting: false }))
    }
  }, [])

  const disconnect = useCallback(async () => {
    await disconnectWallet()
    setState({
      wallet: null, player: null, connecting: false,
      ownedHolders: [...FREE_HOLDERS], ownedNFTs: [],
      completedLevels: [], missions: [], dailyMissionsLoaded: false,
    })
  }, [])

  const addNFT = useCallback((holderType: HolderType, mintAddress: string, rarity: string) => {
    setState(s => {
      if (s.ownedHolders.includes(holderType)) return s
      return {
        ...s,
        ownedHolders: [...s.ownedHolders, holderType],
        ownedNFTs: [...s.ownedNFTs, { nft_mint: mintAddress, holder_type: holderType, rarity, metadata_uri: null }],
      }
    })
  }, [])

  const completeLevel = useCallback(async (levelNum: number, score: number, stars: number) => {
    if (!state.player) return
    await saveLevelProgress(state.player.id, levelNum, score, stars)
    await submitLeaderboardScore(state.player.id, state.wallet!, state.player.username || shortAddress(state.wallet), score, levelNum, levelNum)
    setState(s => ({
      ...s,
      completedLevels: s.completedLevels.includes(levelNum) ? s.completedLevels : [...s.completedLevels, levelNum],
    }))
  }, [state.player, state.wallet])

  const recordGameResult = useCallback(async (score: number, wave: number, jeetsKilled: number, levelNum: number) => {
    if (!state.player || !state.wallet) return
    const stars = Math.min(3, Math.floor(wave / 5) + 1)
    await updatePlayerStats(state.wallet, {
      total_score: (state.player.total_score || 0) + score,
      best_wave: Math.max(state.player.best_wave || 0, wave),
      jeets_killed: (state.player.jeets_killed || 0) + jeetsKilled,
      games_played: (state.player.games_played || 0) + 1,
    })
    await completeLevel(levelNum, score, stars)
    // Update missions
    await updateMissionProgress(state.player.id, 'kill_jeets', jeetsKilled)
    await updateMissionProgress(state.player.id, 'reach_wave', wave)
    await updateMissionProgress(state.player.id, 'win_level', 1)
  }, [state.player, state.wallet, completeLevel])

  // Auto-connect if Phantom is already connected
  useEffect(() => {
    const provider = getPhantomProvider()
    if (provider?.isConnected && provider.publicKey) {
      connect()
    }
    onWalletChange((addr) => {
      if (addr) connect()
      else disconnect()
    })
  }, [connect])

  return {
    ...state,
    connect,
    disconnect,
    addNFT,
    completeLevel,
    recordGameResult,
    shortAddr: shortAddress(state.wallet),
    hasWallet: !!state.wallet,
  }
}
