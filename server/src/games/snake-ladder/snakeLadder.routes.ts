import { Router } from 'express';
import { handleNewRound, handleSubmitAnswer } from './snakeLadder.controller.js';

const router = Router();

router.post('/rounds', handleNewRound);
router.post('/rounds/:id/answer', handleSubmitAnswer);

export default router;
