"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { storyService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { StoryCategory, CreateStoryRequest } from "@/types";
import { toast } from "sonner";

export function useNewStory() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasTriggerWarning, setHasTriggerWarning] = useState(false);
  const [triggerWarningText, setTriggerWarningText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/dashboard/stories");
    }
  }, [token, router]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await storyService.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      toast.error("Maksimal 3 kategori");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Judul harus diisi");
      return;
    }
    if (title.length > 200) {
      toast.error("Judul maksimal 200 karakter");
      return;
    }
    if (!content.trim()) {
      toast.error("Konten harus diisi");
      return;
    }
    if (content.length < 200) {
      toast.error("Konten minimal 200 karakter");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Pilih minimal 1 kategori");
      return;
    }
    if (hasTriggerWarning && !triggerWarningText.trim()) {
      toast.error("Deskripsi trigger warning harus diisi");
      return;
    }

    setSubmitting(true);
    try {
      const storyData: CreateStoryRequest = {
        title: title.trim(),
        content: content.trim(),
        cover_image: coverImage.trim() || undefined,
        is_anonymous: isAnonymous,
        has_trigger_warning: hasTriggerWarning,
        trigger_warning_text: hasTriggerWarning ? triggerWarningText.trim() : undefined,
        category_ids: selectedCategories,
        tags: tags.length > 0 ? tags : undefined,
      };

      const response = await storyService.create(token!, storyData);
      if (response.data) {
        toast.success("Kisah berhasil dikirim untuk moderasi!");
        router.push("/dashboard/stories");
      }
    } catch (error: unknown) {
      console.error("Failed to submit story:", error);
      toast.error("Gagal mengirim kisah");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    token,
    router,
    title,
    setTitle,
    content,
    setContent,
    coverImage,
    setCoverImage,
    isAnonymous,
    setIsAnonymous,
    hasTriggerWarning,
    setHasTriggerWarning,
    triggerWarningText,
    setTriggerWarningText,
    selectedCategories,
    tags,
    tagInput,
    setTagInput,
    categories,
    submitting,
    loadingCategories,
    handleAddTag,
    handleRemoveTag,
    handleToggleCategory,
    handleSubmit,
  };
}
