import { logger } from '../core/logger.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const title = err.title || (status === 500 ? 'Internal Server Error' : 'Error');
  
  logger.error({
    err,
    traceId: req.traceId,
    method: req.method,
    path: req.originalUrl,
  }, 'Request error');

  res.status(status).json({
    type: 'about:blank',
    title: title,
    status: status,
    detail: err.message || 'An unexpected error occurred',
    instance: req.originalUrl,
    traceId: req.traceId,
  });
};
