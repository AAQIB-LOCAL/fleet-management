import { z } from 'zod';
import { sendProblem } from '../middleware/problemDetails.js';

const premiumSchema = z.string().optional().transform(v => v ? Number(v) : undefined).refine(
  v => v === undefined || Number.isFinite(v),
  'Must be a valid number'
);

const policySearchSchema = z.object({
  policyNumber: z.string().trim().max(50).optional(),
  system: z.string().trim().max(100).optional(),
  owner: z.string().trim().max(100).optional(),
  dob: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, must be YYYY-MM-DD').optional(),
  ssn: z.string().trim().regex(/^\d{9}$/, 'Must be exactly 9 numeric digits').optional(),
  status: z.string().trim().max(50).optional(),
  product: z.string().trim().max(100).optional(),
  agentCode: z.string().trim().max(50).optional(),
  minPremium: premiumSchema,
  maxPremium: premiumSchema,
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one query parameter must be provided'
}).refine(data => data.minPremium === undefined || data.maxPremium === undefined || data.minPremium <= data.maxPremium, {
  message: 'minPremium cannot be greater than maxPremium'
});

const policyDetailsSchema = z.object({
  policyNumber: z.string().trim().min(1, 'policyNumber cannot be empty').max(50)
});

const validationError = (req, res, error) => sendProblem(res, req, 400, 'Bad Request', 'Validation failed', {
  errors: error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  })),
});

export const policyValidators = {
  validateSearch: (req, res, next) => {
    try {
      req.query = policySearchSchema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(req, res, error);
      }
      next(error);
    }
  },

  validateDetails: (req, res, next) => {
    try {
      req.query = policyDetailsSchema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(req, res, error);
      }
      next(error);
    }
  }
};
