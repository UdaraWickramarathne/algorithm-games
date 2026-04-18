import type { SolvingStatus } from './queens.types';
import { formatMs } from '../../utils/formatTime';
const ACCENT = '#fb7185';
interface Props { status: SolvingStatus; onStart: () => void; loading: boolean; }
export default function SolverStatus({ status, onStart, loading }: Props) {
  const isDone = status.status === 'done';
  const isRunning = status.status === 'running';
  const speedup = isDone && status.threadedTimeMs && status.sequentialTimeMs
    ? (status.sequentialTimeMs / status.threadedTimeMs).toFixed(2) : null;
  return (
    <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '24px' }}>
      <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: ACCENT, marginBottom: '16px', textTransform: 'uppercase' }}>Solver Status</div>
      {!isDone && !isRunning && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '13px', color: '#5a6480', marginBottom: '16px' }}>Run both sequential and threaded solvers to find all 16-Queens solutions and compare performance.</p>
          <button onClick={onStart} disabled={loading} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '13px', cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Starting...' : 'Run Solvers'}
          </button>
        </div>
      )}
      {isRunning && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>⟳ Solving... (this may take a minute)</div>
          <div style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Computing all 16-Queens solutions sequentially and in parallel threads...</div>
        </div>
      )}
      {isDone && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[{ label: 'Sequential', time: status.sequentialTimeMs, count: status.sequentialCount, color: '#f59e0b' }, { label: `Threaded (${status.workerCount} workers)`, time: status.threadedTimeMs, count: status.threadedCount, color: '#38bdf8' }].map((s) => (
            <div key={s.label} style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#c8d0e8', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                <span style={{ fontSize: '12px', color: s.color, fontFamily: 'var(--font-mono)' }}>{s.time ? formatMs(s.time) : '—'}</span>
              </div>
              <div className="num-display" style={{ fontSize: '14px', color: s.color, fontWeight: 700 }}>{s.count?.toLocaleString() ?? '—'} solutions</div>
            </div>
          ))}
          {speedup && (
            <div style={{ textAlign: 'center', padding: '10px', background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: ACCENT }}>
                Speedup: <strong className="num-display">{speedup}×</strong> faster with threading
              </span>
            </div>
          )}
          <button onClick={onStart} disabled={loading} style={{ background: '#141720', color: ACCENT, border: `1px solid ${ACCENT}40`, borderRadius: '8px', padding: '10px', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Re-run Solvers
          </button>
        </div>
      )}
    </div>
  );
}
