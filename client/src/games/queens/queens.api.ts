import type { SolvingStatus, SubmitResponse, StatsResponse } from './queens.types';
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
