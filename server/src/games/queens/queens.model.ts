import { getDb } from '../../db/database.js';

export interface QueensSolution {
  id: number;
  solution_hash: string;
  solution_json: string;
  found_by_player_id: number | null;
  is_recognized: number;
  created_at: string;
}

export function findSolutionByHash(hash: string): QueensSolution | undefined {
  return getDb()
    .prepare('SELECT * FROM queens_solutions WHERE solution_hash = ?')
    .get(hash) as QueensSolution | undefined;
}

export function insertSolution(
  hash: string,
  solutionJson: string,
  playerId: number | null
): QueensSolution {
  const db = getDb();
  const result = db
    .prepare(
      'INSERT OR IGNORE INTO queens_solutions (solution_hash, solution_json, found_by_player_id, is_recognized) VALUES (?, ?, ?, 1)'
    )
    .run(hash, solutionJson, playerId);
  return db
    .prepare('SELECT * FROM queens_solutions WHERE solution_hash = ?')
    .get(hash) as QueensSolution;
}

export function markRecognized(hash: string): void {
  getDb()
    .prepare('UPDATE queens_solutions SET is_recognized = 1 WHERE solution_hash = ?')
    .run(hash);
}

export function resetAllRecognized(): void {
  getDb()
    .prepare('UPDATE queens_solutions SET is_recognized = 0')
    .run();
}

export function countRecognized(): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM queens_solutions WHERE is_recognized = 1')
    .get() as { cnt: number };
  return row.cnt;
}

export function countTotal(): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM queens_solutions')
    .get() as { cnt: number };
  return row.cnt;
}
