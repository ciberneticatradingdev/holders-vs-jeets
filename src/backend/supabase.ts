import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vrgzzmwytowwtxpaapyt.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key_for_offline_mode'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    try {
      _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      })
    } catch (e) {
      console.warn('Supabase init failed, running in offline mode:', e)
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder', { auth: { persistSession: false } })
    }
  }
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  }
})

export interface Player {
  id: string
  wallet: string
  username: string | null
  level: number
  xp: number
  total_score: number
  best_wave: number
  jeets_killed: number
  games_played: number
  tendies_earned: number
}

export interface PlayerProgress {
  level_num: number
  completed: boolean
  stars: number
  best_score: number
}

export interface PlayerNFT {
  nft_mint: string
  holder_type: string
  rarity: string
  metadata_uri: string | null
}

export interface Mission {
  id: string
  mission_type: string
  target: number
  progress: number
  reward: any
  completed: boolean
  claimed: boolean
  assigned_date: string
}

// ============================================================
// PLAYER SERVICE
// ============================================================
export async function getOrCreatePlayer(wallet: string): Promise<Player> {
  const { data: existing } = await supabase
    .from('hvj_players')
    .select('*')
    .eq('wallet', wallet)
    .single()

  if (existing) {
    await supabase.from('hvj_players').update({ last_login: new Date().toISOString() }).eq('id', existing.id)
    return existing
  }

  const { data: created, error } = await supabase
    .from('hvj_players')
    .insert({ wallet })
    .select()
    .single()

  if (error) throw error
  return created
}

export async function updatePlayerStats(wallet: string, stats: Partial<Player>) {
  const { error } = await supabase
    .from('hvj_players')
    .update(stats)
    .eq('wallet', wallet)
  if (error) console.error('updatePlayerStats:', error)
}

// ============================================================
// PROGRESS SERVICE
// ============================================================
export async function getPlayerProgress(playerId: string): Promise<PlayerProgress[]> {
  const { data, error } = await supabase
    .from('hvj_progress')
    .select('level_num, completed, stars, best_score')
    .eq('player_id', playerId)
  if (error) return []
  return data || []
}

export async function saveLevelProgress(playerId: string, levelNum: number, score: number, stars: number) {
  const { data: existing } = await supabase
    .from('hvj_progress')
    .select('*')
    .eq('player_id', playerId)
    .eq('level_num', levelNum)
    .single()

  if (existing) {
    const better = Math.max(existing.best_score, score)
    const moreStars = Math.max(existing.stars, stars)
    await supabase.from('hvj_progress')
      .update({ completed: true, best_score: better, stars: moreStars, played_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('hvj_progress')
      .insert({ player_id: playerId, level_num: levelNum, completed: true, best_score: score, stars })
  }
}

// ============================================================
// NFT SERVICE
// ============================================================
export async function getPlayerNFTs(playerId: string): Promise<PlayerNFT[]> {
  const { data, error } = await supabase
    .from('hvj_nfts')
    .select('nft_mint, holder_type, rarity, metadata_uri')
    .eq('player_id', playerId)
  if (error) return []
  return data || []
}

export async function mintPlayerNFT(playerId: string, mint: string, holderType: string, rarity: string = 'common') {
  const { error } = await supabase
    .from('hvj_nfts')
    .insert({ player_id: playerId, nft_mint: mint, holder_type: holderType, rarity })
  if (error && !error.message.includes('duplicate')) console.error('mintNFT:', error)
}

// ============================================================
// LEADERBOARD SERVICE
// ============================================================
export async function getGlobalLeaderboard(limit: number = 50) {
  const { data, error } = await supabase
    .from('hvj_leaderboard')
    .select('wallet, username, score, wave, level_num, created_at')
    .order('score', { ascending: false })
    .limit(limit)
  if (error) return []
  return data || []
}

export async function submitLeaderboardScore(playerId: string, wallet: string, username: string, score: number, wave: number, levelNum?: number) {
  const { error } = await supabase
    .from('hvj_leaderboard')
    .insert({ player_id: playerId, wallet, username, score, wave, level_num: levelNum })
  if (error) console.error('submitScore:', error)
}

// ============================================================
// MISSIONS SERVICE
// ============================================================
const MISSION_TEMPLATES = [
  { type: 'kill_jeets', target: 20, reward: { xp: 50, tendies: 100 } },
  { type: 'reach_wave', target: 5, reward: { xp: 75, tendies: 150 } },
  { type: 'use_holder', target: 10, reward: { xp: 50, tendies: 100 } },
  { type: 'win_level', target: 1, reward: { xp: 100, tendies: 200 } },
]

export async function getDailyMissions(playerId: string): Promise<Mission[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('hvj_missions')
    .select('*')
    .eq('player_id', playerId)
    .eq('assigned_date', today)

  if (existing && existing.length > 0) return existing

  // Assign new daily missions
  const inserts = MISSION_TEMPLATES.map(t => ({
    player_id: playerId,
    mission_type: t.type,
    target: t.target,
    progress: 0,
    reward: t.reward,
    completed: false,
    claimed: false,
    assigned_date: today,
  }))

  const { data, error } = await supabase.from('hvj_missions').insert(inserts).select()
  if (error) return []
  return data || []
}

export async function updateMissionProgress(playerId: string, missionType: string, increment: number) {
  const today = new Date().toISOString().split('T')[0]
  const { data: mission } = await supabase
    .from('hvj_missions')
    .select('*')
    .eq('player_id', playerId)
    .eq('mission_type', missionType)
    .eq('assigned_date', today)
    .single()

  if (!mission || mission.completed) return

  const newProgress = Math.min(mission.target, mission.progress + increment)
  const completed = newProgress >= mission.target

  await supabase.from('hvj_missions')
    .update({ progress: newProgress, completed })
    .eq('id', mission.id)
}

export async function claimMission(playerId: string, missionId: string) {
  const { data: mission } = await supabase
    .from('hvj_missions')
    .select('*')
    .eq('id', missionId)
    .single()

  if (!mission || !mission.completed || mission.claimed) return null

  await supabase.from('hvj_missions').update({ claimed: true }).eq('id', missionId)

  // Award rewards
  const reward = mission.reward || {}
  if (reward.xp) {
    const { data: player } = await supabase.from('hvj_players').select('xp, level').eq('id', playerId).single()
    if (player) {
      const newXp = player.xp + reward.xp
      const newLevel = Math.floor(newXp / 100) + 1
      await supabase.from('hvj_players').update({ xp: newXp, level: newLevel }).eq('id', playerId)
    }
  }
  if (reward.tendies) {
    const { data: player } = await supabase.from('hvj_players').select('tendies_earned').eq('id', playerId).single()
    if (player) {
      await supabase.from('hvj_players').update({ tendies_earned: player.tendies_earned + reward.tendies }).eq('id', playerId)
    }
  }

  return reward
}
