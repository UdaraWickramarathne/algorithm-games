export interface AlgoTiming { algorithmName: string; executionTimeMs: number; result: string; }
export interface TrafficEdge { from: string; to: string; capacity: number; }
export interface NewRoundResponse { roundId: number; nodes: string[]; edges: TrafficEdge[]; choices: [number, number, number]; timings: AlgoTiming[]; }
export interface SubmitAnswerResponse { isCorrect: boolean; correctAnswer: number; outcome: 'win' | 'lose'; timings: AlgoTiming[]; }
