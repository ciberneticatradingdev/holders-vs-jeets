import type { GameState, Holder, Jeet, Projectile, Resource } from '../types';
import { GRID, HOLDER_DEFS, JEET_DEFS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../engine/GameEngine';
import { AssetLoader } from './AssetLoader';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AssetLoader;
  private tickMs = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.assets = new AssetLoader();
    this.assets.loadAll();
  }

  resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const scale = Math.min(rect.width / LOGICAL_WIDTH, rect.height / LOGICAL_HEIGHT);
    const displayW = Math.floor(LOGICAL_WIDTH * scale);
    const displayH = Math.floor(LOGICAL_HEIGHT * scale);
    if (this.canvas.width !== displayW || this.canvas.height !== displayH) {
      this.canvas.width = displayW;
      this.canvas.height = displayH;
    }
  }

  get scale(): number {
    return this.canvas.width / LOGICAL_WIDTH;
  }

  render(state: GameState, deltaMs: number): void {
    this.tickMs += deltaMs;
    this.resize();
    const ctx = this.ctx;
    const s = this.scale;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.scale(s, s);

    this.drawBackground(ctx);
    this.drawGrid(ctx, state);

    for (const holder of state.holders) this.drawHolder(ctx, holder);
    for (const jeet of state.jeets) this.drawJeet(ctx, jeet);
    for (const projectile of state.projectiles) this.drawProjectile(ctx, projectile);
    for (const resource of state.resources) this.drawResource(ctx, resource);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#0f1812');
    gradient.addColorStop(1, '#1a2a1d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Back fence
    ctx.fillStyle = '#142018';
    for (let i = 0; i < LOGICAL_WIDTH; i += 40) {
      ctx.fillRect(i, GRID.offsetY - 24, 8, 24);
    }
    ctx.fillRect(0, GRID.offsetY - 12, LOGICAL_WIDTH, 4);
    ctx.fillRect(0, GRID.offsetY - 8, LOGICAL_WIDTH, 2);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, state: GameState): void {
    const sheet = this.assets.tileImg;
    if (!sheet) {
      this.drawFallbackGrid(ctx);
      return;
    }
    const cols = 4;
    const rows = 2;
    for (let lane = 0; lane < GRID.lanes; lane++) {
      for (let col = 0; col < GRID.cols; col++) {
        const x = GRID.offsetX + col * GRID.cellSize;
        const y = GRID.offsetY + lane * GRID.cellSize;
        const variant = (lane * 3 + col * 2 + state.waveIndex) % (cols * rows);
        const sx = (variant % cols) * GRID.cellSize;
        const sy = Math.floor(variant / cols) * GRID.cellSize;

        ctx.drawImage(
          sheet,
          sx, sy, GRID.cellSize, GRID.cellSize,
          x, y, GRID.cellSize, GRID.cellSize
        );

        // Hover selection highlight
        if (state.selectedSeed && state.hoveredCell?.lane === lane && state.hoveredCell?.col === col) {
          ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
          ctx.fillRect(x + 1, y + 1, GRID.cellSize - 2, GRID.cellSize - 2);
        }
      }
    }
  }

  private drawFallbackGrid(ctx: CanvasRenderingContext2D): void {
    for (let lane = 0; lane < GRID.lanes; lane++) {
      for (let col = 0; col < GRID.cols; col++) {
        const x = GRID.offsetX + col * GRID.cellSize;
        const y = GRID.offsetY + lane * GRID.cellSize;
        ctx.fillStyle = (lane + col) % 2 === 0 ? '#1e3324' : '#1a2d20';
        ctx.fillRect(x + 1, y + 1, GRID.cellSize - 2, GRID.cellSize - 2);
      }
    }
  }

  private animFrame(periodMs = 400): number {
    return Math.floor(this.tickMs / periodMs) % 2;
  }

  private drawSprite(
    ctx: CanvasRenderingContext2D,
    sheet: HTMLImageElement | null,
    row: number,
    cx: number,
    cy: number,
    size: number
  ): void {
    if (!sheet) return;
    const sCol = this.animFrame();
    const sx = sCol * FRAME_W;
    const sy = row * FRAME_H;
    ctx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, cx - size / 2, cy - size / 2, size, size);
  }

  private drawHolder(ctx: CanvasRenderingContext2D, holder: Holder): void {
    const row = Object.keys(HOLDER_DEFS).indexOf(holder.type);
    const size = GRID.cellSize - 4;
    this.drawSprite(ctx, this.assets.holderSheet, row, holder.x, holder.y, size);

    // HP bar
    const hpPct = holder.hp / holder.maxHp;
    const barW = 38;
    const barH = 5;
    ctx.fillStyle = '#330000';
    ctx.fillRect(holder.x - barW / 2, holder.y - size / 2 - 8, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(holder.x - barW / 2, holder.y - size / 2 - 8, barW * hpPct, barH);
  }

  private drawJeet(ctx: CanvasRenderingContext2D, jeet: Jeet): void {
    const row = Object.keys(JEET_DEFS).indexOf(jeet.type);
    const size = GRID.cellSize - 8;
    this.drawSprite(ctx, this.assets.jeetSheet, row, jeet.x, jeet.y, size);

    // HP bar
    const hpPct = jeet.hp / jeet.maxHp;
    const barW = 34;
    const barH = 4;
    ctx.fillStyle = '#330000';
    ctx.fillRect(jeet.x - barW / 2, jeet.y - size / 2 - 6, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(jeet.x - barW / 2, jeet.y - size / 2 - 6, barW * hpPct, barH);
  }

  private drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    const sheet = this.assets.projectileSheet;
    if (sheet) {
      const col = Object.keys(HOLDER_DEFS).indexOf(projectile.holderType);
      const sx = col * 16;
      const sy = 0;
      ctx.drawImage(sheet, sx, sy, 16, 16, projectile.x - 8, projectile.y - 8, 16, 16);
    } else {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawResource(ctx: CanvasRenderingContext2D, resource: Resource): void {
    const img = this.assets.coinImg;
    if (img) {
      ctx.drawImage(img, resource.x - 12, resource.y - 12, 24, 24);
    } else {
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(resource.x, resource.y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const FRAME_W = 48;
const FRAME_H = 48;
