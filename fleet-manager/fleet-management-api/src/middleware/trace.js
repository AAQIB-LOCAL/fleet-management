import crypto from 'node:crypto';

export const traceMiddleware = (req, res, next) => {
  const traceId = req.header('X-Trace-Id') || crypto.randomUUID();
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);
  next();
};
