import { describe, it, expect } from 'vitest';
import { edmondsKarp, type FlowNetwork } from '../algorithms/edmondsKarp.js';

function makeNetwork(nodeNames: string[], edges: [string, string, number][]): FlowNetwork {
  const n = nodeNames.length;
  const nodeIndex: Record<string, number> = {};
  nodeNames.forEach((name, i) => { nodeIndex[name] = i; });
  const capacity = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (const [from, to, cap] of edges) {
    capacity[nodeIndex[from]][nodeIndex[to]] = cap;
  }
  return { nodeCount: n, capacity, nodeIndex, nodeNames };
}

describe('Edmonds-Karp Max Flow', () => {
  it('simple 4-node network', () => {
    // S->A=10, S->B=10, A->T=10, B->T=10
    const net = makeNetwork(['S','A','B','T'], [
      ['S','A',10], ['S','B',10], ['A','T',10], ['B','T',10]
    ]);
    const result = edmondsKarp(net, 0, 3);
    expect(result.maxFlow).toBe(20);
  });

  it('bottleneck limits flow', () => {
    // S->A=5, A->B=2, B->T=5
    const net = makeNetwork(['S','A','B','T'], [
      ['S','A',5], ['A','B',2], ['B','T',5]
    ]);
    const result = edmondsKarp(net, 0, 3);
    expect(result.maxFlow).toBe(2);
  });

  it('classic CLRS example', () => {
    // Well-known textbook network with max flow = 23
    const net = makeNetwork(['S','1','2','3','4','T'], [
      ['S','1',16], ['S','2',13],
      ['1','2',10], ['2','1',4],
      ['1','3',12], ['3','2',9],
      ['2','4',14], ['4','3',7],
      ['3','T',20], ['4','T',4]
    ]);
    const result = edmondsKarp(net, 0, 5);
    expect(result.maxFlow).toBe(23);
  });
});
