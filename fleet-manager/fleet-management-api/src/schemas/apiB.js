import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(500).default(50),
});

export const sessionSchemas = {
  create: z.object({
    body: z.object({
      vehicleId: z.string().uuid(),
      stationId: z.string().min(1),
      maxKwh: z.number().positive(),
    }).strict(),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
  stop: z.object({
    body: z.object({}).optional(),
    params: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}).optional(),
  }),
  list: z.object({
    body: z.object({}).optional(),
    params: z.object({}).optional(),
    query: paginationSchema.extend({
      vehicleId: z.string().uuid().optional(),
      status: z.enum(['active', 'completed']).optional(),
    }),
  })
};
