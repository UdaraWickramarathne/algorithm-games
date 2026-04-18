import { useState } from 'react';
const ACCENT = '#fb7185';
export default function PlayerNameInput({ onConfirm }: { onConfirm: (n: string) => void }) {
  const [name, setName] = useState(''); const [err, setErr] = useState('');
  const handle = () => { const t = name.trim(); if (!t || t.length < 2) { setErr('Min 2 characters'); return; } onConfirm(t); };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,14,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0e1018', border: `1px solid ${ACCENT}40`, borderRadius: '16px', padding: '40px', width: '360px', boxShadow: `0 0 60px ${ACCENT}15` }}>
        <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '8px', textTransform: 'uppercase' }}>Sixteen Queens Puzzle</div>
        <h2 style={{ fontSize: '22px', color: '#eef2ff', fontWeight: 700, marginBottom: '20px' }}>Enter Your Name</h2>
        <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && handle()} placeholder="Player name..." style={{ width: '100%', background: '#141720', border: `1px solid ${err ? '#f87171' : '#1e2236'}`, borderRadius: '8px', padding: '12px 14px', color: '#eef2ff', fontSize: '14px', outline: 'none', marginBottom: err ? '6px' : '16px', fontFamily: 'var(--font-body)' }} />
        {err && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px' }}>{err}</div>}
        <button onClick={handle} style={{ width: '100%', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Start Playing</button>
      </div>
    </div>
  );
}
