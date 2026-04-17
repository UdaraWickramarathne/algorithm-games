
import { useState } from 'react';


import PlayerNameInput from './PlayerNameInput';


const ACCENT = '#38bdf8';

export default function TrafficSimPage() {
  const [playerName, setPlayerName] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 

  if (!playerName) return <PlayerNameInput onConfirm={setPlayerName} />;

  return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="font-mono-game" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase' }}>Game 03</div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: '#eef2ff', letterSpacing: '-0.01em' }}>Traffic Simulation</h1>
          <p style={{ fontSize: '13px', color: '#5a6480', marginTop: '4px' }}>Maximum Flow Problem — Edmonds-Karp vs Dinic's</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Playing as: <span style={{ color: ACCENT }}>{playerName}</span></span>
          <button onClick={() => {}} disabled={loading} style={{ background: ACCENT, color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '12px', cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Computing...' : selected !== null ? 'New Round' : 'Start Game'}
          </button>
        </div>
      </div>
  );
}
