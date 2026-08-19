import { AxiosError } from "axios";

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
