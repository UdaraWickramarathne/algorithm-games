import { describe, it, expect } from 'vitest';
import { bfsMinThrows } from '../algorithms/bfs.js';
import type { BoardGraph } from '../algorithms/bfs.js';

describe('BFS Snake and Ladder', () => {
  it('returns 1 for board where cell 1+dice lands on last cell', () => {
    const board: BoardGraph = {
      snakes: {},
      ladders: {},
      totalCells: 6,
    };
    // From cell 1, dice=5 → cell 6 = last cell
    expect(bfsMinThrows(board)).toBe(1);
  });

  it('follows ladder shortcut', () => {
    // 4x4 board (16 cells), ladder from 2->15
    const board: BoardGraph = {
      snakes: {},
      ladders: { 2: 15 },
      totalCells: 16,
    };
    // cell 1 -> dice=1 -> cell 2 -> ladder to 15 -> dice=1 -> 16 = 2 throws
    expect(bfsMinThrows(board)).toBe(2);
  });

  it('avoids snake head', () => {
    const board: BoardGraph = {
      snakes: { 15: 2 },
      ladders: {},
      totalCells: 16,
    };
    // Should still find a path avoiding the snake
    const result = bfsMinThrows(board);
    expect(result).toBeGreaterThan(0);
  });

  it('returns correct minimum for simple 6x6 board no snakes no ladders', () => {
    const board: BoardGraph = {
      snakes: {},
      ladders: {},
      totalCells: 36,
    };
    // Minimum throws = ceil(35/6) = 6
    expect(bfsMinThrows(board)).toBe(6);
  });
});
