import { PaginatedResponse } from '@/types/api.types';

export type ListParams = { page?: number; limit?: number } & Record<
  string,
  string | number | undefined
>;

export function emptyPage<T>(limit = 20): PaginatedResponse<T> {
  return { items: [], total: 0, page: 1, limit, totalPages: 1 };
}

export function buildListQuery(params: ListParams = {}): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value));
    }
  }
  return sp.toString();
}

export function parseListParams(sp: Record<string, string | string[] | undefined>): ListParams {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const params: ListParams = {};

  for (const [key, raw] of Object.entries(sp)) {
    const value = first(raw);
    if (value === undefined || value === '') continue;
    if (key === 'page' || key === 'limit') {
      const n = Number(value);
      if (Number.isFinite(n)) params[key] = n;
    } else {
      params[key] = value;
    }
  }
  return params;
}
