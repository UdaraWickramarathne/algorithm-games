const ACCENT = '#f59e0b';

interface Props {
  choices: [number, number, number];
  selected: number | null;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export default function AnswerChoices({ choices, selected, onChange, disabled }: Props) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#5a6480', marginBottom: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
        SELECT THE MINIMUM TOTAL COST ($):
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {choices.map((choice) => {
          const isSelected = selected === choice;
          return (
            <label
              key={choice}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                background: isSelected ? `${ACCENT}15` : '#141720',
                border: `1px solid ${isSelected ? ACCENT + '60' : '#1e2236'}`,
                borderRadius: '10px', cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.2s', opacity: disabled && !isSelected ? 0.5 : 1,
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: `2px solid ${isSelected ? ACCENT : '#2a2f45'}`,
                background: isSelected ? ACCENT : 'transparent',
                flexShrink: 0, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000' }} />}
              </div>
              <input type="radio" value={choice} checked={isSelected} onChange={() => !disabled && onChange(choice)} style={{ display: 'none' }} />
              <span className="num-display" style={{ fontSize: '18px', color: isSelected ? ACCENT : '#c8d0e8', fontWeight: isSelected ? 700 : 400 }}>
                ${choice.toLocaleString()}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
