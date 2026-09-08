import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from '../core/config.js';

const rateLimiter = new RateLimiterMemory({
  points: config.rateLimit.points,
  duration: config.rateLimit.duration,
});

export const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.set('Retry-After', Math.round(rejRes.msBeforeNext / 1000) || 1);
    res.status(429).json({
      title: 'Too Many Requests',
      status: 429,
      detail: 'Rate limit exceeded',
      instance: req.originalUrl,
      traceId: req.traceId,
    });
  }
};
