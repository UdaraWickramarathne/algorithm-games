import type { SubmitResponse } from './queens.types';
const ACCENT = '#fb7185';
interface Props { result: SubmitResponse; onClose: () => void; }
export default function GameResult({ result, onClose }: Props) {
  const emoji = result.isValid ? (result.isRecognized ? '🔁' : result.isNew ? '✨' : '✓') : '❌';
  const color = result.isValid ? (result.isRecognized ? '#f59e0b' : '#10b981') : '#f87171';
  const title = result.isValid ? (result.isRecognized ? 'ALREADY RECOGNIZED' : 'CORRECT!') : 'INVALID PLACEMENT';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,14,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#0e1018', border: `1px solid ${color}40`, borderRadius: '20px', padding: '48px', maxWidth: '440px', width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>{emoji}</div>
        <div className="font-display" style={{ fontSize: '24px', fontWeight: 900, color, letterSpacing: '0.05em', marginBottom: '12px' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#8890aa', lineHeight: 1.6, marginBottom: '28px' }}>{result.message}</div>
        <button onClick={onClose} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 32px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {result.isRecognized ? 'Try Another' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
