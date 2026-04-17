import { describe, it, expect } from 'vitest';
import { greedyAssignment } from '../algorithms/greedyAssignment.js';

describe('Greedy Assignment Algorithm', () => {
  it('assigns each worker exactly once', () => {
    const cost = [
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ];
    const result = greedyAssignment(cost);
    const usedTasks = new Set(result.assignment);
    expect(usedTasks.size).toBe(3);
  });

  it('produces valid assignment for 4x4 matrix', () => {
    const cost = [
      [9, 2, 7, 8],
      [6, 4, 3, 7],
      [5, 8, 1, 8],
      [7, 6, 9, 4],
    ];
    const result = greedyAssignment(cost);
    expect(result.assignment.length).toBe(4);
    const usedTasks = new Set(result.assignment);
    expect(usedTasks.size).toBe(4);
  });

  it('total cost is consistent with assignment', () => {
    const cost = [
      [10, 20, 30],
      [40, 50, 60],
      [70, 80, 90],
    ];
    const result = greedyAssignment(cost);
    const manual = result.assignment.reduce(
      (sum, task, worker) => sum + cost[worker][task],
      0
    );
    expect(result.totalCost).toBe(manual);
  });
});
