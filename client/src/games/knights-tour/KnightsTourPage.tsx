import { useState } from 'react';
import type { NewRoundResponse, SubmitAnswerResponse } from './knightsTour.types';
import { fetchNewRound, submitAnswer } from './knightsTour.api';
import PlayerNameInput from './PlayerNameInput';
import ChessBoard from './ChessBoard';
import BoardSizeSelector from './BoardSizeSelector';
import MoveControls from './MoveControls';
import AlgorithmTimingPanel from './AlgorithmTimingPanel';
import GameResult from './GameResult';

const ACCENT = '#a855f7';
const KNIGHT_MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

export default function KnightsTourPage() {
  const [playerName, setPlayerName] = useState('');
  const [boardSize, setBoardSize] = useState<8 | 16>(8);
  const [round, setRound] = useState<NewRoundResponse | null>(null);
  const [moves, setMoves] = useState<[number, number][]>([]);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startRound = async (size: 8 | 16 = boardSize) => {
    setLoading(true); setError(''); setMoves([]); setResult(null); setShowSolution(false);
    try { const data = await fetchNewRound(size); setRound(data); setMoves([[data.startRow, data.startCol]]); }
    catch { setError('Server error. Is the backend running?'); }
    finally { setLoading(false); }
  };

  const handleCellClick = (r: number, c: number) => {
    if (!round || result || showSolution) return;
    const [curR, curC] = moves[moves.length - 1];
    const isValidKnight = KNIGHT_MOVES.some(([dr, dc]) => curR + dr === r && curC + dc === c);
    const alreadyVisited = moves.some(([mr, mc]) => mr === r && mc === c);
    if (isValidKnight && !alreadyVisited) setMoves((prev) => [...prev, [r, c]]);
  };

  const handleSubmit = async () => {
    if (!round) return;
    setLoading(true);
    try { const data = await submitAnswer(round.roundId, playerName, moves); setResult(data); }
    catch { setError('Failed to submit'); }
    finally { setLoading(false); }
  };

  if (!playerName) return <PlayerNameInput onConfirm={setPlayerName} />;

  const totalCells = boardSize * boardSize;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="font-mono-game" style={{ fontSize: '10px', letterSpacing: '0.3em', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase' }}>Game 04</div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 900, color: '#eef2ff', letterSpacing: '-0.01em' }}>Knight's Tour</h1>
          <p style={{ fontSize: '13px', color: '#5a6480', marginTop: '4px' }}>Hamiltonian Path — Warnsdorff's vs Backtracking</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#5a6480', fontFamily: 'var(--font-mono)' }}>Playing as: <span style={{ color: ACCENT }}>{playerName}</span></span>
          <button onClick={() => startRound(boardSize)} disabled={loading} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '12px', cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Computing...' : round ? 'New Round' : 'Start Game'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#f8717115', border: '1px solid #f8717140', borderRadius: '8px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '24px' }}>
            <div className="font-display" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#5a6480', marginBottom: '16px', textTransform: 'uppercase' }}>Board Setup</div>
            <div style={{ marginBottom: '20px' }}>
              <BoardSizeSelector value={boardSize} onChange={(s) => { setBoardSize(s); }} disabled={loading} />
            </div>
            {round ? (
              <>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {[{ label: 'Board', val: `${round.boardSize}×${round.boardSize}` }, { label: 'Start', val: `(${round.startRow}, ${round.startCol})` }, { label: 'Cells', val: round.boardSize * round.boardSize }, { label: 'Moves', val: `${moves.length}/${totalCells}` }].map((s) => (
                    <div key={s.label} style={{ background: '#141720', border: '1px solid #1e2236', borderRadius: '8px', padding: '10px 16px' }}>
                      <div className="num-display" style={{ fontSize: '14px', color: ACCENT, fontWeight: 700 }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: '#5a6480', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: '#5a6480', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                  {showSolution ? '✦ ALGORITHM SOLUTION' : '● Click green dots to move the knight'}
                </div>
                <ChessBoard
                  n={round.boardSize}
                  startRow={round.startRow}
                  startCol={round.startCol}
                  moves={showSolution ? [] : moves}
                  solution={showSolution && result ? result.solution : undefined}
                  onCellClick={handleCellClick}
                  interactive={!showSolution && !result}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a6480' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>♞</div>
                <p style={{ fontSize: '13px' }}>Select board size and click <strong style={{ color: ACCENT }}>Start Game</strong></p>
              </div>
            )}
          </div>
          {round && <AlgorithmTimingPanel timings={round.timings} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {round && (
            <MoveControls
              moveCount={moves.length}
              totalCells={totalCells}
              onUndo={() => { if (moves.length > 1) setMoves((p) => p.slice(0, -1)); }}
              onClear={() => setMoves([[round.startRow, round.startCol]])}
              onSubmit={handleSubmit}
              disabled={loading || !!result}
            />
          )}
          <div style={{ background: '#0e1018', border: '1px solid #1e2236', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#5a6480', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: ACCENT, marginBottom: '8px', letterSpacing: '0.1em' }}>HOW TO PLAY</div>
              <div>• Click green dots to move the knight</div>
              <div>• Visit every cell exactly once</div>
              <div>• Knight moves in an L-shape</div>
              <div>• Fill all {totalCells} cells to complete</div>
            </div>
          </div>
        </div>
      </div>

      {result && !showSolution && (
        <GameResult
          isCorrect={result.isCorrect}
          timings={result.timings}
          onNext={() => { setResult(null); setShowSolution(false); setMoves([]); startRound(boardSize); }}
          onShowSolution={() => setShowSolution(true)}
        />
      )}
    </div>
  );
}
