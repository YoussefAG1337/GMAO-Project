import { z } from 'zod';

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(20)
    .transform((v) => Math.min(v, 100)),
});

export type PaginationQuery = z.infer<typeof paginationQuery>;

export const paginationOnlySchema = z.object({ query: paginationQuery });
