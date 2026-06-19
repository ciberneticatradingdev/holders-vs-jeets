import type {
  GameState,
  Holder,
  HolderDefinition,
  HolderType,
  Jeet,
  JeetDefinition,
  JeetType,
  Particle,
  Projectile,
  Wave,
} from '../types';

export const GRID = {
  lanes: 5,
  cols: 9,
  cellSize: 64,
  offsetX: 120,
  offsetY: 60,
};

export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;

export const HOLDER_DEFS: Record<HolderType, HolderDefinition> = {
  diamond_hands: {
    type: 'diamond_hands',
    name: 'Diamond Hands',
    cost: 100,
    hp: 120,
    cooldownMs: 1400,
    range: 600,
    damage: 20,
    color: '#4ade80',
    seedRechargeMs: 7500,
  },
  whale: {
    type: 'whale',
    name: 'Whale',
    cost: 150,
    hp: 600,
    cooldownMs: 0,
    range: 0,
    damage: 0,
    color: '#60a5fa',
    seedRechargeMs: 20000,
  },
  staker: {
    type: 'staker',
    name: 'Staker',
    cost: 50,
    hp: 80,
    cooldownMs: 5000,
    range: 0,
    damage: 0,
    color: '#fcd34d',
    seedRechargeMs: 7500,
  },
  ape: {
    type: 'ape',
    name: 'Ape',
    cost: 125,
    hp: 160,
    cooldownMs: 700,
    range: 90,
    damage: 35,
    color: '#f97316',
    seedRechargeMs: 7500,
  },
  fud_bomber: {
    type: 'fud_bomber',
    name: 'FUD Bomber',
    cost: 175,
    hp: 100,
    cooldownMs: 0,
    range: 0,
    damage: 300,
    color: '#ef4444',
    seedRechargeMs: 25000,
  },
  hodl_laser: {
    type: 'hodl_laser',
    name: 'HODL Laser',
    cost: 200,
    hp: 120,
    cooldownMs: 1800,
    range: 600,
    damage: 60,
    color: '#a855f7',
    seedRechargeMs: 10000,
  },
};

export const JEET_DEFS: Record<JeetType, JeetDefinition> = {
  paper_hands: {
    type: 'paper_hands',
    name: 'Paper Hands',
    hp: 80,
    speed: 22,
    damage: 10,
    attackCooldownMs: 1000,
    color: '#94a3b8',
    reward: 10,
  },
  fomo_runner: {
    type: 'fomo_runner',
    name: 'FOMO Runner',
    hp: 50,
    speed: 45,
    damage: 8,
    attackCooldownMs: 800,
    color: '#f472b6',
    reward: 15,
  },
  rug_puller: {
    type: 'rug_puller',
    name: 'Rug Puller',
    hp: 140,
    speed: 18,
    damage: 12,
    attackCooldownMs: 1200,
    color: '#64748b',
    reward: 25,
  },
  whale_jeet: {
    type: 'whale_jeet',
    name: 'Whale Jeet',
    hp: 500,
    speed: 12,
    damage: 25,
    attackCooldownMs: 1500,
    color: '#1e293b',
    reward: 50,
  },
  bot_swarm: {
    type: 'bot_swarm',
    name: 'Bot Swarm',
    hp: 25,
    speed: 35,
    damage: 5,
    attackCooldownMs: 600,
    color: '#22d3ee',
    reward: 5,
  },
  influencer: {
    type: 'influencer',
    name: 'Influencer',
    hp: 120,
    speed: 20,
    damage: 10,
    attackCooldownMs: 1000,
    color: '#c084fc',
    reward: 30,
  },
};

let idCounter = 0;
const uid = (prefix: string) => `${prefix}_${++idCounter}_${Date.now().toString(36)}`;

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max));

export function cellCenter(lane: number, col: number): { x: number; y: number } {
  return {
    x: GRID.offsetX + col * GRID.cellSize + GRID.cellSize / 2,
    y: GRID.offsetY + lane * GRID.cellSize + GRID.cellSize / 2,
  };
}

export function cellAtPixel(x: number, y: number): { lane: number; col: number } | null {
  const col = Math.floor((x - GRID.offsetX) / GRID.cellSize);
  const lane = Math.floor((y - GRID.offsetY) / GRID.cellSize);
  if (col < 0 || col >= GRID.cols || lane < 0 || lane >= GRID.lanes) return null;
  return { lane, col };
}

