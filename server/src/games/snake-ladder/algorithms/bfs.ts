/**
 * BFS Algorithm for Snake and Ladder minimum dice throws
 * Models the board as a graph and uses BFS to find shortest path from cell 1 to cell N^2
 */

export interface BoardGraph {
  snakes: Record<number, number>;  // head -> tail
  ladders: Record<number, number>; // bottom -> top
  totalCells: number;
}

export function bfsMinThrows(board: BoardGraph): number {
  const { snakes, ladders, totalCells } = board;
  const visited = new Set<number>();
  const queue: [number, number][] = [[1, 0]]; // [cell, throws]
  visited.add(1);

  while (queue.length > 0) {
    const [cell, throws] = queue.shift()!;

    for (let dice = 1; dice <= 6; dice++) {
      let next = cell + dice;
      if (next > totalCells) continue;

      // Apply snake or ladder
      if (snakes[next] !== undefined) next = snakes[next];
      else if (ladders[next] !== undefined) next = ladders[next];

      if (next === totalCells) return throws + 1;

      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, throws + 1]);
      }
    }
  }

  return -1; // unreachable
}
