import type { FloatingText, GameState, Holder, Jeet, Particle, Projectile, Resource } from '../types';
import { GRID, HOLDER_DEFS, JEET_DEFS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../engine/GameEngine';
import { AssetLoader } from './AssetLoader';

const FRAME_W = 48;
const FRAME_H = 48;

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

    // Screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (state.shakeMs > 0) {
      const amt = Math.min(state.shakeMs / 300, 1) * 5;
      shakeX = (Math.random() - 0.5) * amt;
      shakeY = (Math.random() - 0.5) * amt;
      ctx.translate(shakeX, shakeY);
    }

    this.drawBackground(ctx);
    this.drawGrid(ctx, state);

    for (const holder of state.holders) this.drawHolder(ctx, holder);
    for (const jeet of state.jeets) this.drawJeet(ctx, jeet);
    for (const projectile of state.projectiles) this.drawProjectile(ctx, projectile);
    for (const resource of state.resources) this.drawResource(ctx, resource);

    state.particles.forEach((p) => this.drawParticle(ctx, p));
    state.floatingTexts.forEach((t) => this.drawFloatingText(ctx, t));

    if (state.waveBannerMs > 0) this.drawWaveBanner(ctx, state);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#0b140f');
    gradient.addColorStop(0.55, '#14241a');
    gradient.addColorStop(1, '#1a2e22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Distant chart grid / skyline
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let px = 0;
    let py = LOGICAL_HEIGHT * 0.35;
    ctx.moveTo(px, py);
    for (let i = 1; i < 60; i++) {
      px += LOGICAL_WIDTH / 60;
      py += Math.sin(i * 0.45) * 12 + (Math.random() - 0.5) * 4;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Back fence
    ctx.fillStyle = '#132019';
    for (let i = 0; i < LOGICAL_WIDTH; i += 40) {
      ctx.fillRect(i, GRID.offsetY - 24, 8, 24);
    }
    ctx.fillStyle = '#0e1812';
    ctx.fillRect(0, GRID.offsetY - 12, LOGICAL_WIDTH, 4);
    ctx.fillRect(0, GRID.offsetY - 6, LOGICAL_WIDTH, 2);

    // Lane markers
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#4ade80';
    for (let lane = 0; lane < GRID.lanes; lane++) {
      const y = GRID.offsetY + lane * GRID.cellSize + GRID.cellSize / 2;
      ctx.beginPath();
      ctx.moveTo(GRID.offsetX, y);
      ctx.lineTo(LOGICAL_WIDTH - 16, y);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
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

        ctx.drawImage(sheet, sx, sy, GRID.cellSize, GRID.cellSize, x, y, GRID.cellSize, GRID.cellSize);

        if (state.selectedSeed && state.hoveredCell?.lane === lane && state.hoveredCell?.col === col) {
          ctx.save();
          ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
          ctx.fillRect(x + 1, y + 1, GRID.cellSize - 2, GRID.cellSize - 2);
          ctx.strokeStyle = 'rgba(74, 222, 128, 0.65)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, GRID.cellSize - 4, GRID.cellSize - 4);
          ctx.restore();
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
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, cx - size / 2, cy - size / 2, size, size);
  }

  private drawHolder(ctx: CanvasRenderingContext2D, holder: Holder): void {
    const row = Object.keys(HOLDER_DEFS).indexOf(holder.type);
    const size = GRID.cellSize - 4;
    const bob = Math.sin(this.tickMs * 0.006 + holder.col) * 1.5;
    const y = holder.y + bob;

    // White flash when hit
    if (holder.flashMs > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
    }

    this.drawSprite(ctx, this.assets.holderSheet, row, holder.x, y, size);

    if (holder.flashMs > 0) {
      ctx.fillStyle = `rgba(255,255,255,${holder.flashMs / 150})`;
      ctx.fillRect(holder.x - size / 2, y - size / 2, size, size);
      ctx.restore();
    }

    // HP bar
    const hpPct = holder.hp / holder.maxHp;
    const barW = 38;
    const barH = 5;
    ctx.fillStyle = '#330000';
    ctx.fillRect(holder.x - barW / 2, holder.y - size / 2 - 8, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(holder.x - barW / 2, holder.y - size / 2 - 8, barW * hpPct, barH);

    // Charge pulse for shooters
    const def = HOLDER_DEFS[holder.type];
    if (def.damage > 0 && holder.cooldownMs <= 0) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.tickMs * 0.015) * 0.2;
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(holder.x, holder.y - size / 2 - 12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawJeet(ctx: CanvasRenderingContext2D, jeet: Jeet): void {
    const row = Object.keys(JEET_DEFS).indexOf(jeet.type);
    const size = GRID.cellSize - 8;

    // Bob while moving / eat wobble
    const wobble = jeet.isEating ? Math.sin(this.tickMs * 0.03) * 2 : Math.sin(this.tickMs * 0.01 + jeet.x * 0.05) * 1.5;

    if (jeet.flashMs > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
    }

    this.drawSprite(ctx, this.assets.jeetSheet, row, jeet.x, jeet.y + wobble, size);

    if (jeet.flashMs > 0) {
      ctx.fillStyle = `rgba(255,255,255,${jeet.flashMs / 120})`;
      ctx.fillRect(jeet.x - size / 2, jeet.y + wobble - size / 2, size, size);
      ctx.restore();
    }

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
    const tailLen = 14;
    ctx.save();
    ctx.globalAlpha = 0.7;
    const grad = ctx.createLinearGradient(projectile.x, projectile.y, projectile.x - tailLen, projectile.y);
    grad.addColorStop(0, projectile.color);
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(projectile.x, projectile.y);
    ctx.lineTo(projectile.x - tailLen, projectile.y);
    ctx.stroke();
    ctx.restore();

    const sheet = this.assets.projectileSheet;
    if (sheet) {
      const col = Object.keys(HOLDER_DEFS).indexOf(projectile.holderType);
      ctx.drawImage(sheet, col * 16, 0, 16, 16, projectile.x - 8, projectile.y - 8, 16, 16);
    } else {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawResource(ctx: CanvasRenderingContext2D, resource: Resource): void {
    const img = this.assets.coinImg;
    const bob = Math.sin(this.tickMs * 0.01 + resource.x) * 3;
    const y = resource.y + bob;
    if (img) {
      ctx.drawImage(img, resource.x - 12, y - 12, 24, 24);
    } else {
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(resource.x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
    const alpha = Math.max(0, p.lifeMs / p.maxLifeMs);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.restore();
  }

  private drawFloatingText(ctx: CanvasRenderingContext2D, t: FloatingText): void {
    const alpha = Math.max(0, t.lifeMs / t.maxLifeMs);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  private drawWaveBanner(ctx: CanvasRenderingContext2D, state: GameState): void {
    const alpha = Math.min(1, state.waveBannerMs / 400);
    const waveName = state.waveIndex + 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, LOGICAL_HEIGHT / 2 - 28, LOGICAL_WIDTH, 56);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`WAVE ${waveName}`, LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
    ctx.restore();
  }
}
