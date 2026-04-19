import { randomInt, makeChoices } from '../../shared/utils/random.js';
import { timeExecution } from '../../shared/utils/timer.js';
import { edmondsKarp, type FlowNetwork } from './algorithms/edmondsKarp.js';
import { dinic } from './algorithms/dinic.js';
import { createGameRound, getGameRoundById } from '../../shared/models/gameRound.model.js';
import { saveAlgorithmTiming, getTimingsByRoundId } from '../../shared/models/algorithmTiming.model.js';
import { saveGameResult } from '../../shared/models/gameResult.model.js';
import { findOrCreatePlayer } from '../../shared/models/player.model.js';
import { createError } from '../../shared/middleware/errorHandler.js';

const GAME_TYPE = 'traffic' as const;

// Fixed topology: A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, T=8
const NODE_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'T'];
const EDGE_LIST: [string, string][] = [
  ['A', 'B'], ['A', 'C'], ['A', 'D'],
  ['B', 'E'], ['B', 'F'],
  ['C', 'E'], ['C', 'F'],
  ['D', 'F'],
  ['E', 'G'], ['E', 'H'],
  ['F', 'H'],
  ['G', 'T'], ['H', 'T'],
];

function buildNetwork(edgeCapacities: number[]): FlowNetwork {
  const n = NODE_NAMES.length;
  const nodeIndex: Record<string, number> = {};
  NODE_NAMES.forEach((name, i) => { nodeIndex[name] = i; });
  const capacity = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  EDGE_LIST.forEach(([from, to], idx) => {
    capacity[nodeIndex[from]][nodeIndex[to]] = edgeCapacities[idx];
  });
  return { nodeCount: n, capacity, nodeIndex, nodeNames: NODE_NAMES };
}

export function newRound() {
  const edgeCapacities = EDGE_LIST.map(() => randomInt(5, 15));
  const network = buildNetwork(edgeCapacities);

  const sourceIdx = network.nodeIndex['A'];
  const sinkIdx = network.nodeIndex['T'];

  const { result: ekResult, executionTimeMs: ekTime } = timeExecution(() =>
    edmondsKarp(network, sourceIdx, sinkIdx)
  );
  const { result: dinicResult, executionTimeMs: dinicTime } = timeExecution(() =>
    dinic(network, sourceIdx, sinkIdx)
  );

  const correctAnswer = ekResult.maxFlow;
  const choices = makeChoices(correctAnswer);

  const edges = EDGE_LIST.map(([from, to], i) => ({
    from, to, capacity: edgeCapacities[i],
  }));

  const round = createGameRound(
    GAME_TYPE,
    { edges, choices },
    String(correctAnswer)
  );

  saveAlgorithmTiming(round.id, 'Edmonds-Karp', ekTime, String(ekResult.maxFlow), GAME_TYPE);
  saveAlgorithmTiming(round.id, "Dinic's", dinicTime, String(dinicResult.maxFlow), GAME_TYPE);

  return {
    roundId: round.id,
    nodes: NODE_NAMES,
    edges,
    choices,
    timings: [
      { algorithmName: 'Edmonds-Karp', executionTimeMs: ekTime, result: String(ekResult.maxFlow) },
      { algorithmName: "Dinic's", executionTimeMs: dinicTime, result: String(dinicResult.maxFlow) },
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