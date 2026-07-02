/// <reference path="./types/express.d.ts" />
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import './config/env'; // validates env variables at startup
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiLimiter } from './middleware/rateLimiter';
import { requestId } from './middleware/requestId';
import { verifyTransporter } from './services/email.service';
import { env } from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import leadRoutes from './routes/lead.routes';
import taskRoutes from './routes/task.routes';
import activityRoutes from './routes/activity.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
// Phase 2 — MVP modules
import companyRoutes from './routes/company.routes';
import contactRoutes from './routes/contact.routes';
import dealRoutes from './routes/deal.routes';
import noteRoutes from './routes/note.routes';
import customRoutes from './routes/custom.routes';

const app = express();

// ─── Request ID (must be first for tracing) ─────────────────────────────────
app.use(requestId);

// ─── Structured HTTP Logging ─────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    // Don't log health-check endpoints to avoid noise
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/health') ?? false,
    },
    // Redact sensitive data in HTTP logs
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  }),
);

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Enforce HTTPS in production (1 year)
    hsts:
      env.nodeEnv === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    crossOriginEmbedderPolicy: false, // Relaxed for API-only server
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  }),
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (env.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(
          { origin },
          'CORS: blocked request from unauthorized origin',
        );
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }),
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(cookieParser());
// 10kb limit prevents payload bombing attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Global API Rate Limiter ─────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Endpoints (excluded from auth + rate limits) ────────────────────
app.get('/health/live', (_req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: Math.floor(uptime),
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    version: process.env.npm_package_version || '0.0.1',
    environment: env.nodeEnv,
  });
});

app.get('/health/ready', async (_req, res) => {
  try {
    const { supabase } = await import('./config/supabase.js');
    const { error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    if (error) {
      res.status(503).json({ status: 'error', message: 'Database not ready' });
      return;
    }
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database not ready' });
  }
});

// ─── API Routes ──────────────────────────────────────────────────────────────
// Note: auth limiter is applied per-route inside auth.routes.ts for granularity
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
// Phase 2 — MVP modules
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/custom', customRoutes);

// ─── Root Endpoint ───────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Zuna CRM API',
    version: process.env.npm_package_version || '0.0.1',
    status: 'running',
  });
});

// ─── Error Handlers (must be last) ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Startup ───────────────────────────────────────────────────────────
const PORT = env.port;

const start = async () => {
  await connectDB();
  await verifyTransporter();

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT, env: env.nodeEnv }, 'Zuna CRM backend started');
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received. Closing gracefully...');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds if connections are still open
    setTimeout(() => {
      logger.error('Forced shutdown: connections did not close in time');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections to prevent silent failures
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down');
    shutdown('uncaughtException');
  });
};

void start();
