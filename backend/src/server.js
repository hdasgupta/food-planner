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
import { startDailyMenuScheduler } from './schedulers/dailyMenuEmailScheduler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
const configuredCorsOrigins = env.frontendUrl
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Capacitor Android uses https://localhost when androidScheme is set to "https".
// Keep the configured Vercel/web origins, and allow local Capacitor WebView origins.
const capacitorCorsOrigins = new Set([
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
  'ionic://localhost'
]);

app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      configuredCorsOrigins.includes(origin) ||
      capacitorCorsOrigins.has(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: false
}));
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
