import cors from 'cors';
import { config } from './config.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if wildcard '*' is allowed
    if (config.allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    if (config.allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  exposedHeaders: ['X-Trace-Id', 'ETag', 'Idempotency-Key', 'X-Idempotency-Cached'],
});
