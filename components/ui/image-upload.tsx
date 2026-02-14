"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadService } from "@/services/api";
import { getUploadUrl } from "@/services/http/upload-url";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  token: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export function ImageUpload({
  value,
  onChange,
  token,
  className,
  aspectRatio = "video",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const response = await uploadService.uploadImage(token, file);
      onChange(response.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setError("");
  };

  const displayUrl = value ? getUploadUrl(value) : "";

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg overflow-hidden transition-colors",
          aspectRatioClass[aspectRatio],
          !value && "hover:border-primary cursor-pointer hover:bg-gray-50",
          error && "border-red-300"
        )}
        onClick={() => !value && !isUploading && inputRef.current?.click()}
      >
        {value && displayUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={displayUrl}
              alt="Thumbnail"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Mengunggah...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Klik untuk unggah gambar</p>
                <p className="text-xs mt-1">JPG, PNG, GIF, WebP (maks. 10MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
