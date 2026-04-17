import { useState } from 'react';
import type { NewRoundResponse, SubmitAnswerResponse } from './snakeLadder.types';
import { fetchNewRound, submitAnswer } from './snakeLadder.api';
import PlayerNameInput from './PlayerNameInput';
import SnakeLadderBoard from './SnakeLadderBoard';
import BoardSizeInput from './BoardSizeInput';
import AnswerChoices from './AnswerChoices';
import AlgorithmTimingPanel from './AlgorithmTimingPanel';
import GameResult from './GameResult';

const ACCENT = '#10b981';

export default function SnakeLadderPage() {
  const [playerName, setPlayerName] = useState('');
  const [boardSize, setBoardSize] = useState(8);
  const [round, setRound] = useState<NewRoundResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startRound = async (size: number = boardSize) => {
    setLoading(true); setError(''); setSelected(null); setResult(null);
    try { const data = await fetchNewRound(size); setRound(data); }
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
          <div className="font-mono-game" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase' }}>Game 02</div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: '#eef2ff', letterSpacing: '-0.01em' }}>Snake & Ladder</h1>
          <p style={{ fontSize: '13px', color: '#5a6480', marginTop: '4px' }}>Minimum Dice Throws — BFS vs Dijkstra</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Playing as: <span style={{ color: ACCENT }}>{playerName}</span></span>
          <button onClick={() => startRound(boardSize)} disabled={loading} style={{ background: ACCENT, color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '12px', cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Generating...' : round ? 'New Round' : 'Start Game'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#f8717115', border: '1px solid #f8717140', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Board setup */}
          <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '24px' }}>
            <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#5a6480', marginBottom: '16px', textTransform: 'uppercase' }}>Board Configuration</div>
            <div style={{ marginBottom: '20px' }}>
              <BoardSizeInput value={boardSize} onChange={(s) => { setBoardSize(s); }} disabled={loading} />
            </div>
            {round ? (
              <>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {[{ label: 'Board', val: `${round.boardSize}×${round.boardSize}` }, { label: 'Cells', val: round.totalCells }, { label: 'Snakes', val: Object.keys(round.snakes).length }, { label: 'Ladders', val: Object.keys(round.ladders).length }].map((s) => (
                    <div key={s.label} style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                      <div className="num-display" style={{ fontSize: '18px', color: ACCENT, fontWeight: 700 }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <SnakeLadderBoard boardSize={round.boardSize} snakes={round.snakes} ladders={round.ladders} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a6480' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>⬢</div>
                <p style={{ fontSize: '13px' }}>Select board size and click <strong style={{ color: ACCENT }}>Start Game</strong></p>
              </div>
            )}
          </div>
          {round && <AlgorithmTimingPanel timings={round.timings} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0e1018', border: `1px solid ${ACCENT}30`, borderRadius: '12px', padding: '24px' }}>
            <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: ACCENT, marginBottom: '16px', textTransform: 'uppercase' }}>Your Answer</div>
            {round ? (
              <>
                <AnswerChoices choices={round.choices as [number, number, number]} selected={selected} onChange={setSelected} disabled={!!result} />
                <button onClick={handleSubmit} disabled={selected === null || loading || !!result} style={{ marginTop: '16px', width: '100%', background: selected !== null ? ACCENT : '#1e2236', color: selected !== null ? '#000' : '#5a6480', border: 'none', borderRadius: '8px', padding: '13px', fontWeight: 700, fontSize: '13px', cursor: selected !== null && !loading && !result ? 'pointer' : 'default', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}>Submit Answer</button>
              </>
            ) : (
              <div style={{ color: '#3a4060', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Start a round to answer</div>
            )}
          </div>
          <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#5a6480', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: ACCENT, marginBottom: '8px', letterSpacing: '0.1em' }}>HOW TO PLAY</div>
              <div>• Start from cell 1, reach cell N²</div>
              <div>• Dice rolls: 1–6 per turn</div>
              <div>• Ladder bottom → climb to top</div>
              <div>• Snake head → slide to tail</div>
              <div>• Find the minimum dice throws</div>
            </div>
          </div>
        </div>
      </div>

      {result && <GameResult outcome={result.outcome} correctAnswer={result.correctAnswer} isCorrect={result.isCorrect} timings={result.timings} onNext={() => { setResult(null); setSelected(null); startRound(boardSize); }} />}
    </div>
  );
}
