import { config } from '../core/config.js';

export const authMiddleware = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    return res.status(401).json({
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing API Key in x-api-key header',
      instance: req.originalUrl,
      traceId: req.traceId
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(403).json({
      title: 'Forbidden',
      status: 403,
      detail: 'Invalid API Key',
      instance: req.originalUrl,
      traceId: req.traceId
    });
  }

  next();
};
