import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const REFERENCE_REVALIDATE = 300; // 5 min

const SERVER_FETCH_TIMEOUT_MS = Number(process.env.SERVER_FETCH_TIMEOUT_MS) || 8000;

class ApiServerError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiServerError';
    this.status = status;
    this.code = code;
  }
}

type ServerFetchOptions = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

async function request<T>(endpoint: string, options?: ServerFetchOptions): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c: any) => `${c.name}=${c.value}`)
    .join('; ');

  const cacheInit: ServerFetchOptions = options?.next
    ? { next: options.next }
    : { cache: 'no-store' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options?.headers,
      },
      ...cacheInit,
      signal: controller.signal,
    });

    if (response.status === 401) {
      redirect('/login?expired=true');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new ApiServerError(response.status, errorData.message, errorData.code);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    // fetch rejects with an AbortError when our timeout fires.
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[API SERVER TIMEOUT] ${endpoint} (>${SERVER_FETCH_TIMEOUT_MS}ms)`);
      throw new ApiServerError(
        504,
        'Le serveur a mis trop de temps à répondre.',
        'GATEWAY_TIMEOUT',
      );
    }
    console.error(`[API SERVER ERROR] ${endpoint}`, error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiServer = {
  get: <T>(endpoint: string, config?: { revalidate?: number; tags?: string[] }): Promise<T> =>
    request<T>(endpoint, { method: 'GET', next: config }),
  post: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'DELETE' }),
};
