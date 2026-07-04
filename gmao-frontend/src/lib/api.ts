const API_URL = '/api';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

class ApiClient {
  private isRefreshing = false;
  private lastRefreshTime = 0;
  private failedQueue: {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    url: string;
    options?: RequestInit;
  }[] = [];

  private async processQueue(err: any, tokenSuccess = false) {
    const queue = this.failedQueue;
    this.failedQueue = [];

    for (const req of queue) {
      if (tokenSuccess) {
        try {
          const res = await fetch(req.url, {
            ...req.options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...req.options?.headers,
            },
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Erreur serveur' }));
            req.reject(new ApiError(res.status, errorData.message, errorData.code));
          } else {
            const data = await res.json();
            req.resolve(data);
          }
        } catch (e) {
          req.reject(e);
        }
      } else {
        req.reject(err);
      }
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const startTime = Date.now();
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // If 401 with TOKEN_EXPIRED, attempt silent refresh
    if (response.status === 401) {
      const data = await response.json().catch(() => ({ message: 'Non autorisé' }));

      if (data.code === 'TOKEN_EXPIRED') {
        // If another request already refreshed the token while this request was in flight
        if (startTime < this.lastRefreshTime) {
          const retryResponse = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          if (!retryResponse.ok) {
            const errorData = await retryResponse
              .json()
              .catch(() => ({ message: 'Erreur serveur' }));
            throw new ApiError(retryResponse.status, errorData.message, errorData.code);
          }
          return retryResponse.json();
        }

        if (this.isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, url, options });
          });
        }

        this.isRefreshing = true;

        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            this.isRefreshing = false;
            this.lastRefreshTime = Date.now();

            // Retry the original request
            const retryResponsePromise = fetch(url, {
              ...options,
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
              },
            }).then(async (retryResponse) => {
              if (!retryResponse.ok) {
                const errorData = await retryResponse
                  .json()
                  .catch(() => ({ message: 'Erreur serveur' }));
                throw new ApiError(retryResponse.status, errorData.message, errorData.code);
              }
              return retryResponse.json();
            });

            // Process other pending requests in the queue
            this.processQueue(null, true);

            return retryResponsePromise as Promise<T>;
          } else {
            this.isRefreshing = false;
            const error = new ApiError(401, 'Session expirée', 'SESSION_EXPIRED');
            this.processQueue(error, false);

            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw error;
          }
        } catch (err) {
          this.isRefreshing = false;
          this.processQueue(err, false);
          throw err;
        }
      }

      throw new ApiError(response.status, data.message, data.code);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new ApiError(response.status, errorData.message, errorData.code);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
