import { env } from "@/config/env";
import { ApiError, type RequestOptions } from "./types";
import { toast } from "sonner";
import { getUploadUrl } from "./upload-url";

const DEFAULT_TIMEOUT = 30_000; // 30 seconds
const RATE_LIMIT_TOAST_COOLDOWN_MS = 5000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;
let lastRateLimitToastAt = 0;

function normalizeUploadsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return (value.startsWith("/uploads/") ? getUploadUrl(value) : value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeUploadsDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      result[key] = normalizeUploadsDeep(nested);
    }
    return result as T;
  }

  return value;
}

/**
 * Reshape flat paginated backend responses into the nested `{ data, meta }` format
 * expected by `PaginatedResponse<T>`.
 *
 * Backend sends: `{ success, data, page, limit, total_items, total_pages }`
 * Frontend expects: `{ data, meta: { page, limit, total_items, total_pages, has_next, has_prev } }`
 */
function normalizePagination<T>(data: T): T {
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "total_pages" in data &&
    "page" in data &&
    !("meta" in data)
  ) {
    const { page, limit, total_items, total_pages, success, ...rest } = data as Record<string, unknown>;
    return {
      ...rest,
      meta: {
        page,
        limit,
        total_items,
        total_pages,
        has_next: (page as number) < (total_pages as number),
        has_prev: (page as number) > 1,
      },
    } as T;
  }
  return data;
}

/**
 * Centralized HTTP client wrapper.
 * All API requests MUST go through this client.
 *
 * Features:
 * - Auto base URL from env
 * - Auto Authorization header from token
 * - Timeout support
 * - Standardized error parsing
 * - Rate limit handling (429)
 * - Query param builder
 */
class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build a URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = `${this.baseUrl}${endpoint}`;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }

    const query = searchParams.toString();
    return query ? `${url}?${query}` : url;
  }

  /**
  * Core request method - all convenience methods delegate here.
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.requestWithRetry<T>(endpoint, options, 0);
  }

  /**
   * Internal method that supports retry on rate limit (429).
   */
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestOptions,
    attempt: number
  ): Promise<T> {
    const { token, timeout = DEFAULT_TIMEOUT, body, params, ...fetchOptions } =
      options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const url = this.buildUrl(endpoint, params);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // Handle non-JSON responses (e.g., 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const apiError = new ApiError({
          message: data.message || data.error || "An error occurred",
          code: data.code,
          status: response.status,
          details: data.details,
          requestId: data.requestId,
        });

        // Show toast for rate limiting
        if (apiError.isRateLimited) {
          // Retry with exponential backoff before showing error
          if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.requestWithRetry<T>(endpoint, options, attempt + 1);
          }

          const now = Date.now();
          if (now - lastRateLimitToastAt > RATE_LIMIT_TOAST_COOLDOWN_MS) {
            toast.error(
              "Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi."
            );
            lastRateLimitToastAt = now;
          }
        }

        throw apiError;
      }

      return normalizePagination(normalizeUploadsDeep(data as T));
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      // Handle abort/timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError({
          message: "Request timed out",
          code: "TIMEOUT",
          status: 408,
        });
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError({
          message: "Network error - periksa koneksi internet Anda",
          code: "NETWORK_ERROR",
          status: 0,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Upload file (FormData, no JSON content-type).
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    token?: string,
    method: "POST" | "PUT" = "POST"
  ): Promise<T> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError({
        message: data.message || data.error || "Upload failed",
        code: data.code,
        status: response.status,
        details: data.details,
        requestId: data.requestId,
      });
    }

    return normalizePagination(normalizeUploadsDeep(data as T));
  }

  // ==========================================
  // Convenience methods
  // ==========================================

  async get<T>(
    endpoint: string,
    opts?: Omit<RequestOptions, "method">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...opts, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    opts?: Omit<RequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...opts, method: "POST", body });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    opts?: Omit<RequestOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...opts, method: "PUT", body });
  }

  async delete<T>(
    endpoint: string,
    opts?: Omit<RequestOptions, "method">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...opts, method: "DELETE" });
  }
}

/** Singleton HTTP client instance */
export const httpClient = new HttpClient(env.NEXT_PUBLIC_API_BASE_URL);
