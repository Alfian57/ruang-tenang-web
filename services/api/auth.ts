import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";
import type { User, LoginResponse } from "@/types";

export const authService = {
  login(email: string, password: string, rememberMe?: boolean) {
    return httpClient.post<ApiResponse<LoginResponse>>("/auth/login", { email, password, remember_me: rememberMe });
  },

  register(name: string, email: string, password: string, passwordConfirmation: string) {
    return httpClient.post<ApiResponse<LoginResponse>>("/auth/register", { name, email, password, password_confirmation: passwordConfirmation });
  },

  forgotPassword(email: string) {
    return httpClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
  },

  resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }) {
    return httpClient.post<ApiResponse<null>>("/auth/reset-password", data);
  },

  getProfile(token: string) {
    return httpClient.get<ApiResponse<User>>("/auth/profile", { token });
  },

  updateProfile(token: string, data: { name?: string; email?: string; bio?: string; avatar_url?: string }) {
    return httpClient.put<ApiResponse<User>>("/auth/profile", data, { token });
  },

  updatePassword(token: string, data: { old_password: string; new_password: string; new_password_confirmation: string }) {
    return httpClient.put<ApiResponse<null>>("/auth/password", data, { token });
  },
};
