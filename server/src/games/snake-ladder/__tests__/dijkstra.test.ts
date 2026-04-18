import { describe, it, expect } from 'vitest';
import { dijkstraMinThrows } from '../algorithms/dijkstra.js';
import { bfsMinThrows } from '../algorithms/bfs.js';
import type { BoardGraph } from '../algorithms/bfs.js';

describe('Dijkstra Snake and Ladder', () => {
  it('gives same result as BFS for simple board', () => {
    const board: BoardGraph = {
      snakes: {},
      ladders: {},
      totalCells: 36,
    };
    expect(dijkstraMinThrows(board)).toBe(bfsMinThrows(board));
  });

  it('gives same result as BFS with snakes and ladders', () => {
    const board: BoardGraph = {
      snakes: { 20: 5, 30: 10 },
      ladders: { 3: 15, 8: 25 },
      totalCells: 36,
    };
    expect(dijkstraMinThrows(board)).toBe(bfsMinThrows(board));
  });

  it('follows ladder shortcut', () => {
    const board: BoardGraph = {
      snakes: {},
      ladders: { 2: 15 },
      totalCells: 16,
    };
    expect(dijkstraMinThrows(board)).toBe(2);
  });
});
