export interface FlowNetwork {
  nodeCount: number;
  capacity: number[][];
  nodeIndex: Record<string, number>;
  nodeNames: string[];
}

export interface FlowResult {
  maxFlow: number;
  flowMatrix: number[][];
}

export function edmondsKarp(
  network: FlowNetwork,
  sourceIdx: number,
  sinkIdx: number
): FlowResult {
  const n = network.nodeCount;
  const residual = network.capacity.map((row) => [...row]);
  const flow = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  let maxFlow = 0;

  while (true) {
    // BFS to find augmenting path
    const parent = new Array<number>(n).fill(-1);
    parent[sourceIdx] = sourceIdx;
    const queue: number[] = [sourceIdx];

    while (queue.length > 0 && parent[sinkIdx] === -1) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && residual[u][v] > 0) {
          parent[v] = u;
          queue.push(v);
        }
      }
    }




  }

  return { maxFlow, flowMatrix: flow };
}
