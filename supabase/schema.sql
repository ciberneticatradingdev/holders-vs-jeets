-- ============================================================
-- Holders vs Jeets — Supabase Schema
-- ============================================================

-- Players table (wallet-based)
CREATE TABLE IF NOT EXISTS hvj_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet TEXT UNIQUE NOT NULL,
  username TEXT,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  best_wave INT DEFAULT 0,
  jeets_killed BIGINT DEFAULT 0,
  games_played INT DEFAULT 0,
  tendies_earned BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Player progress (unlocks, completions)
CREATE TABLE IF NOT EXISTS hvj_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES hvj_players(id) ON DELETE CASCADE,
  level_num INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  stars INT DEFAULT 0, -- 0-3 stars per level
  best_score INT DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, level_num)
);

-- NFT holdings (which plants the player owns)
CREATE TABLE IF NOT EXISTS hvj_nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES hvj_players(id) ON DELETE CASCADE,
  nft_mint TEXT NOT NULL, -- Solana mint address
  holder_type TEXT NOT NULL, -- which holder this NFT unlocks
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  metadata_uri TEXT,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, nft_mint)
);

-- Global leaderboard
CREATE TABLE IF NOT EXISTS hvj_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES hvj_players(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  username TEXT,
  score BIGINT NOT NULL,
  wave INT NOT NULL,
  level_num INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily missions
CREATE TABLE IF NOT EXISTS hvj_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES hvj_players(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL, -- 'kill_jeets', 'reach_wave', 'use_holder', 'win_level'
  mission_data JSONB DEFAULT '{}',
  target INT NOT NULL,
  progress INT DEFAULT 0,
  reward JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  claimed BOOLEAN DEFAULT FALSE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(player_id, mission_type, assigned_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON hvj_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_players_wallet ON hvj_players(wallet);
CREATE INDEX IF NOT EXISTS idx_progress_player ON hvj_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_nfts_player ON hvj_nfts(player_id);

-- Enable RLS
ALTER TABLE hvj_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE hvj_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hvj_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hvj_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE hvj_missions ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now — production should restrict)
CREATE POLICY "public_read_leaderboard" ON hvj_leaderboard FOR SELECT USING (true);
CREATE POLICY "public_all_players" ON hvj_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_progress" ON hvj_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_nfts" ON hvj_nfts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_missions" ON hvj_missions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_insert_leaderboard" ON hvj_leaderboard FOR INSERT WITH CHECK (true);
