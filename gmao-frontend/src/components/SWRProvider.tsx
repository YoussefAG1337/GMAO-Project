'use client';

import { SWRConfig } from 'swr';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error';
import { toast } from 'sonner';

import { ApiResponse } from '@/types/api.types';

const fetcher = <T,>(url: string) =>
  api.get<ApiResponse<T>>(url).then((res) => (res.data !== undefined ? res.data : res));

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
