import { randomInt, makeChoices } from '../../shared/utils/random.js';
import { timeExecution } from '../../shared/utils/timer.js';
import { hungarian } from './algorithms/hungarian.js';
import { greedyAssignment } from './algorithms/greedyAssignment.js';
import { createGameRound } from '../../shared/models/gameRound.model.js';
import { saveAlgorithmTiming } from '../../shared/models/algorithmTiming.model.js';
import { saveGameResult } from '../../shared/models/gameResult.model.js';
import { findOrCreatePlayer } from '../../shared/models/player.model.js';
import { getGameRoundById } from '../../shared/models/gameRound.model.js';
import { getTimingsByRoundId } from '../../shared/models/algorithmTiming.model.js';
import { createError } from '../../shared/middleware/errorHandler.js';

const GAME_TYPE = 'minimum_cost' as const;

function generateCostMatrix(n: number): number[][] {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randomInt(20, 200))
  );
}

export function newRound() {
  const n = randomInt(50, 100);
  const costMatrix = generateCostMatrix(n);

  const { result: hungarianResult, executionTimeMs: hungarianTime } =
    timeExecution(() => hungarian(costMatrix));

  const { result: greedyResult, executionTimeMs: greedyTime } =
    timeExecution(() => greedyAssignment(costMatrix));

  const correctAnswer = hungarianResult.totalCost;
  const choices = makeChoices(correctAnswer);

  const round = createGameRound(
    GAME_TYPE,
    { n, choices },
    String(correctAnswer)
  );

  saveAlgorithmTiming(round.id, 'Hungarian', hungarianTime, String(correctAnswer), GAME_TYPE);
  saveAlgorithmTiming(round.id, 'Greedy', greedyTime, String(greedyResult.totalCost), GAME_TYPE);

  return {
    roundId: round.id,
    n,
    choices,
    timings: [
      { algorithmName: 'Hungarian', executionTimeMs: hungarianTime, result: String(correctAnswer) },
      { algorithmName: 'Greedy', executionTimeMs: greedyTime, result: String(greedyResult.totalCost) },
    ],
  };
}

export function submitAnswer(roundId: number, playerName: string, answer: number) {
  const round = getGameRoundById(roundId);
  if (!round) throw createError('Round not found', 404);

  const correctAnswer = Number(round.correct_answer);
  const isCorrect = answer === correctAnswer;
  const outcome = isCorrect ? 'win' : 'lose';

  if (isCorrect) {
    const player = findOrCreatePlayer(playerName);
    saveGameResult(roundId, player.id, String(answer), String(correctAnswer), isCorrect, GAME_TYPE);
  }

  const timings = getTimingsByRoundId(roundId).map((t) => ({
    algorithmName: t.algorithm_name,
    executionTimeMs: t.execution_time_ms,
    result: t.result,
  }));

  return { isCorrect, correctAnswer, outcome, timings };
}
