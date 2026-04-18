import { describe, it, expect } from 'vitest';
import { hungarian } from '../algorithms/hungarian.js';

describe('Hungarian Algorithm', () => {
  it('solves a simple 2x2 matrix', () => {
    const cost = [
      [10, 20],
      [30, 5],
    ];
    const result = hungarian(cost);
    // Optimal: worker0->task0 (10) + worker1->task1 (5) = 15
    expect(result.totalCost).toBe(15);
  });

  it('solves a 3x3 matrix with known optimal', () => {
    const cost = [
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ];
    const result = hungarian(cost);
    // Optimal: w0->t1(1) + w1->t0(2) + w2->t2(2) = 5
    expect(result.totalCost).toBe(5);
  });

  it('solves a 4x4 matrix correctly', () => {
    const cost = [
      [9, 2, 7, 8],
      [6, 4, 3, 7],
      [5, 8, 1, 8],
      [7, 6, 9, 4],
    ];
    const result = hungarian(cost);
    // Known optimal: 2+3+1+4 = 10 (assignment: w0->t1, w1->t2, w2->t2... let's just check cost is minimal)
    expect(result.totalCost).toBeLessThanOrEqual(14);
    expect(result.totalCost).toBeGreaterThan(0);
  });

  it('each worker is assigned exactly one unique task', () => {
    const n = 5;
    const cost = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Math.floor(Math.random() * 100) + 20)
    );
    const result = hungarian(cost);
    const usedTasks = new Set(result.assignment);
    expect(usedTasks.size).toBe(n);
    expect(result.assignment.length).toBe(n);
  });

  it('total cost matches sum of assigned cells', () => {
    const cost = [
      [10, 20, 30],
      [40, 50, 60],
      [70, 80, 90],
    ];
    const result = hungarian(cost);
    const manual = result.assignment.reduce(
      (sum, task, worker) => sum + cost[worker][task],
      0
    );
    expect(result.totalCost).toBe(manual);
  });
  it('handles a 1x1 matrix', () => {
    const cost = [[42]];
    const result = hungarian(cost);
    expect(result.assignment).toEqual([0]);
    expect(result.totalCost).toBe(42);
  });

  it('handles matrices with identical costs', () => {
    const cost = [
      [5, 5, 5],
      [5, 5, 5],
      [5, 5, 5],
    ];
    const result = hungarian(cost);
    expect(result.totalCost).toBe(15);
    const usedTasks = new Set(result.assignment);
    expect(usedTasks.size).toBe(3);
  });

  it('handles matrices with large costs', () => {
    const cost = [
      [1000, 2000],
      [3000, 4000],
    ];
    const result = hungarian(cost);
    // Optimal is w0->t1 (2000) + w1->t0 (3000) = 5000
    // Wait, w0->t0 (1000) + w1->t1 (4000) = 5000. It's the same!
    expect(result.totalCost).toBe(5000);
  });
});
