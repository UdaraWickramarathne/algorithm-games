import { useState } from 'react';
import type { NewRoundResponse, SubmitAnswerResponse, AlgoTiming } from './traffic.types';
import { fetchNewRound, submitAnswer } from './traffic.api';
import PlayerNameInput from './PlayerNameInput';
import TrafficGraph from './TrafficGraph';
import AnswerChoices from './AnswerChoices';
import AlgorithmTimingPanel from './AlgorithmTimingPanel';
import GameResult from './GameResult';
import RoundTimingChart from '../../components/RoundTimingChart';

const ACCENT = '#38bdf8';

export default function TrafficSimPage() {
  const [playerName, setPlayerName] = useState('');
  const [round, setRound] = useState<NewRoundResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<AlgoTiming[][]>([]);

  const startRound = async () => {
    setLoading(true); setError(''); setSelected(null); setResult(null);
    try {
      const data = await fetchNewRound();
      setRound(data);
      setHistory(h => [...h, data.timings]);
    }
    catch { setError('Server error. Is the backend running?'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!round || selected === null) return;
    setLoading(true);
    try { const data = await submitAnswer(round.roundId, playerName, selected); setResult(data); }
    catch { setError('Failed to submit'); }
    finally { setLoading(false); }
  };

  if (!playerName) return <PlayerNameInput onConfirm={setPlayerName} />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="font-mono-game" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase' }}>Game 03</div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: '#eef2ff', letterSpacing: '-0.01em' }}>Traffic Simulation</h1>
          <p style={{ fontSize: '13px', color: '#5a6480', marginTop: '4px' }}>Maximum Flow Problem — Edmonds-Karp vs Dinic's</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Playing as: <span style={{ color: ACCENT }}>{playerName}</span></span>
          <button onClick={startRound} disabled={loading} style={{ background: ACCENT, color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '12px', cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Computing...' : round ? 'New Round' : 'Start Game'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#f8717115', border: '1px solid #f8717140', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      {!round && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#5a6480' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>⬟</div>
          <p style={{ fontSize: '14px' }}>Click <strong style={{ color: ACCENT }}>Start Game</strong> to generate a random traffic network.</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>9 nodes (A→T), 13 edges, random capacities 5–15 per round.</p>
        </div>
      )}

      {round && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '24px' }}>
              <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#5a6480', marginBottom: '16px', textTransform: 'uppercase' }}>Traffic Network</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[{ label: 'Nodes', val: round.nodes.length }, { label: 'Edges', val: round.edges.length }, { label: 'Min Cap', val: Math.min(...round.edges.map(e => e.capacity)) }, { label: 'Max Cap', val: Math.max(...round.edges.map(e => e.capacity)) }].map((s) => (
                  <div key={s.label} style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div className="num-display" style={{ fontSize: '18px', color: ACCENT, fontWeight: 700 }}>{s.val}</div>
                    <div style={{ fontSize: '10px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <TrafficGraph edges={round.edges} />
            </div>
            <AlgorithmTimingPanel timings={round.timings} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#0e1018', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '24px' }}>
              <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: ACCENT, marginBottom: '16px', textTransform: 'uppercase' }}>Your Answer</div>
              <AnswerChoices choices={round.choices as [number, number, number]} selected={selected} onChange={setSelected} disabled={!!result} />
              <button onClick={handleSubmit} disabled={selected === null || loading || !!result} style={{ marginTop: '16px', width: '100%', background: selected !== null ? ACCENT : '#1e2236', color: selected !== null ? '#000' : '#5a6480', border: 'none', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '13px', cursor: selected !== null && !loading && !result ? 'pointer' : 'default', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}>Submit Answer</button>
            </div>
            <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#5a6480', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
                <div style={{ color: ACCENT, marginBottom: '8px', letterSpacing: '0.1em' }}>HOW TO PLAY</div>
                <div>• A = source, T = sink</div>
                <div>• Edge labels = max capacity</div>
                <div>• Find max vehicles through network</div>
                <div>• Limited by min-cut bottleneck</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <RoundTimingChart
          title="Algorithm Timing per Round (ms)"
          rounds={history.map((timings, i) => ({
            label: `R${i + 1}`,
            bars: timings.map(t => ({ name: t.algorithmName, value: t.executionTimeMs })),
          }))}
          colors={['#38bdf8', '#818cf8']}
          accent={ACCENT}
        />
      </div>

      {result && <GameResult outcome={result.outcome} correctAnswer={result.correctAnswer} isCorrect={result.isCorrect} timings={result.timings} onNext={() => { setResult(null); setSelected(null); startRound(); }} />}
    </div>
  );
}
