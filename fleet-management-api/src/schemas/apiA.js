import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(500).default(50),
});

export const vehicleSchemas = {
  create: z.object({
    body: z.object({
      vin: z.string().length(17),
      make: z.string().min(1),
      model: z.string().min(1),
      year: z.number().int().min(1900),
      color: z.string().optional(),
    }).strict(),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  update: z.object({
    body: z.object({
      color: z.string().optional(),
      status: z.enum(['active', 'maintenance', 'retired']).optional(),
    }).strict(),
    params: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}).optional(),
  }),
  list: z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: paginationSchema.extend({
      make: z.string().optional(),
      status: z.string().optional(),
    }),
  }),
  get: z.object({
    body: z.object({}).optional(),
    params: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}).optional(),
  })
};
