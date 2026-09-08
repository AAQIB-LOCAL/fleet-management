import { z } from 'zod';

const policySearchSchema = z.object({
  policyNumber: z.string().trim().max(50).optional(),
  system: z.string().trim().max(100).optional(),
  owner: z.string().trim().max(100).optional(),
  dob: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, must be YYYY-MM-DD').optional(),
  ssn: z.string().trim().regex(/^\d{9}$/, 'Must be exactly 9 numeric digits').optional(),
  status: z.string().trim().max(50).optional(),
  product: z.string().trim().max(100).optional(),
  agentCode: z.string().trim().max(50).optional(),
  minPremium: z.string().optional().transform(v => v ? Number(v) : undefined),
  maxPremium: z.string().optional().transform(v => v ? Number(v) : undefined),
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one query parameter must be provided"
});

const policyDetailsSchema = z.object({
  policyNumber: z.string().trim().min(1, 'policyNumber cannot be empty').max(50)
});

export const policyValidators = {
  validateSearch: (req, res, next) => {
    try {
      const result = policySearchSchema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.errors.map(err => {
              const field = err.path.join('.');
              return field ? `${field}: ${err.message}` : err.message;
            })
          }
        });
      }
      next(error);
    }
  },

  validateDetails: (req, res, next) => {
    try {
      const result = policyDetailsSchema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.errors.map(err => {
              const field = err.path.join('.');
              return field ? `${field}: ${err.message}` : err.message;
            })
          }
        });
      }
      next(error);
    }
  }
};
