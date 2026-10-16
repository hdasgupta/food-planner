import express from 'express';
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { env } from './config/env.js';

export const app = express();

const allowedOrigins = [
  'https://food-planner-xi.vercel.app',
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests without Origin (for example, native clients).
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'daily-food-planner' }));
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/menus', menuRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Vercel requires the Express application to be the module's default export.
export default app;
