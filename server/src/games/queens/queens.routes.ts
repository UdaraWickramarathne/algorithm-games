import { Router } from 'express';
import {
  handleStartSolving,
  handleGetStatus,
  handleSubmitSolution,
  handleGetStats,
} from './queens.controller.js';

const router = Router();

router.post('/solve', handleStartSolving);
router.get('/solve/status', handleGetStatus);
router.post('/submit-solution', handleSubmitSolution);
router.get('/stats', handleGetStats);

export default router;
