import { memoryStore } from '../repository/memoryStore.js';
import crypto from 'node:crypto';

export const idempotencyMiddleware = async (req, res, next) => {
  const key = req.header('Idempotency-Key');
  if (!key || (req.method !== 'POST' && req.method !== 'PUT')) {
    return next();
  }

  const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');
  const record = await memoryStore.getIdempotencyRecord(key);

  if (record) {
    if (record.requestHash !== requestHash) {
      return res.status(409).json({
        title: 'Conflict',
        status: 409,
        detail: 'Idempotency key reused with different body',
        instance: req.originalUrl,
        traceId: req.traceId,
      });
    }
    
    res.setHeader('X-Idempotency-Cached', 'true');
    return res.status(record.status).json(record.responseBody);
  }

  // Intercept response to store it
  const originalJson = res.json;
  res.json = function(body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      memoryStore.saveIdempotencyRecord(key, {
        requestHash,
        responseBody: body,
        status: res.statusCode
      });
    }
    return originalJson.call(this, body);
  };

  next();
};
