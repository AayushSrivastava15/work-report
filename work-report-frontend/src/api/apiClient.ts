import type { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'work_report_token';
const USER_KEY = 'work_report_auth_user';

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function handleUnauthorized() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem('work_report_user_id');

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
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
      if (response.status === 401) {
        handleUnauthorized();
      }

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
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }

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

