import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performance } from 'perf_hooks';
import { hashSolution, isValidQueenPlacement } from './algorithms/sequential.js';
import { solveQueensThreaded } from './algorithms/threaded.js';
import {
  findSolutionByHash,
  insertSolution,
  markRecognized,
  resetAllRecognized,
  countRecognized,
  countTotal,
  getRandomSolution,
} from './queens.model.js';
import { findOrCreatePlayer } from '../../shared/models/player.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const N = 16;
const MAX_TIME_MS = 0;   // 0 = unlimited (find all solutions)

function solveQueensSequentialInWorker(
  n: number,
  maxTimeMs: number = MAX_TIME_MS,
): Promise<{ count: number }> {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, 'workers/queensSolverWorker.bootstrap.mjs');
    const allColumns = Array.from({ length: n }, (_, i) => i);
    const worker = new Worker(workerPath, {
      workerData: { n, firstRowCols: allColumns, maxSamples: 0, maxTimeMs },
    });
    worker.on('message', (msg: { count: number }) => resolve(msg));
    worker.on('error', reject);
  });
}

interface SolveSession {
  status: 'running' | 'done' | 'error';
  sequentialCount?: number;
  threadedCount?: number;
  sequentialTimeMs?: number;
  threadedTimeMs?: number;
  workerCount?: number;
}

let currentSession: SolveSession = { status: 'done' };

export async function startSolving(): Promise<{ sessionId: string; status: string }> {
  if (currentSession.status === 'running') {
    return { sessionId: 'current', status: 'running' };
  }

  currentSession = { status: 'running' };

  (async () => {
    try {
      const timed = async <T>(fn: () => Promise<T>): Promise<{ result: T; executionTimeMs: number }> => {
        const start = performance.now();
        const result = await fn();
        return { result, executionTimeMs: performance.now() - start };
      };

      // Run sequential (1 worker, all columns) and threaded (N workers) in parallel
      const [{ result: seqResult, executionTimeMs: seqTime }, { result: thrResult, executionTimeMs: thrTime }] =
        await Promise.all([
          timed(() => solveQueensSequentialInWorker(N, MAX_TIME_MS)),
          timed(() => solveQueensThreaded(N, 0, MAX_TIME_MS)),
        ]);

      currentSession = {
        status: 'done',
        sequentialCount: seqResult.count,
        threadedCount: thrResult.count,
        sequentialTimeMs: seqTime,
        threadedTimeMs: thrTime,
        workerCount: thrResult.workerCount,
      };
    } catch (err) {
      console.error('[Queens] Solve error:', err);
      currentSession = { status: 'error' };
    }
  })();

  return { sessionId: 'current', status: 'running' };
}

export function getSolvingStatus(): SolveSession {
  return currentSession;
}

export function submitSolution(playerName: string, queenPositions: number[]) {
  if (!isValidQueenPlacement(queenPositions, N)) {
    return {
      isValid: false,
      isNew: false,
      isRecognized: false,
      message: 'Invalid queen placement - queens threaten each other or positions are out of range.',
    };
  }

  const hash = hashSolution(queenPositions);
  const existing = findSolutionByHash(hash);

  if (existing) {
    if (existing.is_recognized === 1) {
      return {
        isValid: true,
        isNew: false,
        isRecognized: true,
        message: 'This solution has already been recognized by another player. Please try a different solution.',
      };
    }
    markRecognized(hash);
    const recognized = countRecognized();
    const total = countTotal();
    if (recognized >= total && total > 0) {
      resetAllRecognized();
    }
    return {
      isValid: true,
      isNew: false,
      isRecognized: false,
      message: 'Correct! This is a valid (but already found) solution. Marked as recognized.',
    };
  }

  const player = findOrCreatePlayer(playerName);
  insertSolution(hash, JSON.stringify(queenPositions), player.id);

  const recognized = countRecognized();
  const total = countTotal();
  if (recognized >= total && total > 0) {
    resetAllRecognized();
  }

  return {
    isValid: true,
    isNew: true,
    isRecognized: false,
    message: `Correct! New solution recorded for player ${playerName}.`,
  };
}

export function getSampleSolution(excludeHash?: string): { solution: number[]; hash: string } | null {
  const sol = getRandomSolution(excludeHash);
  if (!sol) return null;
  return { solution: JSON.parse(sol.solution_json) as number[], hash: sol.solution_hash };
}

export function getStats() {
  const recognized = countRecognized();
  const total = countTotal();
  return {
    ...currentSession,
    recognizedCount: recognized,
    totalStored: total,
    allRecognized: total > 0 && recognized >= total,
  };
}
