'use client';

import { SWRConfig } from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) =>
  api.get<any>(url).then((res) => (res.data !== undefined ? res.data : res));

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
}
