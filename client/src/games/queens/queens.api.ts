import type { SolvingStatus, SubmitResponse, StatsResponse, SolverTimingRun } from './queens.types';
export async function startSolving(): Promise<{ sessionId: string; status: string }> {
  const res = await fetch('/api/games/queens/solve', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start solving');
  return res.json();
}
export async function getSolvingStatus(): Promise<SolvingStatus> {
  const res = await fetch('/api/games/queens/solve/status');
  if (!res.ok) throw new Error('Failed to get status');
  return res.json();
}
export async function submitSolution(playerName: string, queenPositions: number[]): Promise<SubmitResponse> {
  const res = await fetch('/api/games/queens/submit-solution', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerName, queenPositions }) });
  if (!res.ok) throw new Error('Failed to submit');
  return res.json();
}
export async function getStats(): Promise<StatsResponse> {
  const res = await fetch('/api/games/queens/stats');
  if (!res.ok) throw new Error('Failed to get stats');
  return res.json();
}

export async function getAlgorithmTimings(): Promise<SolverTimingRun[]> {
  const res = await fetch('/api/games/queens/timings');
  if (!res.ok) throw new Error('Failed to get timings');
  return res.json();
}

export async function revealSolution(excludeHashes: string[] = []): Promise<{ solution: number[]; hash: string }> {
  const url = (() => {
    if (excludeHashes.length === 0) {
      return '/api/games/queens/reveal-solution';
    }
    const params = new URLSearchParams();
    for (const hash of excludeHashes) {
      params.append('exclude', hash);
    }
    return `/api/games/queens/reveal-solution?${params.toString()}`;
  })();
  const res = await fetch(url);
  if (!res.ok) {
    let message = 'Failed to reveal solution.';
    try {
      const payload = await res.json() as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore parse errors and keep the default message.
    }
    throw new Error(message);
  }
  return res.json();
}
