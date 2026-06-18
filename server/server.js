// ⚠️  MUST be imported first — loads .env before any other module is evaluated.
// ESM hoists all static imports, so dotenv.config() inside server.js would run
// too late for modules like firebase.js that read process.env at initialisation.
import './config/env-loader.js';

import express from 'express';
import cors from 'cors';

import { connectDB, isDBConnected } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requireDB } from './middleware/requireDB.js';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const app = express();

// --- CORS ---
// In dev we allow the Vite origins (5173/3000). Set CLIENT_URL in production
// to lock this down to your deployed frontend. An empty allow-list falls back
// to reflecting the request origin (permissive) for local development.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true, // true = reflect request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Momentum Backend Running');
});

// Lightweight health check — useful for confirming the server is up and
// whether the DB is connected, independent of the auth routes.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: isDBConnected() ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// All /api data routes need the database — fail fast with 503 if it's down.
app.use('/api/users', requireDB, userRoutes);
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/habits', requireDB, habitRoutes);
app.use('/api/progress', requireDB, progressRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  // Start listening FIRST so the API is always reachable. A DB failure then
  // surfaces as a clear JSON error per-request instead of a connection-refused
  // "Failed to fetch" in the browser.
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const ok = await connectDB();
  if (!ok) {
    console.warn(
      '⚠️  Server is up but the database is NOT connected. ' +
        'Auth and habit endpoints will return 503 until MongoDB is reachable.'
    );
  }
}

start();
