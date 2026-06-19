import type { GameState, Holder, Jeet, Projectile, Resource } from '../types';
import { GRID, HOLDER_DEFS, JEET_DEFS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../engine/GameEngine';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
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

  render(state: GameState): void {
    this.resize();
    const ctx = this.ctx;
    const s = this.scale;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.scale(s, s);

    this.drawBackground(ctx);
    this.drawGrid(ctx);

    for (const holder of state.holders) this.drawHolder(ctx, holder);
    for (const jeet of state.jeets) this.drawJeet(ctx, jeet);
    for (const projectile of state.projectiles) this.drawProjectile(ctx, projectile);
    for (const resource of state.resources) this.drawResource(ctx, resource);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    // Sky / neighborhood gradient placeholder
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
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    for (let lane = 0; lane < GRID.lanes; lane++) {
      for (let col = 0; col < GRID.cols; col++) {
        const x = GRID.offsetX + col * GRID.cellSize;
        const y = GRID.offsetY + lane * GRID.cellSize;
        ctx.fillStyle = (lane + col) % 2 === 0 ? '#1e3324' : '#1a2d20';
        ctx.fillRect(x + 1, y + 1, GRID.cellSize - 2, GRID.cellSize - 2);
      }
    }
  }

  private drawHolder(ctx: CanvasRenderingContext2D, holder: Holder): void {
    const def = HOLDER_DEFS[holder.type];
    const size = 44;
    const hpPct = holder.hp / holder.maxHp;

    // Body
    ctx.fillStyle = def.color;
    ctx.fillRect(holder.x - size / 2, holder.y - size / 2, size, size);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(holder.x - 8, holder.y - 10, 5, 5);
    ctx.fillRect(holder.x + 3, holder.y - 10, 5, 5);

    // Type icon letter
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.name[0], holder.x, holder.y + 8);

    // HP bar
    const barW = 40;
    const barH = 5;
    ctx.fillStyle = '#330000';
    ctx.fillRect(holder.x - barW / 2, holder.y - size / 2 - 10, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(holder.x - barW / 2, holder.y - size / 2 - 10, barW * hpPct, barH);
  }

  private drawJeet(ctx: CanvasRenderingContext2D, jeet: Jeet): void {
    const def = JEET_DEFS[jeet.type];
    const size = 40;
    const hpPct = jeet.hp / jeet.maxHp;

    ctx.fillStyle = def.color;
    ctx.fillRect(jeet.x - size / 2, jeet.y - size / 2, size, size);

    // Arms
    ctx.fillStyle = '#64748b';
    if (jeet.isEating) {
      ctx.fillRect(jeet.x - size / 2 - 8, jeet.y - 4, 10, 8);
    } else {
      ctx.fillRect(jeet.x - size / 2 - 4, jeet.y + 8, 8, 12);
      ctx.fillRect(jeet.x + size / 2 - 4, jeet.y + 8, 8, 12);
    }

    // Face
    ctx.fillStyle = '#000';
    ctx.fillRect(jeet.x - 8, jeet.y - 8, 5, 5);
    ctx.fillRect(jeet.x + 3, jeet.y - 8, 5, 5);

    // HP bar
    const barW = 36;
    const barH = 4;
    ctx.fillStyle = '#330000';
    ctx.fillRect(jeet.x - barW / 2, jeet.y - size / 2 - 8, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(jeet.x - barW / 2, jeet.y - size / 2 - 8, barW * hpPct, barH);
  }

  private drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(projectile.x - 2, projectile.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawResource(ctx: CanvasRenderingContext2D, resource: Resource): void {
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(resource.x, resource.y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', resource.x, resource.y);
  }
}
