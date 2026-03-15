"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { guildService } from "@/services/api/guild";
import type { GuildDetail } from "@/types/guild";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export function useGuildDetail(guildId: string) {
  const { token } = useAuthStore();
  const router = useRouter();

  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks" | "activity">("overview");
  const [isClaimingId, setIsClaimingId] = useState<string | null>(null);

  // Guild settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchGuild = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await guildService.getGuild(token, guildId);
      setGuild(res.data);
    } catch {
      toast.error("Gagal memuat detail guild");
    } finally {
      setIsLoading(false);
    }
  }, [token, guildId]);

  useEffect(() => {
    fetchGuild();
  }, [fetchGuild]);

  const isLeader = guild?.current_user_role === "leader";
  const isAdmin = guild?.current_user_role === "admin" || isLeader;
  const isMember = guild?.is_current_user_guild ?? false;

  const handleLeaveGuild = async () => {
    if (!token || !guild) return;
    try {
      await guildService.leaveGuild(token, guild.id);
      toast.success("Berhasil meninggalkan guild");
      router.push(ROUTES.GUILDS);
    } catch {
      toast.error("Gagal meninggalkan guild");
    }
  };

  const handleKickMember = async (userId: number) => {
    if (!token || !guild) return;
    try {
      await guildService.kickMember(token, guild.id, userId);
      toast.success("Anggota berhasil dikeluarkan");
      fetchGuild();
    } catch {
      toast.error("Gagal mengeluarkan anggota");
    }
  };

  const handlePromoteMember = async (userId: number) => {
    if (!token || !guild) return;
    try {
      await guildService.promoteMember(token, guild.id, userId);
      toast.success("Anggota berhasil dipromosikan menjadi Wakil Ketua");
      fetchGuild();
    } catch {
      toast.error("Gagal mempromosikan anggota");
    }
  };

  const handleTransferLeadership = async (userId: number) => {
    if (!token || !guild) return;
    try {
      await guildService.transferLeadership(token, guild.id, userId);
      toast.success("Kepemimpinan berhasil ditransfer");
      fetchGuild();
    } catch {
      toast.error("Gagal mentransfer kepemimpinan");
    }
  };

  const handleDeleteGuild = async () => {
    if (!token || !guild) return;
    try {
      await guildService.deleteGuild(token, guild.id);
      toast.success("Guild berhasil dihapus");
      router.push(ROUTES.GUILDS);
    } catch {
      toast.error("Gagal menghapus guild");
    }
  };

  const handleJoinGuild = async () => {
    if (!token || !guild) return;
    try {
      await guildService.joinGuild(token, guild.id);
      toast.success("Berhasil bergabung ke guild!");
      fetchGuild();
    } catch {
      toast.error("Gagal bergabung ke guild");
    }
  };

  const handleClaimTask = async (challengeId: string) => {
    if (!token || !guild) return;
    setIsClaimingId(challengeId);
    try {
      await guildService.claimChallenge(token, guild.id, challengeId);
      toast.success("Hadiah berhasil diklaim!");
      fetchGuild();
    } catch {
      toast.error("Gagal mengklaim hadiah");
    } finally {
      setIsClaimingId(null);
    }
  };

  return {
    guild,
    isLoading,
    activeTab,
    setActiveTab,
    isLeader,
    isAdmin,
    isMember,
    // Actions
    handleLeaveGuild,
    handleKickMember,
    handlePromoteMember,
    handleTransferLeadership,
    handleDeleteGuild,
    handleJoinGuild,
    // Tasks (claim)
    handleClaimTask,
    isClaimingId,
    // Settings
    isSettingsOpen,
    setIsSettingsOpen,
  };
}
