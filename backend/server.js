import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRouter from './routes/chat.js';
import decksRouter from './routes/decks.js';
import scryfallRouter from './routes/scryfall.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  });
});

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/decks', decksRouter);
app.use('/api/scryfall', scryfallRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🎴 MTG AI Deck Builder Backend`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ not configured'}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✓ configured' : '✗ not configured'}`);
  console.log(`   CORS allowed: ${allowedOrigins.join(', ')}\n`);
});
