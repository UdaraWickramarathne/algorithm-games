import { useState } from 'react';
const ACCENT = '#38bdf8';
export default function PlayerNameInput({ onConfirm }: { onConfirm: (n: string) => void }) {
  const [name, setName] = useState(''); const [err, setErr] = useState('');
  const handle = () => { const t = name.trim(); if (!t || t.length < 2) { setErr('Min 2 characters'); return; } onConfirm(t); };
  return (
     
      <div >
        <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && handle()} placeholder="Player name..." style={{ width: '100%', background: '#141720', border: `1px solid ${err ? '#f87171' : '#1e2236'}`, borderRadius: '8px', padding: '12px 14px', color: '#eef2ff', fontSize: '14px', outline: 'none', marginBottom: err ? '6px' : '16px', fontFamily: 'var(--font-body)' }} />
        {err && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px' }}>{err}</div>}
        <button onClick={handle} style={{ width: '100%', background: ACCENT, color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Start Playing</button>
      </div>
   
  );
}
