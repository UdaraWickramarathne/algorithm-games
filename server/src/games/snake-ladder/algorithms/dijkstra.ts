/**
 * Dijkstra's Algorithm for Snake and Ladder minimum dice throws
 * Uses a min-priority queue. All edges have weight 1 (one dice throw).
 * Functionally equivalent to BFS on this graph, but demonstrates Dijkstra's approach.
 */

import type { BoardGraph } from './bfs.js';

class MinHeap {
  private heap: [number, number][] = []; // [dist, cell]

  push(dist: number, cell: number): void {
    this.heap.push([dist, cell]);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): [number, number] | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  get size(): number { return this.heap.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
      if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

export function dijkstraMinThrows(board: BoardGraph): number {
  const { snakes, ladders, totalCells } = board;
  const INF = Number.MAX_SAFE_INTEGER;
  const dist = new Array<number>(totalCells + 1).fill(INF);
  dist[1] = 0;

  const pq = new MinHeap();
  pq.push(0, 1);

  while (pq.size > 0) {
    const [d, cell] = pq.pop()!;
    if (d > dist[cell]) continue;
    if (cell === totalCells) return d;

    for (let dice = 1; dice <= 6; dice++) {
      let next = cell + dice;
      if (next > totalCells) continue;

      if (snakes[next] !== undefined) next = snakes[next];
      else if (ladders[next] !== undefined) next = ladders[next];

      const newDist = dist[cell] + 1;
      if (newDist < dist[next]) {
        dist[next] = newDist;
        pq.push(newDist, next);
      }
    }
  }

  return dist[totalCells] === INF ? -1 : dist[totalCells];
}
