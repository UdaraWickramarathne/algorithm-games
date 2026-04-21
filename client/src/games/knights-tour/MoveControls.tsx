const ACCENT = '#a855f7';
interface Props { moveCount: number; totalCells: number; onUndo: () => void; onClear: () => void; onSubmit: () => void; onReveal: () => void; disabled?: boolean; showSolution?: boolean; }
export default function MoveControls({ moveCount, totalCells, onUndo, onClear, onSubmit, onReveal, disabled, showSolution }: Props) {
  const pct = (moveCount / totalCells) * 100;
  return (
    <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
      <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#5a6480', marginBottom: '12px', textTransform: 'uppercase' }}>Move Controls</div>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          <span>Progress</span><span style={{ color: ACCENT }}>{moveCount} / {totalCells}</span>
        </div>
        <div style={{ height: '6px', background: '#1e2236', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : ACCENT, borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <button onClick={onUndo} disabled={moveCount === 0 || disabled || showSolution} style={{ padding: '10px', background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', color: moveCount > 0 && !disabled && !showSolution ? '#c8d0e8' : '#3a4060', cursor: moveCount > 0 && !disabled && !showSolution ? 'pointer' : 'default', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>↩ Undo Last Move</button>
        <button onClick={onClear} disabled={moveCount === 0 || disabled || showSolution} style={{ padding: '10px', background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', color: moveCount > 0 && !disabled && !showSolution ? '#f87171' : '#3a4060', cursor: moveCount > 0 && !disabled && !showSolution ? 'pointer' : 'default', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>✕ Clear All</button>
        <button onClick={onSubmit} disabled={moveCount !== totalCells || disabled || showSolution} style={{ padding: '12px', background: moveCount === totalCells && !disabled && !showSolution ? ACCENT : '#1e2236', color: moveCount === totalCells && !disabled && !showSolution ? '#fff' : '#3a4060', border: 'none', borderRadius: '8px', cursor: moveCount === totalCells && !disabled && !showSolution ? 'pointer' : 'default', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}>Submit Tour</button>
        <button onClick={onReveal} disabled={disabled} style={{ padding: '10px', background: '#141720', border: `1px solid ${showSolution ? '#a855f730' : '#f8717130'}`, borderRadius: '8px', color: !disabled ? (showSolution ? '#a855f7' : '#f87171') : '#3a4060', cursor: !disabled ? 'pointer' : 'default', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{showSolution ? '✦ Hide Answer' : '⚠ Reveal Answer'}</button>
      </div>
    </div>
  );
}
