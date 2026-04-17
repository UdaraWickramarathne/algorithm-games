import type { NewRoundResponse, SubmitAnswerResponse } from './minimumCost.types.ts';

export async function fetchNewRound(): Promise<NewRoundResponse> {
  const res = await fetch('/api/games/minimum-cost/rounds', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start new round');
  return res.json();
}

export async function submitAnswer(
  roundId: number,
  playerName: string,
  answer: number
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`/api/games/minimum-cost/rounds/${roundId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, answer }),
  });
  if (!res.ok) throw new Error('Failed to submit answer');
  return res.json();
}
