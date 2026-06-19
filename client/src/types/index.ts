export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface Position {
  x: number;
  y: number;
}

export type HolderType = 'diamond_hands' | 'whale' | 'staker' | 'ape' | 'fud_bomber' | 'hodl_laser';

export interface HolderDefinition {
  type: HolderType;
  name: string;
  cost: number;
  hp: number;
  cooldownMs: number;
  range: number;
  damage: number;
  color: string;
  seedRechargeMs: number;
}

export interface Holder {
  id: string;
  type: HolderType;
  lane: number;
  col: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  cooldownMs: number;
}

export type JeetType = 'paper_hands' | 'fomo_runner' | 'rug_puller' | 'whale_jeet' | 'bot_swarm' | 'influencer';

export interface JeetDefinition {
  type: JeetType;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  attackCooldownMs: number;
  color: string;
  reward: number;
}

export interface Jeet {
  id: string;
  type: JeetType;
  lane: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attackCooldownMs: number;
  isEating: boolean;
}

export interface Projectile {
  id: string;
  lane: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
  color: string;
  holderType: HolderType;
}

export interface Resource {
  id: string;
  x: number;
  y: number;
  value: number;
  lifetimeMs: number;
}

export interface Wave {
  index: number;
  durationMs: number;
  spawns: { timeMs: number; lane: number; type: JeetType }[];
}

export interface GameState {
  status: GameStatus;
  liquidity: number;
  lives: number;
  waveIndex: number;
  elapsedMs: number;
  holders: Holder[];
  jeets: Jeet[];
  projectiles: Projectile[];
  resources: Resource[];
  selectedSeed: HolderType | null;
  hoveredCell: { lane: number; col: number } | null;
  seedCooldowns: Partial<Record<HolderType, number>>;
  spawnedKeys: string[];
}
