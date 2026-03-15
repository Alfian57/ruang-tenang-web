"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { guildService } from "@/services/api/guild";
import type { Guild, MyGuildInfo } from "@/types/guild";
import { toast } from "sonner";

export function useGuildPage() {
  const { token } = useAuthStore();

  const [publicGuilds, setPublicGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<MyGuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create guild dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Join by invite code dialog
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [guildsRes, myGuildRes] = await Promise.all([
        guildService.getPublicGuilds(token, { page, limit: 12 }),
        guildService.getMyGuild(token),
      ]);

      setPublicGuilds(guildsRes.data);
      setTotalPages(guildsRes.meta?.total_pages ?? 1);
      setMyGuild(myGuildRes.data);
    } catch {
      toast.error("Gagal memuat data guild");
    } finally {
      setIsLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setNewProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGuild = async () => {
    if (!token || !newName.trim()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("description", newDescription.trim());
      formData.append("is_public", String(newIsPublic));
      if (newProfileImage) {
        formData.append("icon", newProfileImage);
      }

      await guildService.createGuild(token, formData);
      toast.success("Guild berhasil dibuat!");
      setIsCreateOpen(false);
      setNewName("");
      setNewDescription("");
      setNewIsPublic(true);
      setNewProfileImage(null);
      setNewProfileImagePreview(null);
      fetchData();
    } catch {
      toast.error("Gagal membuat guild");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!token) return;
    try {
      await guildService.joinGuild(token, guildId);
      toast.success("Berhasil bergabung ke guild!");
      fetchData();
    } catch {
      toast.error("Gagal bergabung ke guild");
    }
  };

  const handleJoinByCode = async () => {
    if (!token || !inviteCode.trim()) return;
    setIsSubmitting(true);
    try {
      await guildService.joinByInviteCode(token, inviteCode.trim());
      toast.success("Berhasil bergabung ke guild!");
      setIsJoinOpen(false);
      setInviteCode("");
      fetchData();
    } catch {
      toast.error("Kode undangan tidak valid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    publicGuilds,
    myGuild,
    isLoading,
    page,
    setPage,
    totalPages,
    // Create
    isCreateOpen,
    setIsCreateOpen,
    isSubmitting,
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newIsPublic,
    setNewIsPublic,
    newProfileImage,
    newProfileImagePreview,
    handleProfileImageChange,
    fileInputRef,
    handleCreateGuild,
    // Join
    isJoinOpen,
    setIsJoinOpen,
    inviteCode,
    setInviteCode,
    handleJoinByCode,
    handleJoinGuild,
  };
}
