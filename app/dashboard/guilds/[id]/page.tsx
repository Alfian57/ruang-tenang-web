"use client";

import { use, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Shield,
    Users,
    Star,
    Target,
    Activity,
    LogOut,
    Trash2,
    Copy,
    Crown,
    ArrowLeft,
    ClipboardList,
    CalendarDays,
    CalendarClock,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/routes";
import { useGuildDetail } from "../_hooks/useGuildDetail";
import {
    GuildMemberList,
    GuildChallengeCard,
    GuildActivityFeed,
} from "../_components";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

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
        // Tasks
        handleClaimTask,
        isClaimingId,
    } = useGuildDetail(id);

    // Confirmation modals
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Split tasks into daily and weekly
    const { dailyTasks, weeklyTasks } = useMemo(() => {
        const challenges = guild?.active_challenges || [];
        const daily = challenges.filter((c) => {
            const days = differenceInDays(new Date(c.ends_at), new Date(c.starts_at));
            return days <= 1;
        });
        const weekly = challenges.filter((c) => {
            const days = differenceInDays(new Date(c.ends_at), new Date(c.starts_at));
            return days > 1;
        });
        return { dailyTasks: daily, weeklyTasks: weekly };
    }, [guild?.active_challenges]);

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

    const hasProfileImage = guild.icon && (guild.icon.startsWith("http") || guild.icon.startsWith("/"));

    const handleCopyInviteCode = () => {
        if (guild.invite_code) {
            navigator.clipboard.writeText(guild.invite_code);
            toast.success("Kode undangan disalin!");
        }
    };

    const handleConfirmLeave = async () => {
        await handleLeaveGuild();
        setShowLeaveConfirm(false);
    };

    const handleConfirmDelete = async () => {
        await handleDeleteGuild();
        setShowDeleteConfirm(false);
    };

    const tabs = [
        { key: "overview", label: "Ringkasan", icon: Shield },
        { key: "members", label: `Anggota (${guild.members?.length ?? 0})`, icon: Users },
        { key: "tasks", label: "Tugas Guild", icon: ClipboardList },
        { key: "activity", label: "Aktivitas", icon: Activity },
    ] as const;

    // Render task section component (reused in overview and tasks tab)
    const renderTaskSections = (showEmpty: boolean) => (
        <div className="space-y-6">
            {/* Daily Tasks */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-blue-500" />
                    Tugas Harian
                </h3>
                {dailyTasks.length > 0 ? (
                    <div className="space-y-3">
                        {dailyTasks.map((challenge) => (
                            <GuildChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onClaim={isMember ? handleClaimTask : undefined}
                                isClaiming={isClaimingId === challenge.id}
                            />
                        ))}
                    </div>
                ) : showEmpty ? (
                    <div className="text-center py-6 bg-blue-50/30 rounded-xl border border-dashed border-blue-200">
                        <CalendarDays className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Belum ada tugas harian</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tugas harian baru akan diberikan oleh sistem setiap hari</p>
                    </div>
                ) : null}
            </div>

            {/* Weekly Tasks */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                    <CalendarClock className="w-4 h-4 text-purple-500" />
                    Tugas Mingguan
                </h3>
                {weeklyTasks.length > 0 ? (
                    <div className="space-y-3">
                        {weeklyTasks.map((challenge) => (
                            <GuildChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                onClaim={isMember ? handleClaimTask : undefined}
                                isClaiming={isClaimingId === challenge.id}
                            />
                        ))}
                    </div>
                ) : showEmpty ? (
                    <div className="text-center py-6 bg-purple-50/30 rounded-xl border border-dashed border-purple-200">
                        <CalendarClock className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Belum ada tugas mingguan</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tugas mingguan baru akan diberikan oleh sistem setiap minggu</p>
                    </div>
                ) : null}
            </div>
        </div>
    );

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
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
                        {/* Guild Profile Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                            {hasProfileImage ? (
                                <Image
                                    src={guild.icon}
                                    alt={guild.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary/60" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 line-clamp-1">{guild.name}</h1>
                                <span className="text-xs sm:text-sm shrink-0 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                                    Lv.{guild.level}
                                </span>
                                {!guild.is_public && (
                                    <span className="text-xs shrink-0 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Privat</span>
                                )}
                            </div>
                            {guild.description && (
                                <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-lg line-clamp-2">{guild.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-400">
                                <span className="flex items-center gap-1 shrink-0">
                                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {guild.member_count}/{guild.max_members} anggota
                                </span>
                                <span className="flex items-center gap-1 shrink-0">
                                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {guild.total_xp.toLocaleString()} XP
                                </span>
                                <span className="flex items-center gap-1 shrink-0 line-clamp-1">
                                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                    {guild.leader_name}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto mt-2 md:mt-0">
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

                        {isMember && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-red-500 hover:text-red-600"
                                onClick={() => setShowLeaveConfirm(true)}
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </Button>
                        )}

                        {isLeader && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-red-500 hover:text-red-600"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
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
                    {/* Active Tasks */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Tugas Guild Aktif
                        </h2>
                        {guild.active_challenges?.length > 0 ? (
                            renderTaskSections(false)
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                                <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Belum ada tugas guild aktif</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Tugas baru akan diberikan oleh sistem setiap hari dan minggu
                                </p>
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

            {activeTab === "tasks" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            Semua Tugas Guild
                        </h2>
                    </div>

                    {/* Claim info banner */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                        <p className="font-medium mb-1">🎁 Cara Claim Tugas Guild:</p>
                        <ul className="space-y-0.5 list-disc list-inside text-green-600">
                            <li>Tugas dapat dikerjakan bersama oleh semua anggota guild</li>
                            <li>Jika ada anggota yang sudah menyelesaikan tugas, semua anggota bisa melakukan claim</li>
                            <li>Claim hadiah memberikan <strong>XP Guild</strong>, <strong>XP Pengguna</strong>, dan <strong>Koin Emas</strong></li>
                        </ul>
                    </div>

                    {renderTaskSections(true)}
                </div>
            )}

            {activeTab === "activity" && (
                <div className="bg-white rounded-xl border p-6">
                    <GuildActivityFeed activities={guild.recent_activities || []} />
                </div>
            )}

            {/* Leave Guild Confirmation */}
            <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Keluar dari Guild?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 py-2">
                        Apakah kamu yakin ingin keluar dari <strong>{guild.name}</strong>? Kamu akan kehilangan semua progres kontribusi XP di guild ini.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLeaveConfirm(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmLeave}>
                            Ya, Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Guild Confirmation */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Hapus Guild?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 py-2">
                        Apakah kamu yakin ingin menghapus <strong>{guild.name}</strong>? Semua anggota akan dikeluarkan dan semua data guild akan dihapus secara permanen. Tindakan ini <strong>tidak dapat dibatalkan</strong>.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Ya, Hapus Guild
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
