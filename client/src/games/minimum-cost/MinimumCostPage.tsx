import { useState } from 'react';
import type { NewRoundResponse, SubmitAnswerResponse, AlgoTiming } from './minimumCost.types.ts';
import { fetchNewRound, submitAnswer } from './minimumCost.api.ts';
import PlayerNameInput from './PlayerNameInput.tsx';
import CostMatrix from './CostMatrix.tsx';
import AnswerChoices from './AnswerChoices.tsx';
import AlgorithmTimingPanel from './AlgorithmTimingPanel.tsx';
import GameResult from './GameResult.tsx';
import RoundTimingChart from '../../components/RoundTimingChart.tsx';

const ACCENT = '#eab308';

export default function MinimumCostPage() {
  const [playerName, setPlayerName] = useState('');
  const [round, setRound] = useState<NewRoundResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<AlgoTiming[][]>([]);

  const startRound = async () => {
    setLoading(true);
    setError('');
    setSelected(null);
    setResult(null);
    try {
      const data = await fetchNewRound();
      setRound(data);
      setHistory(h => [...h, data.timings]);
    } catch {
      setError('Server error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!round || selected === null) return;
    setLoading(true);
    try {
      const data = await submitAnswer(round.roundId, playerName, selected);
      setResult(data);
    } catch {
      setError('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  if (!playerName) return <PlayerNameInput onConfirm={(n: string) => { setPlayerName(n); }} />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="font-mono-game" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase' }}>Game 01</div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: '#eef2ff', letterSpacing: '-0.01em' }}>Minimum Cost</h1>
          <p style={{ fontSize: '13px', color: '#5a6480', marginTop: '4px' }}>Task Assignment Problem — N workers, N tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Playing as: <span style={{ color: ACCENT }}>{playerName}</span></span>
          <button
            onClick={startRound}
            disabled={loading}
            style={{ background: ACCENT, color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '12px', cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Computing...' : round ? 'New Round' : 'Start Game'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#f8717115', border: '1px solid #f8717140', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!round && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#5a6480' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>⬡</div>
          <p style={{ fontSize: '14px' }}>Click <strong style={{ color: ACCENT }}>Start Game</strong> to generate a new round.</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>N workers will be randomly selected (50–100) with random costs.</p>
        </div>
      )}

      {round && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Problem Info */}
            <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '24px' }}>
              <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#5a6480', marginBottom: '16px', textTransform: 'uppercase' }}>Problem Setup</div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: '8px', padding: '12px 20px', textAlign: 'center' }}>
                  <div className="num-display" style={{ fontSize: '32px', color: ACCENT, fontWeight: 700 }}>{round.n}</div>
                  <div style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>Workers / Tasks</div>
                </div>
                <div style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '12px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>Cost Range</div>
                  <div className="num-display" style={{ fontSize: '16px', color: '#c8d0e8' }}>$20 — $200</div>
                </div>
                <div style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '12px 20px' }}>
                  <div style={{ fontSize: '11px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>Constraint</div>
                  <div className="num-display" style={{ fontSize: '14px', color: '#c8d0e8' }}>1 task per worker</div>
                </div>
              </div>
              <CostMatrix n={round.n} />
            </div>

            {/* Timing */}
            <AlgorithmTimingPanel timings={round.timings} />
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#0e1018', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '24px' }}>
              <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: ACCENT, marginBottom: '16px', textTransform: 'uppercase' }}>Your Answer</div>
              <AnswerChoices
                choices={round.choices as [number, number, number]}
                selected={selected}
                onChange={setSelected}
                disabled={!!result}
              />
              <button
                onClick={handleSubmit}
                disabled={selected === null || loading || !!result}
                style={{ marginTop: '16px', width: '100%', background: selected !== null ? ACCENT : '#1e2236', color: selected !== null ? '#000' : '#5a6480', border: 'none', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '13px', cursor: selected !== null && !loading && !result ? 'pointer' : 'default', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}
              >
                Submit Answer
              </button>
            </div>

            {/* Instructions */}
            <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#5a6480', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
                <div style={{ color: ACCENT, marginBottom: '8px', letterSpacing: '0.1em' }}>HOW TO PLAY</div>
                <div>• N workers must each receive exactly one unique task</div>
                <div>• Each task can be assigned to only one worker</div>
                <div>• Find the assignment that <em>minimizes</em> total cost</div>
                <div>• The Hungarian algorithm finds the optimal solution</div>
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
          colors={['#eab308', '#f97316']}
          accent={ACCENT}
        />
      </div>

      {result && (
        <GameResult
          outcome={result.outcome}
          correctAnswer={result.correctAnswer}
          isCorrect={result.isCorrect}
          timings={result.timings}
          onNext={() => { setResult(null); setSelected(null); startRound(); }}
        />
      )}
    </div>
  );
}
