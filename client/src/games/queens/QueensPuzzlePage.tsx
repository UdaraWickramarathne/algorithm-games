import { useState, useEffect, useCallback } from 'react';
import type { SolvingStatus, SubmitResponse, StatsResponse } from './queens.types';
import { startSolving, getSolvingStatus, submitSolution, getStats } from './queens.api';
import PlayerNameInput from './PlayerNameInput';
import QueensBoard from './QueensBoard';
import SolverStatus from './SolverStatus';
import AlgorithmTimingPanel from './AlgorithmTimingPanel';
import GameResult from './GameResult';

const ACCENT = '#fb7185';
const N = 16;

export default function QueensPuzzlePage() {
  const [playerName, setPlayerName] = useState('');
  const [queens, setQueens] = useState<number[]>(Array(N).fill(-1));
  const [solveStatus, setSolveStatus] = useState<SolvingStatus>({ status: 'done' });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    try { const s = await getStats(); setStats(s); setSolveStatus({ status: s.status as any ?? 'done', ...s }); }
    catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Poll while running
  useEffect(() => {
    if (solveStatus.status !== 'running') return;
    const id = setInterval(async () => {
      const s = await getSolvingStatus();
      setSolveStatus(s);
      if (s.status === 'done') { clearInterval(id); loadStats(); }
    }, 2000);
    return () => clearInterval(id);
  }, [solveStatus.status, loadStats]);

  const handleStartSolving = async () => {
    setLoading(true);
    try { const r = await startSolving(); setSolveStatus({ status: r.status as any }); }
    catch { setError('Failed to start solvers'); }
    finally { setLoading(false); }
  };

  const handleToggle = (row: number, col: number) => {
    setQueens((prev) => {
      const next = [...prev];
      next[row] = next[row] === col ? -1 : col;
      return next;
    });
  };

  const handleSubmit = async () => {
    const placed = queens.filter((c) => c >= 0).length;
    if (placed !== N) { setError(`Place exactly ${N} queens (one per row). Currently ${placed} placed.`); return; }
    setLoading(true); setError('');
    try {
      const data = await submitSolution(playerName, queens);
      setResult(data);
      await loadStats();
    } catch { setError('Failed to submit solution'); }
    finally { setLoading(false); }
  };

  const placedCount = queens.filter((c) => c >= 0).length;

  if (!playerName) return <PlayerNameInput onConfirm={setPlayerName} />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="font-mono-game" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase' }}>Game 05</div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: '#eef2ff', letterSpacing: '-0.01em' }}>Sixteen Queens</h1>
          <p style={{ fontSize: '13px', color: '#5a6480', marginTop: '4px' }}>N-Queens Puzzle — Sequential vs Threaded</p>
        </div>
        <span style={{ fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Playing as: <span style={{ color: ACCENT }}>{playerName}</span></span>
      </div>

      {error && <div style={{ background: '#f8717115', border: '1px solid #f8717140', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Board */}
          <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '24px' }}>
            <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#5a6480', marginBottom: '16px', textTransform: 'uppercase' }}>16×16 Chessboard</div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[{ label: 'Placed', val: placedCount, color: placedCount === N ? '#10b981' : ACCENT }, { label: 'Required', val: N, color: '#5a6480' }, { label: 'Stored Solutions', val: stats?.totalStored ?? 0, color: ACCENT }, { label: 'Recognized', val: stats?.recognizedCount ?? 0, color: '#f59e0b' }].map((s) => (
                <div key={s.label} style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '10px 16px' }}>
                  <div className="num-display" style={{ fontSize: '18px', color: s.color, fontWeight: 700 }}>{s.val.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <QueensBoard queens={queens} onToggle={handleToggle} disabled={loading} />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setQueens(Array(N).fill(-1))} style={{ flex: 1, padding: '10px', background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>✕ Clear Board</button>
              <button onClick={handleSubmit} disabled={placedCount !== N || loading} style={{ flex: 2, padding: '12px', background: placedCount === N && !loading ? ACCENT : '#1e2236', color: placedCount === N && !loading ? '#fff' : '#3a4060', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: placedCount === N && !loading ? 'pointer' : 'default', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                {loading ? 'Submitting...' : `Submit Solution (${placedCount}/${N})`}
              </button>
            </div>
          </div>

          {stats && stats.status === 'done' && <AlgorithmTimingPanel stats={stats} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SolverStatus status={solveStatus} onStart={handleStartSolving} loading={loading} />

          {stats?.allRecognized && (
            <div style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: ACCENT, fontFamily: 'var(--font-mono)' }}>🎉 All stored solutions recognized! Flags cleared for new players.</div>
            </div>
          )}

          <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#5a6480', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: ACCENT, marginBottom: '8px', letterSpacing: '0.1em' }}>HOW TO PLAY</div>
              <div>1. Run solvers to find all solutions</div>
              <div>2. Place 8 queens on 16×16 board</div>
              <div>3. No two queens share row/col/diagonal</div>
              <div>4. Submit to check your solution</div>
              <div>5. Unique solutions get recognized</div>
            </div>
          </div>
        </div>
      </div>

      {result && <GameResult result={result} onClose={() => { setResult(null); if (result.isRecognized) setQueens(Array(N).fill(-1)); }} />}
    </div>
  );
}
