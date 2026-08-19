import type { ApiError } from '../types';

const BASE_URL = '/api';

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: data?.message || `HTTP Error ${response.status}: ${response.statusText}`,
        timestamp: data?.timestamp,
        path: data?.path,
      };
      throw error;
    }

    return data as T;
  } catch (error: any) {
    if (error.status !== undefined) {
      throw error;
    }
    // Network or other error
    const networkError: ApiError = {
      message: error.message || 'Network connection failed. Please check backend server.',
    };
    throw networkError;
  }
}
