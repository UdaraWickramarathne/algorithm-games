/**
 * Greedy Assignment Algorithm
 * Heuristic approach: sort all (cost, worker, task) pairs and greedily assign cheapest available.
 * Does NOT guarantee optimal solution - used for comparison with Hungarian algorithm.
 */

import type { AssignmentResult } from './hungarian.js';

export function greedyAssignment(costMatrix: number[][]): AssignmentResult {
  const n = costMatrix.length;
  if (n === 0) return { assignment: [], totalCost: 0 };

  // Collect all (cost, worker, task) triples and sort by cost ascending
  const triples = new Array<[number, number, number]>(n * n);
  let idx = 0;
  for (let w = 0; w < n; w++) {
    for (let t = 0; t < n; t++) {
      triples[idx++] = [costMatrix[w][t], w, t];
    }
  }
  triples.sort((a, b) => a[0] - b[0]);

  const assignedWorkers = new Uint8Array(n);
  const assignedTasks = new Uint8Array(n);
  const assignment = new Array<number>(n).fill(-1);
  let assignedCount = 0;

  for (const [cost, worker, task] of triples) {
    if (assignedWorkers[worker] === 0 && assignedTasks[task] === 0) {
      assignment[worker] = task;
      assignedWorkers[worker] = 1;
      assignedTasks[task] = 1;
      assignedCount++;
      if (assignedCount === n) break;
    }
  }

  const totalCost = assignment.reduce(
    (sum, task, worker) => sum + (task >= 0 ? costMatrix[worker][task] : 0),
    0
  );

  return { assignment, totalCost };
}
