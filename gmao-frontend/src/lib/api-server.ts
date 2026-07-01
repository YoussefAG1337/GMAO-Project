import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const cookieStore = await cookies();

  // Forward all cookies to the backend (access_token, refresh_token)
  const cookieHeader = cookieStore
    .getAll()
    .map((c: any) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options?.headers,
      },
      // Important to not cache data that changes frequently in dashboard
      cache: 'no-store',
    });

    if (response.status === 401) {
      // Per user preference: redirect to login and let client-side handle it later
      redirect('/login?expired=true');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new ApiServerError(response.status, errorData.message, errorData.code);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Let Next.js handle redirect
    }
    console.error(`[API SERVER ERROR] ${endpoint}`, error);
    throw error;
  }
}

export const apiServer = {
  get: <T>(endpoint: string): Promise<T> => request<T>(endpoint, { method: 'GET' }),
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
