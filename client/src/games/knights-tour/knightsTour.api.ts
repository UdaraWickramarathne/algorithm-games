import type { NewRoundResponse, SubmitAnswerResponse, SolutionResponse } from './knightsTour.types';
export async function fetchNewRound(boardSize: 8 | 16): Promise<NewRoundResponse> {
  const res = await fetch('/api/games/knights-tour/rounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardSize }) });
  if (!res.ok) throw new Error('Failed to start round');
  return res.json();
}
export async function fetchSolution(roundId: number): Promise<SolutionResponse> {
  const res = await fetch(`/api/games/knights-tour/rounds/${roundId}/solution`);
  if (!res.ok) throw new Error('Failed to get solution');
  return res.json();
}
export async function submitAnswer(roundId: number, playerName: string, moves: [number, number][]): Promise<SubmitAnswerResponse> {
  const res = await fetch(`/api/games/knights-tour/rounds/${roundId}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerName, moves }) });
  if (!res.ok) throw new Error('Failed to submit');
  return res.json();
}
