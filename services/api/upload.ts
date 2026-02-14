import { httpClient } from "@/services/http/client";
import type { ApiResponse } from "@/services/http/types";

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadService = {
  async uploadImage(token: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient.upload<ApiResponse<UploadResponse>>("/upload/image", formData, token);
  },

  async uploadAudio(token: string, file: File) {
    const formData = new FormData();
    formData.append("audio", file);
    return httpClient.upload<ApiResponse<UploadResponse>>("/upload/audio", formData, token);
  },
};
