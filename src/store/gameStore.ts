import { create } from 'zustand'
import type { GamePhase } from '../game/types'
import { GameEngine } from '../game/engine'

interface GameStore {
  engine: GameEngine | null
  phase: GamePhase
  score: number
  wave: number
  tendies: number
  combo: number
  tick: number
  init: () => void
  reset: () => void
  setPhase: (p: GamePhase) => void
  startGame: () => void
  saveScore: (name: string) => void
  forceUpdate: () => void
}

let engineInstance: GameEngine | null = null

export const useGame = create<GameStore>((set, get) => ({
  engine: null,
  phase: 'landing',
  score: 0,
  wave: 0,
  tendies: 0,
  combo: 0,
  tick: 0,
  init: () => {
    if (!engineInstance) {
      engineInstance = new GameEngine()
      engineInstance.onStateChange = () => {
        set({
          score: engineInstance!.stats.score,
          wave: engineInstance!.stats.wave,
          tendies: engineInstance!.tendies,
          combo: engineInstance!.stats.combo,
          phase: engineInstance!.phase,
          tick: get().tick + 1,
        })
      }
      engineInstance.onGameOver = () => set({ phase: 'gameover' })
      engineInstance.onVictory = () => set({ phase: 'victory' })
    }
    set({ engine: engineInstance, phase: 'landing' })
  },
  reset: () => {
    engineInstance?.reset()
    set({ phase: 'playing', score: 0, wave: 0, tendies: 150, combo: 0, tick: get().tick + 1 })
  },
  setPhase: (p: GamePhase) => set({ phase: p }),
  startGame: () => {
    engineInstance?.reset()
    set({ phase: 'playing', tick: get().tick + 1 })
  },
  saveScore: (name: string) => {
    engineInstance?.saveScore(name)
  },
  forceUpdate: () => set({ tick: get().tick + 1 }),
}))
