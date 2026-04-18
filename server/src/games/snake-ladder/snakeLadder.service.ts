import { randomInt, shuffleArray, makeChoices } from '../../shared/utils/random.js';
import { timeExecution } from '../../shared/utils/timer.js';
import { bfsMinThrows, type BoardGraph } from './algorithms/bfs.js';
import { dijkstraMinThrows } from './algorithms/dijkstra.js';
import { createGameRound, getGameRoundById } from '../../shared/models/gameRound.model.js';
import { saveAlgorithmTiming, getTimingsByRoundId } from '../../shared/models/algorithmTiming.model.js';
import { saveGameResult } from '../../shared/models/gameResult.model.js';
import { findOrCreatePlayer } from '../../shared/models/player.model.js';
import { createError } from '../../shared/middleware/errorHandler.js';

const GAME_TYPE = 'snake_ladder' as const;

function generateBoard(n: number): BoardGraph {
  const totalCells = n * n;
  const snakeCount = n - 2;
  const ladderCount = n - 2;

  const usedHeads = new Set<number>([1, totalCells]);
  const usedTails = new Set<number>([1, totalCells]);

  const snakes: Record<number, number> = {};
  const ladders: Record<number, number> = {};

  // Generate ladders: bottom (low) -> top (high)
  let attempts = 0;
  while (Object.keys(ladders).length < ladderCount && attempts < 1000) {
    attempts++;
    const bottom = randomInt(2, totalCells - 2);
    const top = randomInt(bottom + 1, totalCells - 1);
    if (!usedHeads.has(bottom) && !usedTails.has(top) && top !== bottom) {
      ladders[bottom] = top;
      usedHeads.add(bottom);
      usedTails.add(top);
    }
  }

  // Generate snakes: head (high) -> tail (low)
  attempts = 0;
  while (Object.keys(snakes).length < snakeCount && attempts < 1000) {
    attempts++;
    const head = randomInt(2, totalCells - 1);
    const tail = randomInt(1, head - 1);
    if (
      !usedHeads.has(head) &&
      !usedTails.has(tail) &&
      !ladders[tail] &&
      tail !== head
    ) {
      snakes[head] = tail;
      usedHeads.add(head);
      usedTails.add(tail);
    }
  }

  return { snakes, ladders, totalCells };
}

export function newRound(boardSize: number) {
  if (boardSize < 6 || boardSize > 12) {
    throw createError('Board size must be between 6 and 12', 400);
  }

  const board = generateBoard(boardSize);

  const { result: bfsResult, executionTimeMs: bfsTime } = timeExecution(() =>
    bfsMinThrows(board)
  );
  const { result: dijkstraResult, executionTimeMs: dijkstraTime } = timeExecution(() =>
    dijkstraMinThrows(board)
  );

  const correctAnswer = bfsResult;
  const choices = makeChoices(correctAnswer);

  const round = createGameRound(
    GAME_TYPE,
    { boardSize, snakes: board.snakes, ladders: board.ladders, choices },
    String(correctAnswer)
  );

  saveAlgorithmTiming(round.id, 'BFS', bfsTime, String(bfsResult), GAME_TYPE);
  saveAlgorithmTiming(round.id, 'Dijkstra', dijkstraTime, String(dijkstraResult), GAME_TYPE);

  return {
    roundId: round.id,
    boardSize,
    snakes: board.snakes,
    ladders: board.ladders,
    totalCells: board.totalCells,
    choices,
    timings: [
      { algorithmName: 'BFS', executionTimeMs: bfsTime, result: String(bfsResult) },
      { algorithmName: 'Dijkstra', executionTimeMs: dijkstraTime, result: String(dijkstraResult) },
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
