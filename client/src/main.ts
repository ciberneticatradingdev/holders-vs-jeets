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
import { fetchLeaderboard, submitScore } from './api/leaderboard';
import { getWallet } from './solana/wallet';
import { AudioManager } from './audio/AudioManager';
import type { GameState, HolderType } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
app.appendChild(canvas);

const uiLayer = document.createElement('div');
uiLayer.className = 'ui-layer';
app.appendChild(uiLayer);

const topHud = document.createElement('div');
topHud.className = 'top-hud';
uiLayer.appendChild(topHud);

const seedBar = document.createElement('div');
seedBar.className = 'seed-bar';
uiLayer.appendChild(seedBar);

const menuOverlay = createOverlay('menu');
menuOverlay.innerHTML = `
  <h1 class="title">HOLDERS vs JEETS</h1>
  <p class="subtitle">Defend the chart. Never sell.</p>
  <button class="btn" id="btn-play">PLAY</button>
  <button class="btn btn-secondary" id="btn-menu-leaderboard">LEADERBOARD</button>
`;
uiLayer.appendChild(menuOverlay);

const gameOverOverlay = createOverlay('gameover');
gameOverOverlay.innerHTML = `
  <h1 class="title">JEETS WON</h1>
  <p class="subtitle" id="go-score"></p>
  <button class="btn" id="btn-retry">RETRY</button>
  <button class="btn btn-secondary" id="btn-go-leaderboard">LEADERBOARD</button>
`;
uiLayer.appendChild(gameOverOverlay);

const victoryOverlay = createOverlay('victory');
victoryOverlay.innerHTML = `
  <h1 class="title">WAGMI</h1>
  <p class="subtitle" id="vic-score"></p>
  <button class="btn" id="btn-victory-retry">PLAY AGAIN</button>
  <button class="btn btn-secondary" id="btn-vic-leaderboard">LEADERBOARD</button>
`;
uiLayer.appendChild(victoryOverlay);

const leaderboardOverlay = createOverlay('leaderboard');
leaderboardOverlay.innerHTML = `
  <div class="leaderboard-card">
    <h2 class="title small">LEADERBOARD</h2>
    <div id="leaderboard-list" class="leaderboard-list"></div>
    <div class="leaderboard-actions">
      <button class="btn" id="btn-leaderboard-close">CLOSE</button>
    </div>
  </div>
`;
uiLayer.appendChild(leaderboardOverlay);

const liquidityPanel = document.createElement('div');
liquidityPanel.className = 'panel';
topHud.appendChild(liquidityPanel);

const wavePanel = document.createElement('div');
wavePanel.className = 'panel';
topHud.appendChild(wavePanel);

const livesPanel = document.createElement('div');
livesPanel.className = 'panel';
topHud.appendChild(livesPanel);

const walletPanel = document.createElement('div');
walletPanel.className = 'panel wallet-panel';
topHud.appendChild(walletPanel);

const soundBtn = document.createElement('button');
soundBtn.className = 'sound-btn';
soundBtn.textContent = '🔊';
uiLayer.appendChild(soundBtn);

function createOverlay(name: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `screen-overlay ${name}-overlay`;
  return el;
}

const store = useGameStore;
const waves = buildWaves();
const renderer = new GameRenderer(canvas);
const audio = new AudioManager();
const wallet = getWallet();
let connectedWallet: string | null = wallet.publicKey;

(window as any).__hvj_store = store;

let lastTime = performance.now();
let scoreSubmitted = false;

function calculateScore(state: GameState): number {
  return state.liquidity + state.waveIndex * 1000 + state.holders.length * 50;
}

async function submitIfWallet(state: GameState) {
  if (!connectedWallet || scoreSubmitted) return;
  const score = calculateScore(state);
  try {
    await submitScore(connectedWallet, score, state.waveIndex + 1);
    scoreSubmitted = true;
  } catch (err) {
    console.error('score submit failed', err);
  }
}

