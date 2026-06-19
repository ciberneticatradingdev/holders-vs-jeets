// ============================================================
// Holders vs Jeets — Interactive Tutorial System
// ============================================================
// Guides new players through 9 sequential steps with an overlay
// rendered on top of the game canvas: instruction box, glowing
// border, animated arrow indicator, and a Skip button.
//
// Lifecycle:
//   currentStep: 0 = not started, 1-9 = active step, -1 = done/skipped
//   The host calls update() each frame and render() after the engine.
//   Forward canvas clicks to handleClick() so the Skip button works.
// ============================================================

import {
  CANVAS_W, CANVAS_H,
  GRID_COLS, GRID_ROWS, CELL_W, CELL_H,
  GRID_OFFSET_X, GRID_OFFSET_Y,
  HOLDER_ORDER, HOLDER_DEFS,
} from '../game/config'
import type { GameEngine } from '../game/engine'
import type { HolderType } from '../game/types'

// --- Card bar layout (must mirror engine.renderCanvasHUD) ----------
const CARD_W = 64
const CARD_H = 80
const CARD_GAP = 4
const CARD_TOTAL_W = HOLDER_ORDER.length * (CARD_W + CARD_GAP) - CARD_GAP
const CARD_START_X = (CANVAS_W - CARD_TOTAL_W) / 2
const CARD_Y = CANVAS_H - CARD_H - 10

/** Center point of a given holder's card in the bottom card bar. */
function cardCenter(type: HolderType): { x: number; y: number } {
  const idx = HOLDER_ORDER.indexOf(type)
  const x = CARD_START_X + idx * (CARD_W + CARD_GAP) + CARD_W / 2
  const y = CARD_Y + CARD_H / 2
  return { x, y }
}

// --- Types ---------------------------------------------------------
export type TargetKind = 'card' | 'grid' | 'tendie' | 'none'

export interface TutorialTarget {
  kind: TargetKind
  /** For 'card' targets. */
  holder?: HolderType
}

export interface TutorialStep {
  id: number
  text: string
  target: TutorialTarget
  /** Returns true when the step's completion condition is satisfied. */
  condition: (engine: GameEngine, snap: StepSnapshot) => boolean
}

interface StepSnapshot {
  /** gameTime when the current step became active. */
  stepStart: number
  /** projectiles.length snapshot at step entry (for "fired" detection). */
  projectilesAtStart: number
  /** stats.tendiesCollected snapshot at step entry. */
  tendiesCollectedAtStart: number
}

// --- Skip button geometry -----------------------------------------
const SKIP_BTN_W = 90
const SKIP_BTN_H = 30
const SKIP_BTN_X = CANVAS_W - SKIP_BTN_W - 16
const SKIP_BTN_Y = 16

// --- Instruction box geometry (sits above the card bar) -----------
const BOX_W = 620
const BOX_H = 64
const BOX_X = (CANVAS_W - BOX_W) / 2
const BOX_Y = CARD_Y - BOX_H - 14

// ===================================================================
// TutorialSystem
// ===================================================================
export class TutorialSystem {
  /** 0 = not started, 1-9 = active step, -1 = completed/skipped. */
  currentStep: number = 0
  active: boolean = false
  isComplete: boolean = false

  private animTime: number = 0
  private snapshot: StepSnapshot = {
    stepStart: 0,
    projectilesAtStart: 0,
    tendiesCollectedAtStart: 0,
  }

  private readonly steps: TutorialStep[] = [
    {
      id: 1,
      text: "Welcome to Holders vs Jeets! Click STAKING POOL to select it.",
      target: { kind: 'card', holder: 'staking_pool' },
      condition: (e) => e.selectedHolder === 'staking_pool',
    },
    {
      id: 2,
      text: "Click on the grid to place your Staking Pool. It generates $TENDIES!",
      target: { kind: 'grid' },
      condition: (e) => e.holders.some(h => h.type === 'staking_pool'),
    },
    {
      id: 3,
      text: "Great! Now select DCA BOT — your first defender.",
      target: { kind: 'card', holder: 'dca_bot' },
      condition: (e) => e.selectedHolder === 'dca_bot',
    },
    {
      id: 4,
      text: "Place the DCA Bot in the SAME lane to defend your pool.",
      target: { kind: 'grid' },
      condition: (e) => e.holders.some(h => h.type === 'dca_bot'),
    },
    {
      id: 5,
      text: "Watch! Your DCA Bot shoots green candles at incoming jeets.",
      target: { kind: 'none' },
      condition: (e, s) =>
        e.gameTime - s.stepStart >= 5 ||
        e.projectiles.length > s.projectilesAtStart,
    },
    {
      id: 6,
      text: "Collect the $TENDIES that drop from the sky! Click them.",
      target: { kind: 'tendie' },
      condition: (e, s) => e.stats.tendiesCollected > s.tendiesCollectedAtStart,
    },
    {
      id: 7,
      text: "Jeets are coming! Place more DCA Bots to defend all lanes.",
      target: { kind: 'card', holder: 'dca_bot' },
      condition: (e) => e.stats.holdersPlaced >= 3,
    },
    {
      id: 8,
      text: "You're ready! Survive the wave to complete the tutorial.",
      target: { kind: 'none' },
      // Wave 1 lives at index 0; once cleared, currentWaveIndex advances to 1.
      condition: (e) => e.currentWaveIndex >= 1,
    },
    {
      id: 9,
      text: "🎉 Tutorial complete! More plants unlock as you play.",
      target: { kind: 'none' },
      condition: (_e, s) => _e.gameTime - s.stepStart >= 3,
    },
  ]

