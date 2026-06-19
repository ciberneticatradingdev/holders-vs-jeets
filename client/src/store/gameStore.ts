import { createStore } from 'zustand/vanilla';
import type { GameState, GameStatus, HolderType } from '../types';

const INITIAL_LIQUIDITY = 150;
const INITIAL_LIVES = 3;

export const createInitialState = (): GameState => ({
  status: 'menu',
  liquidity: INITIAL_LIQUIDITY,
  lives: INITIAL_LIVES,
  waveIndex: 0,
  elapsedMs: 0,
  holders: [],
  jeets: [],
  projectiles: [],
  resources: [],
  particles: [],
  floatingTexts: [],
  selectedSeed: null,
  hoveredCell: null,
  seedCooldowns: {},
  spawnedKeys: [],
  shakeMs: 0,
  waveBannerMs: 0,
  soundEnabled: true,
});

interface GameStore extends GameState {
  setStatus: (status: GameStatus) => void;
  setState: (partial: Partial<GameState>) => void;
  selectSeed: (seed: HolderType | null) => void;
  addLiquidity: (amount: number) => void;
  startGame: () => void;
  resetGame: () => void;
}

export const useGameStore = createStore<GameStore>((set) => ({
  ...createInitialState(),

  setStatus: (status) => set({ status }),

  setState: (partial) => set((state) => ({ ...state, ...partial })),

  selectSeed: (seed) => set({ selectedSeed: seed }),

  addLiquidity: (amount) => set((state) => ({ liquidity: state.liquidity + amount })),

  startGame: () => set({ ...createInitialState(), status: 'playing' }),

  resetGame: () => set(createInitialState()),
}));
