import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler.js';
import playersRouter from './shared/routes/players.routes.js';
import minimumCostRouter from './games/minimum-cost/minimumCost.routes.js';
import snakeLadderRouter from './games/snake-ladder/snakeLadder.routes.js';
import trafficRouter from './games/traffic/traffic.routes.js';
import knightsTourRouter from './games/knights-tour/knightsTour.routes.js';
import queensRouter from './games/queens/queens.routes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/players', playersRouter);
app.use('/api/games/minimum-cost', minimumCostRouter);
app.use('/api/games/snake-ladder', snakeLadderRouter);
app.use('/api/games/traffic', trafficRouter);
app.use('/api/games/knights-tour', knightsTourRouter);
app.use('/api/games/queens', queensRouter);

app.use(errorHandler);

export default app;
