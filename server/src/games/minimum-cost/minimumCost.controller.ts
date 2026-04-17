import type { Request, Response, NextFunction } from 'express';
import { newRound, submitAnswer } from './minimumCost.service.js';
import { createError } from '../../shared/middleware/errorHandler.js';

export function handleNewRound(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = newRound();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export function handleSubmitAnswer(req: Request, res: Response, next: NextFunction): void {
  try {
    const roundId = Number(req.params.id);
    const { playerName, answer } = req.body as { playerName: string; answer: number };
    if (!playerName || typeof answer !== 'number') {
      throw createError('playerName and answer are required', 400);
    }
    const result = submitAnswer(roundId, playerName.trim(), answer);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
