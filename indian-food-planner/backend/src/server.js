import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import planRoutes from './routes/planRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './utils/errors.js';
import { startDailyMenuScheduler } from './services/schedulerService.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.frontendUrl.split(',').map(s => s.trim()), credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/plans', planRoutes);

app.use((req,res) => res.status(404).json({success:false,error:'Not found'}));
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
  startDailyMenuScheduler();
});
