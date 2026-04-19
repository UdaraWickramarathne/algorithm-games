const ACCENT = '#38bdf8';
interface Props { choices: [number, number, number]; selected: number | null; onChange: (v: number) => void; disabled?: boolean; }
export default function AnswerChoices({ choices, selected, onChange, disabled }: Props) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#5a6480', marginBottom: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>MAXIMUM FLOW FROM A TO T:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {choices.map((c) => {
          const sel = selected === c;
          return (
            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: sel ? `${ACCENT}15` : '#141720', border: `1px solid ${sel ? ACCENT + '60' : '#1e2236'}`, borderRadius: '10px', cursor: disabled ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${sel ? ACCENT : '#2a2f45'}`, background: sel ? ACCENT : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000' }} />}</div>
              <input type="radio" checked={sel} onChange={() => !disabled && onChange(c)} style={{ display: 'none' }} />
              <span className="num-display" style={{ fontSize: '20px', color: sel ? ACCENT : '#c8d0e8', fontWeight: sel ? 700 : 400 }}>{c} <span style={{ fontSize: '12px', color: '#5a6480' }}>vehicles/min</span></span>
            </label>
          );
        })}
      </div>
    </div>
  );
}