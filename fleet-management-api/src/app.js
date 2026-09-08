import express from 'express';
import helmet from 'helmet';
import { traceMiddleware } from './middleware/trace.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { healthHandler, readinessHandler } from './core/health.js';
import { metricsRegistry, httpRequestsTotal, httpRequestDuration } from './core/metrics.js';
import { corsMiddleware } from './core/cors.js';
import { logger } from './core/logger.js';
import { vehicleRouter } from './routes/apiA.js';
import { sessionRouter } from './routes/apiB.js';
import { policyRouter } from './routes/policyRoutes.js';

const app = express();

// Security and Base Middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(traceMiddleware);

// Observability: Metrics Collection
app.use((req, res, next) => {
  const startAt = process.hrtime();
  res.on('finish', () => {
    const elapsed = process.hrtime(startAt);
    const durationInSeconds = elapsed[0] + elapsed[1] / 1e9;
    const path = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.inc({ method: req.method, path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, path, status: res.statusCode }, durationInSeconds);
    
    logger.info({
      traceId: req.traceId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latencyMs: (durationInSeconds * 1000).toFixed(2),
    }, 'Request completed');
  });
  next();
});

// Operational Endpoints
app.get('/healthz', healthHandler);
app.get('/readyz', readinessHandler);
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

// API Routes
app.use('/api/v1/vehicles', rateLimitMiddleware, authMiddleware, vehicleRouter);
app.use('/api/v1/sessions', rateLimitMiddleware, authMiddleware, sessionRouter);
app.use('/api/policies', policyRouter);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
