export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPagination(page: number, limit: number): { skip: number; take: number } {
  return { skip: (page - 1) * limit, take: limit };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
