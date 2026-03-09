"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Shield,
    Users,
    Star,
    Target,
    Activity,
    Plus,
    LogOut,
    Trash2,
    Copy,
    Crown,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useGuildDetail } from "../_hooks/useGuildDetail";
import {
    GuildMemberList,
    GuildChallengeCard,
    GuildActivityFeed,
} from "../_components";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const GUILD_ICONS: Record<string, string> = {
    shield: "🛡️",
    sword: "⚔️",
    star: "⭐",
    heart: "❤️",
    fire: "🔥",
    crown: "👑",
    gem: "💎",
    leaf: "🍃",
    moon: "🌙",
    sun: "☀️",
};

const CHALLENGE_TYPE_OPTIONS = [
    { value: "total_xp", label: "Total XP" },
    { value: "total_tasks", label: "Total Tugas" },
    { value: "total_breathing", label: "Total Pernafasan" },
    { value: "total_journals", label: "Total Jurnal" },
    { value: "total_chats", label: "Total Chat" },
    { value: "total_streak_days", label: "Total Hari Streak" },
];

export default function GuildDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user } = useAuthStore();

    const {
        guild,
        isLoading,
        activeTab,
        setActiveTab,
        isLeader,
        isAdmin,
        isMember,
        handleLeaveGuild,
        handleKickMember,
        handlePromoteMember,
        handleTransferLeadership,
        handleDeleteGuild,
        handleJoinGuild,
        // Challenge
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
    } = useGuildDetail(id);

    if (isLoading) {
        return (
            <div className="p-4 lg:p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-32 bg-gray-200 rounded-xl" />
                    <div className="h-64 bg-gray-200 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!guild) {
        return (
            <div className="p-4 lg:p-6">
                <div className="text-center py-16">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Guild tidak ditemukan</h3>
                    <Link href={ROUTES.GUILDS} className="text-primary text-sm mt-2 inline-block hover:underline">
                        Kembali ke daftar guild
                    </Link>
                </div>
            </div>
        );
    }

    const icon = GUILD_ICONS[guild.icon] || "🛡️";

    const handleCopyInviteCode = () => {
        if (guild.invite_code) {
            navigator.clipboard.writeText(guild.invite_code);
            toast.success("Kode undangan disalin!");
        }
    };

    const tabs = [
        { key: "overview", label: "Ringkasan", icon: Shield },
        { key: "members", label: `Anggota (${guild.members?.length ?? 0})`, icon: Users },
        { key: "challenges", label: "Challenge", icon: Target },
        { key: "activity", label: "Aktivitas", icon: Activity },
    ] as const;

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Back link */}
            <Link
                href={ROUTES.GUILDS}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Link>

            {/* Guild Header */}
            <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center text-4xl">
                            {icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-800">{guild.name}</h1>
                                <span className="text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                                    Lv.{guild.level}
                                </span>
                                {!guild.is_public && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Privat</span>
                                )}
                            </div>
                            {guild.description && (
                                <p className="text-gray-500 mt-1 max-w-lg">{guild.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {guild.member_count}/{guild.max_members} anggota
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    {guild.total_xp.toLocaleString()} XP
                                </span>
                                <span className="flex items-center gap-1">
                                    <Crown className="w-4 h-4" />
                                    {guild.leader_name}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {!isMember && guild.is_public && guild.member_count < guild.max_members && (
                            <Button onClick={handleJoinGuild} className="gap-2">
                                <Users className="w-4 h-4" />
                                Gabung Guild
                            </Button>
                        )}

                        {isMember && guild.invite_code && (
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyInviteCode}>
                                <Copy className="w-4 h-4" />
                                <span className="font-mono text-xs">{guild.invite_code}</span>
                            </Button>
                        )}

                        {isMember && !isLeader && (
                            <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-600" onClick={handleLeaveGuild}>
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </Button>
                        )}

                        {isLeader && (
                            <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-600" onClick={handleDeleteGuild}>
                                <Trash2 className="w-4 h-4" />
                                Hapus Guild
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Challenges */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Challenge Aktif
                            </h2>
                            {isAdmin && (
                                <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="gap-1.5">
                                            <Plus className="w-3.5 h-3.5" />
                                            Buat Challenge
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Buat Challenge Baru</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Judul Challenge</label>
                                                <Input
                                                    placeholder="Misal: Kumpulkan 500 XP bersama!"
                                                    value={challengeTitle}
                                                    onChange={(e) => setChallengeTitle(e.target.value)}
                                                    maxLength={200}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Deskripsi</label>
                                                <Textarea
                                                    placeholder="Jelaskan tantangan ini..."
                                                    value={challengeDescription}
                                                    onChange={(e) => setChallengeDescription(e.target.value)}
                                                    rows={2}
                                                    maxLength={500}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Tipe Challenge</label>
                                                    <select
                                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={challengeType}
                                                        onChange={(e) => setChallengeType(e.target.value as typeof challengeType)}
                                                    >
                                                        {CHALLENGE_TYPE_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Target</label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={challengeTarget}
                                                        onChange={(e) => setChallengeTarget(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Reward XP</label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={500}
                                                        value={challengeXPReward}
                                                        onChange={(e) => setChallengeXPReward(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Reward Koin</label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={challengeCoinReward}
                                                        onChange={(e) => setChallengeCoinReward(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Durasi (Hari)</label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={30}
                                                        value={challengeDuration}
                                                        onChange={(e) => setChallengeDuration(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsChallengeOpen(false)}>
                                                Batal
                                            </Button>
                                            <Button onClick={handleCreateChallenge} disabled={isSubmitting || !challengeTitle.trim()}>
                                                {isSubmitting ? "Membuat..." : "Buat Challenge"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {guild.active_challenges?.length > 0 ? (
                            <div className="space-y-3">
                                {guild.active_challenges.map((challenge) => (
                                    <GuildChallengeCard key={challenge.id} challenge={challenge} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                                <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Belum ada challenge aktif</p>
                                {isAdmin && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Buat challenge untuk memotivasi anggota guild!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Aktivitas Terbaru
                        </h2>
                        <div className="bg-white rounded-xl border p-4">
                            <GuildActivityFeed activities={guild.recent_activities || []} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "members" && (
                <GuildMemberList
                    members={guild.members || []}
                    isAdmin={isAdmin}
                    isLeader={isLeader}
                    currentUserId={user?.id}
                    onKick={isAdmin ? handleKickMember : undefined}
                    onPromote={isLeader ? handlePromoteMember : undefined}
                    onTransfer={isLeader ? handleTransferLeadership : undefined}
                />
            )}

            {activeTab === "challenges" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">Semua Challenge</h2>
                        {isAdmin && (
                            <Dialog open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-1.5">
                                        <Plus className="w-3.5 h-3.5" />
                                        Buat Challenge
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Buat Challenge Baru</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Judul Challenge</label>
                                            <Input
                                                placeholder="Misal: Kumpulkan 500 XP bersama!"
                                                value={challengeTitle}
                                                onChange={(e) => setChallengeTitle(e.target.value)}
                                                maxLength={200}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Deskripsi</label>
                                            <Textarea
                                                placeholder="Jelaskan tantangan ini..."
                                                value={challengeDescription}
                                                onChange={(e) => setChallengeDescription(e.target.value)}
                                                rows={2}
                                                maxLength={500}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Tipe Challenge</label>
                                                <select
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={challengeType}
                                                    onChange={(e) => setChallengeType(e.target.value as typeof challengeType)}
                                                >
                                                    {CHALLENGE_TYPE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Target</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={challengeTarget}
                                                    onChange={(e) => setChallengeTarget(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Reward XP</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={500}
                                                    value={challengeXPReward}
                                                    onChange={(e) => setChallengeXPReward(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Reward Koin</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={challengeCoinReward}
                                                    onChange={(e) => setChallengeCoinReward(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Durasi (Hari)</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={30}
                                                    value={challengeDuration}
                                                    onChange={(e) => setChallengeDuration(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsChallengeOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button onClick={handleCreateChallenge} disabled={isSubmitting || !challengeTitle.trim()}>
                                            {isSubmitting ? "Membuat..." : "Buat Challenge"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {guild.active_challenges?.length > 0 ? (
                        <div className="space-y-3">
                            {guild.active_challenges.map((challenge) => (
                                <GuildChallengeCard key={challenge.id} challenge={challenge} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Belum ada challenge</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "activity" && (
                <div className="bg-white rounded-xl border p-6">
                    <GuildActivityFeed activities={guild.recent_activities || []} />
                </div>
            )}
        </div>
    );
}
