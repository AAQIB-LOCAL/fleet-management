import { sendProblem } from './problemDetails.js';

export const notFoundHandler = (req, res) => {
  return sendProblem(
    res,
    req,
    404,
    'Not Found',
    `Route ${req.method} ${req.originalUrl} not found`
  );
};
