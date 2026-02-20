import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { User, LoginResponse } from "@/types";
import { z } from "zod";

const userSchema: z.ZodType<User, z.ZodTypeDef, unknown> = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().optional(),
    role: z.enum(["admin", "moderator", "member"]).catch("member"),
    exp: z.number().catch(0),
    level: z.number().catch(1),
    badge_name: z.string().catch(""),
    badge_icon: z.string().catch(""),
    has_accepted_ai_disclaimer: z.boolean().optional(),
    content_warning_preference: z.enum(["show", "hide_all", "ask_each_time"]).optional(),
    is_suspended: z.boolean().optional(),
    suspension_end: z.string().optional(),
    is_banned: z.boolean().optional(),
    created_at: z.string().catch(""),
  })
  .passthrough();

const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total_items: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: paginationMetaSchema.optional(),
    requestId: z.string().optional(),
  });

const loginResponseSchema = apiResponseSchema(
  z.object({
    token: z.string().min(1),
    user: userSchema,
  })
);

const userResponseSchema = apiResponseSchema(userSchema);

const nullableResponseSchema = apiResponseSchema(z.null().nullable());

export const authService = {
  async login(email: string, password: string, rememberMe?: boolean): Promise<ApiResponse<LoginResponse>> {
    const response = await httpClient.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
      remember_me: rememberMe,
    });
    return loginResponseSchema.parse(response);
  },

  async register(name: string, email: string, password: string, passwordConfirmation: string): Promise<ApiResponse<User>> {
    const response = await httpClient.post<ApiResponse<User>>("/auth/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return userResponseSchema.parse(response);
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await httpClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return nullableResponseSchema.parse(response);
  },

  async resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Promise<ApiResponse<null>> {
    const response = await httpClient.post<ApiResponse<null>>("/auth/reset-password", data);
    return nullableResponseSchema.parse(response);
  },

  async getProfile(token: string): Promise<ApiResponse<User>> {
    const response = await httpClient.get<ApiResponse<User>>("/auth/me", { token });
    return userResponseSchema.parse(response);
  },

  async updateProfile(token: string, data: { name?: string; email?: string; bio?: string; avatar_url?: string }): Promise<ApiResponse<User>> {
    const response = await httpClient.put<ApiResponse<User>>("/auth/profile", data, { token });
    return userResponseSchema.parse(response);
  },

  async updatePassword(token: string, data: { old_password: string; new_password: string; new_password_confirmation: string }): Promise<ApiResponse<null>> {
    const response = await httpClient.put<ApiResponse<null>>("/auth/password", data, { token });
    return nullableResponseSchema.parse(response);
  },
};
