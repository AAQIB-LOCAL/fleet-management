import { config } from '../core/config.js';
import { sendProblem } from './problemDetails.js';

export const authMiddleware = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    return sendProblem(res, req, 401, 'Unauthorized', 'Missing API Key in x-api-key header');
  }

  if (apiKey !== config.apiKey) {
    return sendProblem(res, req, 403, 'Forbidden', 'Invalid API Key');
  }

  next();
};
