const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LeaderboardEntry {
  wallet: string;
  score: number;
  wave: number;
  createdAt: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const resp = await fetch(`${API_URL}/api/leaderboard`);
  if (!resp.ok) throw new Error('failed to fetch leaderboard');
  const data = (await resp.json()) as { leaderboard: LeaderboardEntry[] };
  return data.leaderboard;
}

export async function submitScore(wallet: string, score: number, wave: number): Promise<void> {
  const resp = await fetch(`${API_URL}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, score, wave }),
  });
  if (!resp.ok) throw new Error('failed to submit score');
}
