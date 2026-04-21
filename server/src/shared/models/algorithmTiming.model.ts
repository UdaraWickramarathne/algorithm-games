import { getDb } from '../../db/database.js';
import type { GameType } from './gameRound.model.js';

export interface AlgorithmTiming {
  id: number;
  game_round_id: number;
  algorithm_name: string;
  execution_time_ms: number;
  result: string;
  game_type: GameType;
  created_at: string;
}

export function saveAlgorithmTiming(
  gameRoundId: number,
  algorithmName: string,
  executionTimeMs: number,
  result: string,
  gameType: GameType
): AlgorithmTiming {
  const db = getDb();
  const row = db
    .prepare(
      `INSERT INTO algorithm_timings
       (game_round_id, algorithm_name, execution_time_ms, result, game_type)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(gameRoundId, algorithmName, executionTimeMs, result, gameType);
  return db
    .prepare('SELECT * FROM algorithm_timings WHERE id = ?')
    .get(row.lastInsertRowid) as AlgorithmTiming;
}

export function getTimingsByRoundId(roundId: number): AlgorithmTiming[] {
  return getDb()
    .prepare('SELECT * FROM algorithm_timings WHERE game_round_id = ?')
    .all(roundId) as AlgorithmTiming[];
}

export function getTimingsByGameType(gameType: GameType, limit = 50): AlgorithmTiming[] {
  return getDb()
    .prepare('SELECT * FROM algorithm_timings WHERE game_type = ? ORDER BY id DESC LIMIT ?')
    .all(gameType, limit) as AlgorithmTiming[];
}
