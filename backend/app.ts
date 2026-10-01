import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes';

/**
 * Configure and initialize Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Single-Origin Full-Stack Architecture:
  // Same-origin requests execute directly without CORS headers.
  // Enable CORS reflection for local development and dev proxy tools.
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, server-to-server) or reflect caller in dev
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Total-Count'],
    optionsSuccessStatus: 204
  };

  // Mount CORS before all other middleware and routes
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Security headers for API
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Body and cookie parsing
  app.use(cookieParser());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Root health check for Render / cloud load balancers
  app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Catch-all for unhandled /api routes - strictly returns JSON
  app.use('/api', (req: Request, res: Response) => {
    const msg = `API endpoint not found: ${req.method} ${req.originalUrl}`;
    res.status(404).json({
      success: false,
      message: msg,
      error: msg,
      errorDetails: {
        code: 'API_ENDPOINT_NOT_FOUND',
        message: msg
      }
    });
  });

  // Centralized API error handler - strictly returns JSON, never HTML or stack traces
  app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = typeof err?.status === 'number' && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const errorCode = err?.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR');
    const errorMessage = err?.message || 'An unexpected internal error occurred on the API server.';

    // Server-side logging only - do not leak internal details to client
    if (statusCode >= 500) {
      console.error('[API Error]', {
        method: req.method,
        url: req.originalUrl,
        status: statusCode,
        message: err?.message,
        stack: err?.stack
      });
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: errorMessage,
      errorDetails: {
        code: errorCode,
        message: errorMessage
      }
    });
  });

  // Global top-level error handler - ensures Express never serves HTML stack trace error pages
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = typeof err?.status === 'number' && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const errMsg = err?.message || 'Internal Server Error';
    if (statusCode >= 500) {
      console.error('[Unhandled Server Error]', {
        method: req.method,
        url: req.originalUrl,
        status: statusCode,
        message: err?.message,
        stack: err?.stack
      });
    }
    res.status(statusCode).json({
      success: false,
      message: errMsg,
      error: errMsg,
      errorDetails: {
        code: err?.code || 'INTERNAL_SERVER_ERROR',
        message: errMsg
      }
    });
  });

  return app;
}
