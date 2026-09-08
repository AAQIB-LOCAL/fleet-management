import { z } from 'zod';

const policySearchSchemaBase = z.object({
  policyNumber: z.string().trim().max(50).optional(),
  policyHolderName: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'pending']).optional(),
  productType: z.string().trim().max(50).optional(),
  startDateFrom: z.string().date().optional(),
  startDateTo: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const policySearchSchema = policySearchSchemaBase
  .refine(data => {
    return data.policyNumber || data.policyHolderName || data.status || data.productType || data.startDateFrom || data.startDateTo;
  }, { message: "At least one filter parameter must be provided" })
  .refine(data => {
    if (data.startDateFrom && data.startDateTo) {
      return new Date(data.startDateTo) >= new Date(data.startDateFrom);
    }
    return true;
  }, { message: "startDateTo must be >= startDateFrom", path: ["startDateTo"] });

const policyDetailsSchema = z.object({
  params: z.object({
    policyId: z.string().uuid()
  })
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
      const result = policyDetailsSchema.parse({ params: req.params });
      req.params = result.params;
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
