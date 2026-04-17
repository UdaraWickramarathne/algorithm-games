export interface AlgoTiming {
  algorithmName: string;
  executionTimeMs: number;
  result: string;
}

export interface NewRoundResponse {
  roundId: number;
  n: number;
  choices: [number, number, number];
  timings: AlgoTiming[];
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: number;
  outcome: 'win' | 'lose';
  timings: AlgoTiming[];
}
