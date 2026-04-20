const ACCENT = '#a855f7';

interface Props {
  n: number;
  startRow: number;
  startCol: number;
  moves: [number, number][];
  solution?: number[][];
  onCellClick?: (r: number, c: number) => void;
  interactive?: boolean;
}

const KNIGHT_MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

export default function ChessBoard({ n, startRow, startCol, moves, solution, onCellClick, interactive }: Props) {
  const cellSize = Math.min(560 / n, n <= 8 ? 60 : 32);
  const boardSize = n * cellSize;

  // Build move map: [r,c] -> moveNumber
  const moveMap = new Map<string, number>();
  moves.forEach(([r, c], i) => moveMap.set(`${r},${c}`, i + 1));

  // If showing solution
  const solMap = new Map<string, number>();
  if (solution) {
    solution.forEach((row, r) => row.forEach((move, c) => { if (move > 0) solMap.set(`${r},${c}`, move); }));
  }

  const currentPos = moves.length > 0 ? moves[moves.length - 1] : [startRow, startCol];
  const [curR, curC] = currentPos;

  // Valid next moves from current position
  const validNextSet = new Set<string>();
  if (interactive && !solution) {
    KNIGHT_MOVES.forEach(([dr, dc]) => {
      const nr = curR + dr, nc = curC + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !moveMap.has(`${nr},${nc}`)) {
        validNextSet.add(`${nr},${nc}`);
      }
    });
  }

  const displayMap = solution ? solMap : moveMap;
  const fontSize = cellSize < 28 ? 8 : cellSize < 40 ? 10 : 13;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cellSize}px)`, width: boardSize, position: 'relative', border: '1px solid #1e2236', borderRadius: '4px', overflow: 'hidden' }}>
        {Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => {
            const key = `${r},${c}`;
            const isLight = (r + c) % 2 === 0;
            const moveNum = displayMap.get(key);
            const isStart = r === startRow && c === startCol;
            const isCurrent = !solution && r === curR && c === curC && moves.length > 0;
            const isValid = validNextSet.has(key);
            const bg = isCurrent ? ACCENT + '40'
              : isStart && moves.length === 0 ? ACCENT + '25'
              : moveNum ? (solution ? '#a855f720' : ACCENT + '15')
              : isValid ? '#10b98120'
              : isLight ? '#141720' : '#0e1018';
            return (
              <div
                key={key}
                data-cell={`${r}-${c}`}
                onClick={() => interactive && onCellClick?.(r, c)}
                style={{
                  width: cellSize, height: cellSize,
                  background: bg,
                  border: `0.5px solid ${isCurrent ? ACCENT + '80' : '#1e2236'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: interactive && (isValid || (moves.length === 0 && isStart)) ? 'pointer' : 'default',
                  position: 'relative', transition: 'background 0.15s',
                  flexShrink: 0,
                }}
              >
                {isCurrent && <span style={{ fontSize: cellSize > 36 ? '20px' : '12px' }}>♞</span>}
                {!isCurrent && moveNum && (
                  <span style={{ fontSize, fontFamily: 'var(--font-mono)', color: solution ? '#a855f7' : ACCENT, fontWeight: 600 }}>{moveNum}</span>
                )}
                {!moveNum && isStart && moves.length === 0 && (
                  <span style={{ fontSize: cellSize > 36 ? '20px' : '12px', color: ACCENT }}>♞</span>
                )}
                {isValid && !moveNum && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b98160' }} />
                )}
              </div>
            );
          })
        )}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>
          ♞ = {solution ? 'algorithm solution' : `current (move ${moves.length})`}
        </div>
        {interactive && !solution && <div style={{ fontSize: '11px', color: '#10b981', fontFamily: 'var(--font-mono)' }}>● = valid next moves</div>}
        {solution && <div style={{ fontSize: '11px', color: ACCENT, fontFamily: 'var(--font-mono)' }}>Numbers = move sequence</div>}
      </div>
    </div>
  );
}
