import type { AlgoTiming } from './minimumCost.types.ts';
import { formatMs } from '../../utils/formatTime';

const ACCENT = '#f59e0b';

interface Props {
  timings: AlgoTiming[];
}

export default function AlgorithmTimingPanel({ timings }: Props) {
  if (!timings.length) return null;
  const max = Math.max(...timings.map((t) => t.executionTimeMs), 0.001);

  return (
    <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
      <div className="font-display" style={{ fontSize: '11px', letterSpacing: '0.2em', color: ACCENT, marginBottom: '16px', textTransform: 'uppercase' }}>
        Algorithm Timing Comparison
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {timings.map((t) => (
          <div key={t.algorithmName}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#c8d0e8', fontFamily: 'var(--font-mono)' }}>{t.algorithmName}</span>
              <span style={{ fontSize: '12px', color: ACCENT, fontFamily: 'var(--font-mono)' }}>{formatMs(t.executionTimeMs)}</span>
            </div>
            <div style={{ height: '6px', background: '#1e2236', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(2, (t.executionTimeMs / max) * 100)}%`,
                  background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}80)`,
                  borderRadius: '3px',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#5a6480', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              result: {t.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
