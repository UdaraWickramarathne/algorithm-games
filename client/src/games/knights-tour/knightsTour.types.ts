export interface AlgoTiming { algorithmName: string; executionTimeMs: number; result: string; }
export interface NewRoundResponse { roundId: number; boardSize: 8 | 16; startRow: number; startCol: number; timings: AlgoTiming[]; }
export interface SubmitAnswerResponse { isCorrect: boolean; outcome: 'win' | 'lose'; timings: AlgoTiming[]; solution: number[][]; }
export interface SolutionResponse { solution: number[][]; }
  