export function buildWaves(): Wave[] {
  const waves: Wave[] = [];
  for (let i = 0; i < 8; i++) {
    const spawns: { timeMs: number; lane: number; type: JeetType }[] = [];
    const count = 4 + i * 2;
    const available: JeetType[] = ['paper_hands'];
    if (i >= 1) available.push('fomo_runner');
    if (i >= 2) available.push('bot_swarm');
    if (i >= 3) available.push('rug_puller');
    if (i >= 5) available.push('influencer');
    if (i >= 7) available.push('whale_jeet');

    for (let j = 0; j < count; j++) {
      const type = available[Math.floor(Math.random() * available.length)];
      spawns.push({
        timeMs: 2000 + j * (2200 - i * 150),
        lane: Math.floor(Math.random() * GRID.lanes),
        type,
      });
    }
    waves.push({ index: i, durationMs: 30000 + i * 4000, spawns });
  }
  return waves;
}

export function canPlaceHolder(state: GameState, lane: number, col: number, type: HolderType): boolean {
  if (state.liquidity < HOLDER_DEFS[type].cost) return false;
  if (state.seedCooldowns[type] && state.seedCooldowns[type]! > 0) return false;
  return !state.holders.some((h) => h.lane === lane && h.col === col);
}

export function placeHolder(state: GameState, lane: number, col: number, type: HolderType): GameState {
  const def = HOLDER_DEFS[type];
  if (!canPlaceHolder(state, lane, col, type)) return state;

  const pos = cellCenter(lane, col);
  const holder: Holder = {
    id: uid('holder'),
    type,
    lane,
    col,
    x: pos.x,
    y: pos.y,
    hp: def.hp,
    maxHp: def.hp,
    cooldownMs: 0,
    flashMs: 0,
  };

  return addParticles(
    {
      ...state,
      liquidity: state.liquidity - def.cost,
      holders: [...state.holders, holder],
      selectedSeed: null,
      seedCooldowns: { ...state.seedCooldowns, [type]: def.seedRechargeMs },
    },
    pos.x,
    pos.y,
    def.color,
    12,
    'burst'
  );
}

export function collectResource(state: GameState, id: string): GameState {
  const resource = state.resources.find((r) => r.id === id);
  if (!resource) return state;
  return addFloatingText(
    {
      ...state,
      liquidity: state.liquidity + resource.value,
      resources: state.resources.filter((r) => r.id !== id),
    },
    resource.x,
    resource.y,
    `+${resource.value}`,
    '#fcd34d'
  );
}

function spawnJeet(type: JeetType, lane: number): Jeet {
  const pos = cellCenter(lane, GRID.cols - 1);
  return {
    id: uid('jeet'),
    type,
    lane,
    x: pos.x + GRID.cellSize,
    y: pos.y,
    hp: JEET_DEFS[type].hp,
    maxHp: JEET_DEFS[type].hp,
    attackCooldownMs: 0,
    isEating: false,
    flashMs: 0,
  };
}

function nearestJeetInLane(state: GameState, holder: Holder): Jeet | null {
  let nearest: Jeet | null = null;
  let minDist = Infinity;
  for (const jeet of state.jeets) {
    if (jeet.lane !== holder.lane) continue;
    const dist = jeet.x - holder.x;
    if (dist >= 0 && dist <= HOLDER_DEFS[holder.type].range && dist < minDist) {
      minDist = dist;
      nearest = jeet;
    }
  }
  return nearest;
}

function holderAtCell(state: GameState, lane: number, col: number): Holder | null {
  return state.holders.find((h) => h.lane === lane && h.col === col) || null;
}

function colAtX(x: number): number {
  return Math.floor((x - GRID.offsetX) / GRID.cellSize);
}

