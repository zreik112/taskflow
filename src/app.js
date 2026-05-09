require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const logger = require('./logger');

const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const projectsRouter = require('./routes/projects');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

// Security headers
app.use(helmet());

// CORS — credentials must be true for httpOnly cookie flow
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server / curl with no Origin header (e.g. health checks)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Structured HTTP request logging (skip in test to keep output clean)
if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

app.use(express.json());
app.use(cookieParser());

// Auth rate limiter: 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'too_many_requests',
    message: 'Too many attempts. Please try again in 15 minutes.',
  },
});

// Health check — verifies DB connectivity
app.get('/healthz', async (req, res) => {
  try {
    const db = require('./db');
    await db.raw('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', projectsRouter);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handler must be mounted last
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => logger.info(`TaskFlow API listening on port ${PORT}`));
}

module.exports = app;