async function renderWalletPanel() {
  const short = connectedWallet ? `${connectedWallet.slice(0, 4)}...${connectedWallet.slice(-4)}` : 'Connect Wallet';
  walletPanel.innerHTML = `<span class="value">${short}</span>`;
  walletPanel.onclick = async () => {
    if (connectedWallet) {
      await wallet.disconnect();
      connectedWallet = null;
    } else {
      const pk = await wallet.connect();
      if (!connectedWallet && pk) connectedWallet = pk;
    }
    renderWalletPanel();
  };
}

async function showLeaderboard() {
  const list = document.getElementById('leaderboard-list')!;
  list.innerHTML = '<div class="leaderboard-row">Loading...</div>';
  leaderboardOverlay.classList.add('active');
  try {
    const entries = await fetchLeaderboard();
    if (entries.length === 0) {
      list.innerHTML = '<div class="leaderboard-row">No scores yet. Be the first holder.</div>';
      return;
    }
    list.innerHTML = entries.map((e, i) => `
      <div class="leaderboard-row">
        <span class="rank">${i + 1}</span>
        <span class="wallet">${e.wallet.slice(0, 6)}...${e.wallet.slice(-4)}</span>
        <span class="score">${e.score}</span>
        <span class="wave">W${e.wave}</span>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<div class="leaderboard-row">Error loading leaderboard.</div>';
  }
}

function hideLeaderboard() {
  leaderboardOverlay.classList.remove('active');
}

function toLogical(clientX: number, clientY: number): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
  const scale = rect.width / LOGICAL_WIDTH;
  return { x: x / scale, y: y / scale };
}

const seedPackets: { el: HTMLDivElement; type: HolderType }[] = [];

function createSeedBar(): void {
  seedBar.innerHTML = '';
  seedPackets.length = 0;
  const seeds: HolderType[] = ['diamond_hands', 'whale', 'staker', 'ape', 'fud_bomber', 'hodl_laser'];
  for (const type of seeds) {
    const def = HOLDER_DEFS[type];
    const packet = document.createElement('div');
    packet.className = 'seed-packet';
    packet.dataset.type = type;
    packet.innerHTML = `
      <div class="icon" style="background:${def.color};--packet-color:${def.color}"></div>
      <div class="name">${def.name}</div>
      <div class="cost">${def.cost}</div>
    `;
    seedPackets.push({ el: packet, type });
    seedBar.appendChild(packet);
  }
  seedBar.addEventListener('click', (e) => {
    const packet = (e.target as HTMLElement).closest('.seed-packet') as HTMLDivElement | null;
    if (!packet) return;
    const type = packet.dataset.type as HolderType;
    const state = store.getState();
    if (state.status !== 'playing') return;
    if (state.liquidity < HOLDER_DEFS[type].cost || (state.seedCooldowns[type] ?? 0) > 0) return;
    store.getState().selectSeed(type);
  });
}

function selectSeedByKey(index: number) {
  const seeds: HolderType[] = ['diamond_hands', 'whale', 'staker', 'ape', 'fud_bomber', 'hodl_laser'];
  const type = seeds[index];
  if (!type) return;
  const state = store.getState();
  if (state.status !== 'playing') return;
  if (state.liquidity < HOLDER_DEFS[type].cost || (state.seedCooldowns[type] ?? 0) > 0) return;
  store.getState().selectSeed(type);
}

function renderHUD(_state?: GameState): void {
  const state = _state ?? store.getState();

  liquidityPanel.innerHTML = `Liquidity: <span class="value">${state.liquidity}</span>`;
  wavePanel.innerHTML = `Wave: <span class="value">${state.waveIndex + 1}/${waves.length}</span>`;
  livesPanel.innerHTML = `Lives: <span class="value">${state.lives}</span>`;

  menuOverlay.classList.toggle('active', state.status === 'menu');
  gameOverOverlay.classList.toggle('active', state.status === 'gameover');
  victoryOverlay.classList.toggle('active', state.status === 'victory');

  if (state.status === 'gameover') {
    const score = calculateScore(state);
    document.getElementById('go-score')!.textContent = `Score: ${score} · Wave ${state.waveIndex + 1}`;
    submitIfWallet(state);
  }
  if (state.status === 'victory') {
    const score = calculateScore(state);
    document.getElementById('vic-score')!.textContent = `Score: ${score} · All waves cleared`;
    submitIfWallet(state);
  }

  for (const { el, type } of seedPackets) {
    const def = HOLDER_DEFS[type];
    const cd = state.seedCooldowns[type] ?? 0;
    el.classList.toggle('active', state.selectedSeed === type);
    el.classList.toggle('disabled', state.liquidity < def.cost || cd > 0);

    let overlay = el.querySelector('.cooldown-overlay');
    if (cd > 0) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'cooldown-overlay';
        el.appendChild(overlay);
      }
      overlay.textContent = Math.ceil(cd / 1000).toString();
    } else if (overlay) {
      overlay.remove();
    }
  }
}

function playSounds(prev: GameState, curr: GameState) {
  if (!curr.soundEnabled) return;

  // Projectile shots
  if (curr.projectiles.length > prev.projectiles.length) {
    for (let i = 0; i < curr.projectiles.length - prev.projectiles.length; i++) audio.shoot();
  }

  // Resources collected
  if (curr.resources.length < prev.resources.length) audio.collect();

  // Holder placed
  if (curr.holders.length > prev.holders.length) audio.place();

  // Hits via particle burst that isn't explosion
  const newParticles = curr.particles.length;
  const prevParticles = prev.particles.length;
  if (newParticles > prevParticles && curr.shakeMs < 150 && curr.shakeMs > 0) {
    audio.hit();
  }

  // Explosions (dead jeets or dead holders)
  if (curr.particles.length > prev.particles.length && curr.shakeMs >= 120) {
    audio.explode();
  }

  // Wave banner
  if (curr.waveBannerMs > 0 && prev.waveBannerMs <= 0) audio.waveStart();

  // Game over / victory
  if (curr.status === 'gameover' && prev.status !== 'gameover') audio.gameover();
  if (curr.status === 'victory' && prev.status !== 'victory') audio.victory();
}

function gameLoop(now: number): void {
  const deltaMs = Math.min(now - lastTime, 50);
  lastTime = now;

  const prev = store.getState();

  if (prev.status === 'playing') {
    const next = step(prev, deltaMs, waves);
    store.setState(next);
  }

  const curr = store.getState();
  playSounds(prev, curr);

  renderer.render(curr, deltaMs);
  renderHUD(curr);
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
  const state = store.getState();
  if (state.status !== 'playing') return;

  const pos = toLogical(e.clientX, e.clientY);
  if (!pos) return;

  for (const res of state.resources) {
    const dx = res.x - pos.x;
    const dy = res.y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 24) {
      store.setState(collectResource(state, res.id));
      return;
    }
  }

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

document.getElementById('btn-play')!.addEventListener('click', () => {
  scoreSubmitted = false;
  store.getState().startGame();
  renderHUD();
});

document.getElementById('btn-retry')!.addEventListener('click', () => {
  scoreSubmitted = false;
  store.getState().startGame();
  renderHUD();
});

document.getElementById('btn-victory-retry')!.addEventListener('click', () => {
  scoreSubmitted = false;
  store.getState().startGame();
  renderHUD();
});

document.getElementById('btn-menu-leaderboard')!.addEventListener('click', showLeaderboard);
document.getElementById('btn-go-leaderboard')!.addEventListener('click', showLeaderboard);
document.getElementById('btn-vic-leaderboard')!.addEventListener('click', showLeaderboard);
document.getElementById('btn-leaderboard-close')!.addEventListener('click', hideLeaderboard);

soundBtn.addEventListener('click', () => {
  const enabled = !store.getState().soundEnabled;
  store.setState({ soundEnabled: enabled });
  audio.setEnabled(enabled);
  soundBtn.textContent = enabled ? '🔊' : '🔇';
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '6') {
    selectSeedByKey(parseInt(e.key, 10) - 1);
  }
});

renderWalletPanel();
createSeedBar();
renderHUD();
requestAnimationFrame(gameLoop);