export function step(state: GameState, deltaMs: number, waves: Wave[]): GameState {
  if (state.status !== 'playing') return state;

  let next: GameState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    seedCooldowns: Object.fromEntries(
      Object.entries(state.seedCooldowns).map(([k, v]) => [k, Math.max(0, v - deltaMs)])
    ) as Partial<Record<HolderType, number>>,
    shakeMs: Math.max(0, state.shakeMs - deltaMs),
    waveBannerMs: Math.max(0, state.waveBannerMs - deltaMs),
  };

  // Decrement flash timers
  next.holders = next.holders.map((h) => ({ ...h, flashMs: Math.max(0, h.flashMs - deltaMs) }));
  next.jeets = next.jeets.map((j) => ({ ...j, flashMs: Math.max(0, j.flashMs - deltaMs) }));

  // Wave progression + banner
  if (next.waveBannerMs <= 0 && next.elapsedMs < 2000) {
    next.waveBannerMs = 2200;
  }

  const currentWave = waves[next.waveIndex];
  if (currentWave) {
    for (const spawn of currentWave.spawns) {
      const key = `${next.waveIndex}_${spawn.timeMs}_${spawn.lane}_${spawn.type}`;
      if (spawn.timeMs <= next.elapsedMs && !next.spawnedKeys.includes(key)) {
        next.jeets = [...next.jeets, spawnJeet(spawn.type, spawn.lane)];
        next.spawnedKeys = [...next.spawnedKeys, key];
      }
    }
  }

  // Advance to next wave when current is empty and duration elapsed
  if (
    currentWave &&
    next.elapsedMs >= currentWave.durationMs &&
    next.jeets.length === 0 &&
    next.waveIndex < waves.length - 1
  ) {
    next = { ...next, elapsedMs: 0, waveIndex: next.waveIndex + 1, waveBannerMs: 2200 };
  }

  // Victory
  if (next.waveIndex === waves.length - 1 && next.jeets.length === 0 && next.elapsedMs >= waves[next.waveIndex].durationMs) {
    return { ...next, status: 'victory' };
  }

  // Resources falling
  if (Math.random() < deltaMs * 0.0012) {
    next.resources = [
      ...next.resources,
      {
        id: uid('res'),
        x: GRID.offsetX + Math.random() * (GRID.cols * GRID.cellSize),
        y: -20,
        value: 25,
        lifetimeMs: 8000,
      },
    ];
  }

  next.resources = next.resources
    .map((r) => ({ ...r, y: r.y + deltaMs * 0.04 * (1 + Math.sin(r.x * 0.02) * 0.15), lifetimeMs: r.lifetimeMs - deltaMs }))
    .filter((r) => r.lifetimeMs > 0 && r.y < LOGICAL_HEIGHT + 20);

  // Holders: stakers generate liquidity, shooters attack
  const newProjectiles: Projectile[] = [];
  next.holders = next.holders.map((holder) => {
    const def = HOLDER_DEFS[holder.type];
    let cooldown = Math.max(0, holder.cooldownMs - deltaMs);

    if (holder.type === 'staker' && cooldown <= 0) {
      next.liquidity += 25;
      next = addFloatingText(next, holder.x, holder.y - 24, '+25', '#4ade80');
      next = addParticles(next, holder.x, holder.y, '#fcd34d', 5, 'sparkle');
      cooldown = def.cooldownMs;
    }

    if (def.damage > 0 && cooldown <= 0) {
      const target = nearestJeetInLane(next, holder);
      if (target) {
        cooldown = def.cooldownMs;
        newProjectiles.push({
          id: uid('proj'),
          lane: holder.lane,
          x: holder.x,
          y: holder.y,
          speed: 320,
          damage: def.damage,
          color: def.color,
          holderType: holder.type,
        });
      }
    }

    return { ...holder, cooldownMs: cooldown };
  });

  next.projectiles = [...next.projectiles, ...newProjectiles];

  // Projectiles move and hit
  const hitJeetIds = new Set<string>();
  next.projectiles = next.projectiles
    .map((p) => ({ ...p, x: p.x + (p.speed * deltaMs) / 1000 }))
    .filter((p) => {
      if (p.x > LOGICAL_WIDTH + 20) return false;
      const hit = next.jeets.find((j) => j.lane === p.lane && Math.abs(j.x - p.x) < 20 && !hitJeetIds.has(j.id));
      if (hit) {
        hit.hp -= p.damage;
        hit.flashMs = 120;
        hitJeetIds.add(hit.id);
        next = addParticles(next, hit.x, hit.y, p.color, 6, 'burst');
        next = addFloatingText(next, hit.x, hit.y - 18, `-${p.damage}`, p.color);
        return false;
      }
      return true;
    });

  // Jeets die and reward
  const deadJeets = next.jeets.filter((j) => j.hp <= 0);
  const reward = deadJeets.reduce((sum, j) => sum + JEET_DEFS[j.type].reward, 0);
  next.liquidity += reward;
  for (const j of deadJeets) {
    next = addParticles(next, j.x, j.y, JEET_DEFS[j.type].color, 14, 'explosion');
    next = addFloatingText(next, j.x, j.y - 24, `+${JEET_DEFS[j.type].reward}`, '#fcd34d');
    next.shakeMs = Math.max(next.shakeMs, 120);
  }

  // Jeets move / eat
  next.jeets = next.jeets
    .filter((j) => j.hp > 0)
    .map((jeet) => {
      const def = JEET_DEFS[jeet.type];
      const col = colAtX(jeet.x);
      const holderInFront = col >= 0 && col < GRID.cols ? holderAtCell(next, jeet.lane, col) : null;

      if (holderInFront && Math.abs(jeet.x - holderInFront.x) < GRID.cellSize * 0.55) {
        let attackCooldown = Math.max(0, jeet.attackCooldownMs - deltaMs);
        if (attackCooldown <= 0) {
          holderInFront.hp -= def.damage;
          holderInFront.flashMs = 150;
          attackCooldown = def.attackCooldownMs;
          next = addParticles(next, holderInFront.x, holderInFront.y, '#ef4444', 4, 'burst');
        }
        return { ...jeet, x: jeet.x, attackCooldownMs: attackCooldown, isEating: true };
      }

      return {
        ...jeet,
        x: jeet.x - (def.speed * deltaMs) / 1000,
        attackCooldownMs: Math.max(0, jeet.attackCooldownMs - deltaMs),
        isEating: false,
      };
    });

  // Clean dead holders
  const initialHolderCount = next.holders.length;
  next.holders = next.holders.filter((h) => h.hp > 0);
  if (next.holders.length < initialHolderCount) {
    next.shakeMs = Math.max(next.shakeMs, 200);
  }

  // Jeets reaching left edge
  const leaked = next.jeets.filter((j) => j.x < GRID.offsetX - GRID.cellSize / 2).length;
  if (leaked > 0) {
    next.lives = Math.max(0, next.lives - leaked);
    next.jeets = next.jeets.filter((j) => j.x >= GRID.offsetX - GRID.cellSize / 2);
    next.shakeMs = Math.max(next.shakeMs, 250);
  }

  // Update particles and texts
  next.particles = next.particles
    .map((p) => ({ ...p, x: p.x + p.vx * deltaMs * 0.06, y: p.y + p.vy * deltaMs * 0.06, lifeMs: p.lifeMs - deltaMs }))
    .filter((p) => p.lifeMs > 0);
  next.floatingTexts = next.floatingTexts
    .map((t) => ({ ...t, y: t.y - deltaMs * 0.02, lifeMs: t.lifeMs - deltaMs }))
    .filter((t) => t.lifeMs > 0);

  if (next.lives <= 0) {
    next.status = 'gameover';
  }

  return next;
}