  // --- Lifecycle ---------------------------------------------------

  /** Begin the tutorial from step 1. */
  start(): void {
    this.currentStep = 1
    this.active = true
    this.isComplete = false
    this.resetSnapshot(0)
  }

  /** Skip the tutorial entirely. */
  skip(): void {
    this.currentStep = -1
    this.active = false
    this.isComplete = true
  }

  // --- Update ------------------------------------------------------

  /**
   * Advance the tutorial. Call every frame with the live engine and dt.
   * Checks the active step's condition and advances to the next step
   * (or completes) when satisfied.
   */
  update(engine: GameEngine, dt: number): void {
    if (!this.active || this.currentStep <= 0) return
    this.animTime += dt

    // Stash the first tendie coin's position so the render path (which
    // only receives a ctx) can point the arrow at it for step 6.
    this.liveTendie = engine.tendieCoins.length > 0
      ? { x: engine.tendieCoins[0].x, y: engine.tendieCoins[0].y }
      : null

    const step = this.steps[this.currentStep - 1]
    if (!step) return

    if (step.condition(engine, this.snapshot)) {
      if (this.currentStep >= this.steps.length) {
        this.complete()
      } else {
        this.currentStep++
        this.resetSnapshot(engine.gameTime, engine)
        if (this.currentStep > this.steps.length) this.complete()
      }
    }
  }

  private complete(): void {
    this.currentStep = -1
    this.active = false
    this.isComplete = true
  }

  private resetSnapshot(gameTime: number, engine?: GameEngine): void {
    this.snapshot = {
      stepStart: gameTime,
      projectilesAtStart: engine ? engine.projectiles.length : 0,
      tendiesCollectedAtStart: engine ? engine.stats.tendiesCollected : 0,
    }
  }

  // --- Input -------------------------------------------------------

  /**
   * Handle a canvas-space click. Returns true if the click was consumed
   * by the tutorial (i.e. the Skip button was hit). The host should skip
   * its own click handling when this returns true.
   */
  handleClick(x: number, y: number): boolean {
    if (!this.active) return false
    if (
      x >= SKIP_BTN_X && x <= SKIP_BTN_X + SKIP_BTN_W &&
      y >= SKIP_BTN_Y && y <= SKIP_BTN_Y + SKIP_BTN_H
    ) {
      this.skip()
      return true
    }
    return false
  }

