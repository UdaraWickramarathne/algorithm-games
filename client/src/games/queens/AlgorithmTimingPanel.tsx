import { formatMs } from '../../utils/formatTime';
import type { StatsResponse } from './queens.types';
const ACCENT = '#fb7185';
export default function AlgorithmTimingPanel({ stats }: { stats: StatsResponse }) {
  const timings = [
    { name: 'Sequential', ms: stats.sequentialTimeMs, solutions: stats.sequentialCount, color: '#f59e0b' },
    { name: `Threaded (${stats.workerCount ?? '?'} workers)`, ms: stats.threadedTimeMs, solutions: stats.threadedCount, color: '#38bdf8' },
  ];
  const max = Math.max(...timings.map((t) => t.ms ?? 0), 0.001);
  return (
    <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
      <div className="font-display" style={{ fontSize: '11px', letterSpacing: '0.2em', color: ACCENT, marginBottom: '16px', textTransform: 'uppercase' }}>Performance Comparison</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {timings.map((t) => (
          <div key={t.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#c8d0e8', fontFamily: 'var(--font-mono)' }}>{t.name}</span>
              <span style={{ fontSize: '12px', color: t.color, fontFamily: 'var(--font-mono)' }}>{t.ms ? formatMs(t.ms) : '—'}</span>
            </div>
            <div style={{ height: '6px', background: '#1e2236', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(2, ((t.ms ?? 0) / max) * 100)}%`, background: t.color, borderRadius: '3px', transition: 'width 0.8s' }} />
            </div>
            <div style={{ fontSize: '10px', color: '#5a6480', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {t.solutions?.toLocaleString() ?? '—'} solutions found
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
