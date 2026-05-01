import { env } from "@/config/env";
import { ApiError, type RequestOptions } from "./types";
import { toast } from "sonner";
import { getUploadUrl } from "./upload-url";
import { normalizeApiTimestampString } from "@/utils/date";
import { enqueueMutation } from "@/lib/offline/db";

const DEFAULT_TIMEOUT = 30_000; // 30 seconds
const RATE_LIMIT_TOAST_COOLDOWN_MS = 5000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;
let lastRateLimitToastAt = 0;

const VALIDATION_FIELD_LABELS: Record<string, string> = {
  Title: "Judul",
  Content: "Konten",
  CoverImage: "Cover cerita",
  CategoryIDs: "Kategori",
  Tags: "Tag",
  TriggerWarningText: "Deskripsi trigger warning",
  Email: "Email",
  Password: "Kata sandi",
  Name: "Nama",
};

const VALIDATION_TAG_MESSAGES: Record<string, string> = {
  required: "wajib diisi.",
  email: "format email tidak valid.",
  oneof: "memiliki nilai yang tidak valid.",
};

const OFFLINE_QUEUEABLE_PREFIXES = [
  "/journals",
  "/user-moods",
  "/stories",
  "/forums",
  "/breathing",
];

const OFFLINE_NEVER_QUEUE_PREFIXES = [
  "/admin",
  "/auth",
  "/b2b",
  "/billing",
  "/chat",
  "/chat-sessions",
  "/chat-messages",
  "/moderation",
  "/push",
  "/rewards",
];

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { message: text };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorEnvelope(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" && !Array.isArray(data)
    ? data as Record<string, unknown>
    : {};
}

function isOfflineQueueableMutation(endpoint: string, method: string): method is "POST" | "PUT" | "DELETE" {
  if (method !== "POST" && method !== "PUT" && method !== "DELETE") return false;
  if (OFFLINE_NEVER_QUEUE_PREFIXES.some((prefix) => endpoint === prefix || endpoint.startsWith(`${prefix}/`))) return false;
  return OFFLINE_QUEUEABLE_PREFIXES.some((prefix) => endpoint === prefix || endpoint.startsWith(`${prefix}/`));
}

function getFriendlyFieldLabel(rawField: string): string {
  const key = rawField.split(".").pop() || rawField;
  return VALIDATION_FIELD_LABELS[key] || key;
}

function getFriendlyTagMessage(field: string, tag: string): string {
  const key = field.split(".").pop() || field;

  if (tag === "min") {
    if (key === "Title") return "minimal 5 karakter.";
    if (key === "Content") return "minimal 200 karakter.";
    if (key === "CategoryIDs") return "minimal pilih 1 kategori.";
    return "belum memenuhi batas minimum.";
  }

  if (tag === "max") {
    if (key === "CategoryIDs") return "maksimal 3 kategori.";
    if (key === "Tags") return "maksimal 5 tag.";
    if (key === "Title") return "maksimal 200 karakter.";
    if (key === "Content") return "maksimal 50000 karakter.";
    return "melebihi batas maksimum.";
  }

  return VALIDATION_TAG_MESSAGES[tag] || "tidak valid.";
}

function normalizeApiErrorMessage(message: string): string {
  const raw = (message || "").trim();
  if (!raw) return "Terjadi kesalahan. Silakan coba lagi.";

  const validationMatches = Array.from(
    raw.matchAll(/validation for '([^']+)' failed on the '([^']+)' tag/gi)
  );

  if (validationMatches.length > 0) {
    const friendly = validationMatches
      .map((m) => {
        const field = m[1];
        const tag = m[2];
        return `${getFriendlyFieldLabel(field)} ${getFriendlyTagMessage(field, tag)}`;
      })
      .filter(Boolean);

    if (friendly.length > 0) {
      const unique = Array.from(new Set(friendly));
      return `Data belum valid: ${unique.join(" ")}`;
    }
  }

  if (/^Data tidak valid:/i.test(raw)) {
    return "Data yang dimasukkan belum valid. Mohon periksa kembali isian Anda.";
  }

  return raw;
}

function normalizeUploadsDeep<T>(value: T): T {
  if (typeof value === "string") {
    const uploadNormalized = value.startsWith("/uploads/") ? getUploadUrl(value) : value;
    return normalizeApiTimestampString(uploadNormalized) as T;
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
 * - **Offline mutation queueing** (POST/PUT/DELETE → IndexedDB when offline)
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

      const data = await parseResponseBody(response);

      if (!response.ok) {
        const errorData = getErrorEnvelope(data);
        const apiError = new ApiError({
          message: normalizeApiErrorMessage(String(errorData.message || errorData.error || "An error occurred")),
          code: typeof errorData.code === "string" ? errorData.code : undefined,
          status: response.status,
          details: errorData.details,
          requestId: typeof errorData.requestId === "string" ? errorData.requestId : undefined,
        });

        // Show toast for rate limiting
        if (apiError.isRateLimited && apiError.code !== "ERR_QUOTA_EXCEEDED") {
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

      // Handle network errors — queue mutations for offline replay
      if (error instanceof TypeError) {
        const method = (fetchOptions.method || "GET").toUpperCase();

        // For mutating requests, queue them for later sync
        if (token && isOfflineQueueableMutation(endpoint, method)) {
          await enqueueMutation({
            endpoint,
            method,
            body,
            tag: endpoint.split("/")[1] || "unknown", // e.g. "journals", "user-moods"
          });

          // Return optimistic response so the UI doesn't break
          toast.info("Tersimpan offline — akan disinkronkan saat koneksi kembali");
          return { data: body, _offline: true } as T;
        }

        throw new ApiError({
          message: "Tidak ada koneksi internet",
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: formData,
        signal: controller.signal,
      });

      const data = await parseResponseBody(response);
      if (!response.ok) {
        const errorData = getErrorEnvelope(data);
        throw new ApiError({
          message: normalizeApiErrorMessage(String(errorData.message || errorData.error || "Upload failed")),
          code: typeof errorData.code === "string" ? errorData.code : undefined,
          status: response.status,
          details: errorData.details,
          requestId: typeof errorData.requestId === "string" ? errorData.requestId : undefined,
        });
      }

      return normalizePagination(normalizeUploadsDeep(data as T));
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError({
          message: "Upload timed out",
          code: "TIMEOUT",
          status: 408,
        });
      }

      if (error instanceof TypeError) {
        throw new ApiError({
          message: "Tidak ada koneksi internet",
          code: "NETWORK_ERROR",
          status: 0,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
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
