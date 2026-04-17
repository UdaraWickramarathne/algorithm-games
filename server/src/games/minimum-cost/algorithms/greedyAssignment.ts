/**
 * Greedy Assignment Algorithm
 * Heuristic approach: sort all (cost, worker, task) pairs and greedily assign cheapest available.
 * Does NOT guarantee optimal solution - used for comparison with Hungarian algorithm.
 */

import type { AssignmentResult } from './hungarian.js';

export function greedyAssignment(costMatrix: number[][]): AssignmentResult {
  const n = costMatrix.length;

  // Collect all (cost, worker, task) triples and sort by cost ascending
  const triples: [number, number, number][] = [];
  for (let w = 0; w < n; w++) {
    for (let t = 0; t < n; t++) {
      triples.push([costMatrix[w][t], w, t]);
    }
  }
  triples.sort((a, b) => a[0] - b[0]);

  const assignedWorkers = new Set<number>();
  const assignedTasks = new Set<number>();
  const assignment = new Array<number>(n).fill(-1);

  for (const [, worker, task] of triples) {
    if (!assignedWorkers.has(worker) && !assignedTasks.has(task)) {
      assignment[worker] = task;
      assignedWorkers.add(worker);
      assignedTasks.add(task);
      if (assignedWorkers.size === n) break;
    }
  }

  const totalCost = assignment.reduce(
    (sum, task, worker) => sum + (task >= 0 ? costMatrix[worker][task] : 0),
    0
  );

  return { assignment, totalCost };
}
