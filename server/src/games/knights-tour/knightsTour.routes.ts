import { Router } from 'express';
import { handleNewRound, handleSubmitAnswer, handleGetSolution } from './knightsTour.controller.js';

const router = Router();

router.post('/rounds', handleNewRound);
router.get('/rounds/:id/solution', handleGetSolution);
router.post('/rounds/:id/answer', handleSubmitAnswer);

export default router;
