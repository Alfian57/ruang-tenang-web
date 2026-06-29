"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { guildService } from "@/services/api/guild";
import { ApiError } from "@/services/http/types";
import type { GuildDetail, MyGuildInfo } from "@/types/guild";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.message) return err.message;
  return fallback;
}

export function useGuildDetail(guildId: string) {
  const { token, refreshUser } = useAuthStore();
  const router = useRouter();

  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [myGuild, setMyGuild] = useState<MyGuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks" | "activity">("overview");
  const [isClaimingId, setIsClaimingId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Guild settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchGuild = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [guildRes, myGuildRes] = await Promise.all([
        guildService.getGuild(token, guildId),
        guildService.getMyGuild(token),
      ]);
      setGuild(guildRes.data);
      setMyGuild(myGuildRes.data);
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

  // Whether the user belongs to a *different* guild than the one being viewed.
  const isInAnotherGuild = Boolean(
    myGuild?.is_member && myGuild.guild && myGuild.guild.id !== guildId
  );
  const myGuildId = myGuild?.guild?.id;
  const myGuildName = myGuild?.guild?.name;

  // Leader can only leave once they are no longer the sole leader of a guild
  // with other members — they must transfer leadership first.
  const memberCount = guild?.member_count ?? guild?.members?.length ?? 0;
  const mustTransferBeforeLeaving = isLeader && memberCount > 1;
  const isLastMember = isMember && memberCount <= 1;

  const handleLeaveGuild = async () => {
    if (!token || !guild) return;
    try {
      await guildService.leaveGuild(token, guild.id);
      toast.success("Berhasil meninggalkan guild");
      router.push(ROUTES.GUILDS);
    } catch (err) {
      toast.error(errorMessage(err, "Gagal meninggalkan guild"));
    }
  };

  const handleKickMember = async (userId: number) => {
    if (!token || !guild) return;
    try {
      await guildService.kickMember(token, guild.id, userId);
      toast.success("Anggota berhasil dikeluarkan");
      fetchGuild();
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mengeluarkan anggota"));
    }
  };

  const handlePromoteMember = async (userId: number) => {
    if (!token || !guild) return;
    try {
      await guildService.promoteMember(token, guild.id, userId);
      toast.success("Anggota berhasil dipromosikan menjadi Wakil Ketua");
      fetchGuild();
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mempromosikan anggota"));
    }
  };

  const handleTransferLeadership = async (userId: number) => {
    if (!token || !guild) return;
    try {
      await guildService.transferLeadership(token, guild.id, userId);
      toast.success("Kepemimpinan berhasil ditransfer");
      fetchGuild();
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mentransfer kepemimpinan"));
    }
  };

  const handleDeleteGuild = async () => {
    if (!token || !guild) return;
    try {
      await guildService.deleteGuild(token, guild.id);
      toast.success("Guild berhasil dihapus");
      router.push(ROUTES.GUILDS);
    } catch (err) {
      toast.error(errorMessage(err, "Gagal menghapus guild"));
    }
  };

  const handleJoinGuild = async () => {
    if (!token || !guild) return;
    // Guard the common confusing case before hitting the API.
    if (isInAnotherGuild) {
      toast.error(
        `Kamu masih tergabung di guild "${myGuildName}". Keluar dari guild itu dulu sebelum bergabung ke guild lain.`
      );
      return;
    }
    setIsJoining(true);
    try {
      await guildService.joinGuild(token, guild.id);
      toast.success("Berhasil bergabung ke guild!");
      fetchGuild();
    } catch (err) {
      toast.error(errorMessage(err, "Gagal bergabung ke guild"));
    } finally {
      setIsJoining(false);
    }
  };

  const handleClaimTask = async (challengeId: string) => {
    if (!token || !guild) return;
    setIsClaimingId(challengeId);
    try {
      await guildService.claimChallenge(token, guild.id, challengeId);
      toast.success("Hadiah berhasil diklaim!");
      await fetchGuild();
      // Claiming grants coins/XP to the user — refresh so the navbar balance
      // and XP update without a page reload.
      await refreshUser();
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mengklaim hadiah"));
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
    // Cross-guild awareness
    isInAnotherGuild,
    myGuildId,
    myGuildName,
    // Leader-leave guard
    mustTransferBeforeLeaving,
    isLastMember,
    // Actions
    handleLeaveGuild,
    handleKickMember,
    handlePromoteMember,
    handleTransferLeadership,
    handleDeleteGuild,
    handleJoinGuild,
    isJoining,
    // Tasks (claim)
    handleClaimTask,
    isClaimingId,
    // Settings
    isSettingsOpen,
    setIsSettingsOpen,
  };
}
