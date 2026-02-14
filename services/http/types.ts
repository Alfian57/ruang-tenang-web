/**
 * API error & response types used by the HTTP client wrapper.
 * Aligned with API-CONTEXT.yml response_contract.
 */

/** Shape of API error responses (aligned with API-CONTEXT.yml error_envelope) */
export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: unknown;
  requestId?: string;
}

/** Custom error class for API errors */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: unknown;
  public readonly requestId: string;

  constructor(params: {
    message: string;
    code?: string;
    status: number;
    details?: unknown;
    requestId?: string;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code ?? "UNKNOWN";
    this.status = params.status;
    this.details = params.details;
    this.requestId = params.requestId ?? "";
  }

  /** Check if error is a specific error code */
  is(code: string): boolean {
    return this.code === code;
  }

  /** Check if error is unauthorized (401) */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Check if error is forbidden (403) */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** Check if error is not found (404) */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Check if error is rate limited (429) */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

/** Standard success response shape: { data, meta?, requestId? } */
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: PaginationMeta;
  requestId?: string;
}

/** Pagination metadata returned in the `meta` field */
export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Paginated response shape: { data, meta, requestId? } */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: PaginationMeta;
  requestId?: string;
}

/** Request options for the HTTP client */
export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JWT token (auto-attached as Bearer header) */
  token?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Request body (auto-serialized to JSON) */
  body?: unknown;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
}
