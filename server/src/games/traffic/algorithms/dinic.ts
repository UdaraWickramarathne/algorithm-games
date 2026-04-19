/**
 * Dinic's Algorithm for Maximum Flow
 * Uses level graph (BFS) + blocking flow (DFS). O(V^2 * E)
 */

import type { FlowNetwork, FlowResult } from './edmondsKarp.js';

export function dinic(
  network: FlowNetwork,
  sourceIdx: number,
  sinkIdx: number
): FlowResult {
  const n = network.nodeCount;
  const residual = network.capacity.map((row) => [...row]);
  const flow = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  let maxFlow = 0;

  function bfsLevel(): number[] | null {
    const level = new Array<number>(n).fill(-1);
    level[sourceIdx] = 0;
    const queue = [sourceIdx];
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (level[v] === -1 && residual[u][v] > 0) {
          level[v] = level[u] + 1;
          queue.push(v);
        }
      }
    }
    return level[sinkIdx] === -1 ? null : level;
  }

  function dfsFlow(u: number, pushed: number, level: number[], iter: number[]): number {
    if (u === sinkIdx) return pushed;
    for (; iter[u] < n; iter[u]++) {
      const v = iter[u];
      if (level[v] !== level[u] + 1 || residual[u][v] <= 0) continue;
      const d = dfsFlow(v, Math.min(pushed, residual[u][v]), level, iter);
      if (d > 0) {
        residual[u][v] -= d;
        residual[v][u] += d;
        flow[u][v] += d;
        flow[v][u] -= d;
        return d;
      }
    }
    return 0;
  }

  let level: number[] | null;
  while ((level = bfsLevel()) !== null) {
    const iter = new Array<number>(n).fill(0);
    let f: number;
    while ((f = dfsFlow(sourceIdx, Infinity, level, iter)) > 0) {
      maxFlow += f;
    }
  }

  return { maxFlow, flowMatrix: flow };
}