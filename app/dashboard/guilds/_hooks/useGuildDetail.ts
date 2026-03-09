"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { guildService } from "@/services/api/guild";
import type {
  GuildDetail,
  CreateGuildChallengeRequest,
  GuildChallengeType,
} from "@/types/guild";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export function useGuildDetail(guildId: string) {
  const { token } = useAuthStore();
  const router = useRouter();

  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "challenges" | "activity">("overview");

  // Challenge creation
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeType, setChallengeType] = useState<GuildChallengeType>("total_xp");
  const [challengeTarget, setChallengeTarget] = useState(100);
  const [challengeXPReward, setChallengeXPReward] = useState(50);
  const [challengeCoinReward, setChallengeCoinReward] = useState(10);
  const [challengeDuration, setChallengeDuration] = useState(7);

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
      toast.success("Anggota berhasil dipromosikan");
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

  const handleCreateChallenge = async () => {
    if (!token || !guild || !challengeTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const data: CreateGuildChallengeRequest = {
        title: challengeTitle.trim(),
        description: challengeDescription.trim(),
        challenge_type: challengeType,
        target_value: challengeTarget,
        xp_reward: challengeXPReward,
        coin_reward: challengeCoinReward,
        duration_days: challengeDuration,
      };
      await guildService.createChallenge(token, guild.id, data);
      toast.success("Challenge berhasil dibuat!");
      setIsChallengeOpen(false);
      setChallengeTitle("");
      setChallengeDescription("");
      setChallengeType("total_xp");
      setChallengeTarget(100);
      setChallengeXPReward(50);
      setChallengeCoinReward(10);
      setChallengeDuration(7);
      fetchGuild();
    } catch {
      toast.error("Gagal membuat challenge");
    } finally {
      setIsSubmitting(false);
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
    // Challenge creation
    isChallengeOpen,
    setIsChallengeOpen,
    isSubmitting,
    challengeTitle,
    setChallengeTitle,
    challengeDescription,
    setChallengeDescription,
    challengeType,
    setChallengeType,
    challengeTarget,
    setChallengeTarget,
    challengeXPReward,
    setChallengeXPReward,
    challengeCoinReward,
    setChallengeCoinReward,
    challengeDuration,
    setChallengeDuration,
    handleCreateChallenge,
    // Settings
    isSettingsOpen,
    setIsSettingsOpen,
  };
}
