/**
 * Sequential N-Queens Solver
 * Single-threaded bitmask backtracking — fast enough for n=16.
 * Uses bitwise operations: cols, diag1 (NW-SE), diag2 (NE-SW).
 */

export interface QueensSolveResult {
  count: number;
  sampleSolutions: number[][];
}

export function solveQueensSequential(n: number, maxSamples: number = 100): QueensSolveResult {
  let count = 0;
  const sampleSolutions: number[][] = [];
  const queens = new Array<number>(n).fill(-1);
  const full = (1 << n) - 1;

  function backtrack(row: number, cols: number, diag1: number, diag2: number): void {
    if (cols === full) {
      count++;
      if (sampleSolutions.length < maxSamples) {
        sampleSolutions.push([...queens]);
      }
      return;
    }
    let available = full & ~(cols | diag1 | diag2);
    while (available !== 0) {
      const bit = available & -available;
      available ^= bit;
      const col = Math.log2(bit) | 0;
      queens[row] = col;
      backtrack(row + 1, cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1);
    }
  }

  backtrack(0, 0, 0, 0);
  return { count, sampleSolutions };
}

export function hashSolution(solution: number[]): string {
  return solution.join(',');
}

export function isValidQueenPlacement(queens: number[], n: number): boolean {
  if (queens.length !== n) return false;
  for (let r = 0; r < n; r++) {
    const c = queens[r];
    if (c < 0 || c >= n) return false;
    for (let r2 = r + 1; r2 < n; r2++) {
      const c2 = queens[r2];
      if (c === c2) return false;
      if (Math.abs(r - r2) === Math.abs(c - c2)) return false;
    }
  }
  return true;
}
