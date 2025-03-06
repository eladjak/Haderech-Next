export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  success?: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  status: number;
}

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiOptions {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiRequestConfig extends ApiOptions {
  url: string;
}
