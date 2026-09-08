import { z } from 'zod';
import { sendProblem } from './problemDetails.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = result.body;
    req.query = result.query;
    req.params = result.params;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendProblem(res, req, 400, 'Bad Request', 'Validation failed', {
        errors: error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    next(error);
  }
};
