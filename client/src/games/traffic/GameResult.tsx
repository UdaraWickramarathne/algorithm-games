import { formatMs } from '../../utils/formatTime';
import type { AlgoTiming } from './traffic.types';
const ACCENT = '#38bdf8';
interface Props { outcome: 'win' | 'lose'; correctAnswer: number; isCorrect: boolean; timings: AlgoTiming[]; onNext: () => void; }
export default function GameResult({ outcome, correctAnswer, isCorrect, timings, onNext }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,14,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#0e1018', border: `1px solid ${isCorrect ? '#10b981' : '#f87171'}40`, borderRadius: '20px', padding: '48px', maxWidth: '440px', width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>{isCorrect ? '🚦' : '🚧'}</div>
        <div className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: isCorrect ? '#10b981' : '#f87171', letterSpacing: '0.05em', marginBottom: '8px' }}>{outcome === 'win' ? 'CORRECT!' : 'INCORRECT'}</div>
        <div style={{ fontSize: '14px', color: '#5a6480', marginBottom: '24px' }}>Max flow: <span className="num-display" style={{ color: ACCENT, fontSize: '20px', fontWeight: 700 }}>{correctAnswer}</span> vehicles/min</div>
        {timings.length > 0 && (
          <div style={{ background: '#141720', borderRadius: '10px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            {timings.map((t) => (
              <div key={t.algorithmName} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#c8d0e8', fontFamily: 'var(--font-mono)' }}>{t.algorithmName}</span>
                <span style={{ fontSize: '12px', color: ACCENT, fontFamily: 'var(--font-mono)' }}>{formatMs(t.executionTimeMs)}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onNext} style={{ background: ACCENT, color: '#000', border: 'none', borderRadius: '10px', padding: '14px 32px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Round →</button>
      </div>
    </div>
  );
}