  // --- Render ------------------------------------------------------

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active || this.currentStep <= 0) return
    const step = this.steps[this.currentStep - 1]
    if (!step) return

    this.drawArrow(ctx, step)
    this.drawInstructionBox(ctx, step)
    this.drawSkipButton(ctx)
    this.drawStepBadge(ctx)
  }

  // --- Instruction box --------------------------------------------

  private drawInstructionBox(ctx: CanvasRenderingContext2D, step: TutorialStep): void {
    ctx.save()

    // Soft vignette behind the box to lift it off the scene.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(BOX_X - 6, BOX_Y - 6, BOX_W + 12, BOX_H + 12)

    // Semi-transparent dark body.
    ctx.fillStyle = 'rgba(10, 20, 10, 0.92)'
    ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H)

    // Glowing border (pulses gently).
    const pulse = 0.5 + 0.5 * Math.sin(this.animTime * 3)
    ctx.lineWidth = 2
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.6 + 0.4 * pulse})`
    ctx.shadowColor = '#4ade80'
    ctx.shadowBlur = 12 + 8 * pulse
    ctx.strokeRect(BOX_X, BOX_Y, BOX_W, BOX_H)
    ctx.shadowBlur = 0

    // Step indicator pip row (top-left).
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`STEP ${step.id}/${this.steps.length}`, BOX_X + 12, BOX_Y + 8)

    // Instruction text — monospace, white, subtle glow.
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 15px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(74, 222, 128, 0.8)'
    ctx.shadowBlur = 6
    this.drawWrappedText(ctx, step.text, BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2 + 6, BOX_W - 40, 18)
    ctx.shadowBlur = 0

    ctx.restore()
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D, text: string,
    cx: number, cy: number, maxWidth: number, lineHeight: number,
  ): void {
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = w
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    const startY = cy - ((lines.length - 1) * lineHeight) / 2
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], cx, startY + i * lineHeight)
    }
  }

  // --- Animated arrow ---------------------------------------------

  private drawArrow(ctx: CanvasRenderingContext2D, step: TutorialStep): void {
    const target = this.resolveTarget(step, ctx)
    if (!target) return

    // Arrow originates from the top-center of the instruction box and
    // points toward the target. Bobs along its direction.
    const ox = BOX_X + BOX_W / 2
    const oy = step.target.kind === 'grid' || step.target.kind === 'tendie'
      ? BOX_Y // target above the box → arrow leaves from the top
      : BOX_Y + BOX_H // target below (cards) → arrow leaves from the bottom

    const dx = target.x - ox
    const dy = target.y - oy
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist

    // Pulsing offset along the arrow direction.
    const bob = Math.sin(this.animTime * 6) * 6
    const tipX = target.x - nx * (18 + bob)
    const tipY = target.y - ny * (18 + bob)

    ctx.save()
    ctx.fillStyle = '#fbbf24'
    ctx.shadowColor = 'rgba(251, 191, 36, 0.9)'
    ctx.shadowBlur = 14

    // Draw a triangle arrowhead oriented along (nx, ny).
    const size = 14
    const perpX = -ny
    const perpY = nx
    ctx.beginPath()
    ctx.moveTo(tipX + nx * size, tipY + ny * size)
    ctx.lineTo(tipX + perpX * size * 0.7, tipY + perpY * size * 0.7)
    ctx.lineTo(tipX - perpX * size * 0.7, tipY - perpY * size * 0.7)
    ctx.closePath()
    ctx.fill()

    // Thin guide line from the box to the arrowhead.
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(tipX - nx * size, tipY - ny * size)
    ctx.stroke()
    ctx.setLineDash([])

    // Pulsing ring around the target.
    const ringPulse = 0.5 + 0.5 * Math.sin(this.animTime * 5)
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.4 + 0.4 * ringPulse})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(target.x, target.y, 22 + 4 * ringPulse, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }

  /** Resolve the on-canvas target point for the current step, if any. */
  private resolveTarget(
    step: TutorialStep,
    _ctx: CanvasRenderingContext2D,
  ): { x: number; y: number } | null {
    switch (step.target.kind) {
      case 'card': {
        if (!step.target.holder) return null
        return cardCenter(step.target.holder)
      }
      case 'grid': {
        return {
          x: GRID_OFFSET_X + (GRID_COLS * CELL_W) / 2,
          y: GRID_OFFSET_Y + (GRID_ROWS * CELL_H) / 2,
        }
      }
      case 'tendie': {
        // Point at the first available tendie coin; otherwise the grid.
        // We need a live engine reference — fetch via a stored handle.
        const t = this.liveTendie
        if (t) return { x: t.x, y: t.y }
        return {
          x: GRID_OFFSET_X + (GRID_COLS * CELL_W) / 2,
          y: GRID_OFFSET_Y + (GRID_ROWS * CELL_H) / 2,
        }
      }
      case 'none':
      default:
        return null
    }
  }

  /**
   * The render path doesn't receive the engine, so update() stashes the
   * first tendie coin's position each frame for the 'tendie' target.
   */
  private liveTendie: { x: number; y: number } | null = null

  // --- Skip button -------------------------------------------------

  private drawSkipButton(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    const hover = false // pointer hover handled by host if desired
    ctx.fillStyle = hover ? 'rgba(239, 68, 68, 0.9)' : 'rgba(127, 29, 29, 0.85)'
    ctx.fillRect(SKIP_BTN_X, SKIP_BTN_Y, SKIP_BTN_W, SKIP_BTN_H)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.strokeRect(SKIP_BTN_X, SKIP_BTN_Y, SKIP_BTN_W, SKIP_BTN_H)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SKIP ▶', SKIP_BTN_X + SKIP_BTN_W / 2, SKIP_BTN_Y + SKIP_BTN_H / 2)
    ctx.restore()
  }

  // --- Step badge (top-left) --------------------------------------

  private drawStepBadge(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(16, 16, 150, 30)
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(16, 16, 150, 30)
    ctx.fillStyle = '#4ade80'
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('TUTORIAL MODE', 26, 31)
    ctx.restore()
  }
}

