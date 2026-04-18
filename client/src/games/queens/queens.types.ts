
export interface AlgoTiming { algorithmName: string; executionTimeMs: number; result: string; }
export interface SolvingStatus { status: 'running' | 'done' | 'error'; sequentialCount?: number; threadedCount?: number; sequentialTimeMs?: number; threadedTimeMs?: number; workerCount?: number; }
export interface SubmitResponse { isValid: boolean; isNew: boolean; isRecognized: boolean; message: string; }
export interface StatsResponse { status?: string; sequentialCount?: number; threadedCount?: number; sequentialTimeMs?: number; threadedTimeMs?: number; workerCount?: number; recognizedCount: number; totalStored: number; allRecognized: boolean; }
