/**
 * Hungarian Algorithm (Jonker-Volgenant O(n^3) variant)
 * Solves the assignment problem: minimize total cost of assigning n tasks to n workers
 */

export interface AssignmentResult {
  assignment: number[];  // assignment[worker] = task
  totalCost: number;
}

export function hungarian(costMatrix: number[][]): AssignmentResult {
  const n = costMatrix.length;
  if (n === 0) return { assignment: [], totalCost: 0 };

  const INF = Math.floor(Number.MAX_SAFE_INTEGER / 2);

  // u[i] = potential for row i (workers 1..n), v[j] = potential for column j (tasks 1..n)
  const u = new Float64Array(n + 1);
  const v = new Float64Array(n + 1);
  // p[j] = worker assigned to task j (1-indexed)
  const p = new Int32Array(n + 1);
  // way[j] = previous task in augmenting path
  const way = new Int32Array(n + 1);
  
  const minDist = new Float64Array(n + 1);
  const used = new Uint8Array(n + 1);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    minDist.fill(INF);
    used.fill(0);

    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = INF;
      let j1 = -1;

      for (let j = 1; j <= n; j++) {
        if (used[j] === 0) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minDist[j]) {
            minDist[j] = cur;
            way[j] = j0;
          }
          if (minDist[j] < delta) {
            delta = minDist[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j] === 1) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minDist[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  // Build assignment: worker i -> task assignment[i]
  const assignment = new Array<number>(n).fill(0);
  for (let j = 1; j <= n; j++) {
    if (p[j] !== 0) {
      assignment[p[j] - 1] = j - 1;
    }
  }

  const totalCost = assignment.reduce(
    (sum, task, worker) => sum + costMatrix[worker][task],
    0
  );

  return { assignment, totalCost };
}
