import axios, { AxiosError } from "axios";

export interface ApiError {
  success: false;
  error: string;
  details?: string[] | null;
}

export interface ApiResponse<T> {
  success: true;
  message?: string | null;
  data: T;
}

export function getApiErrorMessage(
  err: AxiosError<ApiError>,
  fallback = "An unexpected error occurred."
): string {
  const data = err.response?.data;
  if (!data) return err.message || fallback;
  if (data.details && data.details.length > 0) return data.details[0];
  if (data.error) return data.error;
  return fallback;
}

export function isServerError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response || error.response.status >= 500;
  }
  return true;
}

export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred."
): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return getApiErrorMessage(error, fallback);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