function addParticles(
  state: GameState,
  x: number,
  y: number,
  color: string,
  count: number,
  style: 'burst' | 'explosion' | 'sparkle'
): GameState {
  const out: Particle[] = [...state.particles];
  for (let i = 0; i < count; i++) {
    let vx: number;
    let vy: number;
    if (style === 'burst' || style === 'explosion') {
      const angle = Math.random() * Math.PI * 2;
      const speed = style === 'explosion' ? rnd(3, 7) : rnd(1, 4);
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else {
      vx = rnd(-1, 1);
      vy = rnd(-2, -0.5);
    }
    out.push({
      id: uid('part'),
      x: x + rnd(-4, 4),
      y: y + rnd(-4, 4),
      vx,
      vy,
      lifeMs: style === 'sparkle' ? rnd(500, 900) : rnd(350, 700),
      maxLifeMs: style === 'sparkle' ? 900 : 700,
      color,
      size: style === 'explosion' ? rndInt(3, 6) : rndInt(2, 4),
    });
  }
  return { ...state, particles: out };
}

function addFloatingText(state: GameState, x: number, y: number, text: string, color: string): GameState {
  return {
    ...state,
    floatingTexts: [
      ...state.floatingTexts,
      { id: uid('ftxt'), x, y, text, color, lifeMs: 900, maxLifeMs: 900 },
    ],
  };
}
