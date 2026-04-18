/**
 * Threaded N-Queens Solver using Node.js worker_threads
 * Divides first-row columns across CPU cores.
 * Time-bounded: workers stop after maxTimeMs to keep response times reasonable.
 */

import { Worker } from 'worker_threads';
import { cpus } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ThreadedSolveResult {
  count: number;
  sampleSolutions: number[][];
  workerCount: number;
}

export function solveQueensThreaded(
  n: number,
  maxSamples: number = 100,
  maxTimeMs: number = 5000,
): Promise<ThreadedSolveResult> {
  return new Promise((resolve, reject) => {
    const workerCount = Math.min(n, cpus().length);
    const workerPath = join(__dirname, '../workers/queensSolverWorker.ts');

    const columns = Array.from({ length: n }, (_, i) => i);
    const chunks: number[][] = Array.from({ length: workerCount }, () => []);
    columns.forEach((col, i) => chunks[i % workerCount].push(col));

    let completed = 0;
    let totalCount = 0;
    const allSamples: number[][] = [];

    for (let w = 0; w < workerCount; w++) {
      const worker = new Worker(workerPath, {
        execArgv: ['--import', 'tsx'],
        workerData: {
          n,
          firstRowCols: chunks[w],
          maxSamples: Math.ceil(maxSamples / workerCount),
          maxTimeMs,
        },
      });

      worker.on('message', (msg: { count: number; sampleSolutions: number[][] }) => {
        totalCount += msg.count;
        allSamples.push(...msg.sampleSolutions);
        completed++;
        if (completed === workerCount) {
          resolve({
            count: totalCount,
            sampleSolutions: allSamples.slice(0, maxSamples),
            workerCount,
          });
        }
      });

      worker.on('error', reject);
    }
  });
}
