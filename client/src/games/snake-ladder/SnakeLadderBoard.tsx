interface Props {
  boardSize: number;
  snakes: Record<string, number>;
  ladders: Record<string, number>;
}

export default function SnakeLadderBoard({ boardSize, snakes, ladders }: Props) {
  const total = boardSize * boardSize;
  const cellSize = Math.min(520 / boardSize, 60);
  const boardWidth = boardSize * cellSize;
  const boardHeight = boardSize * cellSize;

  // Cell number to (col, row) in visual layout
  // Row 0 = top, alternating direction (boustrophedon)
  function cellToPos(cell: number): [number, number] {
    const idx = cell - 1; // 0-indexed
    const row = boardSize - 1 - Math.floor(idx / boardSize); // visual row (0=top)
    const colInRow = idx % boardSize;
    const rowFromBottom = Math.floor(idx / boardSize);
    const col = rowFromBottom % 2 === 0 ? colInRow : boardSize - 1 - colInRow;
    return [col, row];
  }

  function cellCenter(cell: number): [number, number] {
    const [col, row] = cellToPos(cell);
    return [col * cellSize + cellSize / 2, row * cellSize + cellSize / 2];
  }

  const snakeEntries = Object.entries(snakes).map(([h, t]) => [Number(h), Number(t)] as [number, number]);
  const ladderEntries = Object.entries(ladders).map(([b, t]) => [Number(b), Number(t)] as [number, number]);

  const cells = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ position: 'relative', width: boardWidth, height: boardHeight, flexShrink: 0 }}>
        {/* Grid cells */}
        {cells.map((cell) => {
          const [col, row] = cellToPos(cell);
          const isStart = cell === 1;
          const isEnd = cell === total;
          const isSnakeHead = snakes[cell] !== undefined;
          const isLadderBottom = ladders[cell] !== undefined;
          const rowFromBottom = Math.floor((cell - 1) / boardSize);
          const shade = rowFromBottom % 2 === 0
            ? (col % 2 === 0 ? '#141720' : '#0e1018')
            : (col % 2 === 0 ? '#0e1018' : '#141720');

          return (
            <div
              key={cell}
              style={{
                position: 'absolute',
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
                background: isStart ? '#10b98120' : isEnd ? '#f59e0b20' : shade,
                border: `1px solid #1e2236`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.max(8, cellSize * 0.2),
                color: isStart ? '#10b981' : isEnd ? '#f59e0b' : '#3a4060',
                fontFamily: 'var(--font-mono)',
                fontWeight: isStart || isEnd ? 700 : 400,
              }}
            >
              {cell}
              {isSnakeHead && <span style={{ position: 'absolute', top: 1, right: 2, fontSize: '7px' }}>🐍</span>}
              {isLadderBottom && <span style={{ position: 'absolute', top: 1, right: 2, fontSize: '7px' }}>🪜</span>}
            </div>
          );
        })}

        {/* SVG overlay for snakes and ladders */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={boardWidth} height={boardHeight}>
          {/* Ladders */}
          {ladderEntries.map(([bottom, top]) => {
            const [x1, y1] = cellCenter(bottom);
            const [x2, y2] = cellCenter(top);
            return (
              <g key={`ladder-${bottom}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth="2.5" strokeDasharray="5,3" opacity="0.8" />
                <circle cx={x1} cy={y1} r="3" fill="#10b981" />
                <circle cx={x2} cy={y2} r="3" fill="#10b981" />
              </g>
            );
          })}
          {/* Snakes */}
          {snakeEntries.map(([head, tail]) => {
            const [x1, y1] = cellCenter(head);
            const [x2, y2] = cellCenter(tail);
            const mx = (x1 + x2) / 2 + (y1 - y2) * 0.3;
            const my = (y1 + y2) / 2 + (x2 - x1) * 0.3;
            return (
              <g key={`snake-${head}`}>
                <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke="#f87171" strokeWidth="2.5" opacity="0.8" />
                <circle cx={x1} cy={y1} r="4" fill="#f87171" />
                <circle cx={x2} cy={y2} r="3" fill="#f87171" opacity="0.6" />
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '3px', background: '#10b981' }} />
          <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'var(--font-mono)' }}>Ladders ({ladderEntries.length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '3px', background: '#f87171' }} />
          <span style={{ fontSize: '11px', color: '#f87171', fontFamily: 'var(--font-mono)' }}>Snakes ({snakeEntries.length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#10b98120', border: '1px solid #10b981' }} />
          <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'var(--font-mono)' }}>Start (1)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f59e0b20', border: '1px solid #f59e0b' }} />
          <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>End ({total})</span>
        </div>
      </div>
    </div>
  );
}
