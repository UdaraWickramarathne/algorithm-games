import type { Request, Response, NextFunction } from 'express';
import { startSolving, getSolvingStatus, submitSolution, getStats, revealSolution } from './queens.service.js';
import { createError } from '../../shared/middleware/errorHandler.js';

export async function handleStartSolving(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await startSolving();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export function handleGetStatus(_req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(getSolvingStatus());
  } catch (err) {
    next(err);
  }
}

export function handleSubmitSolution(req: Request, res: Response, next: NextFunction): void {
  try {
    const { playerName, queenPositions } = req.body as {
      playerName: string;
      queenPositions: number[];
    };
    if (!playerName || !Array.isArray(queenPositions) || queenPositions.length !== 16) {
      throw createError('playerName and queenPositions (16 values) are required', 400);
    }
    const result = submitSolution(playerName.trim(), queenPositions);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function handleGetStats(_req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(getStats());
  } catch (err) {
    next(err);
  }
}

export async function handleRevealSolution(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const excludeHash = req.query.exclude as string | undefined;
    res.json(await revealSolution(excludeHash));
  } catch (err) {
    next(err);
  }
}
