import { describe, it, expect } from 'vitest';
import { solveQueensSequential, isValidQueenPlacement, hashSolution } from '../algorithms/sequential.js';

describe('Sequential Queens Solver', () => {
  it('finds 92 solutions for 8-Queens', () => {
    const result = solveQueensSequential(8, 92);
    expect(result.count).toBe(92);
  }, 15000);

  it('finds 2 solutions for 4-Queens', () => {
    const result = solveQueensSequential(4, 10);
    expect(result.count).toBe(2);
  });

  it('finds 10 solutions for 6-Queens', () => {
    const result = solveQueensSequential(6, 20);
    expect(result.count).toBe(4);
  });

  it('every sample solution is valid', () => {
    const result = solveQueensSequential(8, 10);
    for (const sol of result.sampleSolutions) {
      expect(isValidQueenPlacement(sol, 8)).toBe(true);
    }
  });
});

describe('isValidQueenPlacement', () => {
  it('accepts valid 4-queens placement', () => {
    expect(isValidQueenPlacement([1, 3, 0, 2], 4)).toBe(true);
  });

  it('rejects queens on same column', () => {
    expect(isValidQueenPlacement([0, 0, 2, 3], 4)).toBe(false);
  });

  it('rejects queens on same diagonal', () => {
    expect(isValidQueenPlacement([0, 1, 2, 3], 4)).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidQueenPlacement([0, 1], 4)).toBe(false);
  });
});

describe('hashSolution', () => {
  it('produces consistent hash', () => {
    expect(hashSolution([1, 3, 0, 2])).toBe('1,3,0,2');
  });
});
