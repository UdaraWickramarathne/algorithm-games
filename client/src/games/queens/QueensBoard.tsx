const ACCENT = '#fb7185';
const N = 16;

interface Props {
  queens: number[]; // queens[row] = col (-1 = no queen)
  onToggle: (row: number, col: number) => void;
  disabled?: boolean;
}

function hasConflict(queens: number[], row: number, col: number): boolean {
  for (let r = 0; r < N; r++) {
    if (r === row) continue;
    const c = queens[r];
    if (c === -1) continue;
    if (c === col) return true;
    if (Math.abs(r - row) === Math.abs(c - col)) return true;
  }
  return false;
}

export default function QueensBoard({ queens, onToggle, disabled }: Props) {
  const cellSize = Math.min(480 / N, 28);
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${N}, ${cellSize}px)`, border: '1px solid #1e2236', borderRadius: '4px', overflow: 'hidden' }}>
        {Array.from({ length: N }, (_, r) =>
          Array.from({ length: N }, (_, c) => {
            const isLight = (r + c) % 2 === 0;
            const hasQueen = queens[r] === c;
            const conflict = hasQueen && hasConflict(queens, r, c);
            const bg = conflict ? '#f8717125' : hasQueen ? `${ACCENT}20` : isLight ? '#141720' : '#0e1018';
            const border = conflict ? '#f8717160' : hasQueen ? `${ACCENT}60` : '#1e2236';
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => !disabled && onToggle(r, c)}
                style={{ width: cellSize, height: cellSize, background: bg, border: `0.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', transition: 'background 0.1s', fontSize: cellSize > 20 ? 14 : 10 }}
                title={hasQueen ? (conflict ? 'Conflict!' : 'Queen') : `Place queen at row ${r + 1}, col ${c + 1}`}
              >
                {hasQueen && <span style={{ color: conflict ? '#f87171' : ACCENT, lineHeight: 1 }}>{conflict ? '⚡' : '♛'}</span>}
              </div>
            );
          })
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#5a6480', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
        Click a cell to place/remove a queen. ⚡ = conflict. One queen per row.
      </div>
    </div>
  );
}
