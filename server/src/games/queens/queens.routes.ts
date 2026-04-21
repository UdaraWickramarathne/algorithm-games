import { Router } from 'express';
import {
  handleStartSolving,
  handleGetStatus,
  handleSubmitSolution,
  handleGetStats,
  handleRevealSolution,
} from './queens.controller.js';

const router = Router();

router.post('/solve', handleStartSolving);
router.get('/solve/status', handleGetStatus);
router.post('/submit-solution', handleSubmitSolution);
router.get('/stats', handleGetStats);
router.get('/reveal-solution', handleRevealSolution);

export default router;
