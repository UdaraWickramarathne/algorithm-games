import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performance } from 'perf_hooks';
import { hashSolution, isValidQueenPlacement } from './algorithms/sequential.js';
import { solveQueensThreaded } from './algorithms/threaded.js';
import { getDb } from '../../db/database.js';
import {
  findSolutionByHash,
  insertSolution,
  markRecognized,
  resetAllRecognized,
  countRecognized,
  countTotal,
} from './queens.model.js';
import { findOrCreatePlayer } from '../../shared/models/player.model.js';
import { createError } from '../../shared/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const N = 16;
const MAX_SAMPLES = 5000; // Store up to 5000 sample solutions for player recognition
const MAX_TIME_MS = 0;   // 0 = unlimited (find all solutions)

function solveQueensSequentialInWorker(
  n: number,
  maxSamples: number,
  maxTimeMs: number = MAX_TIME_MS,
): Promise<{ count: number; sampleSolutions: number[][] }> {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, 'workers/queensSolverWorker.ts');
    const allColumns = Array.from({ length: n }, (_, i) => i);
    const worker = new Worker(workerPath, {
      execArgv: ['--import', 'tsx'],
      workerData: { n, firstRowCols: allColumns, maxSamples, maxTimeMs },
    });
    worker.on('message', (msg: { count: number; sampleSolutions: number[][] }) => resolve(msg));
    worker.on('error', reject);
  });
}

interface SolveSession {
  status: 'running' | 'done' | 'error';
  sequentialCount?: number;
  threadedCount?: number;
  sequentialTimeMs?: number;
  threadedTimeMs?: number;
  sampleSolutions?: number[][];
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
          timed(() => solveQueensSequentialInWorker(N, MAX_SAMPLES, MAX_TIME_MS)),
          timed(() => solveQueensThreaded(N, MAX_SAMPLES, MAX_TIME_MS)),
        ]);

      // Store sample solutions in DB
      const db = getDb();
      const insertStmt = db.prepare(
        'INSERT OR IGNORE INTO queens_solutions (solution_hash, solution_json, is_recognized) VALUES (?, ?, 0)'
      );
      const insertMany = db.transaction((solutions: number[][]) => {
        for (const sol of solutions) {
          const hash = hashSolution(sol);
          insertStmt.run(hash, JSON.stringify(sol));
        }
      });
      insertMany(seqResult.sampleSolutions);

      currentSession = {
        status: 'done',
        sequentialCount: seqResult.count,
        threadedCount: thrResult.count,
        sequentialTimeMs: seqTime,
        threadedTimeMs: thrTime,
        sampleSolutions: seqResult.sampleSolutions,
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
