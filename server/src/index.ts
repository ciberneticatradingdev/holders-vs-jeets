import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = process.env.DATA_DIR || '/app/data';
fs.mkdirSync(DATA_DIR, { recursive: true });
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

function loadScores(): Array<{ wallet: string; score: number; wave: number; createdAt: string }> {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveScores(scores: Array<{ wallet: string; score: number; wave: number; createdAt: string }>) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

function leaderboard() {
  const scores = loadScores();
  const bestByWallet = new Map<string, { wallet: string; score: number; wave: number; createdAt: string }>();
  for (const sc of scores) {
    const existing = bestByWallet.get(sc.wallet);
    if (!existing || sc.score > existing.score) {
      bestByWallet.set(sc.wallet, sc);
    }
  }
  return Array.from(bestByWallet.values()).sort((a, b) => b.score - a.score).slice(0, 100);
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/leaderboard', async (_req, res) => {
  res.json({ leaderboard: leaderboard() });
});

app.post('/api/scores', async (req, res) => {
  const { wallet, score, wave } = req.body;
  if (!wallet || typeof wallet !== 'string' || wallet.length < 32 || wallet.length > 48) {
    return res.status(400).json({ error: 'invalid wallet' });
  }
  if (typeof score !== 'number' || score < 0 || score > 1_000_000) {
    return res.status(400).json({ error: 'invalid score' });
  }
  if (typeof wave !== 'number' || wave < 0 || wave > 1000) {
    return res.status(400).json({ error: 'invalid wave' });
  }

  const scores = loadScores();
  scores.push({
    wallet,
    score: Math.floor(score),
    wave: Math.floor(wave),
    createdAt: new Date().toISOString(),
  });
  saveScores(scores);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Holders vs Jeets server listening on port ${PORT}`);
});
