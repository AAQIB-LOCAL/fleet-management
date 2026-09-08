import { logger } from '../core/logger.js';
import { sendProblem } from './problemDetails.js';

export const errorHandler = (err, req, res, next) => {
  const requestedStatus = Number(err?.status);
  const status = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
    ? requestedStatus
    : 500;
  const title = status >= 500 ? 'Internal Server Error' : (err?.title || 'Error');
  const detail = status >= 500 ? 'An unexpected error occurred' : (err?.message || 'An unexpected error occurred');

  logger.error({
    err,
    traceId: req.traceId,
    method: req.method,
    path: req.originalUrl,
    status,
  }, 'Request error');

  return sendProblem(res, req, status, title, detail);
};
