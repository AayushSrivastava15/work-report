import type { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
        error: data?.error || `HTTP ${response.status}`,
        message: data?.message || `HTTP Error ${response.status}: ${response.statusText}`,
        timestamp: data?.timestamp,
        path: data?.path,
        fieldErrors: data?.fieldErrors,
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

export interface BlobResponse {
  blob: Blob;
  filename: string;
}

export async function requestBlob(endpoint: string, options: RequestInit = {}): Promise<BlobResponse> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const error: ApiError = {
        status: response.status,
        error: data?.error || `HTTP ${response.status}`,
        message: data?.message || `HTTP Error ${response.status}: ${response.statusText}`,
        timestamp: data?.timestamp,
        path: data?.path,
        fieldErrors: data?.fieldErrors,
      };
      throw error;
    }

    const blob = await response.blob();

    let filename = 'download';
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    return { blob, filename };
  } catch (error: any) {
    if (error.status !== undefined) {
      throw error;
    }
    const networkError: ApiError = {
      message: error.message || 'Network connection failed. Please check backend server.',
    };
    throw networkError;
  }
}

