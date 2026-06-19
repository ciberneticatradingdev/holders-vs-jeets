import './style.css';
import { GameRenderer } from './renderer/GameRenderer';
import {
  buildWaves,
  canPlaceHolder,
  cellAtPixel,
  collectResource,
  HOLDER_DEFS,
  LOGICAL_WIDTH,
  placeHolder,
  step,
} from './engine/GameEngine';
import { useGameStore } from './store/gameStore';
import type { HolderType } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;

// Canvas
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
app.appendChild(canvas);

// UI layer
const uiLayer = document.createElement('div');
uiLayer.className = 'ui-layer';
app.appendChild(uiLayer);

const topHud = document.createElement('div');
topHud.className = 'top-hud';
uiLayer.appendChild(topHud);

const seedBar = document.createElement('div');
seedBar.className = 'seed-bar';
uiLayer.appendChild(seedBar);

// Screen overlays
const menuOverlay = createOverlay('menu');
menuOverlay.innerHTML = `
  <h1 class="title">HOLDERS vs JEETS</h1>
  <button class="btn" id="btn-play">PLAY</button>
`;
uiLayer.appendChild(menuOverlay);

const gameOverOverlay = createOverlay('gameover');
gameOverOverlay.innerHTML = `
  <h1 class="title">JEETS WON</h1>
  <button class="btn" id="btn-retry">RETRY</button>
`;
uiLayer.appendChild(gameOverOverlay);

const victoryOverlay = createOverlay('victory');
victoryOverlay.innerHTML = `
  <h1 class="title">WAGMI</h1>
  <button class="btn" id="btn-victory-retry">PLAY AGAIN</button>
`;
uiLayer.appendChild(victoryOverlay);

const liquidityPanel = document.createElement('div');
liquidityPanel.className = 'panel';
topHud.appendChild(liquidityPanel);

const wavePanel = document.createElement('div');
wavePanel.className = 'panel';
topHud.appendChild(wavePanel);

const livesPanel = document.createElement('div');
livesPanel.className = 'panel';
topHud.appendChild(livesPanel);

function createOverlay(name: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `screen-overlay ${name}-overlay`;
  return el;
}

const store = useGameStore;
const waves = buildWaves();
const renderer = new GameRenderer(canvas);

(window as any).__hvj_store = store;

let lastTime = performance.now();

function toLogical(clientX: number, clientY: number): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
  const scale = rect.width / LOGICAL_WIDTH;
  return { x: x / scale, y: y / scale };
}

function renderHUD(state = store.getState()): void {
  liquidityPanel.innerHTML = `Liquidity: <span class="value">${state.liquidity}</span>`;
  wavePanel.innerHTML = `Wave: <span class="value">${state.waveIndex + 1}/${waves.length}</span>`;
  livesPanel.innerHTML = `Lives: <span class="value">${state.lives}</span>`;

  menuOverlay.classList.toggle('active', state.status === 'menu');
  gameOverOverlay.classList.toggle('active', state.status === 'gameover');
  victoryOverlay.classList.toggle('active', state.status === 'victory');

  seedBar.innerHTML = '';
  const seeds: HolderType[] = ['diamond_hands', 'whale', 'staker', 'ape', 'fud_bomber', 'hodl_laser'];
  for (const type of seeds) {
    const def = HOLDER_DEFS[type];
    const packet = document.createElement('div');
    packet.className = 'seed-packet';
    if (state.selectedSeed === type) packet.classList.add('active');
    if (state.liquidity < def.cost || (state.seedCooldowns[type] ?? 0) > 0) {
      packet.classList.add('disabled');
    }
    packet.innerHTML = `
      <div class="icon" style="background:${def.color};--packet-color:${def.color}"></div>
      <div class="name">${def.name}</div>
      <div class="cost">${def.cost}</div>
    `;
    const cd = state.seedCooldowns[type] ?? 0;
    if (cd > 0) {
      const overlay = document.createElement('div');
      overlay.className = 'cooldown-overlay';
      overlay.textContent = Math.ceil(cd / 1000).toString();
      packet.appendChild(overlay);
    }
    packet.addEventListener('click', () => {
      if (state.status !== 'playing') return;
      const current = store.getState();
      if (current.liquidity < def.cost || (current.seedCooldowns[type] ?? 0) > 0) return;
      store.getState().selectSeed(type);
      renderHUD();
    });
    seedBar.appendChild(packet);
  }
}

function gameLoop(now: number): void {
  const deltaMs = Math.min(now - lastTime, 50);
  lastTime = now;

  const state = store.getState();
  if (state.status === 'playing') {
    const next = step(state, deltaMs, waves);
    store.setState(next);
  }

  renderer.render(store.getState(), deltaMs);
  renderHUD();
  requestAnimationFrame(gameLoop);
}

// Input handlers
canvas.addEventListener('click', (e) => {
  const state = store.getState();
  if (state.status !== 'playing') return;

  const pos = toLogical(e.clientX, e.clientY);
  if (!pos) return;

  // Check resource clicks
  for (const res of state.resources) {
    const dx = res.x - pos.x;
    const dy = res.y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 24) {
      store.setState(collectResource(state, res.id));
      return;
    }
  }

  // Check grid placement
  const cell = cellAtPixel(pos.x, pos.y);
  if (cell && state.selectedSeed) {
    if (canPlaceHolder(state, cell.lane, cell.col, state.selectedSeed)) {
      store.setState(placeHolder(state, cell.lane, cell.col, state.selectedSeed));
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const state = store.getState();
  if (state.status !== 'playing') return;
  const pos = toLogical(e.clientX, e.clientY);
  if (!pos) {
    store.setState({ hoveredCell: null });
    return;
  }
  const cell = cellAtPixel(pos.x, pos.y);
  store.setState({ hoveredCell: cell });
});

// Overlay buttons
document.getElementById('btn-play')!.addEventListener('click', () => {
  store.getState().startGame();
  renderHUD();
});

document.getElementById('btn-retry')!.addEventListener('click', () => {
  store.getState().startGame();
  renderHUD();
});

document.getElementById('btn-victory-retry')!.addEventListener('click', () => {
  store.getState().startGame();
  renderHUD();
});

// Start
renderHUD();
requestAnimationFrame(gameLoop);
